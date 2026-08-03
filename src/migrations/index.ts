import * as migration_20260727_101107_production_baseline from './20260727_101107_production_baseline';
import * as migration_20260727_131359_image_optimization_settings from './20260727_131359_image_optimization_settings';
import * as migration_20260728_101500_configurable_sku_rules from './20260728_101500_configurable_sku_rules';
import * as migration_20260729_140108_media_text_block from './20260729_140108_media_text_block';
import * as migration_20260730_053858_media_text_layouts from './20260730_053858_media_text_layouts';
import * as migration_20260731_075754_m9_page_builder_foundations from './20260731_075754_m9_page_builder_foundations';
import * as migration_20260731_101005_m9_content_block_polish from './20260731_101005_m9_content_block_polish';
import * as migration_20260731_113512_m9_new_content_blocks from './20260731_113512_m9_new_content_blocks';
import * as migration_20260803_060000_redact_download_access_codes from './20260803_060000_redact_download_access_codes';

export const migrations = [
  {
    up: migration_20260727_101107_production_baseline.up,
    down: migration_20260727_101107_production_baseline.down,
    name: '20260727_101107_production_baseline',
  },
  {
    up: migration_20260727_131359_image_optimization_settings.up,
    down: migration_20260727_131359_image_optimization_settings.down,
    name: '20260727_131359_image_optimization_settings',
  },
  {
    up: migration_20260728_101500_configurable_sku_rules.up,
    down: migration_20260728_101500_configurable_sku_rules.down,
    name: '20260728_101500_configurable_sku_rules',
  },
  {
    up: migration_20260729_140108_media_text_block.up,
    down: migration_20260729_140108_media_text_block.down,
    name: '20260729_140108_media_text_block',
  },
  {
    up: migration_20260730_053858_media_text_layouts.up,
    down: migration_20260730_053858_media_text_layouts.down,
    name: '20260730_053858_media_text_layouts',
  },
  {
    up: migration_20260731_075754_m9_page_builder_foundations.up,
    down: migration_20260731_075754_m9_page_builder_foundations.down,
    name: '20260731_075754_m9_page_builder_foundations',
  },
  {
    up: migration_20260731_101005_m9_content_block_polish.up,
    down: migration_20260731_101005_m9_content_block_polish.down,
    name: '20260731_101005_m9_content_block_polish',
  },
  {
    up: migration_20260731_113512_m9_new_content_blocks.up,
    down: migration_20260731_113512_m9_new_content_blocks.down,
    name: '20260731_113512_m9_new_content_blocks',
  },
  {
    up: migration_20260803_060000_redact_download_access_codes.up,
    down: migration_20260803_060000_redact_download_access_codes.down,
    name: '20260803_060000_redact_download_access_codes',
  },
];
