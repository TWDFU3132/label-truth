/* Label Truth — app logic. No build step, no framework. */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const TAG_LABEL = {
  "bug":"From bugs","animal":"From animals","maybe-animal":"May be animal","msg":"MSG-like",
  "sugar":"Sugar","sweetener":"Sweetener","dye":"Color","petro":"Petroleum-based",
  "pres":"Preservative","hidden":"Hidden meaning","banned":"Banned or restricted"
};
const TAG_ORDER = ["bug","animal","maybe-animal","msg","banned","dye","petro","sugar","sweetener","pres","hidden"];
const SCRIPTS = {
  scanner: "vendor/html5-qrcode.min.js",
  ocr: "vendor/tesseract.min.js"
};
const OFF_FIELDS = "code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,additives_tags,categories_tags,serving_quantity,serving_size,image_front_small_url,image_front_url";

// ---------- storage (best effort) ----------
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

// ---------- matching engine ----------
const norm = s => String(s || "").toLowerCase()
  .replace(/[’`]/g, "'").replace(/\s+/g, " ").trim();

const ALIASES = [];
window.GLOSSARY.forEach((e, i) => {
  const all = new Set([e.n.toLowerCase(), ...e.a.map(x => x.toLowerCase())]);
  all.forEach(a => {
    const clean = a.replace(/\(.*?\)/g, "").trim();
    if (clean.length < 2) return;
    const re = new RegExp("(^|[^a-z0-9])" + clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[\\s-]+") + "(?=$|[^a-z0-9])", "i");
    ALIASES.push({ alias: clean, idx: i, re });
  });
});
ALIASES.sort((a, b) => b.alias.length - a.alias.length);

function cleanIngredientText(t){
  return norm(t)
    .replace(/^.*?ingredients?\s*[:：]/i, "")
    .replace(/\b(contains|contain)\s+(\d+\s*%|two percent)\s+or\s+less\s+of\s*(each\s+of\s+)?(the\s+following\s*)?[:]?/gi, ",")
    .replace(/\bless than\s+\d+\s*%\s+of\s*[:]?/gi, ",")
    .replace(/\d+(\.\d+)?\s*%/g, "")
    .replace(/[*†‡]/g, "")
    .replace(/natural\s+(and|&)\s+artificial\s+(flavou?rs?|flavou?rings?)/g, "natural flavors, artificial flavors")
    .replace(/artificial\s+(and|&)\s+natural\s+(flavou?rs?|flavou?rings?)/g, "artificial flavors, natural flavors")
    .replace(/[\[{]/g, "(").replace(/[\]}]/g, ")");
}

function splitPieces(t){
  return t.split(/[,;()•·]|\.\s(?!\d)|\band\/or\b|:/)
    .map(p => p.replace(/^\s*(and|or|&)\s+/, "").replace(/\s*\.$/, "").trim())
    .filter(p => p && p.length > 1 && !/^(contains?|ingredients?|made with|allergens?)$/.test(p));
}

function decode(text, additiveTags){
  const cleaned = cleanIngredientText(text);
  const pieces = splitPieces(cleaned);
  const found = new Map(); // idx -> {entry, hits:Set}
  const unknown = [];
  const hitWords = new Set();
  pieces.forEach(p => {
    const taken = [];
    let any = false;
    for (const a of ALIASES){
      const m = a.re.exec(p);
      if (!m) continue;
      const start = m.index + m[1].length, end = start + m[0].length - m[1].length;
      if (taken.some(([s, e]) => start < e && end > s)) continue;
      taken.push([start, end]);
      any = true;
      const word = p.slice(start, end);
      hitWords.add(word);
      if (!found.has(a.idx)) found.set(a.idx, { entry: window.GLOSSARY[a.idx], hits: new Set(), order: found.size });
      found.get(a.idx).hits.add(word);
    }
    if (!any) unknown.push(p);
  });
  (additiveTags || []).forEach(tag => {
    const code = String(tag).replace(/^[a-z]{2}:/, "").toLowerCase();
    const a = ALIASES.find(x => x.alias === code);
    if (a && !found.has(a.idx)) found.set(a.idx, { entry: window.GLOSSARY[a.idx], hits: new Set([code.toUpperCase()]), order: found.size });
  });
  return { cleaned, pieces, found: [...found.values()].sort((a, b) => a.order - b.order), unknown: [...new Set(unknown)], hitWords };
}

function stripQualifiers(p){
  return p.replace(/^(organic|ground|dried|dry|whole|pure|natural|roasted|toasted|dehydrated|minced|chopped|crushed)\s+/g, "")
          .replace(/^(organic|ground|dried|dry|whole|pure|natural|roasted|toasted|dehydrated|minced|chopped|crushed)\s+/g, "").trim();
}

function matchDefects(product, pieces){
  const cats = (product.categories_tags || []).map(c => String(c).replace(/^[a-z]{2}:/, ""));
  const name = norm(product.product_name || "");
  const productHits = [], ingrHits = [];
  const P = pieces.map(stripQualifiers);
  window.DEFECTS.forEach(d => {
    const byCat = d.cats.some(c => cats.includes(c));
    const byName = name && d.words.some(w => new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(name));
    if (byCat || byName){ productHits.push(d); return; }
    const byIngr = d.ingr.some(ph => P.some(p => p === ph || (ph.includes(" ") && (p.endsWith(" " + ph) || p.startsWith(ph + " ")))));
    if (byIngr) ingrHits.push(d);
  });
  return { productHits, ingrHits };
}

function fmtNum(x){
  if (x >= 10) return Math.round(x).toString();
  if (x >= 1) return (Math.round(x * 10) / 10).toString();
  return (Math.round(x * 100) / 100).toString();
}

// ---------- rendering ----------
function tagHTML(t){ return `<span class="tag t-${t}">${esc(TAG_LABEL[t] || t)}</span>`; }

function termHTML(entry, hits){
  const tags = [...entry.t].sort((a, b) => TAG_ORDER.indexOf(a) - TAG_ORDER.indexOf(b));
  const seen = hits && hits.size ? ` <span class="muted tiny" style="display:block">label says: ${esc([...hits].join(", "))}</span>` : "";
  return `<details class="term">
    <summary><span><span class="word">${esc(entry.n)}</span>${seen}<span class="plain">${esc(entry.p)}</span></span>
      <span class="tags">${tags.map(tagHTML).join("")}</span></summary>
    <div class="body">
      <p><strong>Made from:</strong> ${esc(entry.f)}</p>
      <p><strong>Why it's in there:</strong> ${esc(entry.w)}</p>
      ${entry.x ? `<p class="heads"><strong>Heads up:</strong> ${esc(entry.x)}</p>` : ""}
    </div></details>`;
}

function highlight(raw, words){
  let html = esc(raw);
  const list = [...words].filter(w => w.length > 2).sort((a, b) => b.length - a.length);
  list.forEach(w => {
    const re = new RegExp("(^|[^a-z0-9>])(" + esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[\\s-]+") + ")(?=$|[^a-z0-9<])", "gi");
    html = html.replace(re, "$1<mark>$2</mark>");
  });
  return html;
}

function defectHTML(d, servingG, productLevel){
  const lines = d.items.map(it => {
    let lvl = it.text ? esc(it.text) : `${fmtNum(it.n)}+ per ${it.per} ${it.unit}${it.extra ? " " + esc(it.extra) : ""}`;
    let serv = "";
    if (productLevel && servingG && it.n && it.unit === "g"){
      const perServ = it.n * servingG / it.per;
      serv = `<br><span class="serv">≈ ${fmtNum(perServ)} per ${fmtNum(servingG)} g serving</span>`;
    }
    return `<li><strong>${esc(it.plain)}:</strong> ${lvl}${serv}</li>`;
  }).join("");
  return `<div class="defect"><div class="dname">${esc(d.name)}${productLevel ? "" : ' <span class="muted tiny">(an ingredient in this product)</span>'}</div><ul>${lines}</ul></div>`;
}

function renderResults({ product, source, text }){
  const r = decode(text, product.additives_tags);
  const counts = {};
  r.found.forEach(f => f.entry.t.forEach(t => counts[t] = (counts[t] || 0) + 1));
  const pills = TAG_ORDER.filter(t => counts[t]).map(t =>
    `<span class="pill t-${t}"><span class="dot"></span>${counts[t]} ${esc(TAG_LABEL[t])}</span>`).join("");
  const { productHits, ingrHits } = matchDefects(product, r.pieces);
  const servingG = Number(product.serving_quantity) > 0 && Number(product.serving_quantity) < 2000 ? Number(product.serving_quantity) : null;
  const rank = f => Math.min(...f.entry.t.map(t => { const i = TAG_ORDER.indexOf(t); return i < 0 ? 99 : i; }));
  const flagged = r.found.filter(f => f.entry.t.length).sort((a, b) => rank(a) - rank(b) || a.order - b.order);
  const plain = r.found.filter(f => !f.entry.t.length);

  const img = product.image_front_small_url || product.image_front_url;
  const title = product.product_name || "Ingredient list";
  const out = `
  <div class="card">
    <div class="product">
      ${img ? `<img src="${esc(img)}" alt="">` : ""}
      <div><div class="name">${esc(title)}</div>
      <div class="muted tiny">${esc(product.brands || "")}${product.code ? " · " + esc(product.code) : ""}${source ? " · from " + esc(source) : ""}</div></div>
    </div>
    <div class="summary">${(productHits.length || ingrHits.length) ? `<span class="pill t-bug"><span class="dot"></span>FDA bug/hair/mold limits apply</span>` : ""}${pills || '<span class="muted tiny">Nothing in our dictionary was flagged.</span>'}</div>
  </div>
  <div class="card">
    <h2>What the FDA allows in it</h2>
    ${productHits.length || ingrHits.length ? `
      <p class="tiny muted">These are the FDA's "defect action levels": the amount where the FDA <em>steps in</em>. It's a ceiling, not a measurement of this package. Most food has much less.</p>
      ${productHits.map(d => defectHTML(d, servingG, true)).join("")}
      ${ingrHits.map(d => defectHTML(d, null, false)).join("")}
      <p class="tiny muted">Source: <a href="https://www.fda.gov/food/current-good-manufacturing-practices-cgmps-food-and-dietary-supplements/food-defect-levels-handbook" target="_blank" rel="noopener">FDA Food Defect Levels Handbook</a>. Human hair and human DNA have no allowed level; they aren't on the FDA list at all.</p>`
      : `<p class="tiny muted">The FDA handbook doesn't set a bug/hair/mold level for this kind of product or its main ingredients. It covers about 50 foods, mostly spices, flour, fruits, vegetables, chocolate and peanut butter. That doesn't mean zero; it means there's no published number.</p>`}
  </div>
  <div class="card">
    <h2>What those words really mean</h2>
    ${flagged.length ? flagged.map(f => termHTML(f.entry, f.hits)).join("") : '<p class="muted tiny">No flagged ingredients found.</p>'}
    ${plain.length ? `<h3>Plain but worth knowing</h3>${plain.map(f => termHTML(f.entry, f.hits)).join("")}` : ""}
    ${r.unknown.length ? `<h3>Everything else on the label</h3><p class="unknown">${esc(r.unknown.join(" · "))}</p>` : ""}
  </div>
  <div class="card">
    <h2>Full ingredient list</h2>
    <p class="ingr-raw">${highlight(text, r.hitWords)}</p>
    <button class="alt small" id="btnAgain">Scan another</button>
  </div>`;
  const res = $("#results");
  res.innerHTML = out;
  res.classList.remove("hidden");
  $("#btnAgain").onclick = () => { res.classList.add("hidden"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  res.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- status ----------
function status(msg, busy){
  const s = $("#status");
  if (!msg){ s.classList.add("hidden"); return; }
  s.innerHTML = (busy ? '<span class="row"><span class="spin"></span><span>' : "<span><span>") + esc(msg) + "</span></span>";
  s.classList.remove("hidden");
}

// ---------- lookups ----------
async function fetchJSON(url, ms = 12000){
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json(); }
  finally { clearTimeout(t); }
}

function codeVariants(code){
  const c = code.replace(/\D/g, "");
  const v = new Set([c]);
  if (c.length === 12) v.add("0" + c);
  if (c.length === 13 && c.startsWith("0")) v.add(c.slice(1));
  if (c.length === 14) v.add(c.replace(/^0+/, ""));
  return [...v];
}

async function lookupOFF(code){
  for (const c of codeVariants(code)){
    try {
      const d = await fetchJSON(`https://world.openfoodfacts.org/api/v2/product/${c}.json?fields=${OFF_FIELDS}`);
      if (d && d.status === 1 && d.product){
        const p = d.product; p.code = p.code || c;
        p.product_name = p.product_name_en || p.product_name;
        const text = p.ingredients_text_en || p.ingredients_text || "";
        return { product: p, text, source: "Open Food Facts" };
      }
    } catch (e) { /* try next */ }
  }
  return null;
}

