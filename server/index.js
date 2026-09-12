import express from "express";
import compression from "compression";
import sharp from "sharp";
import multer from "multer";
import cors from "cors";
import cookieParser from "cookie-parser";
import { randomBytes } from "crypto";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
} from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const IS_VERCEL = !!process.env.VERCEL;

// Where admin edits live. The app directory is rebuilt from git on every deploy,
// so anything written into it — content.json, uploaded photos — is gone after
// the next push; that is why admin changes never stuck in production. Railway
// sets RAILWAY_VOLUME_MOUNT_PATH when a volume is attached, and with one, edits
// survive deploys and restarts. DATA_DIR does the same on any other host.
// Without either, behaviour is unchanged, which is fine for local development.
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || "";
const BUNDLED_CONTENT_FILE = join(__dirname, "content.json");

// On Vercel /tmp is the only writable directory
const CONTENT_FILE = DATA_DIR
  ? join(DATA_DIR, "content.json")
  : IS_VERCEL
    ? "/tmp/sakura-content.json"
    : BUNDLED_CONTENT_FILE;

const ASSETS_DIR = join(ROOT, "public", "assets");
const ASSETS_WRITE_DIR = DATA_DIR
  ? join(DATA_DIR, "uploads")
  : IS_VERCEL
    ? "/tmp/assets"
    : ASSETS_DIR;

const SRC_ASSETS_DIR = join(ROOT, "src", "assets");

// ─── Google Sheets config ────────────────────────────────────────────────────
const GOOGLE_CREDENTIALS_PATH = join(__dirname, "credentials.json");
const SPREADSHEET_ID = "1Dz6Yq2D5fU9xYKXuobrsxV0oOB_kZjw48y4CWh8eT8E";
const SHEET_NAME = "Poptávky";
// ─────────────────────────────────────────────────────────────────────────────

// ─── Google reviews config ───────────────────────────────────────────────────
// A plain API key, not the Sheets service account — the Places API only accepts
// a key. Kept server-side so it is never exposed to the browser.
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
// Optional. The listing's Maps URL only carries the name and coordinates, not
// the ChIJ-style id the API wants, so when this is unset the place is looked up
// by name and pinned to the coordinates below.
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || "";
const GOOGLE_PLACE_NAME = process.env.GOOGLE_PLACE_NAME || "SAKURA Cleaning Service";
const GOOGLE_PLACE_LAT = Number(process.env.GOOGLE_PLACE_LAT || 50.1266504);
const GOOGLE_PLACE_LNG = Number(process.env.GOOGLE_PLACE_LNG || 14.4645764);
// Places API bills per request, so responses are cached rather than fetched per
// visitor. Reviews change rarely; a few hours of staleness is invisible.
const REVIEWS_TTL_MS = 6 * 60 * 60 * 1000;
// ─────────────────────────────────────────────────────────────────────────────

if (!IS_VERCEL) {
  mkdirSync(ASSETS_DIR, { recursive: true });

  // Copy default images from src/assets to public/assets on first run
  if (existsSync(SRC_ASSETS_DIR)) {
    for (const file of readdirSync(SRC_ASSETS_DIR)) {
      const dest = join(ASSETS_DIR, file);
      if (!existsSync(dest)) {
        copyFileSync(join(SRC_ASSETS_DIR, file), dest);
      }
    }
  }
}

mkdirSync(ASSETS_WRITE_DIR, { recursive: true });

function readContent() {
  // On Vercel: prefer /tmp (modified by admin), fall back to bundled content.json
  if (IS_VERCEL) {
    if (existsSync(CONTENT_FILE)) {
      return JSON.parse(readFileSync(CONTENT_FILE, "utf-8"));
    }
    // Fall back to the bundled content.json next to this file
    const bundled = join(__dirname, "content.json");
    if (existsSync(bundled)) {
      return JSON.parse(readFileSync(bundled, "utf-8"));
    }
    return getDefaults();
  }
  if (!existsSync(CONTENT_FILE)) return getDefaults();
  return JSON.parse(readFileSync(CONTENT_FILE, "utf-8"));
}

