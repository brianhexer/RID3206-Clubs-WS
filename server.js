const express = require("express");
const session = require("express-session");
const multer = require("multer");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const vm = require("vm");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const SITE_CONTENT_PATH = path.join(ROOT, "assets", "js", "site-content.js");
const EVENT_UPLOAD_DIR = path.join(ROOT, "assets", "uploads", "events");
const CONTACT_SUBMISSIONS_PATH = path.join(ROOT, ".data", "contact-submissions.jsonl");
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = String(process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const cookieSameSiteRaw = String(process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
const cookieSameSite = ["strict", "lax", "none"].includes(cookieSameSiteRaw) ? cookieSameSiteRaw : "lax";
const sessionSecret = String(process.env.SESSION_SECRET || "").trim() || crypto.randomBytes(32).toString("hex");
const adminUser = String(process.env.ADMIN_USERNAME || "admin").trim();
const adminPass = String(process.env.ADMIN_PASSWORD || "change-this-password");
const apiBodyLimit = String(process.env.API_BODY_LIMIT || "1mb").trim();
const maxContentPayloadBytes = Number(process.env.MAX_CONTENT_PAYLOAD_BYTES) || 2 * 1024 * 1024;
const maxContactMessageLength = Number(process.env.MAX_CONTACT_MESSAGE_LENGTH) || 2000;
const uploadFileSizeLimit = Number(process.env.UPLOAD_FILE_SIZE_MB) > 0
  ? Number(process.env.UPLOAD_FILE_SIZE_MB) * 1024 * 1024
  : 25 * 1024 * 1024;
const uploadFileCountLimit = Number(process.env.UPLOAD_FILE_COUNT) > 0 ? Number(process.env.UPLOAD_FILE_COUNT) : 20;
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const allowedVideoMimeTypes = new Set(["video/mp4", "video/webm", "video/quicktime", "video/ogg", "video/x-m4v"]);
const allowedUploadMimeTypes = new Set([...allowedImageMimeTypes, ...allowedVideoMimeTypes]);
const allowedUploadExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".mov", ".m4v", ".ogg"]);
const allowedSourcePages = new Set(["home", "impact", "programs", "events", "stories", "contact"]);

app.disable("x-powered-by");
app.set("trust proxy", 1);

if (isProduction) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.trim().length < 24) {
    throw new Error("SESSION_SECRET must be set to a strong value in production");
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters in production");
  }
}

const isSameHostOrigin = (req, origin) => {
  try {
    const parsed = new URL(origin);
    return parsed.host === req.get("host");
  } catch (_error) {
    return false;
  }
};

const sanitizeText = (value, maxLength = 255) => String(value || "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLength);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const isValidPhone = (phone) => {
  const cleaned = phone.replace(/[\s()-]/g, "");
  return /^\+?[0-9]{7,15}$/.test(cleaned);
};

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
};

const corsOptionsDelegate = (req, callback) => {
  const requestOrigin = req.get("origin");

  if (!requestOrigin) {
    callback(null, { credentials: true, origin: true });
    return;
  }

  if (allowedOrigins.includes(requestOrigin) || isSameHostOrigin(req, requestOrigin)) {
    callback(null, { credentials: true, origin: requestOrigin });
    return;
  }

  if (!isProduction && /localhost|127\.0\.0\.1/.test(requestOrigin)) {
    callback(null, { credentials: true, origin: requestOrigin });
    return;
  }

  callback(new Error("Origin not allowed"));
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." }
});

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many contact submissions. Please try again later." }
});

const mediaUploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many upload requests. Please try again later." }
});

const ensureDirectory = async (dirPath) => {
  await fsp.mkdir(dirPath, { recursive: true });
};

const loadSiteContent = async () => {
  const source = await fsp.readFile(SITE_CONTENT_PATH, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  const script = new vm.Script(source, { filename: "site-content.js" });
  script.runInContext(sandbox);

  if (!sandbox.window || typeof sandbox.window.SITE_CONTENT !== "object") {
    throw new Error("Unable to parse site content");
  }

  return sandbox.window.SITE_CONTENT;
};

const saveSiteContent = async (content) => {
  const serialized = `window.SITE_CONTENT = ${JSON.stringify(content, null, 2)};\n`;
  await fsp.writeFile(SITE_CONTENT_PATH, serialized, "utf8");
};

const listUploadedMedia = async () => {
  await ensureDirectory(EVENT_UPLOAD_DIR);
  const entries = await fsp.readdir(EVENT_UPLOAD_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const ext = path.extname(entry.name).toLowerCase();
      const imageExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
      const videoExt = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];
      let type = "other";
      if (imageExt.includes(ext)) {
        type = "image";
      }
      if (videoExt.includes(ext)) {
        type = "video";
      }

      return {
        filename: entry.name,
        type,
        url: `/assets/uploads/events/${encodeURIComponent(entry.name)}`
      };
    })
    .sort((a, b) => a.filename.localeCompare(b.filename));
};

const saveContactSubmission = async (submission) => {
  await ensureDirectory(path.dirname(CONTACT_SUBMISSIONS_PATH));
  await fsp.appendFile(CONTACT_SUBMISSIONS_PATH, `${JSON.stringify(submission)}\n`, "utf8");
};

