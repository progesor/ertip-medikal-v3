import * as migration_20260727_101107_production_baseline from './20260727_101107_production_baseline';
import * as migration_20260727_131359_image_optimization_settings from './20260727_131359_image_optimization_settings';
import * as migration_20260728_101500_configurable_sku_rules from './20260728_101500_configurable_sku_rules';

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
  {
    up: migration_20260728_101500_configurable_sku_rules.up,
    down: migration_20260728_101500_configurable_sku_rules.down,
    name: '20260728_101500_configurable_sku_rules'
  },
];