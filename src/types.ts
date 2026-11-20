import type { LucideIcon } from 'lucide-react';

export type Accent =
  'green' | 'yellow' | 'purple' | 'blue' | 'orange' | 'cyan' | 'red';

export type CategoryId = 'create' | 'work' | 'communicate' | 'build';

export type CategoryMeta = {
  id: CategoryId;
  labelKey:
    | 'categories.create'
    | 'categories.work'
    | 'categories.communicate'
    | 'categories.build';
  descriptionKey:
    | 'categories.createDescription'
    | 'categories.workDescription'
    | 'categories.communicateDescription'
    | 'categories.buildDescription';
  icon: LucideIcon;
  accent: Accent;
};

export type StudioApp = {
  slug: string;
  name: string;
  description: string;
  category: CategoryId;
  icon: LucideIcon;
  accent: Accent;
  url: string | null;
};
