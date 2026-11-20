import { SearchX } from 'lucide-react';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import {
  Button,
  EmptyState,
  FilterChips,
  ScrollableArea,
} from '@nuclearplayer/ui';

import { AppIcon } from '../components/AppIcon';
import { AppTile } from '../components/AppTile';
import { APPS } from '../data/apps';
import { CATEGORIES, findCategory } from '../data/categories';
import type { CategoryId, StudioApp } from '../types';

type CategoryFilter = CategoryId | 'all';

type HomeViewProps = {
  category: CategoryFilter;
  query: string;
  recentApps: StudioApp[];
  onSelectCategory: (category: CategoryFilter) => void;
  onOpenApp: (app: StudioApp) => void;
  onClearSearch: () => void;
};

const greetingKey = ():
  | 'home.greetingMorning'
  | 'home.greetingAfternoon'
  | 'home.greetingEvening' => {
  const hour = DateTime.now().hour;
  if (hour < 12) {
    return 'home.greetingMorning';
  }
  if (hour < 18) {
    return 'home.greetingAfternoon';
  }
  return 'home.greetingEvening';
};

export const HomeView: FC<HomeViewProps> = ({
  category,
  query,
  recentApps,
  onSelectCategory,
  onOpenApp,
  onClearSearch,
}) => {
  const { t } = useTranslation('studio');
  const categoryMeta = category === 'all' ? undefined : findCategory(category);
  const search = query.trim().toLowerCase();

  const visibleApps = useMemo(
    () =>
      APPS.filter(
        (app) => category === 'all' || app.category === category,
      ).filter((app) =>
        `${app.name} ${app.slug} ${app.description}`
          .toLowerCase()
          .includes(search),
      ),
    [category, search],
  );

  const chips = useMemo(
    () => [
      { id: 'all', label: t('categories.all') },
      ...CATEGORIES.map((item) => ({
        id: item.id,
        label: t(item.labelKey),
      })),
    ],
    [t],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 px-6 py-6">
      {categoryMeta ? (
        <header className="shrink-0">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-50">
            {t('brand.name')}
          </p>
          <h1 data-testid="view-heading" className="mt-1 text-3xl">
            {t(categoryMeta.labelKey)}
          </h1>
          <p className="mt-1 text-sm opacity-60">
            {t(categoryMeta.descriptionKey)}
          </p>
        </header>
      ) : (
        <>
          <section className="border-border surface-primary shadow-shadow shrink-0 rounded-lg border-(length:--border-width) px-6 py-5">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">
              {t('brand.tagline')}
            </p>
            <h1 data-testid="view-heading" className="mt-1 text-4xl">
              {t(greetingKey())}
            </h1>
            <p className="mt-2 max-w-xl text-sm opacity-70">
              {t('home.subtitle')}
            </p>
          </section>

          {recentApps.length > 0 && !search && (
            <section className="shrink-0">
              <h2 className="mb-2 text-sm font-bold">{t('home.recent')}</h2>
              <div className="flex flex-wrap gap-2">
                {recentApps.map((app) => (
                  <button
                    key={app.slug}
                    type="button"
                    data-testid="recent-app"
                    onClick={() => onOpenApp(app)}
                    className="border-border surface-background shadow-shadow hover:translate-x-shadow-x hover:translate-y-shadow-y flex items-center gap-2 rounded-md border-(length:--border-width) px-2.5 py-1.5 transition-all hover:shadow-none"
                  >
                    <AppIcon icon={app.icon} accent={app.accent} size="sm" />
                    <span className="text-sm font-bold">{app.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <FilterChips
          items={chips}
          selected={category}
          onChange={(id) => onSelectCategory(id as CategoryFilter)}
        />
        <span className="font-mono text-[11px] tracking-wider uppercase opacity-50">
          {t('home.appsCount', { count: visibleApps.length })}
        </span>
      </div>

      {visibleApps.length === 0 ? (
        <EmptyState
          className="flex-1"
          icon={<SearchX size={40} />}
          title={t('home.noResults')}
          description={t('home.noResultsDescription', { query: query.trim() })}
          action={
            <Button variant="secondary" size="sm" onClick={onClearSearch}>
              {t('home.clearSearch')}
            </Button>
          }
        />
      ) : (
        <ScrollableArea className="min-h-0 flex-1" viewportClassName="pr-1">
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(15.5rem,1fr))] gap-3 pb-6">
            {visibleApps.map((app) => (
              <AppTile key={app.slug} app={app} onOpen={onOpenApp} />
            ))}
          </div>
        </ScrollableArea>
      )}
    </div>
  );
};
