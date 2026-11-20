(function () {
  'use strict';

  var DB_NAME = 'arct-studio-local';
  var DB_VERSION = 1;
  var dbPromise = null;

  function openDb() {
    if (!dbPromise) {
      dbPromise = new Promise(function (resolve, reject) {
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function () {
          var db = request.result;
          if (!db.objectStoreNames.contains('kv')) {
            db.createObjectStore('kv');
          }
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files');
          }
        };
        request.onsuccess = function () {
          resolve(request.result);
        };
        request.onerror = function () {
          reject(request.error);
        };
      });
    }
    return dbPromise;
  }

  function withStore(storeName, mode, action) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var transaction = db.transaction(storeName, mode);
        var store = transaction.objectStore(storeName);
        var request = null;
        try {
          request = action(store);
        } catch (error) {
          reject(error);
          return;
        }
        transaction.oncomplete = function () {
          resolve(request ? request.result : undefined);
        };
        transaction.onerror = function () {
          reject(transaction.error);
        };
        transaction.onabort = function () {
          reject(transaction.error);
        };
      });
    });
  }

  function normalizePath(value) {
    return String(value == null ? '' : value)
      .replace(/\\/g, '/')
      .replace(/^~\/?/, '')
      .replace(/^\/+/, '')
      .split('/')
      .filter(function (part) {
        return part && part !== '.';
      })
      .reduce(function (parts, part) {
        if (part === '..') {
          parts.pop();
        } else {
          parts.push(part);
        }
        return parts;
      }, [])
      .join('/');
  }

  function parentPath(path) {
    var index = path.lastIndexOf('/');
    return index < 0 ? '' : path.slice(0, index);
  }

  function baseName(path) {
    var index = path.lastIndexOf('/');
    return index < 0 ? path : path.slice(index + 1);
  }

  function toBlob(data, type) {
    if (data instanceof Blob) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return new Blob([data], { type: type || 'application/octet-stream' });
    }
    if (ArrayBuffer.isView(data)) {
      return new Blob([data], { type: type || 'application/octet-stream' });
    }
    if (typeof data === 'string') {
      return new Blob([data], { type: type || 'text/plain' });
    }
    return new Blob([JSON.stringify(data)], { type: type || 'application/json' });
  }

  function fileNode(path, data) {
    var now = Date.now();
    return {
      path: path,
      name: baseName(path),
      parent: parentPath(path),
      isDir: false,
      created: now,
      modified: now,
      data: toBlob(data),
    };
  }

  function dirNode(path) {
    var now = Date.now();
    return {
      path: path,
      name: baseName(path),
      parent: parentPath(path),
      isDir: true,
      created: now,
      modified: now,
      data: null,
    };
  }

  function getNode(path) {
    return withStore('files', 'readonly', function (store) {
      return store.get(normalizePath(path));
    }).then(function (node) {
      return node || null;
    });
  }

  function putNode(node) {
    return withStore('files', 'readwrite', function (store) {
      return store.put(node, node.path);
    }).then(function () {
      return node;
    });
  }

  function allNodes() {
    return withStore('files', 'readonly', function (store) {
      return store.getAll();
    }).then(function (nodes) {
      return nodes || [];
    });
  }

  async function ensureDirectory(path) {
    var normalized = normalizePath(path);
    if (!normalized) {
      return;
    }
    var parts = normalized.split('/');
    var current = '';
    for (var index = 0; index < parts.length; index += 1) {
      current = current ? current + '/' + parts[index] : parts[index];
      var existing = await getNode(current);
      if (!existing) {
        await putNode(dirNode(current));
      } else if (!existing.isDir) {
        throw new Error('A file already exists at ' + current);
      }
    }
  }

  function itemFor(node) {
    var item = {
      path: node.path,
      name: node.name,
      is_dir: node.isDir,
      isDir: node.isDir,
      size: node.data ? node.data.size : 0,
      created: node.created,
      modified: node.modified,
    };
    item.read = function () {
      return readFile(node.path);
    };
    item.write = function (data, options) {
      return writeFile(node.path, data, options);
    };
    item.delete = function () {
      return deletePath(node.path);
    };
    item.rename = function (name) {
      return renamePath(node.path, name);
    };
    item.move = function (destination) {
      return movePath(node.path, destination);
    };
    item.copy = function (destination) {
      return copyPath(node.path, destination);
    };
    item.stat = function () {
      return statPath(node.path);
    };
    item.list = function () {
      return readdir(node.path);
    };
    item.mkdir = function () {
      return mkdirPath(node.path);
    };
    return item;
  }

  async function writeFile(path, data, options) {
    var normalized = normalizePath(path);
    if (!normalized) {
      throw new Error('A file path is required.');
    }
    var existing = await getNode(normalized);
    if (existing && existing.isDir) {
      throw new Error('A folder already exists at ' + normalized);
    }
    var parent = parentPath(normalized);
    var optionsValue = options || {};
    if (optionsValue.createMissingParents !== false) {
      await ensureDirectory(parent);
    }
    var node = fileNode(normalized, data);
    if (existing) {
      node.created = existing.created;
    }
    await putNode(node);
    return itemFor(node);
  }

  async function readFile(path) {
    var node = await getNode(path);
    if (!node) {
      throw new Error('File not found: ' + normalizePath(path));
    }
    if (node.isDir) {
      throw new Error('Cannot read a folder: ' + normalizePath(path));
    }
    return node.data;
  }

  async function readdir(path) {
    var normalized = normalizePath(path);
    var node = await getNode(normalized);
    if (node && !node.isDir) {
      throw new Error('Not a folder: ' + normalized);
    }
    if (!node && normalized) {
      throw new Error('Folder not found: ' + normalized);
    }
    var nodes = await allNodes();
    return nodes
      .filter(function (entry) {
        return entry.parent === normalized;
      })
      .sort(function (left, right) {
        return left.name.localeCompare(right.name);
      })
      .map(itemFor);
  }

  async function statPath(path) {
    var node = await getNode(path);
    if (!node) {
      throw new Error('Not found: ' + normalizePath(path));
    }
    return itemFor(node);
  }

  async function mkdirPath(path) {
    var normalized = normalizePath(path);
    var existing = await getNode(normalized);
    if (existing) {
      if (!existing.isDir) {
        throw new Error('A file already exists at ' + normalized);
      }
      return itemFor(existing);
    }
    await ensureDirectory(normalized);
    return itemFor(await getNode(normalized));
  }

  async function deletePath(path) {
    var normalized = normalizePath(path);
    if (!normalized) {
      throw new Error('The root folder cannot be deleted.');
    }
    var nodes = await allNodes();
    var targets = nodes.filter(function (node) {
      return node.path === normalized || node.path.indexOf(normalized + '/') === 0;
    });
    for (var index = 0; index < targets.length; index += 1) {
      await withStore('files', 'readwrite', function (store) {
        return store.delete(targets[index].path);
      });
    }
    return true;
  }

  async function copyPath(source, destination) {
    var from = normalizePath(source);
    var to = normalizePath(destination);
    var node = await getNode(from);
    if (!node) {
      throw new Error('Not found: ' + from);
    }
    var destinationNode = await getNode(to);
    if (destinationNode && destinationNode.isDir) {
      to = to + '/' + node.name;
    }
    if (node.isDir) {
      await ensureDirectory(to);
      var nodes = await allNodes();
      var children = nodes.filter(function (entry) {
        return entry.path.indexOf(from + '/') === 0;
      });
      for (var index = 0; index < children.length; index += 1) {
        var child = children[index];
        var childDestination = to + child.path.slice(from.length);
        if (child.isDir) {
          await ensureDirectory(childDestination);
        } else {
          await writeFile(childDestination, child.data);
        }
      }
      return itemFor(await getNode(to));
    }
    return writeFile(to, node.data);
  }

  async function movePath(source, destination) {
    var from = normalizePath(source);
    var to = normalizePath(destination);
    if (!from) {
      throw new Error('The root folder cannot be moved.');
    }
    var node = await getNode(from);
    if (!node) {
      throw new Error('Not found: ' + from);
    }
    var destinationNode = await getNode(to);
    if (destinationNode && destinationNode.isDir) {
      to = to + '/' + node.name;
    }
    var nodes = await allNodes();
    var moved = nodes.filter(function (entry) {
      return entry.path === from || entry.path.indexOf(from + '/') === 0;
    });
    for (var index = 0; index < moved.length; index += 1) {
      var entry = moved[index];
      var nextPath = to + entry.path.slice(from.length);
      var nextParent = parentPath(nextPath);
      if (nextParent) {
        await ensureDirectory(nextParent);
      }
      var next = Object.assign({}, entry, {
        path: nextPath,
        name: baseName(nextPath),
        parent: nextParent,
        modified: Date.now(),
      });
      await putNode(next);
      await withStore('files', 'readwrite', function (store) {
        return store.delete(entry.path);
      });
    }
    return itemFor(await getNode(to));
  }

  async function renamePath(path, name) {
    var normalized = normalizePath(path);
    var parent = parentPath(normalized);
    var next = parent ? parent + '/' + name : name;
    return movePath(normalized, next);
  }

  var fs = {
    write: writeFile,
    writeFile: writeFile,
    read: readFile,
    readFile: readFile,
    readdir: readdir,
    list: readdir,
    stat: statPath,
    get: statPath,
    mkdir: mkdirPath,
    delete: deletePath,
    del: deletePath,
    remove: deletePath,
    copy: copyPath,
    move: movePath,
    rename: renamePath,
    upload: async function (path, file) {
      var normalized = normalizePath(path);
      var existing = await getNode(normalized);
      if (existing && existing.isDir) {
        return writeFile(normalized + '/' + file.name, file);
      }
      return writeFile(normalized || file.name, file);
    },
    exists: async function (path) {
      return Boolean(await getNode(path));
    },
  };

  function isExpired(record) {
    return Boolean(record && record.expiresAt != null && record.expiresAt <= Date.now());
  }

  async function kvDelete(key) {
    await withStore('kv', 'readwrite', function (store) {
      return store.delete(String(key));
    });
  }

  var kv = {
    set: async function (key, value, options) {
      var settings = options || {};
      var record = { value: value };
      if (settings.ttl != null) {
        record.expiresAt = Date.now() + Number(settings.ttl) * 1000;
      } else if (settings.expireAt != null) {
        record.expiresAt = Number(settings.expireAt);
      }
      await withStore('kv', 'readwrite', function (store) {
        return store.put(record, String(key));
      });
      return true;
    },
    get: async function (key) {
      var record = await withStore('kv', 'readonly', function (store) {
        return store.get(String(key));
      });
      if (!record) {
        return null;
      }
      if (isExpired(record)) {
        await kvDelete(key);
        return null;
      }
      return record.value;
    },
    del: kvDelete,
    delete: kvDelete,
    remove: kvDelete,
    list: async function (pattern, returnValues, limit) {
      var options =
        pattern && typeof pattern === 'object'
          ? pattern
          : { pattern: pattern, returnValues: returnValues, limit: limit };
      var source = String(options.pattern || '*');
      var expression = new RegExp(
        '^' +
          source
            .split('*')
            .map(function (part) {
              return part.replace(/[.+^${}()|[\]\\]/g, '\\$&');
            })
            .join('.*') +
          '$',
      );
      var keys = await withStore('kv', 'readonly', function (store) {
        return store.getAllKeys();
      });
      var records = await withStore('kv', 'readonly', function (store) {
        return store.getAll();
      });
      var items = [];
      for (var index = 0; index < keys.length; index += 1) {
        var key = String(keys[index]);
        if (!expression.test(key) || isExpired(records[index])) {
          continue;
        }
        items.push(
          options.returnValues === false
            ? { key: key }
            : { key: key, value: records[index].value },
        );
      }
      if (options.limit) {
        items = items.slice(0, Number(options.limit));
      }
      return items;
    },
    incr: async function (key, amount) {
      var current = Number((await kv.get(key)) || 0);
      var next = current + (amount == null ? 1 : Number(amount));
      await kv.set(key, next);
      return next;
    },
    decr: async function (key, amount) {
      return kv.incr(key, -(amount == null ? 1 : Number(amount)));
    },
    expire: async function (key, seconds) {
      var record = await withStore('kv', 'readonly', function (store) {
        return store.get(String(key));
      });
      if (!record) {
        return false;
      }
      record.expiresAt = Date.now() + Number(seconds) * 1000;
      await withStore('kv', 'readwrite', function (store) {
        return store.put(record, String(key));
      });
      return true;
    },
    flush: async function () {
      await withStore('kv', 'readwrite', function (store) {
        return store.clear();
      });
      return true;
    },
    clear: async function () {
      await withStore('kv', 'readwrite', function (store) {
        return store.clear();
      });
      return true;
    },
  };

  var user = {
    uuid: 'local-user',
    username: 'You',
    email: 'you@localhost',
    email_confirmed: true,
    is_temp: false,
  };

  var auth = {
    isSignedIn: function () {
      return true;
    },
    signIn: async function () {
      return user;
    },
    signOut: async function () {
      return true;
    },
    getUser: async function () {
      return user;
    },
    getAuthToken: function () {
      return 'local';
    },
    token: 'local',
  };

  var puter = window.puter || {};
  puter.auth = auth;
  puter.authToken = 'local';
  puter.kv = kv;
  puter.fs = fs;
  puter.env = 'web';
  puter.origin = window.location.origin;
  puter.APIOrigin = window.location.origin;
  puter.print = function () {
    window.print();
  };
  puter.exit = function () {};
  puter.setWindowTitle = function (title) {
    document.title = title;
  };
  puter.ui = {
    notify: function (message) {
      console.info(message);
    },
    alert: function (message, title) {
      window.alert(title ? title + '\n\n' + message : message);
    },
    prompt: function (message, defaultValue) {
      return Promise.resolve(window.prompt(message, defaultValue || '') || null);
    },
    confirm: function (message) {
      return Promise.resolve(window.confirm(message));
    },
  };

  window.puter = puter;
})();
