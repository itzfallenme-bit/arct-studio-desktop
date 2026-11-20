import '@testing-library/jest-dom/vitest';

import { setupDomMocks } from '@nuclearplayer/ui';

import { useStudioStore } from '../stores/studioStore';

setupDomMocks();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  useStudioStore.setState({
    theme: 'light',
    openMode: 'studio',
    recentSlugs: [],
    googleAiKey: '',
  });
});