function writeContent(data) {
  writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getDefaults() {
  return [
    {
      id: "pravidelny",
      name: "Pravidelný úklid",
      name_en: "Regular Cleaning",
      description: "",
      description_en: "",
      pricingDesc: "1× týdně / 1× za 2 týdny",
      pricingDesc_en: "weekly / bi-weekly",
      price: "290 Kč / hod",
      image: "/assets/pravidelny.jpeg",
      showOnHome: true,
      bullets: [
        "vysávání všech podlah a koberců",
        "vytírání podlah",
        "utírání prachu ze všech dostupných povrchů",
        "úklid kuchyně (pracovní desky, dřez, vnější plochy spotřebičů)",
        "úklid koupelny a toalety (sanitární zařízení, umyvadlo, WC, baterie)",
        "základní úklid společných prostor v bytě/domě",
        "vynášení odpadků",
      ],
      bullets_en: [
        "vacuuming all floors and carpets",
        "mopping floors",
        "dusting all accessible surfaces",
        "cleaning kitchen (countertops, sink, exterior of appliances)",
        "cleaning bathroom and toilet (sanitary fixtures, sink, WC, taps)",
        "basic cleaning of shared areas in the apartment/house",
        "taking out trash",
      ],
    },
    {
      id: "generalni",
      name: "Generální úklid",
      name_en: "Deep Cleaning",
      description:
        "Tento úklid je hloubkový a detailní, vhodný po delší době nebo jako jednorázový úklid.",
      description_en:
        "A thorough and detailed clean, ideal after a long break or as a one-off service.",
      pricingDesc: "",
      pricingDesc_en: "",
      price: "350 Kč / hod",
      image: "/assets/generalni.jpeg",
      showOnHome: true,
      bullets: [
        "důkladné vysávání a vytírání všech místností",
        "detailní čištění všech povrchů",
        "hloubkové čištění kuchyně (včetně odmaštění, čištění spotřebičů zvenku i zevnitř dle domluvy)",
        "hloubkové čištění koupelny a toalety (vodní kámen, spáry, sanitární vybavení)",
        "čištění dveří, klik, soklů a rohů",
        "odstranění silnějších nečistot a usazenin",
        "vynášení odpadků",
      ],
      bullets_en: [
        "thorough vacuuming and mopping of all rooms",
        "detailed cleaning of all surfaces",
        "deep kitchen cleaning (incl. degreasing, appliances inside and out as agreed)",
        "deep bathroom and toilet cleaning (limescale, grout, sanitary fixtures)",
        "cleaning doors, handles, skirting boards and corners",
        "removal of heavy dirt and deposits",
        "taking out trash",
      ],
    },
    {
      id: "okna",
      name: "Mytí oken",
      name_en: "Window Cleaning",
      description: "",
      description_en: "",
      pricingDesc: "",
      pricingDesc_en: "",
      price: "350 Kč / hod",
      image: "",
      showOnHome: false,
    },
    {
      id: "zehleni",
      name: "Žehlení",
      name_en: "Ironing",
      description: "",
      description_en: "",
      pricingDesc: "",
      pricingDesc_en: "",
      price: "350 Kč / hod",
      image: "",
      showOnHome: false,
    },
    {
      id: "spolecne",
      name: "Úklid společných prostor",
      name_en: "Common Area Cleaning",
      description: "",
      description_en: "",
      pricingDesc: "(vchody, schodiště)",
      pricingDesc_en: "(entrances, stairwells)",
      price: "290 Kč / hod",
      image: "/assets/prostor.jpeg",
      showOnHome: true,
      bullets: [
        "zametání a vytírání schodů a chodeb",
        "úklid vstupních prostor",
        "čištění zábradlí a klik",
        "vynášení odpadků (dle domluvy)",
        "udržování čistoty společných prostor",
        "Individuální požadavky po domluvě",
      ],
      bullets_en: [
        "sweeping and mopping stairs and hallways",
        "cleaning entrance areas",
        "cleaning handrails and door handles",
        "taking out trash (as agreed)",
        "maintaining cleanliness of shared areas",
        "custom requests available on request",
      ],
    },
    {
      id: "kancelare",
      name: "Úklid kanceláří",
      name_en: "Office Cleaning",
      description: "",
      description_en: "",
      pricingDesc: "",
      pricingDesc_en: "",
      price: "290 Kč / hod",
      image: "/assets/kancelari.jpeg",
      showOnHome: true,
      bullets: [
        "vysávání a vytírání podlah",
        "utírání prachu z pracovních ploch",
        "úklid kuchyňky (pokud je součástí)",
        "úklid WC a sociálního zařízení",
        "vynášení odpadků",
        "základní dezinfekce povrchů",
        "Individuální požadavky po domluvě",
      ],
      bullets_en: [
        "vacuuming and mopping floors",
        "dusting work surfaces",
        "cleaning kitchenette (if available)",
        "cleaning WC and sanitary facilities",
        "taking out trash",
        "basic surface disinfection",
        "custom requests available on request",
      ],
    },
    {
      id: "tepovani",
      name: "Hloubkové tepování",
      name_en: "Deep Upholstery Cleaning",
      description:
        "Profesionální hloubkové čištění (tepování) sedacích souprav, křesel, matrací a koberců.",
      description_en:
        "Professional deep cleaning (hot water extraction) of sofas, armchairs, mattresses and carpets.",
      pricingDesc: "Vyberte typ sedačky pro tepování",
      pricingDesc_en: "Select sofa type for cleaning",
      price: "",
      image: "/assets/tepovani.png",
      showOnHome: true,
      hasSelect: true,
      bullets: [
        "odstranění hluboko usazeného prachu, roztočů a alergenů",
        "likvidace odolných skvrn a nepříjemných pachů",
        "čištění ekologickou a účinnou chemií bezpečnou pro děti a zvířata",
        "hloubkové odsávání vlhkosti profesionálním extraktorem",
        "obnova barev a oživení vzhledu textilních povrchů",
        "Individuální požadavky po domluvě",
      ],
      bullets_en: [
        "removal of deeply embedded dust, mites and allergens",
        "elimination of stubborn stains and unpleasant odors",
        "cleaning with eco-friendly chemicals safe for children and pets",
        "deep moisture extraction with professional extractor",
        "restoring colors and refreshing the look of textile surfaces",
        "custom requests available on request",
      ],
    },
  ];
}

// First boot on a fresh volume: start from the committed content rather than the
// hardcoded defaults, so attaching a volume does not change the live site. From
// then on the volume copy is the source of truth.
if (!IS_VERCEL && !existsSync(CONTENT_FILE)) {
  if (CONTENT_FILE !== BUNDLED_CONTENT_FILE && existsSync(BUNDLED_CONTENT_FILE)) {
    copyFileSync(BUNDLED_CONTENT_FILE, CONTENT_FILE);
  } else {
    writeContent(getDefaults());
  }
}
if (DATA_DIR) {
  console.log(`Persistent storage: ${DATA_DIR}`);
} else if (!IS_VERCEL) {
  console.warn("No volume attached — admin edits will be lost on the next deploy");
}

// ─── Admin credentials ───────────────────────────────────────────────────────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vasilsakura40@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '_sakura_clean_40_';
// ─────────────────────────────────────────────────────────────────────────────

const sessions = new Map(); // token → expiry timestamp

function createSession() {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return token;
}

function isValidSession(token) {
  if (!token) return false;
  const expiry = sessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) { sessions.delete(token); return false; }
  return true;
}

