# Rotaract Club Website Template

Modern NGO-style website for a Rotaract Club with separate menu pages, all built from shared JavaScript content.

## What You Get

- Separate page file for each menu item (Home, Impact, Programs, Events, Campaigns, Stories, Contact)
- JavaScript-rendered page sections powered by a shared content schema
- Responsive design for desktop, tablet, and mobile
- Centralized content architecture: edit one JS file to update any specific menu page
- Ready to connect forms and donation button to real services

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
│       └── site-content.js
└── README.md
```

## How Content Updates Work

Edit only this file:

- `assets/js/site-content.js`

All menu pages are linked to this common file. Update the specific page content inside:

- `pages.home`
- `pages.impact`
- `pages.programs`
- `pages.events`
- `pages.campaigns`
- `pages.stories`
- `pages.contact`

Also available in the same file:

- Site name and navigation
- Hero copy and actions per page
- Section blocks (`cards`, `metrics`, `timeline`, `progress`, `donate`, `quotes`, `faq`, `contact`, `newsletter`, `list`)
- Footer links and legal copy
- Success/error toast messages

No page file edits are required for normal content updates.

## Run Locally

Because this is a static site, you can open `index.html` directly in a browser.

For best local development behavior, use a local web server:

```bash
# Python 3 example
python3 -m http.server 5500
```

Then open:

`http://localhost:5500`

## Deployment

This project is configured for automatic deployment with GitHub Pages.

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

## Connect Real Integrations (Optional)

- Contact form: connect the `renderContact` form submit handler in `assets/js/main.js` to your backend API or form service
- Newsletter form: connect the `renderNewsletter` submit handler in `assets/js/main.js` to your mailing list platform
- Donation button: connect the `renderDonate` action in `assets/js/main.js` to Stripe, Razorpay, or another payment provider

## Customization Tips

- Brand colors: update CSS variables in `assets/css/styles.css`
- Typography: replace Google Fonts in page files and update font-family rules in `styles.css`
- New section types: add renderer logic in `assets/js/main.js` and data in `assets/js/site-content.js`

## License

This template follows the repository license in `LICENSE`.