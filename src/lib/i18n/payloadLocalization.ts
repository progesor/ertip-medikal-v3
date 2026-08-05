import type { CollectionConfig, Field, GlobalConfig } from "payload";
import { createEnglishBootstrapAfterCreateHook } from "@/lib/i18n/localeBootstrap";

function localizeFields(fields: Field[], fieldNames: ReadonlySet<string>): Field[] {
  return fields.map((field) => {
    if (
      "name" in field &&
      typeof field.name === "string" &&
      fieldNames.has(field.name)
    ) {
      return { ...field, localized: true };
    }

    if (field.type === "tabs") {
      return {
        ...field,
        tabs: field.tabs.map((tab) => ({
          ...tab,
          fields: localizeFields(tab.fields, fieldNames),
        })),
      };
    }

    if (field.type === "row" || field.type === "collapsible") {
      return {
        ...field,
        fields: localizeFields(field.fields, fieldNames),
      };
    }

    if (field.type === "group") {
      return {
        ...field,
        fields: localizeFields(field.fields, fieldNames),
      };
    }

    // Arrays and block internals are intentionally not traversed here. When an
    // array/blocks field itself is localized, Payload localizes the full nested
    // structure. This also prevents variant.title and SKU-driving attribute
    // fields from accidentally becoming localized.
    return field;
  });
}

function fieldsThatNeedFreshRowIds(fieldNames: readonly string[]) {
  const localizedRowFields = new Set(["layout", "specs"]);
  return fieldNames.filter((fieldName) => localizedRowFields.has(fieldName));
}

export function withLocalizedCollectionFields(
  collection: CollectionConfig,
  fieldNames: readonly string[],
): CollectionConfig {
  return {
    ...collection,
    fields: localizeFields(collection.fields, new Set(fieldNames)),
    hooks: {
      ...collection.hooks,
      afterChange: [
        ...(collection.hooks?.afterChange ?? []),
        createEnglishBootstrapAfterCreateHook({
          fields: fieldNames,
          stripNestedIds: fieldsThatNeedFreshRowIds(fieldNames),
        }),
      ],
    },
  };
}

export function withLocalizedGlobalFields(
  global: GlobalConfig,
  fieldNames: readonly string[],
): GlobalConfig {
  return {
    ...global,
    fields: localizeFields(global.fields, new Set(fieldNames)),
  };
}
