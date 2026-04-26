const express = require("express");
const session = require("express-session");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const vm = require("vm");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const SITE_CONTENT_PATH = path.join(ROOT, "assets", "js", "site-content.js");
const EVENT_UPLOAD_DIR = path.join(ROOT, "assets", "uploads", "events");
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = String(process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const cookieSameSite = String(process.env.COOKIE_SAME_SITE || "lax").toLowerCase();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed"));
  }
};

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
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image and video files are allowed"));
  }
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-session-secret",
    name: "rid3206.sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(express.static(ROOT));

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(ROOT, "admin.html"));
});

app.get("/api/auth/session", (req, res) => {
  res.json({ authenticated: Boolean(req.session && req.session.isAdmin) });
});

app.post("/api/auth/login", (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "change-this-password";

  if (username !== adminUser || password !== adminPass) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  req.session.isAdmin = true;
  req.session.username = username;
  res.json({ ok: true });
});

app.post("/api/auth/logout", (req, res) => {
  if (!req.session) {
    res.json({ ok: true });
    return;
  }

  req.session.destroy(() => {
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

app.post("/api/events/media", requireAuth, upload.array("files", 20), async (_req, res) => {
  try {
    const files = await listUploadedMedia();
    res.json({ ok: true, files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use((error, _req, res, _next) => {
  res.status(400).json({ message: error.message || "Request error" });
});

app.listen(PORT, async () => {
  await ensureDirectory(EVENT_UPLOAD_DIR);
  if (!fs.existsSync(SITE_CONTENT_PATH)) {
    console.error("Missing site content file at assets/js/site-content.js");
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
