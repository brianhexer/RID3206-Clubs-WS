# Rotaract Club Website Template

Modern NGO-style website for a Rotaract Club, built so content updates happen in one file only.

## What You Get

- Modern landing experience with impact counters, programs, campaigns, events, testimonials, gallery, FAQ, and contact/newsletter forms
- Responsive design for desktop, tablet, and mobile
- Centralized content architecture: edit one JS file to update all visible text/data on the site
- Ready to connect forms and donation button to real services

## Project Structure

```text
.
├── index.html
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

All page sections pull data from that file, including:

- Site name and navigation
- Hero section
- Impact numbers
- Programs
- Events
- Campaign goals and raised amounts
- Testimonials
- Gallery images
- Blog cards and FAQ
- Contact details and form labels
- Newsletter copy
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

- Contact form: connect `#contactForm` submit handler in `assets/js/main.js` to your backend API or form service
- Newsletter form: connect `#newsletterForm` submit handler to your mailing list platform
- Donation button: connect `#donateButton` action to Stripe, Razorpay, or another payment provider

## Customization Tips

- Brand colors: update CSS variables in `assets/css/styles.css`
- Typography: replace Google Fonts in `index.html` and update font-family rules in `styles.css`
- New sections: add data in `site-content.js` and render logic in `main.js`

## License

This template follows the repository license in `LICENSE`.