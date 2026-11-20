export const isTauri = (): boolean =>
  '__TAURI_INTERNALS__' in window && Boolean(window.__TAURI_INTERNALS__);

export const showStudioWindow = async (): Promise<void> => {
  if (!isTauri()) {
    return;
  }
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  const current = getCurrentWindow();
  await current.show();
  await current.setFocus();
};

export const minimizeStudioWindow = async (): Promise<void> => {
  if (!isTauri()) {
    return;
  }
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  await getCurrentWindow().minimize();
};

export const toggleMaximizeStudioWindow = async (): Promise<void> => {
  if (!isTauri()) {
    return;
  }
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  await getCurrentWindow().toggleMaximize();
};

export const closeStudioWindow = async (): Promise<void> => {
  if (!isTauri()) {
    return;
  }
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  await getCurrentWindow().close();
};

export const openExternal = async (url: string): Promise<void> => {
  if (isTauri()) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};
