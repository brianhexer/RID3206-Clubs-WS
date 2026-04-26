(function () {
  const FALLBACK_CONTENT = window.SITE_CONTENT;

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const pageKeyFromPath = {
    "": "home",
    "index.html": "home",
    "impact.html": "impact",
    "programs.html": "programs",
    "events.html": "events",
    "campaigns.html": "campaigns",
    "stories.html": "stories",
    "contact.html": "contact"
  };

  const pageKey = window.PAGE_KEY || pageKeyFromPath[currentPath] || "home";

  const create = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (typeof text === "string") {
      el.textContent = text;
    }
    return el;
  };

  const showToast = (text) => {
    const toast = document.getElementById("toast");
    if (!toast) {
      return;
    }

    toast.textContent = text;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const getBaseUrl = (content) => {
    const configured = content.site.baseUrl;
    if (typeof configured === "string" && configured.trim()) {
      return configured.replace(/\/$/, "");
    }

    return `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}`.replace(/\/$/, "");
  };

  const toAbsoluteUrl = (content, pathOrUrl) => {
    if (!pathOrUrl) {
      return getBaseUrl(content);
    }

    try {
      return new URL(pathOrUrl).toString();
    } catch (_error) {
      return new URL(pathOrUrl, `${getBaseUrl(content)}/`).toString();
    }
  };

  const setMetaTag = (selector, attributes, value) => {
    let tag = document.head.querySelector(selector);
    if (!tag) {
      tag = document.createElement("meta");
      Object.entries(attributes).forEach(([key, attrValue]) => tag.setAttribute(key, attrValue));
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", value);
  };

  const setLinkTag = (selector, rel, href) => {
    let tag = document.head.querySelector(selector);
    if (!tag) {
      tag = document.createElement("link");
      tag.setAttribute("rel", rel);
      document.head.appendChild(tag);
    }
    tag.setAttribute("href", href);
  };

  const fetchLiveContent = async () => {
    try {
      const response = await fetch("/api/content", { headers: { Accept: "application/json" } });
      if (!response.ok) {
        throw new Error(`Failed content request: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.site && data.pages) {
        return data;
      }
      return FALLBACK_CONTENT;
    } catch (_error) {
      return FALLBACK_CONTENT;
    }
  };

  const fetchEventMedia = async () => {
    try {
      const response = await fetch("/api/events/media", { headers: { Accept: "application/json" } });
      if (!response.ok) {
        return [];
      }
      const payload = await response.json();
      return Array.isArray(payload.files) ? payload.files : [];
    } catch (_error) {
      return [];
    }
  };

  const renderHeader = (content) => {
    const header = document.getElementById("siteHeader");
    const wrap = create("div", "container nav-wrap");
    const brand = create("a", "brand", content.site.title);
    brand.href = "index.html";

    const desktopNav = create("nav", "desktop-nav");
    desktopNav.setAttribute("aria-label", "Primary");

    const mobileNav = create("nav", "mobile-nav");
    mobileNav.setAttribute("aria-label", "Mobile navigation");
    mobileNav.id = "mobileNav";

    content.site.nav.forEach((item) => {
      const desktopLink = create("a", "", item.label);
      desktopLink.href = item.href;

      const mobileLink = create("a", "", item.label);
      mobileLink.href = item.href;

      if (item.key === pageKey) {
        desktopLink.classList.add("active");
        mobileLink.classList.add("active");
        desktopLink.setAttribute("aria-current", "page");
        mobileLink.setAttribute("aria-current", "page");
      }

      desktopNav.appendChild(desktopLink);
      mobileNav.appendChild(mobileLink);
    });

    const menuToggle = create("button", "menu-toggle");
    menuToggle.id = "menuToggle";
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.appendChild(create("span"));
    menuToggle.appendChild(create("span"));

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.classList.toggle("open");
    });

    mobileNav.addEventListener("click", (event) => {
      if (event.target.tagName === "A") {
        menuToggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("open");
      }
    });

    wrap.appendChild(brand);
    wrap.appendChild(desktopNav);
    wrap.appendChild(menuToggle);

    header.appendChild(wrap);
    header.appendChild(mobileNav);
  };

  const renderHero = (main, pageData) => {
    const section = create("section", "hero section");
    const container = create("div", "container");
    const copy = create("div", "hero-copy");

    copy.appendChild(create("p", "kicker", pageData.kicker));
    copy.appendChild(create("h1", "", pageData.title));
    copy.appendChild(create("p", "lead", pageData.intro));

    if (Array.isArray(pageData.actions) && pageData.actions.length > 0) {
      const actions = create("div", "hero-actions");
      pageData.actions.forEach((action) => {
        const link = create("a", `btn ${action.style === "outline" ? "btn-outline" : "btn-solid"}`, action.label);
        link.href = action.href;
        actions.appendChild(link);
      });
      copy.appendChild(actions);
    }

    container.appendChild(copy);
    section.appendChild(container);
    main.appendChild(section);
  };

  const createSectionShell = (title, intro) => {
    const section = create("section", "section");
    const container = create("div", "container");
    const head = create("div", "section-head");

    if (title) {
      head.appendChild(create("h2", "", title));
    }
    if (intro) {
      head.appendChild(create("p", "", intro));
    }

    container.appendChild(head);
    section.appendChild(container);
    return { section, container };
  };

  const renderCards = (cfg) => {
    const { section, container } = createSectionShell(cfg.title, cfg.intro);
    const grid = create("div", "card-grid");

    const items = Array.isArray(cfg.items) ? cfg.items : [];

    items.forEach((item) => {
      const card = create("article", "program-card reveal");
      card.appendChild(create("h3", "", item.title));
      card.appendChild(create("p", "", item.text));

      if (Array.isArray(item.tags) && item.tags.length > 0) {
        const tags = create("div", "tags");
        item.tags.forEach((tag) => tags.appendChild(create("span", "", tag)));
        card.appendChild(tags);
      }

      grid.appendChild(card);
    });

    container.appendChild(grid);
    return section;
  };

  const renderMetrics = (cfg) => {
    const { section, container } = createSectionShell(cfg.title, cfg.intro);
    const grid = create("div", "impact-grid");

    const items = Array.isArray(cfg.items) ? cfg.items : [];

    items.forEach((item) => {
      const card = create("article", "impact-card reveal");
      card.appendChild(create("h3", "", item.value));
      card.appendChild(create("p", "", item.label));
      grid.appendChild(card);
    });

    container.appendChild(grid);
    return section;
  };

  const renderTimeline = (cfg) => {
    const { section, container } = createSectionShell(cfg.title, cfg.intro);
    const list = create("div", "timeline");

    const items = Array.isArray(cfg.items) ? cfg.items : [];

    items.forEach((item) => {
      const card = create("article", "event-item reveal");
      card.appendChild(create("p", "event-date", item.date));
      card.appendChild(create("h3", "", item.title));
      card.appendChild(create("p", "event-location", item.meta));
      card.appendChild(create("p", "", item.text));
      list.appendChild(card);
    });

    container.appendChild(list);
    return section;
  };

  const renderList = (cfg) => {
    const { section, container } = createSectionShell(cfg.title, cfg.intro);
    const card = create("article", "aside-card reveal");
    const ul = create("ul", "bullet-list");

    const items = Array.isArray(cfg.items) ? cfg.items : [];

    items.forEach((item) => {
      ul.appendChild(create("li", "", item));
    });

    card.appendChild(ul);
    container.appendChild(card);
    return section;
  };

  const renderProgress = (cfg) => {
    const { section, container } = createSectionShell(cfg.title, cfg.intro);
    const list = create("div", "campaign-list");

    const items = Array.isArray(cfg.items) ? cfg.items : [];

    items.forEach((item) => {
      const safeRaised = Number(item.raised) || 0;
      const safeGoal = Number(item.goal) || 0;
      const percent = safeGoal > 0 ? Math.min(100, Math.round((safeRaised / safeGoal) * 100)) : 0;
      const card = create("article", "campaign-card reveal");
      card.appendChild(create("h3", "", item.title));
      card.appendChild(create("p", "", item.text));
      card.appendChild(create("p", "campaign-meta", `Raised $${safeRaised.toLocaleString("en-IN")} of $${safeGoal.toLocaleString("en-IN")}`));

      const track = create("div", "progress-track");
      const fill = create("span", "progress-fill");
      fill.style.width = `${percent}%`;
      track.appendChild(fill);

      card.appendChild(track);
      card.appendChild(create("p", "campaign-percent", `${percent}% funded`));
      list.appendChild(card);
    });

    container.appendChild(list);
    return section;
  };

  const renderDonate = (cfg, content) => {
    const { section, container } = createSectionShell(cfg.title, cfg.intro);
    const card = create("div", "donation-card reveal");
    card.appendChild(create("p", "", cfg.text));

    const presetWrap = create("div", "donation-presets");
    const amountInput = create("input", "");
    amountInput.type = "number";
    amountInput.min = "1";
    amountInput.step = "1";
    amountInput.placeholder = "Enter amount";

    const presets = Array.isArray(cfg.presets) ? cfg.presets : [];

    const amountLabel = create("label", "", "Donation amount");
    amountLabel.htmlFor = "donationAmount";
    amountInput.id = "donationAmount";
    amountInput.name = "donationAmount";

    presets.forEach((amount) => {
      const button = create("button", "", `$${amount}`);
      button.type = "button";
      button.addEventListener("click", () => {
        amountInput.value = String(amount);
      });
      presetWrap.appendChild(button);
    });

    const donateButton = create("button", "btn btn-solid", "Donate");
    donateButton.type = "button";
    donateButton.addEventListener("click", () => {
      const amount = Number(amountInput.value);
      if (!amount || amount <= 0) {
        showToast(content.messages.amountRequired);
        return;
      }
      showToast(`${content.messages.donationReady}: $${amount}`);
    });

    card.appendChild(presetWrap);
    card.appendChild(amountLabel);
    card.appendChild(amountInput);
    card.appendChild(donateButton);
    container.appendChild(card);
    return section;
  };

  const renderQuotes = (cfg) => {
    const { section, container } = createSectionShell(cfg.title, cfg.intro);
    const grid = create("div", "card-grid");

    const items = Array.isArray(cfg.items) ? cfg.items : [];

    items.forEach((item) => {
      const card = create("article", "quote-card reveal");
      card.appendChild(create("p", "quote", `"${item.text}"`));
      card.appendChild(create("p", "quote-person", item.name));
      card.appendChild(create("p", "quote-role", item.role));
      grid.appendChild(card);
    });

    container.appendChild(grid);
    return section;
  };

  const renderFaq = (cfg) => {
    const { section, container } = createSectionShell(cfg.title, cfg.intro);
    const list = create("div", "faq-list");

    const items = Array.isArray(cfg.items) ? cfg.items : [];

    items.forEach((item, index) => {
      const details = create("details", "faq-item reveal");
      if (index === 0) {
        details.open = true;
      }

      const summary = create("summary", "", item.question);
      const answer = create("p", "", item.answer);

      details.appendChild(summary);
      details.appendChild(answer);
      list.appendChild(details);
    });

    container.appendChild(list);
    return section;
  };

  const renderContact = (cfg, content) => {
    const section = create("section", "section contact");
    const container = create("div", "container two-col contact-wrap");

    const detailsCard = create("article", "aside-card reveal");
    detailsCard.appendChild(create("h3", "", cfg.title));

    cfg.details.forEach((row) => {
      detailsCard.appendChild(create("p", "", `${row.label}: ${row.value}`));
    });

    const formCard = create("form", "contact-form reveal");
    formCard.appendChild(create("h3", "", cfg.form.title));

    const nameLabel = create("label", "", cfg.form.nameLabel);
    nameLabel.htmlFor = "contactName";
    const nameInput = create("input");
    nameInput.id = "contactName";
    nameInput.name = "name";
    nameInput.autocomplete = "name";
    nameInput.required = true;

    const emailLabel = create("label", "", cfg.form.emailLabel);
    emailLabel.htmlFor = "contactEmail";
    const emailInput = create("input");
    emailInput.id = "contactEmail";
    emailInput.name = "email";
    emailInput.type = "email";
    emailInput.autocomplete = "email";
    emailInput.required = true;

    const messageLabel = create("label", "", cfg.form.messageLabel);
    messageLabel.htmlFor = "contactMessage";
    const messageInput = create("textarea");
    messageInput.id = "contactMessage";
    messageInput.name = "message";
    messageInput.required = true;
    messageInput.rows = 5;

    const submit = create("button", "btn btn-solid", cfg.form.submitLabel);
    submit.type = "submit";

    formCard.addEventListener("submit", (event) => {
      event.preventDefault();
      formCard.reset();
      showToast(content.messages.contactSuccess);
    });

    formCard.appendChild(nameLabel);
    formCard.appendChild(nameInput);
    formCard.appendChild(emailLabel);
    formCard.appendChild(emailInput);
    formCard.appendChild(messageLabel);
    formCard.appendChild(messageInput);
    formCard.appendChild(submit);

    container.appendChild(detailsCard);
    container.appendChild(formCard);
    section.appendChild(container);
    return section;
  };

  const renderNewsletter = (cfg, content) => {
    const section = create("section", "section");
    const container = create("div", "container newsletter-card reveal");

    const textWrap = create("div");
    textWrap.appendChild(create("h3", "", cfg.title));
    textWrap.appendChild(create("p", "", cfg.text));

    const form = create("form", "newsletter-form");
    form.setAttribute("aria-label", "Newsletter subscription form");
    const emailLabel = create("label", "sr-only", "Email for newsletter");
    emailLabel.htmlFor = "newsletterEmail";
    const email = create("input");
    email.id = "newsletterEmail";
    email.name = "newsletterEmail";
    email.type = "email";
    email.autocomplete = "email";
    email.required = true;
    email.placeholder = "Enter your email";

    const button = create("button", "btn btn-ghost", cfg.submitLabel);
    button.type = "submit";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      showToast(content.messages.newsletterSuccess);
    });

    form.appendChild(emailLabel);
    form.appendChild(email);
    form.appendChild(button);

    container.appendChild(textWrap);
    container.appendChild(form);
    section.appendChild(container);
    return section;
  };

  const renderEventMediaGallery = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    const section = create("section", "section");
    const container = create("div", "container");
    const head = create("div", "section-head");
    head.appendChild(create("h2", "", "Event Media"));
    head.appendChild(create("p", "", "Recent photos and videos uploaded from the admin panel."));

    const grid = create("div", "event-media-grid");

    items.forEach((item) => {
      const card = create("article", "event-media-item reveal");
      if (item.type === "video") {
        const video = create("video");
        video.controls = true;
        video.preload = "metadata";
        video.src = item.url;
        card.appendChild(video);
      } else {
        const image = create("img");
        image.src = item.url;
        image.alt = "Event media";
        image.loading = "lazy";
        card.appendChild(image);
      }
      grid.appendChild(card);
    });

    container.appendChild(head);
    container.appendChild(grid);
    section.appendChild(container);
    return section;
  };

  const renderMain = (content, pageData, eventMedia) => {
    const main = document.getElementById("pageMain");
    renderHero(main, pageData);

    const sections = Array.isArray(pageData.sections) ? pageData.sections : [];

    sections.forEach((sectionConfig) => {
      let rendered = null;
      if (sectionConfig.type === "cards") {
        rendered = renderCards(sectionConfig);
      }
      if (sectionConfig.type === "metrics") {
        rendered = renderMetrics(sectionConfig);
      }
      if (sectionConfig.type === "timeline") {
        rendered = renderTimeline(sectionConfig);
      }
      if (sectionConfig.type === "list") {
        rendered = renderList(sectionConfig);
      }
      if (sectionConfig.type === "progress") {
        rendered = renderProgress(sectionConfig);
      }
      if (sectionConfig.type === "donate") {
        rendered = renderDonate(sectionConfig, content);
      }
      if (sectionConfig.type === "quotes") {
        rendered = renderQuotes(sectionConfig);
      }
      if (sectionConfig.type === "faq") {
        rendered = renderFaq(sectionConfig);
      }
      if (sectionConfig.type === "contact") {
        rendered = renderContact(sectionConfig, content);
      }
      if (sectionConfig.type === "newsletter") {
        rendered = renderNewsletter(sectionConfig, content);
      }

      if (rendered) {
        main.appendChild(rendered);
      }
    });

    if (pageKey === "events") {
      const mediaSection = renderEventMediaGallery(eventMedia);
      if (mediaSection) {
        main.appendChild(mediaSection);
      }
    }
  };

  const renderFooter = (content) => {
    const footer = document.getElementById("siteFooter");
    const container = create("div", "container footer-grid");

    const aboutCol = create("div");
    aboutCol.appendChild(create("h3", "", content.site.title));
    aboutCol.appendChild(create("p", "", content.site.footerAbout));

    const linksCol = create("div");
    linksCol.appendChild(create("h4", "", "Quick Links"));
    content.site.footerLinks.forEach((item) => {
      const link = create("a", "", item.label);
      link.href = item.href;
      linksCol.appendChild(link);
    });

    const legalCol = create("div");
    legalCol.appendChild(create("h4", "", "Legal"));
    content.site.legalLinks.forEach((item) => {
      const link = create("a", "", item.label);
      link.href = item.href;
      legalCol.appendChild(link);
    });

    container.appendChild(aboutCol);
    container.appendChild(linksCol);
    container.appendChild(legalCol);

    const copy = create("p", "copyright", `${new Date().getFullYear()} ${content.site.title}. All rights reserved.`);

    footer.appendChild(container);
    footer.appendChild(copy);
  };

  const setupBackToTop = () => {
    const button = document.getElementById("backToTop");
    if (!button) {
      return;
    }

    const onScroll = () => {
      button.classList.toggle("visible", window.scrollY > 480);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const setupReveal = () => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
  };

  const applyPageMetadata = (content, pageData) => {
    const baseTitle = content.site.title || "Rotaract Club";
    const pageSeo = pageData.seo || {};
    const description = pageData.intro || "Youth-led service and leadership initiatives with measurable impact.";
    const keywords = Array.isArray(pageSeo.keywords) ? pageSeo.keywords.join(", ") : "";
    const slug = pageSeo.slug || currentPath;
    const canonicalUrl = toAbsoluteUrl(content, slug);
    const imageUrl = toAbsoluteUrl(content, content.site.defaultImage || "assets/img/social-preview.svg");

    if (pageKey === "home") {
      document.title = baseTitle;
    } else {
      document.title = `${pageData.title} | ${baseTitle}`;
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }

    if (keywords) {
      setMetaTag('meta[name="keywords"]', { name: "keywords" }, keywords);
    }

    setMetaTag('meta[name="robots"]', { name: "robots" }, "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMetaTag('meta[name="author"]', { name: "author" }, baseTitle);
    setMetaTag('meta[name="geo.region"]', { name: "geo.region" }, content.site.geo?.regionCode || "IN-TN");
    setMetaTag('meta[name="geo.placename"]', { name: "geo.placename" }, content.site.geo?.city || "Metro City");
    setMetaTag('meta[name="application-name"]', { name: "application-name" }, baseTitle);
    setMetaTag('meta[name="apple-mobile-web-app-title"]', { name: "apple-mobile-web-app-title" }, baseTitle);

    setMetaTag('meta[property="og:type"]', { property: "og:type" }, pageKey === "home" ? "website" : "article");
    setMetaTag('meta[property="og:site_name"]', { property: "og:site_name" }, baseTitle);
    setMetaTag('meta[property="og:title"]', { property: "og:title" }, document.title);
    setMetaTag('meta[property="og:description"]', { property: "og:description" }, description);
    setMetaTag('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    setMetaTag('meta[property="og:image"]', { property: "og:image" }, imageUrl);
    setMetaTag('meta[property="og:locale"]', { property: "og:locale" }, content.site.locale || "en_IN");

    setMetaTag('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, document.title);
    setMetaTag('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    setMetaTag('meta[name="twitter:image"]', { name: "twitter:image" }, imageUrl);

    setMetaTag('meta[name="ai-summary"]', { name: "ai-summary" }, description);
    if (Array.isArray(pageSeo.quickAnswers) && pageSeo.quickAnswers.length > 0) {
      setMetaTag('meta[name="ai-key-answers"]', { name: "ai-key-answers" }, pageSeo.quickAnswers.map((item) => `${item.question} ${item.answer}`).join(" | "));
    }

    setLinkTag('link[rel="canonical"]', "canonical", canonicalUrl);

    const pageName = pageKey === "home" ? "Home" : pageData.title;
    const breadcrumb = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: toAbsoluteUrl(content, "index.html")
      }
    ];

    if (pageKey !== "home") {
      breadcrumb.push({
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: canonicalUrl
      });
    }

    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${getBaseUrl(content)}/#organization`,
        name: baseTitle,
        url: getBaseUrl(content),
        description: content.site.footerAbout,
        slogan: content.site.tagline,
        email: "hello@rotaractmetro.org",
        telephone: "+91 90000 12345",
        sameAs: Array.isArray(content.site.sameAs) ? content.site.sameAs : undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: content.site.geo?.city || "Metro City",
          addressRegion: content.site.geo?.region || "Tamil Nadu",
          addressCountry: content.site.geo?.country || "IN"
        },
        areaServed: {
          "@type": "Place",
          name: `${content.site.geo?.city || "Metro City"}, ${content.site.geo?.region || "Tamil Nadu"}`
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${getBaseUrl(content)}/#website`,
        url: getBaseUrl(content),
        name: baseTitle,
        description
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: document.title,
        description,
        inLanguage: "en",
        isPartOf: { "@id": `${getBaseUrl(content)}/#website` },
        about: { "@id": `${getBaseUrl(content)}/#organization` }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumb
      }
    ];

    const faqFromStories = pageKey === "stories"
      ? (Array.isArray(pageData.sections)
        ? pageData.sections.find((section) => section.type === "faq")
        : null)
      : null;

    if (faqFromStories && Array.isArray(faqFromStories.items) && faqFromStories.items.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqFromStories.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      });
    }

    const quickAnswers = Array.isArray(pageSeo.quickAnswers) ? pageSeo.quickAnswers : [];
    if (quickAnswers.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: quickAnswers.map((qa) => ({
          "@type": "Question",
          name: qa.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: qa.answer
          }
        }))
      });
    }

    if (pageKey === "events") {
      const timeline = Array.isArray(pageData.sections)
        ? pageData.sections.find((section) => section.type === "timeline")
        : null;

      if (timeline && Array.isArray(timeline.items) && timeline.items.length > 0) {
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Upcoming Rotaract Events",
          itemListElement: timeline.items.map((item, index) => {
            const parsedDate = new Date(item.date);
            const startDate = Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();

            return {
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Event",
                name: item.title,
                startDate,
                eventStatus: "https://schema.org/EventScheduled",
                eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                location: {
                  "@type": "Place",
                  name: item.meta,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: content.site.geo?.city || "Metro City",
                    addressRegion: content.site.geo?.region || "Tamil Nadu",
                    addressCountry: content.site.geo?.country || "IN"
                  }
                },
                description: item.text
              }
            };
          })
        });
      }
    }

    let schemaScript = document.getElementById("site-schema-json");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "site-schema-json";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(structuredData);
  };

  const init = async () => {
    const content = await fetchLiveContent();
    if (!content || !content.site || !content.pages) {
      return;
    }

    const pageData = content.pages[pageKey] || content.pages.home;
    if (!pageData) {
      return;
    }

    const eventMedia = pageKey === "events" ? await fetchEventMedia() : [];

    applyPageMetadata(content, pageData);
    renderHeader(content);
    renderMain(content, pageData, eventMedia);
    renderFooter(content);
    setupBackToTop();
    setupReveal();
  };

  init();
})();
