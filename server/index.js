import express from "express";
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

// On Vercel /tmp is the only writable directory
const CONTENT_FILE = IS_VERCEL
  ? "/tmp/sakura-content.json"
  : join(__dirname, "content.json");

const ASSETS_DIR = join(ROOT, "public", "assets");
const ASSETS_WRITE_DIR = IS_VERCEL ? "/tmp/assets" : ASSETS_DIR;

const SRC_ASSETS_DIR = join(ROOT, "src", "assets");

// ─── Google Sheets config ────────────────────────────────────────────────────
const GOOGLE_CREDENTIALS_PATH = join(__dirname, "credentials.json");
const SPREADSHEET_ID = "1Dz6Yq2D5fU9xYKXuobrsxV0oOB_kZjw48y4CWh8eT8E";
const SHEET_NAME = "Poptávky";
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

// Init content.json if it doesn't exist (local dev only)
if (!IS_VERCEL && !existsSync(CONTENT_FILE)) {
  writeContent(getDefaults());
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
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Serve uploaded assets (local dev)
if (!IS_VERCEL) {
  app.use("/assets", express.static(ASSETS_DIR));
}

// ── Admin Auth ───────────────────────────────────────────────────────────────

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = createSession();
    res.cookie('sakura_session', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
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

app.post("/api/content", (req, res) => {
  if (!Array.isArray(req.body))
    return res.status(400).json({ error: "Expected array" });
  writeContent(req.body);
  res.json({ ok: true });
});

app.post("/api/content/reset", (req, res) => {
  const defaults = getDefaults();
  writeContent(defaults);
  res.json(defaults);
});

// ── Upload API ───────────────────────────────────────────────────────────────

app.post("/api/upload/:serviceId", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { serviceId } = req.params;
  const ext = extname(req.file.originalname).toLowerCase() || ".jpg";
  const filename = `${serviceId}${ext}`;
  const destPath = join(ASSETS_WRITE_DIR, filename);

  // Delete old file if extension changed
  const content = readContent();
  const service = content.find((s) => s.id === serviceId);
  if (service?.image?.startsWith("/assets/")) {
    const oldFilename = service.image.replace("/assets/", "");
    const oldPath = join(ASSETS_WRITE_DIR, oldFilename);
    if (existsSync(oldPath) && oldPath !== destPath) {
      try { unlinkSync(oldPath); } catch {}
    }
  }

  writeFileSync(destPath, req.file.buffer);

  // On Vercel, serve from /tmp via a special path
  const publicPath = IS_VERCEL
    ? `/api/assets/${filename}`
    : `/assets/${filename}`;

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
    app.use(express.static(DIST_DIR));
    app.get("*path", (req, res) => {
      res.sendFile(join(DIST_DIR, "index.html"));
    });
  }
}

// Export for Vercel serverless
export default app;

// Start server only in local dev
if (!IS_VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`🌸 Server running on http://localhost:${PORT}`)
  );
}
