import { Search } from 'lucide-react';
import { FC } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import { Input, ThemeController, TopBar } from '@nuclearplayer/ui';

import type { ThemeMode } from '../stores/studioStore';
import { ArctMark } from './ArctMark';

type StudioHeaderProps = {
  query: string;
  onQueryChange: (query: string) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
};

export const StudioHeader: FC<StudioHeaderProps> = ({
  query,
  onQueryChange,
  theme,
  onThemeChange,
}) => {
  const { t } = useTranslation('studio');
  const isDark = theme === 'dark';

  return (
    <TopBar className="grid-cols-[1fr_2.5fr_1fr]">
      <div className="flex min-w-0 items-center gap-2">
        <ArctMark className="size-7" />
        <span className="font-heading truncate text-sm font-extrabold tracking-[0.14em] uppercase">
          {t('brand.name')}
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-xl">
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 opacity-60"
        />
        <Input
          data-testid="app-search"
          aria-label={t('home.searchLabel')}
          placeholder={t('home.searchPlaceholder')}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="surface-background border-border h-9 pl-9"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <ThemeController
          isDark={isDark}
          onThemeChange={(nextIsDark) =>
            onThemeChange(nextIsDark ? 'dark' : 'light')
          }
        />
      </div>
    </TopBar>
  );
};
