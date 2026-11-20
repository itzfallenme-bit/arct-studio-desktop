import { FC } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import { TitleBar } from '@nuclearplayer/ui';

import {
  closeStudioWindow,
  minimizeStudioWindow,
  toggleMaximizeStudioWindow,
} from '../lib/tauri';

const isMac = (): boolean => navigator.userAgent.includes('Mac');

export const StudioTitleBar: FC = () => {
  const { t } = useTranslation('studio');

  return (
    <TitleBar
      title={t('titleBar.title')}
      onMinimize={() => void minimizeStudioWindow()}
      onMaximize={() => void toggleMaximizeStudioWindow()}
      onClose={() => void closeStudioWindow()}
      styleOverride={isMac() ? 'macos' : 'windows'}
      labels={{
        minimize: t('titleBar.minimize'),
        maximize: t('titleBar.maximize'),
        close: t('titleBar.close'),
      }}
    />
  );
};
