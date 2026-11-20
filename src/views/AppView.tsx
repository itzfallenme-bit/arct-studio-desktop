import { ArrowLeft, ExternalLink, PackageOpen, RotateCw } from 'lucide-react';
import { FC, useEffect, useState } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import { Button, EmptyState } from '@nuclearplayer/ui';

import { AppIcon } from '../components/AppIcon';
import { findCategory } from '../data/categories';
import { openExternal } from '../lib/tauri';
import type { StudioApp } from '../types';

type AppViewProps = {
  app: StudioApp;
  onBack: () => void;
};

export const AppView: FC<AppViewProps> = ({ app, onBack }) => {
  const { t } = useTranslation('studio');
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const category = findCategory(app.category);
  const url = app.url;

  useEffect(() => {
    setIsLoading(true);
  }, [app.slug, reloadToken]);

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="app-workspace">
      <header className="surface-background border-border flex shrink-0 flex-wrap items-center gap-3 border-b-(length:--border-width) px-4 py-3">
        <Button
          data-testid="workspace-back"
          variant="secondary"
          size="icon-sm"
          aria-label={t('workspace.back')}
          onClick={onBack}
        >
          <ArrowLeft size={16} />
        </Button>

        <AppIcon icon={app.icon} accent={app.accent} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1
              data-testid="view-heading"
              className="truncate text-lg font-bold"
            >
              {app.name}
            </h1>
            {category && (
              <span className="border-border rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase opacity-50">
                {t(category.labelKey)}
              </span>
            )}
          </div>
          <p className="truncate text-xs opacity-60">{app.description}</p>
        </div>

        {url && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon-sm"
              data-testid="workspace-reload"
              aria-label={t('workspace.reload')}
              onClick={() => setReloadToken((token) => token + 1)}
            >
              <RotateCw size={14} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              data-testid="workspace-external"
              onClick={() => void openExternal(url)}
            >
              <ExternalLink size={14} className="mr-1.5" />
              {t('workspace.openInBrowser')}
            </Button>
          </div>
        )}
      </header>

      {url ? (
        <div className="surface-muted relative min-h-0 flex-1 p-3">
          <div className="border-border shadow-shadow surface-background relative h-full w-full overflow-hidden rounded-md border-(length:--border-width)">
            {isLoading && (
              <div className="surface-background absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
                <span className="border-border size-5 animate-spin rounded-full border-2 border-t-transparent" />
                <p className="text-xs opacity-60">
                  {t('workspace.loading', { name: app.name })}
                </p>
              </div>
            )}
            <iframe
              key={reloadToken}
              data-testid="app-frame"
              title={app.name}
              src={url}
              onLoad={() => setIsLoading(false)}
              className="h-full w-full border-0"
              allow="clipboard-read; clipboard-write; camera; microphone; fullscreen"
            />
          </div>
          <p className="mt-2 text-center text-[11px] opacity-50">
            {t('workspace.hint')}
          </p>
        </div>
      ) : (
        <div className="surface-muted flex min-h-0 flex-1 items-center justify-center p-6">
          <EmptyState
            size="lg"
            icon={<PackageOpen size={48} />}
            title={t('workspace.unavailableTitle')}
            description={t('workspace.unavailableDescription')}
            action={
              <Button variant="secondary" size="sm" onClick={onBack}>
                {t('workspace.back')}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};