const app = express();
// Railway terminates TLS in front of the app. Without this req.secure is always
// false, so the session cookie could not be marked Secure correctly.
app.set("trust proxy", 1);

/** Write endpoints are admin-only. */
function requireAuth(req, res, next) {
  if (isValidSession(req.cookies?.sakura_session)) return next();
  res.status(401).json({ error: "unauthorized" });
}

// Both sakura-uklid.com and www.sakura-uklid.com point at this app, which would
// let Google index the same pages twice. Canonical host is www — it is what the
// sitemap, canonical tag and Open Graph URLs all use — so send the apex there.
// Matches the apex only: the railway.app domain and localhost are left alone.
const CANONICAL_HOST = "www.sakura-uklid.com";
const APEX_HOST = "sakura-uklid.com";

app.use((req, res, next) => {
  // req.host drops the port; Railway terminates TLS and forwards the original
  // host, so this sees the name the visitor actually typed.
  if (req.hostname === APEX_HOST) {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }
  next();
});

// Without this, JS/CSS ship uncompressed — the React bundle alone goes out at
// 160 kB instead of 53 kB. Images are already compressed, so they're skipped.
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Vite fingerprints its bundles (index-aVYPB03W.js), so those are safe to cache
// forever. Images keep stable names across deploys, so they must revalidate —
// otherwise a browser that cached the old copy would never see an updated one.
const HASHED_ASSET = /-[A-Za-z0-9_-]{8,}\.(js|css)$/;

