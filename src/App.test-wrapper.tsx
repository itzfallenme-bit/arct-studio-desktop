import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './App';

const findNavItem = (label: string): HTMLElement => {
  const item = screen
    .getAllByTestId('studio-nav-item')
    .find((element) => element.textContent?.includes(label));
  if (!item) {
    throw new Error(`No navigation item found for ${label}`);
  }
  return item;
};

export const StudioWrapper = {
  async mount(): Promise<void> {
    render(<App />);
  },

  get tiles(): HTMLElement[] {
    return screen.queryAllByTestId('app-tile');
  },

  get searchInput(): HTMLElement {
    return screen.getByTestId('app-search');
  },

  get heading(): HTMLElement {
    return screen.getByTestId('view-heading');
  },

  get frame(): HTMLElement {
    return screen.getByTestId('app-frame');
  },

  tile(name: string): HTMLElement {
    const tile = this.tiles.find((element) =>
      element.textContent?.includes(name),
    );
    if (!tile) {
      throw new Error(`No app tile found for ${name}`);
    }
    return tile;
  },

  navItem(label: string): HTMLElement {
    return findNavItem(label);
  },

  async search(query: string): Promise<void> {
    await userEvent.type(this.searchInput, query);
  },

  async openCategory(label: string): Promise<void> {
    await userEvent.click(this.navItem(label));
  },

  async openApp(name: string): Promise<void> {
    await userEvent.click(this.tile(name));
  },

  async goBack(): Promise<void> {
    await userEvent.click(screen.getByTestId('workspace-back'));
  },

  async openSettings(): Promise<void> {
    await userEvent.click(this.navItem('Settings'));
  },

  async selectTheme(label: string): Promise<void> {
    await userEvent.click(screen.getByRole('radio', { name: label }));
  },

  async enterAiKey(key: string): Promise<void> {
    await userEvent.type(screen.getByTestId('ai-key'), key);
  },

  get aiKeyInput(): HTMLElement {
    return screen.getByTestId('ai-key');
  },
};
