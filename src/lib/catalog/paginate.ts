// Plain JavaScript shared by server-side preview and PDF layout.
export const catalogPaginationScript = String.raw`
async function paginateCatalog() {
  await Promise.race([document.fonts.ready, new Promise((_, reject) => setTimeout(() => reject(Error("Font timeout")), 15000))]);
  await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined)));
  const root = document.getElementById("pages");
  const sheetTemplate = document.getElementById("page-template");
  const faults = [];
  const sections = new Map();
  let serial = 0;
  const overflow = node => node.scrollHeight > node.clientHeight + 2 || node.scrollWidth > node.clientWidth + 2;
  function identify(sheet, plan) {
    sheet.id = "catalog-page-" + (++serial);
    const anchor=document.createElement("span");anchor.id=sheet.id+"-top";
    anchor.style.cssText="position:absolute;top:0;left:0;width:1px;height:1px";
    sheet.prepend(anchor);sheet.dataset.anchor=anchor.id;
    sheet.dataset.plan = plan.dataset.plan || "";
    sheet.dataset.title = plan.dataset.title || "";
    sheet.dataset.kind = plan.dataset.kind;
    if (sheet.dataset.title && !sections.has(sheet.dataset.title)) sections.set(sheet.dataset.title, sheet);
  }
  function newSheet(plan, capacity, layout) {
    const sheet = sheetTemplate.content.firstElementChild.cloneNode(true);
    identify(sheet, plan);
    sheet.classList.add("layout-" + layout);
    if (capacity >= 6) sheet.classList.add("dense");
    const columns = layout === "grid" ? (capacity === 1 ? 1 : capacity === 9 ? 3 : 2) : 1;
    const rows = Math.ceil(capacity / columns);
    const grid = sheet.querySelector(".cards");
    grid.style.setProperty("--cols", columns);
    grid.style.setProperty("--rows", rows);
    root.appendChild(sheet);
    if (document.body.dataset.bands === "true" && plan.dataset.title) {
      const band = document.createElement("div"); band.className = "section-band";
      const title = document.createElement("h2"); title.textContent = plan.dataset.title;
      band.appendChild(title); grid.before(band); sheet.classList.add("has-band");
    }
    const cardHeight = (grid.clientHeight - Math.max(0, rows-1)*19) / rows;
    grid.style.setProperty("--visual", Math.max(36, Math.min(200, cardHeight * (layout === "rows" ? .8 : .30))) + "px");
    return {sheet, grid};
  }
  function fit(card) {
    if (!overflow(card)) return true;
    card.classList.add("tight");
    const visual = card.querySelector(".visual");
    if (visual && !card.closest(".layout-spotlight")) visual.style.height = Math.max(32, visual.getBoundingClientRect().height*.65) + "px";
    return !overflow(card);
  }
  function fullProduct(original, plan) {
    let current = newSheet(plan, 1, "spotlight");
    let card = original.cloneNode(true);
    current.grid.appendChild(card);
    if (fit(card)) return;
    const units = Array.from(card.querySelector(".copy").children).map(unit=>unit.cloneNode(true));
    card.querySelector(".copy").replaceChildren();
    let placed = 0;
    for (const unit of units) {
      card.querySelector(".copy").appendChild(unit);
      if (overflow(card) && placed > 0) {
        unit.remove();
        current = newSheet(plan, 1, "spotlight");
        card = original.cloneNode(true);
        card.querySelector(".copy").replaceChildren();
        const note = document.createElement("small");
        note.className = "continuation";
        note.textContent = document.documentElement.lang === "en" ? "Technical specifications · continued" : "Teknik özellikler · devamı";
        card.querySelector(".card-heading").appendChild(note);
        current.grid.appendChild(card);
        card.querySelector(".copy").appendChild(unit);
        placed = 0;
      }
      if (!fit(card)) faults.push(card.querySelector("h2").textContent);
      placed++;
    }
  }
  for (const plan of document.querySelectorAll("template.planned")) {
    if (plan.dataset.kind === "divider") {
      const sheet = plan.content.firstElementChild.cloneNode(true);
      identify(sheet, plan); root.appendChild(sheet); continue;
    }
    const products = Array.from(plan.content.children);
    const capacity = Math.min(Number(plan.dataset.density), products.length);
    const layout = plan.dataset.layout === "spotlight" || capacity === 1 ? "spotlight" : plan.dataset.layout;
    let current = null, filled = 0;
    for (const original of products) {
      if (!current || filled >= capacity) { current = newSheet(plan, capacity, layout); filled = 0; }
      const card = original.cloneNode(true); current.grid.appendChild(card);
      // Cloned template images need decoding too, before their dimensions are measured.
      await Promise.all(Array.from(card.querySelectorAll("img")).map(image=>image.decode().catch(()=>undefined)));
      if (!fit(card)) {
        card.remove();
        if (!filled) {
          for (const [title,sheet] of sections) if (sheet===current.sheet) sections.delete(title);
          current.sheet.remove();
        }
        fullProduct(original, plan);
        current=null; filled=0;
      } else filled++;
    }
  }
  const back = document.getElementById("back-template");
  if (back) {const sheet=back.content.firstElementChild.cloneNode(true);sheet.dataset.kind="back";sheet.dataset.title=document.documentElement.lang==="en"?"Back cover":"Arka kapak";root.appendChild(sheet);}
  if (document.body.dataset.toc === "true" && sections.size) {
    const reference = root.querySelector(".sheet:not(.cover)");
    const tocTemplate = document.getElementById("toc-template");
    let toc = null;
    for (const [title, target] of sections) {
      if (!toc) {toc=tocTemplate.content.firstElementChild.cloneNode(true);toc.dataset.kind="toc";toc.dataset.title=document.documentElement.lang==="en"?"Contents":"İçindekiler";root.insertBefore(toc,reference);}
      const row=document.createElement("a");row.className="toc-row";row.href="#"+target.dataset.anchor;
      const label=document.createElement("span");label.textContent=title;
      const number=document.createElement("b");number.dataset.target=target.dataset.anchor;
      row.append(label,number);toc.querySelector(".toc-list").appendChild(row);
      const bottom=row.getBoundingClientRect().bottom;
      const safeBottom=toc.querySelector("footer").getBoundingClientRect().top-25;
      if(bottom>safeBottom) {
        row.remove();toc=tocTemplate.content.firstElementChild.cloneNode(true);toc.dataset.kind="toc";toc.dataset.title=document.documentElement.lang==="en"?"Contents":"İçindekiler";root.insertBefore(toc,reference);toc.querySelector(".toc-list").appendChild(row);
      }
    }
  }
  const sheets=Array.from(root.querySelectorAll(".sheet"));
  sheets.forEach((sheet,index)=>{
    sheet.dataset.page=String(index+1);
    const number=sheet.querySelector(".number");
    if(number)number.textContent=String(index+1).padStart(2,"0")+" / "+sheets.length;
    if(sheet.classList.contains("cover")) {
      const title=sheet.querySelector(".cover-title").getBoundingClientRect();
      const bounds=sheet.getBoundingClientRect();
      if(title.right>bounds.right || title.bottom>sheet.querySelector("footer").getBoundingClientRect().top)faults.push(sheet.dataset.title || "Cover");
    } else if(overflow(sheet))faults.push(sheet.dataset.title || "Page");
  });
  for (const number of root.querySelectorAll("[data-target]")) number.textContent=document.getElementById(number.dataset.target)?.closest(".sheet")?.dataset.page || "";
  document.body.dataset.pages=String(sheets.length);
  document.body.dataset.overflow=[...new Set(faults)].join(" | ");
  document.body.dataset.ready="true";
}
paginateCatalog().catch(error=>{
  document.body.dataset.failed="true";
  document.body.dataset.failure=String(error.message || error);
});
`;
