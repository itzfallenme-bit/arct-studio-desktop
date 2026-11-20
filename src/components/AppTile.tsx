import { FC } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';

import { findCategory } from '../data/categories';
import type { StudioApp } from '../types';
import { AppIcon } from './AppIcon';

type AppTileProps = {
  app: StudioApp;
  onOpen: (app: StudioApp) => void;
};

export const AppTile: FC<AppTileProps> = ({ app, onOpen }) => {
  const { t } = useTranslation('studio');
  const category = findCategory(app.category);

  return (
    <button
      type="button"
      data-testid="app-tile"
      onClick={() => onOpen(app)}
      className="border-border surface-background shadow-shadow hover:translate-x-shadow-x hover:translate-y-shadow-y group flex flex-col gap-4 rounded-md border-(length:--border-width) p-4 text-left transition-all hover:shadow-none"
    >
      <span className="flex w-full items-center justify-between">
        <AppIcon
          icon={app.icon}
          accent={app.accent}
          className="transition-transform duration-200 group-hover:-rotate-3"
        />
        <span className="border-border rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase opacity-50">
          {category ? t(category.labelKey) : app.category}
        </span>
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-sm font-bold">{app.name}</span>
        <span className="line-clamp-2 text-xs leading-relaxed opacity-60">
          {app.description}
        </span>
      </span>
    </button>
  );
};
