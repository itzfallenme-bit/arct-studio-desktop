import { StudioWrapper } from './App.test-wrapper';
import { APPS } from './data/apps';

describe('Arct Studio', () => {
  it('shows every app in the catalog', async () => {
    await StudioWrapper.mount();

    expect(StudioWrapper.tiles).toHaveLength(APPS.length);
    expect(StudioWrapper.heading).toBeInTheDocument();
  });

  it('filters the catalog with the search field', async () => {
    await StudioWrapper.mount();

    await StudioWrapper.search('parametric');

    expect(StudioWrapper.tiles).toHaveLength(1);
    expect(StudioWrapper.tiles[0]).toHaveTextContent('Parametric');
  });

  it('filters the catalog by workspace', async () => {
    await StudioWrapper.mount();

    await StudioWrapper.openCategory('Build');

    expect(StudioWrapper.heading).toHaveTextContent('Build');
    expect(StudioWrapper.tiles).toHaveLength(6);
  });

  it('opens an app in a workspace frame and goes back home', async () => {
    await StudioWrapper.mount();

    await StudioWrapper.openApp('Notes');

    expect(StudioWrapper.frame).toHaveAttribute('title', 'Notes');

    await StudioWrapper.goBack();

    expect(StudioWrapper.tiles).toHaveLength(APPS.length);
  });

  it('switches the studio to the dark theme', async () => {
    await StudioWrapper.mount();

    await StudioWrapper.openSettings();
    await StudioWrapper.selectTheme('Dark');

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('stores the Google AI key for the tools', async () => {
    await StudioWrapper.mount();

    await StudioWrapper.openSettings();
    await StudioWrapper.enterAiKey('AIzaTestKey');

    expect(StudioWrapper.aiKeyInput).toHaveAttribute('type', 'password');
    expect(localStorage.getItem('arct.googleAiKey')).toBe('AIzaTestKey');
  });
});
