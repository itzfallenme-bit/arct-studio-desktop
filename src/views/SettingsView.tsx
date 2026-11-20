import { ExternalLink, KeyRound, RotateCcw } from 'lucide-react';
import { FC, useState } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import {
  Box,
  Button,
  FilterChips,
  Input,
  ScrollableArea,
} from '@nuclearplayer/ui';

import { ArctMark } from '../components/ArctMark';
import { SOURCE_URL } from '../data/apps';
import { openExternal } from '../lib/tauri';
import type { OpenMode, ThemeMode } from '../stores/studioStore';

type SettingsViewProps = {
  theme: ThemeMode;
  openMode: OpenMode;
  recentCount: number;
  googleAiKey: string;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenModeChange: (openMode: OpenMode) => void;
  onClearRecent: () => void;
  onGoogleAiKeyChange: (key: string) => void;
};

export const SettingsView: FC<SettingsViewProps> = ({
  theme,
  openMode,
  recentCount,
  googleAiKey,
  onThemeChange,
  onOpenModeChange,
  onClearRecent,
  onGoogleAiKeyChange,
}) => {
  const { t } = useTranslation('studio');
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col px-6 py-6">
      <h1 data-testid="view-heading" className="mb-5 shrink-0 text-3xl">
        {t('settings.title')}
      </h1>

      <ScrollableArea className="min-h-0 flex-1">
        <div className="flex max-w-2xl flex-col gap-4 pb-8">
          <Box variant="secondary" className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-bold">{t('settings.appearance')}</h2>
              <p className="text-sm opacity-60">
                {t('settings.appearanceDescription')}
              </p>
            </div>
            <FilterChips
              items={[
                { id: 'light', label: t('settings.themeLight') },
                { id: 'dark', label: t('settings.themeDark') },
              ]}
              selected={theme}
              onChange={(id) => onThemeChange(id as ThemeMode)}
            />
          </Box>

          <Box variant="secondary" className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <KeyRound size={20} className="mt-1 shrink-0 opacity-60" />
              <div>
                <h2 className="text-lg font-bold">{t('settings.ai')}</h2>
                <p className="text-sm opacity-60">
                  {t('settings.aiDescription')}
                </p>
              </div>
            </div>
            <Input
              data-testid="ai-key"
              label={t('settings.aiApiKey')}
              variant={isKeyVisible ? 'text' : 'password'}
              value={googleAiKey}
              placeholder={t('settings.aiPlaceholder')}
              onChange={(event) => onGoogleAiKeyChange(event.target.value)}
              endAddon={
                <button
                  type="button"
                  className="cursor-pointer text-xs font-bold"
                  onClick={() => setIsKeyVisible((visible) => !visible)}
                >
                  {isKeyVisible ? t('settings.aiHide') : t('settings.aiShow')}
                </button>
              }
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  void openExternal('https://aistudio.google.com/app/apikey')
                }
              >
                <ExternalLink size={14} className="mr-1.5" />
                {t('settings.aiGetKey')}
              </Button>
              {googleAiKey && (
                <span className="text-xs opacity-60">
                  {t('settings.aiStored')}
                </span>
              )}
            </div>
          </Box>

          <Box variant="secondary" className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-bold">{t('settings.opening')}</h2>
              <p className="text-sm opacity-60">
                {t('settings.openingDescription')}
              </p>
            </div>
            <FilterChips
              items={[
                { id: 'studio', label: t('settings.openInStudio') },
                { id: 'browser', label: t('settings.openInBrowser') },
              ]}
              selected={openMode}
              onChange={(id) => onOpenModeChange(id as OpenMode)}
            />
          </Box>

          <Box variant="secondary" className="flex items-start gap-4">
            <RotateCcw size={20} className="mt-1 shrink-0 opacity-60" />
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <h2 className="text-lg font-bold">{t('settings.recent')}</h2>
                <p className="text-sm opacity-60">
                  {t('settings.recentDescription')}
                </p>
              </div>
              <Button
                data-testid="clear-recent"
                variant="secondary"
                size="sm"
                className="self-start"
                disabled={recentCount === 0}
                onClick={onClearRecent}
              >
                {t('settings.clearRecent')}
              </Button>
            </div>
          </Box>

          <Box variant="secondary" className="flex items-start gap-4">
            <ArctMark className="size-10 shrink-0" />
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <h2 className="text-lg font-bold">{t('settings.about')}</h2>
                <p className="text-sm opacity-60">
                  {t('settings.aboutDescription')}
                </p>
                <p className="mt-2 font-mono text-[11px] opacity-40">
                  {t('settings.version', { version: '0.1.0' })}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => void openExternal(SOURCE_URL)}
              >
                <ExternalLink size={14} className="mr-1.5" />
                {t('settings.source')}
              </Button>
            </div>
          </Box>
        </div>
      </ScrollableArea>
    </div>
  );
};
