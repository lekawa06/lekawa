// ⚠️  FICHIER GÉNÉRÉ — ne pas éditer ici.
// Source : K-BIR-X-AIT-SaaS/tracker/analytics.ts · régénérer avec `node tracker/sync.mjs`

const PROJECT = "k-bir-tools";
const API_KEY = "AIzaSyAGnYBsx5w4kz-Z3RUgG3CK7Df04GE9E8U";
const DOCS = `projects/${PROJECT}/databases/(default)/documents`;
const BASE = `https://firestore.googleapis.com/v1/${DOCS}`;
const COMMIT = `https://firestore.googleapis.com/v1/${DOCS}:commit?key=${API_KEY}`;
const SITE_ID = "kawa";
const NS = "kawa";
const MAX_EVENTS_PER_PAGE = 200;
const BATCH_SIZE = 15;
const BATCH_DELAY_MS = 3e3;
const MAX_QUEUED_BEFORE_CONSENT = 60;
let _opts = {
  requireConsent: false,
  autocapture: true,
  webVitals: true,
  allowLocalhost: false
};
function uid() {
  var _a, _b;
  return (_b = (_a = crypto.randomUUID) == null ? void 0 : _a.call(crypto)) != null ? _b : Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function getVisitorId() {
  try {
    const KEY = `${NS}_vid`;
    const stored = localStorage.getItem(KEY);
    if (stored) return { id: stored, isNew: false };
    const id = uid();
    localStorage.setItem(KEY, id);
    return { id, isNew: true };
  } catch {
    return { id: uid(), isNew: true };
  }
}
function getSessionId() {
  try {
    const KEY = `${NS}_sid`;
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = uid();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return fallbackSession();
  }
}
let _fallbackSessionId = "";
function fallbackSession() {
  if (!_fallbackSessionId) _fallbackSessionId = uid();
  return _fallbackSessionId;
}
function getDevice() {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}
function getBrowser() {
  const ua = navigator.userAgent;
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Edg/i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua)) return "Safari";
  return "Other";
}
function getOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}
const SEARCH_ENGINES = /google|bing|duckduckgo|yahoo|ecosia|qwant|brave|baidu|yandex/i;
const SOCIAL_NETWORKS = /facebook|instagram|tiktok|youtube|linkedin|twitter|^t\.co$|x\.com|pinterest|snapchat|reddit|whatsapp|messenger|threads/i;
const CLICK_IDS = ["gclid", "gbraid", "wbraid", "msclkid", "fbclid", "ttclid", "twclid", "li_fat_id", "epik"];
const EMPTY_ATTRIBUTION = {
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmTerm: "",
  utmContent: "",
  clickId: "",
  clickIdType: "",
  channel: "direct",
  referrerHost: "",
  landingPage: ""
};
function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
function deriveChannel(a) {
  const medium = a.utmMedium.toLowerCase();
  const source = a.utmSource.toLowerCase();
  const paidMedium = /^(cpc|ppc|paid|paidsearch|paid_search|paidsocial|paid_social|cpm|display|retargeting)$/.test(medium);
  if (a.clickIdType === "gclid" || a.clickIdType === "gbraid" || a.clickIdType === "wbraid" || a.clickIdType === "msclkid") {
    return "paid_search";
  }
  if (a.clickIdType === "fbclid" || a.clickIdType === "ttclid" || a.clickIdType === "twclid" || a.clickIdType === "li_fat_id") {
    return "paid_social";
  }
  if (medium === "email" || medium === "newsletter" || source === "klaviyo" || source === "mailchimp") return "email";
  if (medium === "sms") return "sms";
  if (medium === "affiliate" || medium === "affiliation") return "affiliate";
  if (paidMedium) return SOCIAL_NETWORKS.test(source) ? "paid_social" : "paid_search";
  if (medium === "social" || source && SOCIAL_NETWORKS.test(source)) return "social";
  if (source && SEARCH_ENGINES.test(source)) return "organic_search";
  if (a.utmSource || a.utmCampaign) return "campaign";
  if (a.referrerHost) {
    if (SEARCH_ENGINES.test(a.referrerHost)) return "organic_search";
    if (SOCIAL_NETWORKS.test(a.referrerHost)) return "social";
    return "referral";
  }
  return "direct";
}
function readAttribution() {
  var _a, _b, _c, _d, _e;
  const p = new URLSearchParams(location.search);
  let clickId = "";
  let clickIdType = "";
  for (const key of CLICK_IDS) {
    const v = p.get(key);
    if (v) {
      clickId = v.slice(0, 120);
      clickIdType = key;
      break;
    }
  }
  const referrerHost = hostOf(document.referrer);
  const external = referrerHost && referrerHost !== location.hostname.replace(/^www\./, "") ? referrerHost : "";
  const partial = {
    utmSource: ((_a = p.get("utm_source")) != null ? _a : "").slice(0, 80),
    utmMedium: ((_b = p.get("utm_medium")) != null ? _b : "").slice(0, 80),
    utmCampaign: ((_c = p.get("utm_campaign")) != null ? _c : "").slice(0, 120),
    utmTerm: ((_d = p.get("utm_term")) != null ? _d : "").slice(0, 120),
    utmContent: ((_e = p.get("utm_content")) != null ? _e : "").slice(0, 120),
    clickId,
    clickIdType,
    referrerHost: external,
    landingPage: location.pathname.slice(0, 200)
  };
  return { ...partial, channel: deriveChannel(partial) };
}
function getSource() {
  try {
    const KEY = `${NS}_src`;
    const fresh = readAttribution();
    const hasSignal = fresh.utmSource || fresh.clickId || fresh.referrerHost || fresh.utmCampaign;
    const saved = sessionStorage.getItem(KEY);
    if (saved && !hasSignal) return { ...EMPTY_ATTRIBUTION, ...JSON.parse(saved) };
    if (hasSignal) sessionStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    return EMPTY_ATTRIBUTION;
  }
}
function getFirstTouch(current) {
  const fallback = {
    channel: current.channel,
    source: current.utmSource || current.referrerHost || "direct",
    campaign: current.utmCampaign,
    date: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const KEY = `${NS}_ft`;
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(KEY, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}
function toFs(v) {
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFs) } };
  if (v && typeof v === "object") {
    const f = {};
    for (const [k, val] of Object.entries(v)) f[k] = toFs(val);
    return { mapValue: { fields: f } };
  }
  return { nullValue: null };
}
function doc(fields) {
  const f = {};
  for (const [k, val] of Object.entries(fields)) f[k] = toFs(val);
  return { fields: f };
}
function post(collection, fields) {
  return fetch(`${BASE}/${collection}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc(fields)),
    keepalive: true
  }).then((r) => r.ok ? r.json() : null).then((d) => {
    var _a;
    return (_a = d == null ? void 0 : d.name) != null ? _a : null;
  }).catch(() => null);
}
function label(el) {
  const explicit = el.getAttribute("data-track-label");
  if (explicit) return explicit.slice(0, 80);
  const text = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim();
  return (text || el.tagName.toLowerCase()).slice(0, 80);
}
let _path = null;
let _t0 = 0;
let _page = "";
let _maxScroll = 0;
let _visitor = { id: "", isNew: false };
let _started = false;
let _clicks = 0;
let _eventsThisPage = 0;
let _activeMs = 0;
let _lastActiveAt = 0;
let _pageIndex = 0;
const _seenView = /* @__PURE__ */ new Set();
const _seenHover = /* @__PURE__ */ new Set();
let _consent = "granted";
let _queue = [];
function setConsent(granted) {
  if (_consent === (granted ? "granted" : "denied")) return;
  _consent = granted ? "granted" : "denied";
  if (!granted) {
    _queue = [];
    return;
  }
  const pending = _queue;
  _queue = [];
  for (const item of pending) enqueue(item.collection, item.fields);
  flushEvents();
  if (_started && !_path) void createVisit(_page || location.pathname);
}
let _batch = [];
let _batchTimer;
function enqueue(collection, fields) {
  if (_consent === "denied") return;
  if (_consent === "pending") {
    if (_queue.length < MAX_QUEUED_BEFORE_CONSENT) _queue.push({ collection, fields });
    return;
  }
  _batch.push({ collection, fields });
  if (_batch.length >= BATCH_SIZE) {
    flushEvents();
    return;
  }
  if (_batchTimer === void 0) {
    _batchTimer = window.setTimeout(flushEvents, BATCH_DELAY_MS);
  }
}
function flushEvents() {
  if (_batchTimer !== void 0) {
    clearTimeout(_batchTimer);
    _batchTimer = void 0;
  }
  if (_batch.length === 0) return;
  const writes = _batch.map((item) => ({
    update: { name: `${DOCS}/${item.collection}/${uid()}`, ...doc(item.fields) }
  }));
  _batch = [];
  fetch(COMMIT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ writes }),
    keepalive: true
    // survit à la fermeture de l'onglet
  }).catch(() => {
  });
}
async function createVisit(page) {
  _t0 = Date.now();
  _lastActiveAt = Date.now();
  _activeMs = 0;
  _page = page;
  _maxScroll = 0;
  _clicks = 0;
  _eventsThisPage = 0;
  _pageIndex++;
  if (_consent !== "granted") {
    _path = null;
    return;
  }
  const src = getSource();
  const ft = getFirstTouch(src);
  _path = await post("analytics", {
    siteId: SITE_ID,
    visitorId: _visitor.id,
    sessionId: getSessionId(),
    isNewVisitor: _visitor.isNew,
    page,
    referrer: document.referrer || "",
    device: getDevice(),
    browser: getBrowser(),
    os: getOS(),
    language: navigator.language.split("-")[0],
    screenWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    duration: 0,
    maxScroll: 0,
    ctaClicks: 0,
    activeTime: 0,
    firstTouchChannel: ft.channel,
    firstTouchSource: ft.source,
    firstTouchCampaign: ft.campaign,
    ...src
  });
}
function flushVisit() {
  flushEvents();
  if (!_path || !_t0) return;
  const duration = Math.round((Date.now() - _t0) / 1e3);
  if (duration < 2 && _maxScroll === 0 && _clicks === 0) return;
  const activeTime = Math.round(activeMsNow() / 1e3);
  const mask = ["duration", "maxScroll", "ctaClicks", "activeTime"].map((f) => `updateMask.fieldPaths=${f}`).join("&");
  fetch(`https://firestore.googleapis.com/v1/${_path}?${mask}&key=${API_KEY}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc({ duration, maxScroll: _maxScroll, ctaClicks: _clicks, activeTime })),
    keepalive: true
  }).catch(() => {
  });
}
function activeMsNow() {
  if (document.visibilityState === "visible" && _lastActiveAt) {
    return _activeMs + (Date.now() - _lastActiveAt);
  }
  return _activeMs;
}
function trackEvent(type, name, opts = {}) {
  var _a, _b, _c, _d;
  if (typeof window === "undefined" || !_started) return;
  if (_eventsThisPage >= MAX_EVENTS_PER_PAGE) return;
  _eventsThisPage++;
  enqueue("analyticsEvents", {
    siteId: SITE_ID,
    visitorId: _visitor.id,
    sessionId: getSessionId(),
    isNewVisitor: _visitor.isNew,
    type,
    name: name.slice(0, 110),
    // les règles Firestore refusent au-delà de 120
    label: ((_a = opts.label) != null ? _a : name).slice(0, 120),
    href: ((_b = opts.href) != null ? _b : "").slice(0, 300),
    page: _page || location.pathname,
    device: getDevice(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    isGoal: opts.goal === true,
    value: (_c = opts.value) != null ? _c : 0,
    secondsOnPage: Math.round((Date.now() - _t0) / 1e3),
    ...(_d = opts.extra) != null ? _d : {}
  });
}
function trackCommerce(name, payload = {}) {
  var _a, _b, _c, _d, _e;
  const items = ((_a = payload.items) != null ? _a : []).slice(0, 20).map((it) => {
    var _a2, _b2, _c2, _d2, _e2, _f, _g;
    return {
      productId: String((_a2 = it.productId) != null ? _a2 : "").slice(0, 60),
      variantId: String((_b2 = it.variantId) != null ? _b2 : "").slice(0, 60),
      title: String((_c2 = it.title) != null ? _c2 : "").slice(0, 100),
      variantTitle: String((_d2 = it.variantTitle) != null ? _d2 : "").slice(0, 60),
      vendor: String((_e2 = it.vendor) != null ? _e2 : "").slice(0, 60),
      price: Number((_f = it.price) != null ? _f : 0),
      quantity: Math.round(Number((_g = it.quantity) != null ? _g : 1))
    };
  });
  trackEvent("commerce", name, {
    label: (_b = payload.label) != null ? _b : name,
    goal: payload.goal === true,
    value: (_c = payload.value) != null ? _c : 0,
    extra: {
      currency: (_d = payload.currency) != null ? _d : "EUR",
      itemCount: items.reduce((n, it) => n + (it.quantity || 0), 0),
      items,
      ...(_e = payload.extra) != null ? _e : {}
    }
  });
}
function getTrackingIds() {
  return {
    visitorId: _visitor.id || getVisitorId().id,
    sessionId: getSessionId(),
    attribution: typeof window === "undefined" ? EMPTY_ATTRIBUTION : getSource()
  };
}
const BOOKING_PROVIDERS = [
  [/zenchef/i, "zenchef"],
  [/thefork|lafourchette/i, "thefork"],
  [/sevenrooms/i, "sevenrooms"],
  [/opentable/i, "opentable"],
  [/resy\.com/i, "resy"],
  [/guestonline/i, "guestonline"],
  [/covermanager/i, "covermanager"],
  [/tablebooker/i, "tablebooker"],
  [/formitable/i, "formitable"],
  [/resengo/i, "resengo"],
  [/quandoo/i, "quandoo"],
  [/bookatable/i, "bookatable"],
  [/mozrest/i, "mozrest"],
  [/planity/i, "planity"],
  [/calendly/i, "calendly"],
  [/reserve\.google|google\.[a-z.]+\/maps\/reserve/i, "google_reserve"],
  [/bookings?\.|\/booking|\/reservation|\/reserver|\/reserve(?:r)?(?:[/?#]|$)/i, "site"]
];
const ORDER_PROVIDERS = [
  [/ubereats|uber\.com\/.*eats/i, "ubereats"],
  [/deliveroo/i, "deliveroo"],
  [/just-?eat/i, "justeat"],
  [/glovo/i, "glovo"],
  [/delicity/i, "delicity"],
  [/sunday|sundayapp/i, "sunday"]
];
const RESERVE_TEXT = /\b(r[ée]serv\w*|book(ing)?|book a table)\b/i;
function providerOf(href, table) {
  if (!href) return "";
  for (const [re, name] of table) if (re.test(href)) return name;
  return "";
}
function intentOf(el) {
  var _a;
  const href = (_a = el.getAttribute("href")) != null ? _a : "";
  const text = label(el);
  if (href.startsWith("tel:")) return { name: "call", provider: "phone" };
  if (href.startsWith("sms:")) return { name: "sms", provider: "sms" };
  if (href.startsWith("mailto:")) return { name: "email", provider: "email" };
  if (/wa\.me|whatsapp\.com|api\.whatsapp/i.test(href)) return { name: "whatsapp", provider: "whatsapp" };
  const order = providerOf(href, ORDER_PROVIDERS);
  if (order) return { name: "order", provider: order };
  const booking = /^https?:|^\//i.test(href) ? providerOf(href, BOOKING_PROVIDERS) : "";
  if (booking) return { name: "reserve", provider: booking };
  if (RESERVE_TEXT.test(text) && !/r[ée]servation(s)? (ferm|complet)/i.test(text)) {
    return { name: "reserve", provider: href.startsWith("#") || !href ? "on_page" : hostOf(href) || "site" };
  }
  if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple\.com|waze\.com/i.test(href)) {
    return { name: "directions", provider: "maps" };
  }
  return null;
}
const GOAL_NAMES = /* @__PURE__ */ new Set(["reserve", "call", "order", "quote", "privatisation", "whatsapp", "sms", "signup", "events"]);
function isGoalName(name) {
  return GOAL_NAMES.has(name);
}
const CANDIDATES = 'a[href],button,[role="button"],input[type="submit"],input[type="button"]';
const _intentChecked = /* @__PURE__ */ new WeakSet();
function markIfIntent(el) {
  if (_intentChecked.has(el)) return el.hasAttribute("data-track");
  _intentChecked.add(el);
  if (el.hasAttribute("data-track") || el.closest("[data-track]") || isIgnored(el)) return false;
  const intent = intentOf(el);
  if (!intent) return false;
  el.setAttribute("data-track", intent.name);
  el.setAttribute("data-track-auto", intent.provider);
  return true;
}
function autoMark() {
  document.querySelectorAll(CANDIDATES).forEach((el) => {
    markIfIntent(el);
  });
}
function actionExtra(el) {
  var _a;
  const href = (_a = el.getAttribute("href")) != null ? _a : "";
  const name = el.getAttribute("data-track") || "";
  let provider = el.getAttribute("data-track-auto") || "";
  if (!provider && name === "reserve") provider = providerOf(href, BOOKING_PROVIDERS) || (href.startsWith("#") || !href ? "on_page" : hostOf(href) || "site");
  if (!provider && name === "order") provider = providerOf(href, ORDER_PROVIDERS);
  const rect = el.getBoundingClientRect();
  const docH = document.documentElement.scrollHeight || 1;
  return {
    selector: cssPath(el),
    section: sectionOf(el),
    provider,
    autoMarked: el.hasAttribute("data-track-auto"),
    // Position verticale du bouton dans la page (0 = haut, 100 = bas) : distingue
    // le bouton du hero de celui du pied de page quand ils ont le même libellé.
    pagePosition: Math.round((rect.top + (window.scrollY || 0)) / docH * 100),
    scrollAtClick: _maxScroll,
    pageIndex: _pageIndex
  };
}
const _widgetSeen = /* @__PURE__ */ new Set();
function onWindowBlur() {
  window.setTimeout(() => {
    const el = document.activeElement;
    if (!el || el.tagName !== "IFRAME") return;
    const src = el.src || "";
    const host = hostOf(src);
    const booking = providerOf(src, BOOKING_PROVIDERS);
    const key = host || "iframe";
    if (_widgetSeen.has(key)) return;
    _widgetSeen.add(key);
    trackEvent(booking ? "reserve_widget" : "iframe_interaction", booking ? "reserve" : "iframe", {
      label: booking ? `Widget ${booking}` : host || "iframe",
      href: src.split("?")[0],
      extra: { provider: booking || host, section: sectionOf(el) }
    });
  }, 0);
}
let _sectionIo = null;
const _sectionsObserved = /* @__PURE__ */ new WeakSet();
const _sectionsSeen = /* @__PURE__ */ new Set();
const MAX_SECTIONS_PER_PAGE = 30;
function sectionKey(el) {
  return (el.getAttribute("data-section") || el.getAttribute("id") || el.getAttribute("aria-label") || "").slice(0, 60);
}
function scanSections() {
  if (!_sectionIo) return;
  document.querySelectorAll("[data-section],section[id],section[aria-label],footer").forEach((el) => {
    if (_sectionsObserved.has(el)) return;
    _sectionsObserved.add(el);
    _sectionIo.observe(el);
  });
}
function onSectionSeen(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const el = entry.target;
    const name = sectionKey(el) || el.tagName.toLowerCase();
    const k = `${_page}|${name}`;
    if (_sectionsSeen.has(k)) continue;
    if ([..._sectionsSeen].filter((x) => x.startsWith(`${_page}|`)).length >= MAX_SECTIONS_PER_PAGE) continue;
    _sectionsSeen.add(k);
    trackEvent("section_view", name, { label: name, extra: { section: name } });
  }
}
function onCopy() {
  var _a, _b;
  const sel = (((_b = (_a = window.getSelection) == null ? void 0 : _a.call(window)) == null ? void 0 : _b.toString()) || "").trim();
  if (!sel || sel.length > 80) return;
  if (/(?:\+?\d[\s.-]?){9,}/.test(sel)) trackEvent("copy", "copy_phone", { label: "Num\xE9ro copi\xE9", goal: true });
  else if (/@[\w-]+\./.test(sel)) trackEvent("copy", "copy_email", { label: "E-mail copi\xE9" });
  else if (/\d{5}|rue|avenue|bd|boulevard|place|chemin/i.test(sel)) trackEvent("copy", "copy_address", { label: "Adresse copi\xE9e" });
}
function autoKind(a) {
  var _a;
  const href = (_a = a.getAttribute("href")) != null ? _a : "";
  if (href.startsWith("tel:")) return { name: "call", type: "cta_click" };
  if (href.startsWith("mailto:")) return { name: "email", type: "cta_click" };
  if (/^https?:/i.test(href)) {
    try {
      if (new URL(href).hostname !== location.hostname) return { name: "outbound", type: "outbound" };
    } catch {
    }
  }
  return null;
}
const INTERACTIVE = 'a,button,[role="button"],[role="tab"],[role="menuitem"],input[type="submit"],input[type="button"],select,summary,label[for]';
function cssPath(el) {
  const parts = [];
  let node = el;
  for (let depth = 0; node && depth < 4; depth++) {
    if (node.id) {
      parts.unshift(`#${node.id}`);
      break;
    }
    let part = node.tagName.toLowerCase();
    const cls = (node.getAttribute("class") || "").split(/\s+/).filter((c) => c.length > 2 && c.length < 24 && !/^(flex|grid|block|p|m|w|h|text|bg|border|gap|rounded)[-\d]/.test(c)).slice(0, 2);
    if (cls.length) part += `.${cls.join(".")}`;
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(">").slice(0, 160);
}
function sectionOf(el) {
  const holder = el.closest("[data-section],section,header,footer,nav,aside,dialog,form");
  if (!holder) return "";
  return (holder.getAttribute("data-section") || holder.getAttribute("id") || holder.getAttribute("aria-label") || holder.tagName.toLowerCase()).slice(0, 60);
}
function isIgnored(el) {
  return !!el.closest("[data-track-ignore]");
}
function autoName(el) {
  const tag = el.tagName.toLowerCase();
  const words = label(el).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean).slice(0, 6);
  const text = words.join("_");
  return (text ? `${tag}_${text}` : tag).slice(0, 60);
}
let _rageCount = 0;
let _rageAt = 0;
let _rageX = 0;
let _rageY = 0;
function detectRage(e, el) {
  const now = Date.now();
  const near = Math.abs(e.clientX - _rageX) < 30 && Math.abs(e.clientY - _rageY) < 30;
  if (near && now - _rageAt < 1e3) {
    _rageCount++;
    if (_rageCount === 3) {
      trackEvent("rage_click", autoName(el), {
        label: label(el),
        extra: { selector: cssPath(el), section: sectionOf(el) }
      });
    }
  } else {
    _rageCount = 1;
  }
  _rageAt = now;
  _rageX = e.clientX;
  _rageY = e.clientY;
}
function onClick(e) {
  var _a, _b, _c;
  const target = e.target;
  if (!(target == null ? void 0 : target.closest)) return;
  if (isIgnored(target)) return;
  const candidate = target.closest(CANDIDATES);
  if (candidate && !target.closest("[data-track]")) markIfIntent(candidate);
  const marked = target.closest("[data-track]");
  if (marked) {
    const name = marked.getAttribute("data-track") || "cta";
    _clicks++;
    detectRage(e, marked);
    const goalAttr = marked.getAttribute("data-track-goal");
    trackEvent("cta_click", name, {
      label: label(marked),
      href: (_a = marked.getAttribute("href")) != null ? _a : "",
      // Un « reserve », « call », « order »… est un objectif même si personne
      // n'a pensé à poser data-track-goal ; data-track-goal="none" l'en retire.
      goal: goalAttr === "conversion" || goalAttr !== "none" && isGoalName(name),
      extra: actionExtra(marked)
    });
    return;
  }
  const a = target.closest("a");
  const kind = a ? autoKind(a) : null;
  if (a && kind) {
    if (kind.type === "cta_click") _clicks++;
    detectRage(e, a);
    trackEvent(kind.type, kind.name, {
      label: label(a),
      href: (_b = a.getAttribute("href")) != null ? _b : "",
      goal: kind.name === "call",
      // un appel est toujours une conversion
      extra: { selector: cssPath(a), section: sectionOf(a) }
    });
    return;
  }
  if (!_opts.autocapture) return;
  const el = target.closest(INTERACTIVE);
  if (!el) return;
  detectRage(e, el);
  trackEvent("click", autoName(el), {
    label: label(el),
    href: (_c = el.getAttribute("href")) != null ? _c : "",
    extra: {
      selector: cssPath(el),
      section: sectionOf(el),
      tag: el.tagName.toLowerCase(),
      testId: (el.getAttribute("data-testid") || "").slice(0, 60)
    }
  });
}
let _hoverTimer;
function onOver(e) {
  var _a, _b;
  const el = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "[data-track]");
  if (!el) return;
  const key = `${el.getAttribute("data-track")}|${label(el)}`;
  if (_seenHover.has(key)) return;
  clearTimeout(_hoverTimer);
  _hoverTimer = window.setTimeout(() => {
    _seenHover.add(key);
    trackEvent("cta_hover", el.getAttribute("data-track") || "cta", { label: label(el) });
  }, 400);
}
function onOut() {
  clearTimeout(_hoverTimer);
}
let _io = null;
const _observed = /* @__PURE__ */ new WeakSet();
let _scanQueued = false;
function scanCtas() {
  if (!_io || _scanQueued) return;
  _scanQueued = true;
  requestAnimationFrame(() => {
    _scanQueued = false;
    if (!_io) return;
    autoMark();
    scanSections();
    document.querySelectorAll("[data-track]").forEach((el) => {
      if (_observed.has(el)) return;
      _observed.add(el);
      _io.observe(el);
    });
  });
}
let _scrollQueued = false;
function onScroll() {
  if (_scrollQueued) return;
  _scrollQueued = true;
  requestAnimationFrame(() => {
    _scrollQueued = false;
    const h = document.documentElement;
    const total = h.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const pct = Math.min(100, Math.round((window.scrollY || h.scrollTop) / total * 100));
    if (pct > _maxScroll) _maxScroll = pct;
  });
}
function onSubmit(e) {
  const form = e.target;
  if (!form || isIgnored(form)) return;
  const name = form.getAttribute("data-track") || form.getAttribute("name") || "form";
  trackEvent("form_submit", name, { label: label(form), goal: true });
}
const _vitals = { lcp: 0, cls: 0, inp: 0 };
let _vitalsSent = false;
function observeVitals() {
  if (!("PerformanceObserver" in window)) return;
  const safe = (type, cb, opts) => {
    try {
      new PerformanceObserver(cb).observe({ type, buffered: true, ...opts != null ? opts : {} });
    } catch {
    }
  };
  safe("largest-contentful-paint", (list) => {
    const entries = list.getEntries();
    const last = entries[entries.length - 1];
    if (last) _vitals.lcp = Math.round(last.startTime);
  });
  safe("layout-shift", (list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) _vitals.cls += entry.value;
    }
  });
  safe("event", (list) => {
    for (const entry of list.getEntries()) {
      const d = Math.round(entry.duration);
      if (d > _vitals.inp) _vitals.inp = d;
    }
  }, { durationThreshold: 40 });
}
function sendVitals() {
  var _a, _b;
  if (_vitalsSent || !_opts.webVitals) return;
  if (!_vitals.lcp && !_vitals.cls && !_vitals.inp) return;
  _vitalsSent = true;
  trackEvent("web_vital", "page_performance", {
    label: _page || location.pathname,
    extra: {
      lcp: _vitals.lcp,
      cls: Math.round(_vitals.cls * 1e3) / 1e3,
      inp: _vitals.inp,
      connection: (_b = (_a = navigator.connection) == null ? void 0 : _a.effectiveType) != null ? _b : ""
    }
  });
}
function initAnalytics(options = {}) {
  if (typeof window === "undefined" || _started) return;
  _opts = {
    requireConsent: options.requireConsent === true,
    autocapture: options.autocapture !== false,
    webVitals: options.webVitals !== false,
    allowLocalhost: options.allowLocalhost === true
  };
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (isLocal && !_opts.allowLocalhost) return;
  _started = true;
  _consent = _opts.requireConsent ? "pending" : "granted";
  _visitor = getVisitorId();
  if (_opts.webVitals) observeVitals();
  createVisit(location.pathname);
  if ("IntersectionObserver" in window) {
    _io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          const key = `${el.getAttribute("data-track")}|${label(el)}`;
          if (_seenView.has(key)) continue;
          _seenView.add(key);
          trackEvent("cta_view", el.getAttribute("data-track") || "cta", { label: label(el) });
        }
      },
      { threshold: 0.5 }
    );
    _sectionIo = new IntersectionObserver(onSectionSeen, { threshold: 0.35 });
    scanCtas();
    new MutationObserver(() => scanCtas()).observe(document.body, { childList: true, subtree: true });
  }
  document.addEventListener("click", onClick, true);
  document.addEventListener("pointerover", onOver, true);
  document.addEventListener("pointerout", onOut, true);
  document.addEventListener("submit", onSubmit, true);
  document.addEventListener("copy", onCopy, true);
  window.addEventListener("blur", onWindowBlur);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      _activeMs = activeMsNow();
      _lastActiveAt = 0;
      sendVitals();
      flushVisit();
    } else {
      _lastActiveAt = Date.now();
    }
  });
  window.addEventListener("pagehide", () => {
    sendVitals();
    flushVisit();
  });
}
async function trackPageView(path) {
  if (typeof window === "undefined") return;
  if (!_started) {
    initAnalytics(_opts);
    return;
  }
  if (path === _page) return;
  sendVitals();
  _vitalsSent = false;
  flushVisit();
  await createVisit(path);
  scanCtas();
}
export {
  getTrackingIds,
  initAnalytics,
  setConsent,
  trackCommerce,
  trackEvent,
  trackPageView
};