function setAssetCacheHeaders(res, filePath) {
  if (HASHED_ASSET.test(filePath)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else {
    // "no-cache" still caches — it just forces an ETag revalidation first,
    // so a changed image is picked up immediately and an unchanged one costs a 304.
    res.setHeader("Cache-Control", "no-cache");
  }
}

// Uploaded photos first, so a freshly uploaded image wins over a bundled file
// of the same name; then the images shipped with the build.
if (!IS_VERCEL) {
  if (ASSETS_WRITE_DIR !== ASSETS_DIR) {
    app.use(
      "/assets",
      express.static(ASSETS_WRITE_DIR, { setHeaders: setAssetCacheHeaders }),
    );
  }
  app.use(
    "/assets",
    express.static(ASSETS_DIR, { setHeaders: setAssetCacheHeaders }),
  );
}

// ── Admin Auth ───────────────────────────────────────────────────────────────

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = createSession();
    res.cookie('sakura_session', token, {
      httpOnly: true,
      // The admin is same-origin, so 'lax' is enough. 'none' demanded Secure,
      // which browsers refuse over plain http, so local logins never stuck.
      sameSite: 'lax',
      secure: req.secure,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Nesprávný e-mail nebo heslo' });
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies?.sakura_session;
  if (token) sessions.delete(token);
  res.clearCookie('sakura_session');
  res.json({ ok: true });
});

app.get('/api/admin/verify', (req, res) => {
  const token = req.cookies?.sakura_session;
  res.json({ ok: isValidSession(token) });
});

// Multer — memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Content API ──────────────────────────────────────────────────────────────

app.get("/api/content", (req, res) => {
  res.json(readContent());
});

// Writes used to be open to anyone: a plain POST replaced the whole site's
// content without logging in. An admin session is required now.
app.post("/api/content", requireAuth, (req, res) => {
  if (!Array.isArray(req.body))
    return res.status(400).json({ error: "Expected array" });
  writeContent(req.body);
  res.json({ ok: true });
});

app.post("/api/content/reset", requireAuth, (req, res) => {
  const defaults = getDefaults();
  writeContent(defaults);
  res.json(defaults);
});

// ── Upload API ───────────────────────────────────────────────────────────────

app.post("/api/upload/:serviceId", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { serviceId } = req.params;
  // Route params are URL-decoded, so an id carrying an encoded "../" would
  // otherwise let a filename escape the uploads directory.
  if (!/^[a-z0-9-]+$/i.test(serviceId)) {
    return res.status(400).json({ error: "invalid service id" });
  }

  // Always re-encode. A photo straight off a phone is 5–10 MB and thousands of
  // pixels wide — the exact weight that made the site crawl before — and an
  // iPhone HEIC would not display in most browsers at all.
  let output;
  try {
    output = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toBuffer();
  } catch {
    return res.status(415).json({ error: "unsupported image" });
  }

  const filename = `${serviceId}.jpg`;
  const destPath = join(ASSETS_WRITE_DIR, filename);

  // Remove this service's previous upload if it had a different name.
  const content = readContent();
  const service = content.find((s) => s.id === serviceId);
  if (service?.image?.startsWith("/assets/")) {
    const oldFilename = service.image.replace("/assets/", "").split("?")[0];
    const oldPath = join(ASSETS_WRITE_DIR, oldFilename);
    if (existsSync(oldPath) && oldPath !== destPath) {
      try { unlinkSync(oldPath); } catch {}
    }
  }

  writeFileSync(destPath, output);

  // Re-uploading keeps the same filename, so the version query is what makes
  // the admin and the site show the new photo instead of a cached old one.
  const version = `?v=${Date.now()}`;
  const publicPath = IS_VERCEL
    ? `/api/assets/${filename}${version}`
    : `/assets/${filename}${version}`;

  res.json({ path: publicPath });
});

