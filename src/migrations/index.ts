import * as migration_20260727_101107_production_baseline from './20260727_101107_production_baseline';

export const migrations = [
  {
    up: migration_20260727_101107_production_baseline.up,
    down: migration_20260727_101107_production_baseline.down,
    name: '20260727_101107_production_baseline'
  },
];
