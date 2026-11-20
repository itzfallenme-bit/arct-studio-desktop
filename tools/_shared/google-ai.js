(function () {
  'use strict';

  var KEY_STORAGE = 'arct.googleAiKey';
  var API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';
  var DEFAULT_MODEL = 'gemini-2.5-flash';
  var DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';

  function getApiKey() {
    try {
      return localStorage.getItem(KEY_STORAGE) || '';
    } catch (error) {
      return '';
    }
  }

  function setApiKey(key) {
    try {
      if (key) {
        localStorage.setItem(KEY_STORAGE, String(key).trim());
      } else {
        localStorage.removeItem(KEY_STORAGE);
      }
    } catch (error) {
      console.warn('Arct AI could not save the API key', error);
    }
  }

  function hasApiKey() {
    return Boolean(getApiKey());
  }

  function requireKey() {
    var key = getApiKey();
    if (!key) {
      throw new Error('Add your Google AI API key in Arct Studio settings.');
    }
    return key;
  }

  function textFromResponse(data) {
    var parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    if (!Array.isArray(parts)) {
      return '';
    }
    return parts.map(function (part) {
      return typeof part.text === 'string' ? part.text : '';
    }).join('').trim();
  }

  async function request(model, body) {
    var key = requireKey();
    var response = await fetch(API_ROOT + '/' + model + ':generateContent?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || data.error) {
      throw new Error((data.error && data.error.message) || 'Google AI request failed (' + response.status + ')');
    }
    return data;
  }

  function readOptions(second, third) {
    if (second && typeof second === 'object') {
      return second;
    }
    if (third && typeof third === 'object') {
      return third;
    }
    return {};
  }

  function normalizeMessages(prompt) {
    if (Array.isArray(prompt)) {
      return prompt.map(function (message) {
        return {
          role: message.role || 'user',
          content: message.content == null ? '' : message.content,
        };
      });
    }
    return [{ role: 'user', content: prompt == null ? '' : prompt }];
  }

  function textContent(content) {
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content.map(function (part) {
        return typeof part === 'string' ? part : part && part.text ? part.text : '';
      }).join('');
    }
    return JSON.stringify(content);
  }

  async function chat(prompt, second, third) {
    var options = readOptions(second, third);
    var messages = normalizeMessages(prompt);
    var system = messages.filter(function (message) {
      return message.role === 'system';
    }).map(function (message) {
      return textContent(message.content);
    }).join('\n\n');

    var contents = messages.filter(function (message) {
      return message.role !== 'system';
    }).map(function (message) {
      return {
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: textContent(message.content) }],
      };
    });

    var body = { contents: contents };
    if (system) {
      body.systemInstruction = { parts: [{ text: system }] };
    }
    if (typeof options.temperature === 'number' || typeof options.max_tokens === 'number') {
      body.generationConfig = {};
      if (typeof options.temperature === 'number') {
        body.generationConfig.temperature = options.temperature;
      }
      if (typeof options.max_tokens === 'number') {
        body.generationConfig.maxOutputTokens = options.max_tokens;
      }
    }

    var data = await request(options.model || DEFAULT_MODEL, body);
    var content = textFromResponse(data);
    return {
      message: { role: 'assistant', content: content },
      content: content,
      text: content,
      candidates: data.candidates,
    };
  }

  async function txt2img(prompt, second, third) {
    var options = readOptions(second, third);
    var data = await request(options.model || DEFAULT_IMAGE_MODEL, {
      contents: [{ role: 'user', parts: [{ text: String(prompt == null ? '' : prompt) }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    });
    var parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    var imagePart = parts.find(function (part) {
      return part.inlineData && part.inlineData.data;
    });
    if (!imagePart) {
      throw new Error('Google AI did not return an image.');
    }
    return {
      src: 'data:' + (imagePart.inlineData.mimeType || 'image/png') + ';base64,' + imagePart.inlineData.data,
    };
  }

  async function txt2speech(text) {
    var value = String(text == null ? '' : text);
    return {
      src: '',
      async play() {
        if (!('speechSynthesis' in window)) {
          throw new Error('Speech is not available on this device.');
        }
        window.speechSynthesis.cancel();
        await new Promise(function (resolve, reject) {
          var utterance = new SpeechSynthesisUtterance(value);
          utterance.onend = resolve;
          utterance.onerror = reject;
          window.speechSynthesis.speak(utterance);
        });
      },
      pause() {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      },
    };
  }

  async function img2txt(input, options) {
    var prompt = options && typeof options === 'object' ? options.prompt : options;
    var source = input;
    var blob;
    if (input instanceof Blob) {
      blob = input;
    } else {
      if (source && typeof source === 'object') {
        source = source.currentSrc || source.src || source.blob;
      }
      if (source instanceof Blob) {
        blob = source;
      } else if (typeof source === 'string') {
        blob = await (await fetch(source)).blob();
      } else {
        throw new Error('No image was provided.');
      }
    }
    var dataUrl = await new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result)); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    var base64 = dataUrl.split(',')[1] || '';
    var data = await request(DEFAULT_MODEL, {
      contents: [{
        role: 'user',
        parts: [
          { text: String(prompt == null ? 'Describe this image.' : prompt) },
          { inlineData: { mimeType: blob.type || 'image/png', data: base64 } },
        ],
      }],
    });
    var content = textFromResponse(data);
    return { message: { role: 'assistant', content: content }, content: content, text: content };
  }

  async function speech2txt() {
    throw new Error('Speech to text is not available with the Google AI free tier yet.');
  }

  async function txt2vid() {
    throw new Error('Video generation is not available with the Google AI free tier yet.');
  }

  var client = {
    chat: chat,
    txt2img: txt2img,
    txt2speech: txt2speech,
    img2txt: img2txt,
    speech2txt: speech2txt,
    txt2vid: txt2vid,
    getApiKey: getApiKey,
    setApiKey: setApiKey,
    hasApiKey: hasApiKey,
  };

  window.arctAI = client;

  function install() {
    if (window.puter && window.puter.ai !== client) {
      window.puter.ai = client;
    }
  }

  install();
  var attempts = 0;
  var timer = setInterval(function () {
    install();
    attempts += 1;
    if (attempts > 80) {
      clearInterval(timer);
    }
  }, 250);
})();
