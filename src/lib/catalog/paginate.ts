// Kept as plain browser JavaScript so server bundlers cannot rewrite function source.
// No user input is interpolated into this script.
export const catalogPaginationScript = String.raw`
async function paginateCatalog() {
  await document.fonts.ready;
  await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined)));
  const pages = document.getElementById("pages");
  const template = document.getElementById("page-template");
  const source = document.getElementById("product-templates");
  const density = Number(document.body.dataset.density);
  let grid = null;
  let filled = density;
  const faults = [];
  const overflows = element => element.scrollHeight > element.clientHeight + 1;
  function nextSlot() {
    if (filled >= density) {
      const sheet = template.content.firstElementChild.cloneNode(true);
      pages.appendChild(sheet);
      grid = sheet.querySelector(".cards");
      filled = 0;
    }
    const card = document.createElement("article");
    card.className = "card";
    grid.appendChild(card);
    filled++;
    return card;
  }
  for (const product of Array.from(source.children)) {
    const heading = product.querySelector(".card-heading");
    const visual = product.querySelector(".visual");
    let card = nextSlot();
    card.appendChild(heading.cloneNode(true));
    if (visual) card.appendChild(visual.cloneNode(true));
    const content = product.querySelector(".units");
    let count = 0;
    for (const unit of Array.from(content.children)) {
      let copy = unit.cloneNode(true);
      card.appendChild(copy);
      // Give text a little more room before creating a continuation card.
      const image = card.querySelector(".visual");
      if (image && overflows(card)) {
        const currentHeight = image.getBoundingClientRect().height;
        const minimum = Number(image.dataset.minimumHeight || Math.max(40, currentHeight * .45));
        image.dataset.minimumHeight = String(minimum);
        const targetHeight = Math.max(minimum, currentHeight - (card.scrollHeight - card.clientHeight) - 2);
        image.style.height = targetHeight + "px";
      }
      if (overflows(card) && count > 0) {
        copy.remove();
        card = nextSlot();
        card.classList.add("continued");
        card.appendChild(heading.cloneNode(true));
        const note = document.createElement("small");
        note.className = "continuation";
        note.textContent = document.documentElement.lang === "en" ? "Continued" : "Devamı";
        card.appendChild(note);
        copy = unit.cloneNode(true);
        card.appendChild(copy);
        count = 0;
      }
      if (overflows(card) && count === 0) {
        card.querySelector(".visual")?.remove();
        if (overflows(card)) faults.push(heading.textContent || "");
      }
      count++;
    }
    if (overflows(card)) faults.push(heading.textContent || "");
  }
  const back = document.getElementById("back-template");
  if (back) pages.appendChild(back.content.cloneNode(true));
  const sheets = Array.from(pages.querySelectorAll(".sheet"));
  sheets.forEach((sheet, index) => {
    const number = sheet.querySelector(".number");
    if (number) number.textContent = String(index + 1).padStart(2, "0") + " / " + sheets.length;
    if (overflows(sheet)) faults.push("Kapak / altbilgi");
  });
  document.body.dataset.pages = String(sheets.length);
  document.body.dataset.overflow = [...new Set(faults)].join(" | ");
  document.body.dataset.ready = "true";
  window.parent.postMessage({
    type: "catalog-layout",
    pages: sheets.length,
    error: faults.length ? "Bazı içerikler sığmıyor. Sayfadaki ürün sayısını azaltın veya açıklamayı kısaltın." : ""
  }, "*");
}
paginateCatalog().catch(() => {
  document.body.dataset.failed = "true";
  window.parent.postMessage({type: "catalog-layout", pages: 0, error: "Önizleme yerleşimi oluşturulamadı."}, "*");
});
`;