const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
    return;
  }

  res.status(401).json({ message: "Authentication required" });
};

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureDirectory(EVENT_UPLOAD_DIR);
      cb(null, EVENT_UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = path.basename(file.originalname || "upload", ext).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "upload";
    const safeName = `${base}${ext}`;
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    files: uploadFileCountLimit,
    fileSize: uploadFileSizeLimit,
    fieldNameSize: 120,
    fieldSize: 1024
  },
  fileFilter: (_req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (allowedUploadMimeTypes.has(mime) && allowedUploadExtensions.has(ext)) {
      cb(null, true);
      return;
    }

    cb(new Error("Unsupported file type"));
  }
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false
  })
);
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: apiBodyLimit, strict: true }));
app.use(express.urlencoded({ extended: true, limit: apiBodyLimit, parameterLimit: 50 }));
app.use(cors(corsOptionsDelegate));
app.use(
  session({
    secret: sessionSecret,
    name: "rid3206.sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: isProduction || cookieSameSite === "none",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});

app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(
  "/assets",
  express.static(path.join(ROOT, "assets"), {
    etag: true,
    maxAge: isProduction ? "7d" : 0,
    immutable: isProduction,
    setHeaders: (res, filePath) => {
      if (/\.(html)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "no-store");
      }
      res.setHeader("X-Content-Type-Options", "nosniff");
    }
  })
);

app.use(
  express.static(ROOT, {
    etag: true,
    maxAge: 0,
    setHeaders: (res, filePath) => {
      if (/\.(html)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "no-store");
      }
      res.setHeader("X-Content-Type-Options", "nosniff");
    }
  })
);

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(ROOT, "admin.html"));
});

app.get("/api/auth/session", (req, res) => {
  res.json({ authenticated: Boolean(req.session && req.session.isAdmin) });
});

app.post("/api/auth/login", authLimiter, (req, res) => {
  const username = sanitizeText(req.body.username, 80);
  const password = String(req.body.password || "");

  if (!safeEqual(username, adminUser) || !safeEqual(password, adminPass)) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  req.session.regenerate((error) => {
    if (error) {
      res.status(500).json({ message: isProduction ? "Authentication failed" : error.message });
      return;
    }

    req.session.isAdmin = true;
    req.session.username = username;
    res.json({ ok: true });
  });
});

app.post("/api/auth/logout", (req, res) => {
  if (!req.session) {
    res.json({ ok: true });
    return;
  }

  req.session.destroy(() => {
    res.clearCookie("rid3206.sid");
    res.json({ ok: true });
  });
});

app.get("/api/content", async (_req, res) => {
  try {
    const content = await loadSiteContent();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/content", requireAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || !req.body.site || !req.body.pages) {
      res.status(400).json({ message: "Invalid content payload" });
      return;
    }

    const payloadBytes = Buffer.byteLength(JSON.stringify(req.body), "utf8");
    if (payloadBytes > maxContentPayloadBytes) {
      res.status(413).json({ message: "Content payload too large" });
      return;
    }

    await saveSiteContent(req.body);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/events/media", async (_req, res) => {
  try {
    const files = await listUploadedMedia();
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/events/media", requireAuth, mediaUploadLimiter, upload.array("files", uploadFileCountLimit), async (_req, res) => {
  try {
    const files = await listUploadedMedia();
    res.json({ ok: true, files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    const name = sanitizeText(req.body?.name, 120);
    const phone = sanitizeText(req.body?.phone, 32);
    const email = sanitizeText(req.body?.email, 254).toLowerCase();
    const reasons = Array.isArray(req.body?.reasons)
      ? req.body.reasons.map((reason) => sanitizeText(reason, 60)).filter(Boolean).slice(0, 8)
      : [];
    const customQuery = sanitizeText(req.body?.customQuery, maxContactMessageLength);
    const sourcePageRaw = sanitizeText(req.body?.sourcePage, 30);
    const sourcePage = allowedSourcePages.has(sourcePageRaw) ? sourcePageRaw : "contact";

    if (!name || !phone || !email || reasons.length === 0 || !isValidEmail(email) || !isValidPhone(phone)) {
      res.status(400).json({ message: "Please complete all required contact fields" });
      return;
    }

    await saveContactSubmission({
      name,
      phone,
      email,
      reasons,
      customQuery,
      sourcePage,
      createdAt: new Date().toISOString(),
      userAgent: String(req.get("user-agent") || "")
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to save contact submission" });
  }
});

app.use((error, _req, res, _next) => {
  const statusCode = Number(error?.statusCode || error?.status || 400);
  const message = isProduction
    ? "Request error"
    : String(error?.message || "Request error");
  res.status(statusCode).json({ message });
});

app.listen(PORT, async () => {
  await ensureDirectory(EVENT_UPLOAD_DIR);
  await ensureDirectory(path.dirname(CONTACT_SUBMISSIONS_PATH));
  if (!fs.existsSync(SITE_CONTENT_PATH)) {
    console.error("Missing site content file at assets/js/site-content.js");
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
