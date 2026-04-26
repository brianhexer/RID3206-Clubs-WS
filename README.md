# Rotaract Club Website Template

Modern NGO-style website for a Rotaract Club with separate menu pages, page-specific JS entry files, and a secured admin dashboard for content and event media management.

## What You Get

- Separate page file for each menu item (Home, Impact, Programs, Events, Campaigns, Stories, Contact)
- JavaScript-rendered page sections powered by a shared content schema
- Unique page script for each public page under `assets/js/pages/`
- Responsive design for desktop, tablet, and mobile
- Centralized content architecture: admin edits update the live content file automatically
- Protected admin page with username/password authentication
- Event photo and video uploads shown on the Events page automatically

## Project Structure

```text
.
├── index.html
├── impact.html
├── programs.html
├── events.html
├── campaigns.html
├── stories.html
├── contact.html
├── assets
│   ├── css
│   │   └── styles.css
│   └── js
│       ├── main.js
│       ├── admin.js
│       ├── pages/
│       │   ├── home.js
│       │   ├── impact.js
│       │   ├── programs.js
│       │   ├── events.js
│       │   ├── campaigns.js
│       │   ├── stories.js
│       │   └── contact.js
│       └── site-content.js
├── assets/uploads/events/
├── admin.html
├── server.js
├── package.json
└── README.md
```

## How Content Updates Work

Use the admin dashboard:

- URL: `/admin`
- Login with `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Edit full site JSON and save
- Upload event photos/videos

The admin panel writes updates to:

- `assets/js/site-content.js`

Public pages automatically load this updated content through the API.

## Authentication and Environment

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Set secure values:

- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Run Locally (Admin + Site)

Install dependencies:

```bash
npm install
```

Start the app server:

```bash
npm start
```

Open:

- Site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Legacy Direct Content Editing

You can still edit this file directly if needed:

- `assets/js/site-content.js`

All menu pages read from this shared content object.

## Event Media Uploads

- Uploads are available from the admin dashboard
- Accepted: image and video files
- Files are stored in `assets/uploads/events/`
- Uploaded files are shown automatically on the Events page

## API Endpoints

- `GET /api/content` public content fetch
- `PUT /api/content` admin-only content save
- `GET /api/events/media` public media list
- `POST /api/events/media` admin-only media upload
- `POST /api/auth/login` admin login
- `POST /api/auth/logout` admin logout
- `GET /api/auth/session` auth state check

## Deployment

This project is configured for automatic deployment with GitHub Pages.

Important hosting note:

- GitHub Pages serves static files only
- The public website pages will run on GitHub Pages
- The admin login, content save API, and media upload API require the Node server (`server.js`) and will not run on GitHub Pages alone
- For full admin functionality, host the Node server on a backend platform (for example Render, Railway, Fly.io, or VPS) and keep this repository on GitHub

- Workflow file: `.github/workflows/deploy-pages.yml`
- Trigger: every push to `main`
- Manual trigger: GitHub Actions `workflow_dispatch`

### One-Time GitHub Setup

1. Open repository `Settings` -> `Pages`
2. Under `Build and deployment`, set `Source` to `GitHub Actions`
3. Push to `main` (or run the workflow manually)

Your site will be published at:

`https://<github-username>.github.io/<repository-name>/`

For this repository, expected URL is:

`https://brianhexer.github.io/RID3206-Clubs-WS/`

### Full Stack Hosting (Site + Admin)

To use admin features in production:

1. Keep GitHub Pages for public static pages if desired
2. Deploy `server.js` to a Node host
3. Configure environment variables on the Node host:
	- `PORT`
	- `SESSION_SECRET`
	- `ADMIN_USERNAME`
	- `ADMIN_PASSWORD`
4. Access admin from the Node host URL at `/admin`

If you want one single URL with both public site and admin/API, deploy the entire repository to a Node host and skip GitHub Pages.

### Render Quick Deploy (Recommended)

This repository now includes a Render blueprint file:

- [render.yaml](render.yaml)

Deploy steps:

1. Push the latest code to GitHub.
2. In Render, click `New` -> `Blueprint`.
3. Connect your GitHub account and select this repository.
4. Render reads [render.yaml](render.yaml) and creates the web service automatically.
5. Set secure values for:
	- `ADMIN_USERNAME`
	- `ADMIN_PASSWORD`
6. Deploy.

After deploy:

- Public site: your Render service root URL
- Admin login: `https://<your-render-url>/admin`

Notes for uploads:

- Render disk is configured in [render.yaml](render.yaml) to persist uploaded event photos/videos.
- Uploaded files are stored under `assets/uploads/events/`.

Optional DNS setup:

- If you want a custom domain, add it in Render service settings.

## Connect Real Integrations (Optional)

- Contact form: connect the `renderContact` submit handler in `assets/js/main.js` to your backend API or form service
- Newsletter form: connect the `renderNewsletter` submit handler in `assets/js/main.js` to your mailing list platform
- Donation button: connect the `renderDonate` action in `assets/js/main.js` to Stripe, Razorpay, or another payment provider

## Customization Tips

- Brand colors: update CSS variables in `assets/css/styles.css`
- Typography: replace Google Fonts in page files and update font-family rules in `styles.css`
- New section types: add renderer logic in `assets/js/main.js` and data in `assets/js/site-content.js`

## License

This template follows the repository license in `LICENSE`.