import { Briefcase, Hammer, MessagesSquare, Sparkles } from 'lucide-react';

import type { CategoryId, CategoryMeta } from '../types';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'create',
    labelKey: 'categories.create',
    descriptionKey: 'categories.createDescription',
    icon: Sparkles,
    accent: 'purple',
  },
  {
    id: 'work',
    labelKey: 'categories.work',
    descriptionKey: 'categories.workDescription',
    icon: Briefcase,
    accent: 'blue',
  },
  {
    id: 'communicate',
    labelKey: 'categories.communicate',
    descriptionKey: 'categories.communicateDescription',
    icon: MessagesSquare,
    accent: 'cyan',
  },
  {
    id: 'build',
    labelKey: 'categories.build',
    descriptionKey: 'categories.buildDescription',
    icon: Hammer,
    accent: 'orange',
  },
];

export const findCategory = (id: CategoryId): CategoryMeta | undefined =>
  CATEGORIES.find((category) => category.id === id);
