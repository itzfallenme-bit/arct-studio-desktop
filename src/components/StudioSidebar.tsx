import {
  Github,
  Home,
  LayoutGrid,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { FC } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import { cn } from '@nuclearplayer/ui';

import { appCountForCategory, APPS, SOURCE_URL } from '../data/apps';
import { CATEGORIES } from '../data/categories';
import { openExternal } from '../lib/tauri';
import type { CategoryId } from '../types';

export type StudioViewId = CategoryId | 'all' | 'settings';

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  count?: number;
  isSelected?: boolean;
  onClick: () => void;
};

const NavItem: FC<NavItemProps> = ({
  icon: Icon,
  label,
  count,
  isSelected = false,
  onClick,
}) => (
  <button
    type="button"
    data-testid="studio-nav-item"
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-2 rounded-md border-(length:--border-width) px-2 py-1.5 text-left transition-colors',
      isSelected
        ? 'surface-primary border-border shadow-shadow font-bold'
        : 'hover:bg-foreground/5 border-transparent',
    )}
  >
    <span className="flex size-7 shrink-0 items-center justify-center">
      <Icon size={16} />
    </span>
    <span className="truncate text-sm">{label}</span>
    {count !== undefined && (
      <span className="ml-auto font-mono text-[11px] opacity-50">{count}</span>
    )}
  </button>
);

type StudioSidebarProps = {
  view: StudioViewId;
  onNavigate: (view: StudioViewId) => void;
};

export const StudioSidebar: FC<StudioSidebarProps> = ({ view, onNavigate }) => {
  const { t } = useTranslation('studio');

  return (
    <aside className="surface-sidebar-left border-border flex min-h-0 flex-col border-r-(length:--border-width) px-2 py-3">
      <nav className="flex flex-col gap-1">
        <NavItem
          icon={Home}
          label={t('navigation.home')}
          isSelected={view === 'all'}
          onClick={() => onNavigate('all')}
        />
        <NavItem
          icon={LayoutGrid}
          label={t('navigation.apps')}
          count={APPS.length}
          isSelected={false}
          onClick={() => onNavigate('all')}
        />
      </nav>

      <p className="mt-5 mb-2 px-2 font-mono text-[10px] tracking-[0.18em] uppercase opacity-50">
        {t('navigation.categories')}
      </p>

      <nav className="flex flex-col gap-1">
        {CATEGORIES.map((category) => (
          <NavItem
            key={category.id}
            icon={category.icon}
            label={t(category.labelKey)}
            count={appCountForCategory(category.id)}
            isSelected={view === category.id}
            onClick={() => onNavigate(category.id)}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <button
          type="button"
          onClick={() => void openExternal(SOURCE_URL)}
          className="hover:bg-foreground/5 flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-xs opacity-70 transition-colors hover:opacity-100"
        >
          <Github size={14} />
          <span className="truncate">{t('brand.maker')}</span>
        </button>
        <NavItem
          icon={Settings}
          label={t('navigation.settings')}
          isSelected={view === 'settings'}
          onClick={() => onNavigate('settings')}
        />
        <p className="px-2 font-mono text-[10px] tracking-wider opacity-40">
          v0.1.0
        </p>
      </div>
    </aside>
  );
};
