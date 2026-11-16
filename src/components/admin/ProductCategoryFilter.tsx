import type { BeforeListTableServerProps } from "payload";
import { ProductCategorySelect } from "./ProductCategorySelect";

export async function ProductCategoryFilter({ payload, locale, user }: BeforeListTableServerProps) {
  const { docs } = await payload.find({
    collection: "categories",
    locale: locale?.code === "en" ? "en" : "tr",
    depth: 0,
    pagination: false,
    overrideAccess: false,
    user,
    select: { title: true, parent: true },
  });

  const options = docs.filter((category) => !category.parent).flatMap((parent) => {
    const children = docs.filter((category) => category.parent === parent.id);
    return [
      { label: parent.title, ids: [parent.id, ...children.map((child) => child.id)] },
      ...children.map((child) => ({ label: `${parent.title} / ${child.title}`, ids: [child.id] })),
    ];
  });

  return <ProductCategorySelect options={options} />;
}