async function lookupUSDA(code){
  const key = store.get("usdaKey", "") || "DEMO_KEY";
  const bare = code.replace(/\D/g, "").replace(/^0+/, "");
  try {
    const d = await fetchJSON(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(code.replace(/\D/g, ""))}&dataType=Branded&pageSize=10`);
    const foods = (d && d.foods) || [];
    const f = foods.find(x => String(x.gtinUpc || "").replace(/^0+/, "") === bare) || null;
    if (!f) return null;
    const unit = String(f.servingSizeUnit || "").toLowerCase();
    const product = {
      code: f.gtinUpc, product_name: titleCase(f.description || ""), brands: f.brandName || f.brandOwner || "",
      categories_tags: f.brandedFoodCategory ? [norm(f.brandedFoodCategory).replace(/[^a-z0-9]+/g, "-")] : [],
      serving_quantity: (unit === "g" || unit === "grm") ? f.servingSize : null
    };
    return { product, text: f.ingredients || "", source: "USDA FoodData Central" };
  } catch (e) { return null; }
}

function titleCase(s){ return s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase()); }

async function lookupBarcode(code){
  code = String(code || "").replace(/\D/g, "");
  if (code.length < 6){ status("That doesn't look like a barcode number. Most are 12 or 13 digits."); return; }
  status("Looking up " + code + "…", true);
  let hit = await lookupOFF(code);
  if (!hit || !hit.text){
    status("Not in Open Food Facts. Trying USDA…", true);
    const u = await lookupUSDA(code);
    if (u && u.text) hit = u;
    else if (!hit && u) hit = u;
  }
  if (!hit){
    status("Couldn't find this product in either database. Tap 'Photo of ingredients' and snap the ingredient list instead.");
    return;
  }
  if (!hit.text){
    status("Found the product, but its ingredient list isn't in the database yet. Tap 'Photo of ingredients' and snap the label.");
    return;
  }
  status("");
  saveHistory({ code, name: hit.product.product_name || code });
  renderResults(hit);
}

// ---------- history ----------
function saveHistory(item){
  const h = store.get("hist", []).filter(x => x.code !== item.code);
  h.unshift({ ...item, at: Date.now() });
  store.set("hist", h.slice(0, 20));
  renderHistory();
}
function renderHistory(){
  const h = store.get("hist", []);
  const el = $("#hist");
  if (!h.length){ el.textContent = "Nothing scanned yet."; return; }
  el.innerHTML = h.map(x => `<a href="#" data-code="${esc(x.code)}">${esc(x.name)} <span class="muted">· ${esc(x.code)}</span></a>`).join("");
  el.querySelectorAll("a").forEach(a => a.onclick = e => { e.preventDefault(); lookupBarcode(a.dataset.code); });
}

// ---------- script loader ----------
const loaded = {};
function loadScript(src){
  if (loaded[src]) return loaded[src];
  loaded[src] = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src; s.async = true;
    s.onload = res; s.onerror = () => { delete loaded[src]; rej(new Error("Couldn't load " + src)); };
    document.head.appendChild(s);
  });
  return loaded[src];
}

// ---------- barcode scanning ----------
let scanner = null;
const BARCODE_FORMATS = () => {
  const F = window.Html5QrcodeSupportedFormats;
  return [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E];
};
async function startScan(){
  try {
    status("Starting camera…", true);
    await loadScript(SCRIPTS.scanner);
    $("#scanWrap").classList.remove("hidden");
    scanner = new window.Html5Qrcode("reader", { formatsToSupport: BARCODE_FORMATS(), experimentalFeatures: { useBarCodeDetectorIfSupported: true }, verbose: false });
    await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: (w, h) => ({ width: Math.min(300, w * 0.85), height: Math.min(150, h * 0.4) }) },
      async text => { await stopScan(); $("#barcode").value = text; lookupBarcode(text); }, () => {});
    status("Point the camera at the barcode.");
  } catch (e) {
    await stopScan();
    status("Couldn't open the live camera (" + (e && e.message ? e.message : e) + "). Taking a photo of the barcode instead.");
    $("#fileBarcode").click();
  }
}
async function stopScan(){
  if (scanner){ try { await scanner.stop(); } catch {} try { scanner.clear(); } catch {} scanner = null; }
  $("#scanWrap").classList.add("hidden");
}
async function scanBarcodeFile(file){
  try {
    status("Reading barcode from photo…", true);
    await loadScript(SCRIPTS.scanner);
    const h = new window.Html5Qrcode("hiddenReader", { formatsToSupport: BARCODE_FORMATS(), experimentalFeatures: { useBarCodeDetectorIfSupported: true }, verbose: false });
    const text = await h.scanFile(file, false);
    try { h.clear(); } catch {}
    $("#barcode").value = text;
    lookupBarcode(text);
  } catch (e) {
    status("Couldn't read a barcode in that photo. Try closer, flatter and in good light, or type the number in.");
  }
}

// ---------- OCR ----------
async function ocrLabel(file){
  try {
    status("Loading the text reader (first time takes a bit)…", true);
    await loadScript(SCRIPTS.ocr);
    const base = new URL("vendor/", location.href).href;
    const worker = await window.Tesseract.createWorker("eng", 1, {
      workerPath: base + "worker.min.js", corePath: base + "tesseract-core", langPath: base + "lang",
      logger: m => { if (m.status === "recognizing text") status("Reading label… " + Math.round((m.progress || 0) * 100) + "%", true); }
    });
    const { data } = await worker.recognize(file);
    worker.terminate();
    const text = (data && data.text || "").replace(/\s*\n\s*/g, " ").trim();
    if (!text){ status("Couldn't read any text. Try a sharper, closer photo of just the ingredient list."); return; }
    $("#pasteText").value = text;
    $("#pasteText").closest("details").open = true;
    status("Read the label. Check the text for typos (photos aren't perfect), then tap 'Decode ingredients'.");
    decodePasted();
  } catch (e) {
    status("The text reader didn't load. Check your connection, or paste the ingredients in by hand.");
  }
}

function decodePasted(){
  const t = $("#pasteText").value.trim();
  if (!t){ status("Paste or type an ingredient list first."); return; }
  status("");
  renderResults({ product: { product_name: "Your ingredient list" }, source: "", text: t });
}

// ---------- search ----------
function doSearch(){
  const q = norm($("#search").value);
  const out = $("#searchOut");
  if (q.length < 2){ out.innerHTML = ""; return; }
  const hits = window.GLOSSARY.filter(e => e.n.toLowerCase().includes(q) || e.a.some(a => a.includes(q)) || e.p.toLowerCase().includes(q)).slice(0, 12);
  out.innerHTML = hits.length ? hits.map(e => termHTML(e)).join("") : `<p class="muted tiny">Not in the dictionary yet.</p>`;
  if (hits.length === 1) out.querySelector("details").open = true;
}

// ---------- wire up ----------
$("#btnScan").onclick = startScan;
$("#btnStop").onclick = () => { stopScan(); status(""); };
$("#btnBarcodePhoto").onclick = () => { stopScan(); $("#fileBarcode").click(); };
$("#btnPhoto").onclick = () => $("#fileLabel").click();
$("#fileBarcode").onchange = e => { const f = e.target.files[0]; if (f) scanBarcodeFile(f); e.target.value = ""; };
$("#fileLabel").onchange = e => { const f = e.target.files[0]; if (f) ocrLabel(f); e.target.value = ""; };
$("#btnLookup").onclick = () => lookupBarcode($("#barcode").value);
$("#barcode").addEventListener("keydown", e => { if (e.key === "Enter") lookupBarcode($("#barcode").value); });
$("#btnDecode").onclick = decodePasted;
$("#search").addEventListener("input", doSearch);
$("#usdaKey").value = store.get("usdaKey", "");
$("#btnSaveKey").onclick = () => { store.set("usdaKey", $("#usdaKey").value.trim()); status("USDA key saved on this phone."); };
$("#btnClear").onclick = () => { store.set("hist", []); renderHistory(); };
$("#btnShare").onclick = async () => {
  const data = { title: "Label Truth", text: "Scan food and see what's really in it", url: location.href.split("#")[0] };
  try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); status("Link copied. Send it to your friends."); } } catch {}
};
renderHistory();

// open a barcode from the URL: ...#upc=0123456789
const m = location.hash.match(/upc=(\d+)/);
if (m) lookupBarcode(m[1]);

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// expose for testing
window.LabelTruth = { decode, matchDefects };
})();
