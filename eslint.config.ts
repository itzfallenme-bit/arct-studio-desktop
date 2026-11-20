import { globalIgnores } from 'eslint/config';

import config from '@nuclearplayer/eslint-config';

export default [
  ...config,
  globalIgnores([
    'ref/**',
    'packages/**',
    'tools/**',
    'public/tools/**',
    'dev/**',
    '.agents/**',
    '.freebuff/**',
  ]),
];
