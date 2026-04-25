(function () {
  const content = window.SITE_CONTENT;

  if (!content) {
    return;
  }

  const pageKey = document.body.dataset.page || "home";
  const pageData = content.pages[pageKey] || content.pages.home;

  if (!pageData || !content.site || !Array.isArray(content.site.nav)) {
    return;
  }

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

  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  const renderHeader = () => {
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

      if (item.href === currentPath || (item.href === "index.html" && currentPath === "")) {
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

  const renderHero = (main) => {
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

  const renderDonate = (cfg) => {
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

  const renderContact = (cfg) => {
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

  const renderNewsletter = (cfg) => {
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

  const sectionRenderers = {
    cards: renderCards,
    metrics: renderMetrics,
    timeline: renderTimeline,
    list: renderList,
    progress: renderProgress,
    donate: renderDonate,
    quotes: renderQuotes,
    faq: renderFaq,
    contact: renderContact,
    newsletter: renderNewsletter
  };

  const renderMain = () => {
    const main = document.getElementById("pageMain");
    renderHero(main);

    const sections = Array.isArray(pageData.sections) ? pageData.sections : [];

    sections.forEach((sectionConfig) => {
      const renderSection = sectionRenderers[sectionConfig.type];
      if (renderSection) {
        main.appendChild(renderSection(sectionConfig));
      }
    });
  };

  const renderFooter = () => {
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

  const applyPageMetadata = () => {
    const baseTitle = content.site.title || "Rotaract Club";
    if (pageKey === "home") {
      document.title = baseTitle;
    } else {
      document.title = `${pageData.title} | ${baseTitle}`;
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && pageData.intro) {
      metaDescription.setAttribute("content", pageData.intro);
    }
  };

  const init = () => {
    applyPageMetadata();
    renderHeader();
    renderMain();
    renderFooter();
    setupBackToTop();
    setupReveal();
  };

  init();
})();
