import * as migration_20260727_101107_production_baseline from './20260727_101107_production_baseline';
import * as migration_20260727_131359_image_optimization_settings from './20260727_131359_image_optimization_settings';

export const migrations = [
  {
    up: migration_20260727_101107_production_baseline.up,
    down: migration_20260727_101107_production_baseline.down,
    name: '20260727_101107_production_baseline',
  },
  {
    up: migration_20260727_131359_image_optimization_settings.up,
    down: migration_20260727_131359_image_optimization_settings.down,
    name: '20260727_131359_image_optimization_settings'
  },
];
