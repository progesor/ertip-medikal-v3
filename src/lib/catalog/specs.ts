type Specification = { key: string; value: string };
function priority(key: string) {
  const name = key.toLocaleLowerCase("tr");
  if (
    /çap|diameter|uzunluk|length|ölçü|dimension|açı|angle|motor|güç|power|hız|speed|kapasite|capacity/.test(
      name,
    )
  )
    return 0;
  if (
    /malzeme|material|model|uç |tip |ekran|display|screen|kontrol|control/.test(
      name,
    )
  )
    return 1;
  if (/üretim|manufacturer|menşe|origin|marka|brand|ülke|country/.test(name))
    return 4;
  if (/ürün tipi|product type/.test(name)) return 3;
  return 2;
}
export function selectCatalogSpecs(specs: Specification[], limit: number) {
  const valid = specs.filter((spec) => spec.key?.trim() && spec.value?.trim());
  if (limit === Infinity) return valid;
  return valid
    .map((spec, index) => ({ spec, index }))
    .sort(
      (a, b) =>
        priority(a.spec.key) - priority(b.spec.key) || a.index - b.index,
    )
    .slice(0, limit)
    .map((item) => item.spec);
}