// Serve uploaded assets on Vercel (from /tmp)
app.get("/api/assets/:filename", (req, res) => {
  const filePath = join(ASSETS_WRITE_DIR, req.params.filename);
  if (existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

// ── Google reviews ───────────────────────────────────────────────────────────

const reviewsCache = new Map(); // languageCode -> { data, expires }
let resolvedPlaceId = GOOGLE_PLACE_ID || null;

/**
 * Google replies with { error: { code, status, message } }. Surface just the
 * code and status — enough to tell "API not enabled" from "billing disabled"
 * from "key restricted", and neither field can contain the key itself.
 */
async function describeFailure(response) {
  let code = response.status;
  let status = "";
  try {
    const body = await response.json();
    code = body?.error?.code ?? code;
    status = body?.error?.status ?? "";
    console.error("Places API error:", JSON.stringify(body?.error ?? body));
  } catch {
    console.error("Places API error: non-JSON response", response.status);
  }
  return `${code} ${status}`.trim();
}

/**
 * Turns the business name into a Places id. Only runs when GOOGLE_PLACE_ID is
 * not set, and only once — the id never changes, so it is kept for the process
 * lifetime rather than looked up per request.
 */
async function resolvePlaceId() {
  if (resolvedPlaceId) return resolvedPlaceId;

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({
      textQuery: GOOGLE_PLACE_NAME,
      maxResultCount: 1,
      // Bias to the listing's own coordinates so a similarly named business
      // elsewhere cannot win the match.
      locationBias: {
        circle: {
          center: { latitude: GOOGLE_PLACE_LAT, longitude: GOOGLE_PLACE_LNG },
          radius: 500,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`place lookup failed: ${await describeFailure(response)}`);
  }

  const found = (await response.json()).places?.[0];
  if (!found?.id) throw new Error(`No place matched "${GOOGLE_PLACE_NAME}"`);

  console.log(`Resolved place "${found.displayName?.text ?? GOOGLE_PLACE_NAME}" -> ${found.id}`);
  resolvedPlaceId = found.id;
  return resolvedPlaceId;
}

app.get("/api/reviews", async (req, res) => {
  // Before the key is configured, report "not set up" rather than failing, so
  // the front end can simply leave the section out.
  if (!GOOGLE_PLACES_API_KEY) {
    return res.json({ configured: false, reviews: [] });
  }

  // Reviews are requested in the page's language so Google localises the body
  // and the "2 months ago" line. Cached per language, two entries in total.
  const lang = req.query.lang === "en" ? "en" : "cs";
  const cached = reviewsCache.get(lang);
  if (cached && cached.expires > Date.now()) {
    return res.json(cached.data);
  }

  /**
   * The pre-2023 Places endpoint. Separate implementation from the v1 API, and
   * it returns reviews for some listings the new one omits. Its key goes in the
   * query string by design, so the URL is never logged.
   */
  async function fetchLegacyReviews(placeId) {
    const url =
      "https://maps.googleapis.com/maps/api/place/details/json" +
      `?place_id=${encodeURIComponent(placeId)}` +
      "&fields=reviews&reviews_no_translations=true" +
      `&key=${encodeURIComponent(GOOGLE_PLACES_API_KEY)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`http ${response.status}`);
    const body = await response.json();
    // This API reports failures in the body with a 200, unlike the v1 one.
    if (body.status !== "OK") {
      throw new Error(`${body.status}${body.error_message ? `: ${body.error_message}` : ""}`);
    }
    return body.result?.reviews ?? [];
  }

  /** One Place Details call for a given field mask. */
  async function fetchPlace(placeId, fieldMask) {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
        `?languageCode=${lang}`,
      {
        headers: {
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          // Places bills by the fields requested, so ask only for what is shown.
          "X-Goog-FieldMask": fieldMask,
        },
      },
    );
    if (!response.ok) {
      throw new Error(await describeFailure(response));
    }
    return response.json();
  }

  try {
    const placeId = await resolvePlaceId();
    const place = await fetchPlace(
      placeId,
      "rating,userRatingCount,googleMapsUri,pureServiceAreaBusiness",
    );

    // Reviews are requested on their own. Bundled into the mask above, Google
    // simply dropped the field from the response and left no clue why; asking
    // for it alone turns that silence into a real status code.
    let received = [];
    let reviewsNote = "";
    try {
      const withReviews = await fetchPlace(placeId, "reviews");
      received = withReviews.reviews ?? [];
      reviewsNote = `mask=reviews returned=${received.length}`;
    } catch (err) {
      reviewsNote = `mask=reviews failed -> ${err.message}`;
      console.error("Reviews request failed:", err.message);
    }

    // Asking the new API for every field returned 33 of them and no `reviews`
    // key at all, so it will not serve review text for this listing. The legacy
    // Places endpoint is a separate implementation and does return reviews for
    // some listings the new one does not, so try it before giving up.
    if (received.length === 0) {
      try {
        const legacy = await fetchLegacyReviews(placeId);
        received = legacy.map((r) => ({
          rating: r.rating,
          relativePublishTimeDescription: r.relative_time_description,
          text: { text: r.text, languageCode: r.language },
          // This endpoint names the language differently; carry it across so the
          // Czech-only filter below works the same whichever API answered.
          originalText: {
            text: r.text,
            languageCode: r.original_language ?? r.language,
          },
          authorAttribution: {
            displayName: r.author_name,
            photoUri: r.profile_photo_url,
            uri: r.author_url,
          },
        }));
        reviewsNote += ` | legacy returned=${received.length}`;
      } catch (err) {
        reviewsNote += ` | legacy failed -> ${err.message}`;
        console.error("Legacy reviews request failed:", err.message);
      }
    }
    console.log(`Places reviews: ${reviewsNote}`);
    const data = {
      configured: true,
      rating: typeof place.rating === "number" ? place.rating : null,
      total: place.userRatingCount ?? 0,
      url: place.googleMapsUri ?? null,
      // Google caps this at five and picks which ones; there is no way to ask
      // for more or to choose them.
      reviews: received
        .map((r) => ({
          author: r.authorAttribution?.displayName ?? "",
          avatar: r.authorAttribution?.photoUri ?? null,
          profileUrl: r.authorAttribution?.uri ?? null,
          rating: typeof r.rating === "number" ? r.rating : 5,
          // `text` is localised to the page language; `originalText` is what the
          // reviewer actually typed, and its language is what we filter on.
          text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
          writtenIn: (
            r.originalText?.languageCode ??
            r.text?.languageCode ??
            ""
          ).toLowerCase(),
          relativeTime: r.relativePublishTimeDescription ?? "",
        }))
        .filter((r) => r.text && r.author)
        // Client asked for Czech customers only. Reviews written in other
        // languages are dropped rather than shown machine-translated.
        .filter((r) => r.writtenIn.startsWith("cs"))
        .map(({ writtenIn, ...rest }) => rest),
    };

    // Star-only ratings carry no text, so a listing can have a rating and still
    // return nothing to display. Record which case this is — otherwise an empty
    // section is indistinguishable from a broken one.
    if (data.reviews.length === 0) {
      // Distinguish "Google sent nothing" from "Google sent some but none were
      // usable" — otherwise an empty section gives no clue which it was.
      // Place ids are public, and having it here lets the listing be checked
      // against Google's own Place ID finder without redeploying.
      data.note = `placeId=${placeId} ${reviewsNote}`;
    }
    console.log(
      `Google reviews: rating=${data.rating} total=${data.total} ` +
        `received=${received.length} usable=${data.reviews.length}`,
    );

    reviewsCache.set(lang, { data, expires: Date.now() + REVIEWS_TTL_MS });
    res.json(data);
  } catch (err) {
    console.error("Failed to load Google reviews:", err.message);
    // Prefer showing slightly stale reviews over an empty section.
    if (cached) return res.json(cached.data);
    // `reason` carries only Google's status code, so it is safe to return and
    // saves digging through deploy logs when the key or billing is misconfigured.
    res.json({ configured: true, error: true, reason: err.message, reviews: [] });
  }
});

// ── Contact / Google Sheets API ──────────────────────────────────────────────

app.post("/api/contact", async (req, res) => {
  const { name, phone, email, services, vacuum, message } = req.body;

  try {
    const credentialsExist = existsSync(GOOGLE_CREDENTIALS_PATH);
    const credentialsEnv = process.env.GOOGLE_CREDENTIALS_JSON;
    const spreadsheetConfigured = SPREADSHEET_ID !== "YOUR_SPREADSHEET_ID_HERE";

    if ((credentialsExist || credentialsEnv) && spreadsheetConfigured) {
      let authConfig;
      if (credentialsEnv) {
        // Vercel: credentials passed as env var
        authConfig = {
          credentials: JSON.parse(credentialsEnv),
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        };
      } else {
        authConfig = {
          keyFile: GOOGLE_CREDENTIALS_PATH,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        };
      }

      const auth = new google.auth.GoogleAuth(authConfig);
      const sheets = google.sheets({ version: "v4", auth });
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${SHEET_NAME}'!A:G`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              new Date().toLocaleString("cs-CZ"),
              name ?? "",
              phone ?? "",
              email ?? "",
              Array.isArray(services) ? services.join(", ") : (services ?? ""),
              vacuum === 'ano' ? 'Ano' : vacuum === 'ne' ? 'Ne' : '',
              message ?? "",
            ],
          ],
        },
      });
      console.log("✅ Form submitted to Google Sheets");
    } else {
      console.log("⚠️  Google Sheets not configured — form data:", { name, phone, email, services, message });
    }
  } catch (err) {
    console.error("❌ Google Sheets error:", err.message);
  }

  res.json({ ok: true });
});

// ── Production: serve built React app (local only) ───────────────────────────

if (!IS_VERCEL) {
  const DIST_DIR = join(ROOT, "dist");
  if (existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR, { setHeaders: setAssetCacheHeaders }));
    app.get("*path", (req, res) => {
      // index.html references the hashed bundles, so it must never be cached —
      // a stale copy would point at bundles that no longer exist.
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(join(DIST_DIR, "index.html"));
    });
  }
}

// Export for Vercel serverless
export default app;

// Start server only in local dev
if (!IS_VERCEL) {
  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, () =>
    console.log(`🌸 Server running on http://localhost:${PORT}`)
  );

  // Railway sends SIGTERM to the old container when a new deploy takes over.
  // Closing the server lets in-flight requests finish and exits 0 instead of
  // dying on the signal. This only has any effect because railway.json starts
  // node directly: under `npm start` the signal goes to npm, which reports it
  // as "npm error signal SIGTERM" no matter what this process does.
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      console.log(`${signal} received, shutting down`);
      server.close(() => process.exit(0));
      // Do not wait forever on a hung keep-alive connection.
      setTimeout(() => process.exit(0), 10000).unref();
    });
  }
}
