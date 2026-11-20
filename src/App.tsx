import { FC, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@nuclearplayer/i18n';
import { PlayerShell } from '@nuclearplayer/ui';

import { StudioHeader } from './components/StudioHeader';
import { StudioSidebar, type StudioViewId } from './components/StudioSidebar';
import { StudioTitleBar } from './components/StudioTitleBar';
import { APPS_BY_SLUG } from './data/apps';
import { openExternal, showStudioWindow } from './lib/tauri';
import { useStudioStore } from './stores/studioStore';
import type { CategoryId, StudioApp } from './types';
import { AppView } from './views/AppView';
import { HomeView } from './views/HomeView';
import { SettingsView } from './views/SettingsView';

type View =
  | { kind: 'home'; category: CategoryId | 'all' }
  | { kind: 'app'; slug: string }
  | { kind: 'settings' };

const StudioShell: FC = () => {
  const [view, setView] = useState<View>({ kind: 'home', category: 'all' });
  const [query, setQuery] = useState('');

  const theme = useStudioStore((state) => state.theme);
  const openMode = useStudioStore((state) => state.openMode);
  const recentSlugs = useStudioStore((state) => state.recentSlugs);
  const googleAiKey = useStudioStore((state) => state.googleAiKey);
  const setTheme = useStudioStore((state) => state.setTheme);
  const setOpenMode = useStudioStore((state) => state.setOpenMode);
  const rememberApp = useStudioStore((state) => state.rememberApp);
  const clearRecent = useStudioStore((state) => state.clearRecent);
  const setGoogleAiKey = useStudioStore((state) => state.setGoogleAiKey);

  const recentApps = recentSlugs.flatMap((slug) => {
    const app = APPS_BY_SLUG.get(slug);
    return app ? [app] : [];
  });

  useEffect(() => {
    void showStudioWindow();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    try {
      if (googleAiKey) {
        localStorage.setItem('arct.googleAiKey', googleAiKey);
      } else {
        localStorage.removeItem('arct.googleAiKey');
      }
    } catch (error) {
      console.warn('Could not sync the Google AI key', error);
    }
  }, [googleAiKey]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setView({ kind: 'home', category: 'all' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openApp = (app: StudioApp) => {
    rememberApp(app.slug);
    if (openMode === 'browser' && app.url) {
      void openExternal(app.url);
      return;
    }
    setView({ kind: 'app', slug: app.slug });
  };

  const navigate = (destination: StudioViewId) => {
    setQuery('');
    if (destination === 'settings') {
      setView({ kind: 'settings' });
      return;
    }
    setView({ kind: 'home', category: destination });
  };

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    if (nextQuery && view.kind !== 'home') {
      setView({ kind: 'home', category: 'all' });
    }
  };

  const activeApp =
    view.kind === 'app' ? APPS_BY_SLUG.get(view.slug) : undefined;

  const activeNavigation: StudioViewId =
    view.kind === 'settings'
      ? 'settings'
      : view.kind === 'app'
        ? (activeApp?.category ?? 'all')
        : view.category;

  const homeView = (
    <HomeView
      category={view.kind === 'home' ? view.category : 'all'}
      query={query}
      recentApps={recentApps}
      onSelectCategory={(category) => setView({ kind: 'home', category })}
      onOpenApp={openApp}
      onClearSearch={() => setQuery('')}
    />
  );

  return (
    <PlayerShell
      className="grid-rows-[auto_auto_1fr]"
      onContextMenu={(event) => event.preventDefault()}
    >
      <StudioTitleBar />
      <StudioHeader
        query={query}
        onQueryChange={changeQuery}
        theme={theme}
        onThemeChange={setTheme}
      />

      <div className="grid min-h-0 grid-cols-[13rem_1fr]">
        <StudioSidebar view={activeNavigation} onNavigate={navigate} />

        <main className="surface-muted flex min-h-0 min-w-0 flex-col">
          {view.kind === 'home' && homeView}
          {view.kind === 'app' &&
            (activeApp ? (
              <AppView
                app={activeApp}
                onBack={() => setView({ kind: 'home', category: 'all' })}
              />
            ) : (
              homeView
            ))}
          {view.kind === 'settings' && (
            <SettingsView
              theme={theme}
              openMode={openMode}
              recentCount={recentApps.length}
              googleAiKey={googleAiKey}
              onThemeChange={setTheme}
              onOpenModeChange={setOpenMode}
              onClearRecent={clearRecent}
              onGoogleAiKeyChange={setGoogleAiKey}
            />
          )}
        </main>
      </div>
    </PlayerShell>
  );
};

export const App: FC = () => (
  <I18nextProvider i18n={i18n}>
    <StudioShell />
  </I18nextProvider>
);
