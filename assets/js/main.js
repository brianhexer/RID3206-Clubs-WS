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

  const getContinuousLoopWidth = (scroll) => Number(scroll?.dataset?.loopWidth || 0);

  const wrapContinuousScroll = (scroll) => {
    const loopWidth = getContinuousLoopWidth(scroll);
    if (!loopWidth) {
      return;
    }

    if (scroll.scrollLeft >= loopWidth) {
      scroll.scrollLeft -= loopWidth;
    } else if (scroll.scrollLeft < 0) {
      scroll.scrollLeft += loopWidth;
    }
  };

  const prepareContinuousScroll = (scroll) => {
    if (!scroll || scroll.dataset.continuousPrepared === "true") {
      return;
    }

    const children = Array.from(scroll.children);
    if (children.length === 0) {
      return;
    }

    scroll.dataset.continuousPrepared = "true";
    children.forEach((child) => {
      scroll.appendChild(child.cloneNode(true));
    });
    scroll.dataset.loopWidth = String(Math.max(1, Math.round(scroll.scrollWidth / 2)));
  };

  const resolveImageSource = (value) => {
    const source = String(value || "");
    if (!source) {
      return "assets/img/social-preview.svg";
    }

    if (source.startsWith("assets/img/common/")) {
      return "assets/img/social-preview.svg";
    }

    return source;
  };

  const addScrollControls = (scroll, options = {}) => {
    const stepRatio = Number(options.stepRatio) || 0.8;
    const frame = create("div", "scroll-frame");
    const prevButton = create("button", "scroll-arrow scroll-arrow-prev");
    prevButton.type = "button";
    prevButton.setAttribute("aria-label", options.prevLabel || "Scroll left");
    prevButton.textContent = "❮";

    const nextButton = create("button", "scroll-arrow scroll-arrow-next");
    nextButton.type = "button";
    nextButton.setAttribute("aria-label", options.nextLabel || "Scroll right");
    nextButton.textContent = "❯";

    const scrollDistance = () => Math.max(260, Math.round(scroll.clientWidth * stepRatio));
    const pauseAutoScroll = () => {
      scroll.dispatchEvent(new CustomEvent("scroll-autoplay-pause", { bubbles: true }));
    };

    const resumeAutoScroll = () => {
      scroll.dispatchEvent(new CustomEvent("scroll-autoplay-resume", { bubbles: true }));
    };

    let dragState = null;

    const stopDrag = () => {
      if (!dragState) {
        return;
      }

      scroll.classList.remove("is-dragging");
      dragState = null;
      resumeAutoScroll();
    };

    scroll.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }

      dragState = {
        startX: event.clientX,
        startScrollLeft: scroll.scrollLeft,
        pointerId: event.pointerId
      };

      scroll.classList.add("is-dragging");
      pauseAutoScroll();

      if (scroll.setPointerCapture) {
        scroll.setPointerCapture(event.pointerId);
      }
    });

    scroll.addEventListener("pointermove", (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - dragState.startX;
      scroll.scrollLeft = dragState.startScrollLeft - deltaX;
      wrapContinuousScroll(scroll);
    });

    scroll.addEventListener("pointerup", stopDrag);
    scroll.addEventListener("pointercancel", stopDrag);
    scroll.addEventListener("pointerleave", stopDrag);

    const wirePressAndHold = (button, direction) => {
      let holdTimer = null;
      let repeatTimer = null;
      let pressStartedAt = 0;

      const stopRepeating = () => {
        if (holdTimer) {
          window.clearTimeout(holdTimer);
          holdTimer = null;
        }
        if (repeatTimer) {
          window.clearInterval(repeatTimer);
          repeatTimer = null;
        }
        resumeAutoScroll();
      };

      const startRepeating = () => {
        stopRepeating();
        pauseAutoScroll();
        repeatTimer = window.setInterval(() => {
          scroll.scrollLeft += direction * Math.max(18, Math.round(scrollDistance() / 18));
          wrapContinuousScroll(scroll);
        }, 16);
      };

      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        pressStartedAt = Date.now();
        stopRepeating();
        pauseAutoScroll();
        holdTimer = window.setTimeout(startRepeating, 140);
      });

      const finishPress = () => {
        stopRepeating();
      };

      button.addEventListener("pointerup", finishPress);
      button.addEventListener("pointerleave", finishPress);
      button.addEventListener("pointercancel", finishPress);
      window.addEventListener("blur", finishPress);

      button.addEventListener("click", (event) => {
        const heldLongEnough = Date.now() - pressStartedAt >= 180;
        if (heldLongEnough) {
          event.preventDefault();
          return;
        }

        scroll.scrollLeft += direction * scrollDistance();
        wrapContinuousScroll(scroll);
      });
    };

    wirePressAndHold(prevButton, -1);
    wirePressAndHold(nextButton, 1);

    frame.appendChild(prevButton);
    frame.appendChild(scroll);
    frame.appendChild(nextButton);
    return frame;
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

  const resolveApiBase = (content) => {
    const configured = String(content?.site?.apiBaseUrl || "").trim();
    if (configured) {
      return configured.replace(/\/$/, "");
    }

    const saved = String(window.localStorage.getItem("rid3206_api_base_url") || "").trim();
    if (saved) {
      return saved.replace(/\/$/, "");
    }

    return "";
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
      const apiBase = resolveApiBase(FALLBACK_CONTENT || {});
      const response = await fetch(`${apiBase}/api/content`, { headers: { Accept: "application/json" }, credentials: "include" });
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

  const fetchEventMedia = async (content) => {
    try {
      const apiBase = resolveApiBase(content);
      const response = await fetch(`${apiBase}/api/events/media`, { headers: { Accept: "application/json" }, credentials: "include" });
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
    const section = create("section", "hero-section");
    section.id = "hero";
    const container = create("div", "container");

    if (pageData.title) {
      container.appendChild(create("h1", "", pageData.title));
    }
    if (pageData.subtitle) {
      container.appendChild(create("p", "subtitle", pageData.subtitle));
    }
    if (pageData.tagline) {
      container.appendChild(create("p", "tagline", pageData.tagline));
    }

    section.appendChild(container);
    main.appendChild(section);
  };

  const renderAbout = (main, section) => {
    const aboutSection = create("section", "about-section");
    aboutSection.id = section.id || "about";
    const container = create("div", "container");

    const aboutContainer = create("div", "about-container");

    // Background image
    if (section.backgroundImage) {
      const bgDiv = create("div", "about-bg");
      const img = create("img");
      img.src = resolveImageSource(section.backgroundImage);
      img.alt = "About the club";
      img.loading = "lazy";
      bgDiv.appendChild(img);
      aboutContainer.appendChild(bgDiv);
    }

    // Content
    const contentDiv = create("div", "about-content");
    if (section.title) {
      contentDiv.appendChild(create("h2", "", section.title));
    }
    if (section.content) {
      contentDiv.appendChild(create("p", "", section.content));
    }

    // Highlights
    if (Array.isArray(section.highlights) && section.highlights.length > 0) {
      const highlightsDiv = create("div", "about-highlights");
      section.highlights.forEach((highlight) => {
        const box = create("div", "highlight-box");
        const value = create("div", "value", highlight.value);
        const label = create("div", "label", highlight.label);
        box.appendChild(value);
        box.appendChild(label);
        highlightsDiv.appendChild(box);
      });
      contentDiv.appendChild(highlightsDiv);
    }

    aboutContainer.appendChild(contentDiv);
    container.appendChild(aboutContainer);
    aboutSection.appendChild(container);
    main.appendChild(aboutSection);
  };

  const renderSponsors = (main, section) => {
    const sponsorsSection = create("section", "sponsors-section");
    sponsorsSection.id = section.id || "sponsors";
    const container = create("div", "container");

    if (section.title) {
      const h2 = create("h2", "", section.title);
      container.appendChild(h2);
    }
    if (section.subtitle) {
      const subtitle = create("p", "subtitle", section.subtitle);
      container.appendChild(subtitle);
    }

    const scroll = create("div", "sponsors-scroll");
    if (Array.isArray(section.sponsors)) {
      section.sponsors.forEach((sponsor) => {
        const item = create("a", "sponsor-item");
        item.href = sponsor.url || "#";
        const img = create("img");
        img.src = resolveImageSource(sponsor.image);
        img.alt = sponsor.name;
        img.loading = "lazy";
        item.appendChild(img);
        scroll.appendChild(item);
      });
    }

    container.appendChild(addScrollControls(scroll, {
      prevLabel: "Scroll sponsors left",
      nextLabel: "Scroll sponsors right",
      stepRatio: 0.9
    }));
    sponsorsSection.appendChild(container);
    main.appendChild(sponsorsSection);
  };

  const renderProjects = (main, section) => {
    const projectsSection = create("section", "projects-section");
    projectsSection.id = section.id || "projects";
    const container = create("div", "container");

    if (section.title) {
      container.appendChild(create("h2", "", section.title));
    }
    if (section.subtitle) {
      container.appendChild(create("p", "subtitle", section.subtitle));
    }

    // Filter buttons
    const filterDiv = create("div", "projects-filter");
    const allBtn = create("button", "filter-btn active");
    allBtn.textContent = "All";
    allBtn.dataset.filter = "all";
    filterDiv.appendChild(allBtn);

    const upcomingBtn = create("button", "filter-btn");
    upcomingBtn.textContent = "Upcoming";
    upcomingBtn.dataset.filter = "upcoming";
    filterDiv.appendChild(upcomingBtn);

    const completedBtn = create("button", "filter-btn");
    completedBtn.textContent = "Completed";
    completedBtn.dataset.filter = "completed";
    filterDiv.appendChild(completedBtn);

    container.appendChild(filterDiv);

    // Projects grid
    const grid = create("div", "projects-grid");
    if (Array.isArray(section.projects)) {
      section.projects.forEach((project) => {
        const card = create("article", "project-card reveal");
        card.dataset.category = project.category;

        if (project.image) {
          const img = create("img");
          img.src = resolveImageSource(project.image);
          img.alt = project.name;
          img.loading = "lazy";
          card.appendChild(img);
        }

        const info = create("div", "project-info");

        const category = create("span", "project-category " + project.category, project.category === "upcoming" ? "Upcoming" : "Completed");
        info.appendChild(category);

        const h3 = create("h3", "", project.name);
        info.appendChild(h3);

        const meta = create("div", "project-meta");
        const dateSpan = create("span", "");
        dateSpan.textContent = "📅 " + project.date;
        meta.appendChild(dateSpan);

        const timeSpan = create("span", "");
        timeSpan.textContent = "🕐 " + project.time;
        meta.appendChild(timeSpan);

        const venueSpan = create("span", "");
        venueSpan.textContent = "📍 " + project.venue;
        meta.appendChild(venueSpan);

        info.appendChild(meta);

        const desc = create("p", "project-description", project.description);
        info.appendChild(desc);

        card.appendChild(info);
        grid.appendChild(card);
      });
    }

    container.appendChild(grid);

    // Filter functionality
    const filterCards = (category) => {
      grid.querySelectorAll(".project-card").forEach((card) => {
        if (category === "all" || card.dataset.category === category) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    };

    filterDiv.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        filterDiv.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        filterCards(btn.dataset.filter);
      });
    });

    projectsSection.appendChild(container);
    main.appendChild(projectsSection);
  };

  const renderMembers = (main, section) => {
    const membersSection = create("section", "members-section");
    membersSection.id = section.id || "members";
    const container = create("div", "container");

    if (section.title) {
      container.appendChild(create("h2", "", section.title));
    }
    if (section.subtitle) {
      container.appendChild(create("p", "subtitle", section.subtitle));
    }

    const scroll = create("div", "members-scroll");
    if (Array.isArray(section.boardMembers)) {
      section.boardMembers.forEach((member) => {
        const card = create("article", "member-card");

        const photo = create("div", "member-photo");
        const img = create("img");
        img.src = resolveImageSource(member.image);
        img.alt = member.name;
        img.loading = "lazy";
        photo.appendChild(img);
        card.appendChild(photo);

        const info = create("div", "member-info");
        const name = create("p", "member-name", member.name);
        info.appendChild(name);

        const position = create("p", "member-position", member.position);
        info.appendChild(position);

        const bio = create("p", "member-bio", member.bio);
        info.appendChild(bio);

        card.appendChild(info);
        scroll.appendChild(card);
      });
    }

    container.appendChild(addScrollControls(scroll, {
      prevLabel: "Scroll members left",
      nextLabel: "Scroll members right",
      stepRatio: 0.82
    }));
    membersSection.appendChild(container);
    main.appendChild(membersSection);
  };

  const renderTestimonials = (main, section) => {
    const testimonialsSection = create("section", "testimonials-section");
    testimonialsSection.id = section.id || "testimonials";
    const container = create("div", "container");

    if (section.title) {
      container.appendChild(create("h2", "", section.title));
    }
    if (section.subtitle) {
      container.appendChild(create("p", "subtitle", section.subtitle));
    }

    const scroll = create("div", "testimonials-scroll");
    if (Array.isArray(section.testimonials)) {
      section.testimonials.forEach((testimonial) => {
        const card = create("article", "testimonial-card");

        const quote = create("p", "testimonial-quote", testimonial.text);
        card.appendChild(quote);

        const author = create("div", "testimonial-author");

        if (testimonial.image) {
          const avatar = create("div", "testimonial-avatar");
          const img = create("img");
          img.src = resolveImageSource(testimonial.image);
          img.alt = testimonial.name;
          img.loading = "lazy";
          avatar.appendChild(img);
          author.appendChild(avatar);
        }

        const nameDiv = create("div", "");
        const name = create("p", "testimonial-name", testimonial.name);
        nameDiv.appendChild(name);

        const role = create("p", "testimonial-role", testimonial.role);
        nameDiv.appendChild(role);

        author.appendChild(nameDiv);
        card.appendChild(author);
        scroll.appendChild(card);
      });
    }

    container.appendChild(addScrollControls(scroll, {
      prevLabel: "Scroll testimonials left",
      nextLabel: "Scroll testimonials right",
      stepRatio: 0.88
    }));
    testimonialsSection.appendChild(container);
    main.appendChild(testimonialsSection);
  };

  const renderGallery = (main, section) => {
    const gallerySection = create("section", "gallery-section");
    gallerySection.id = section.id || "gallery";
    const container = create("div", "container");

    if (section.title) {
      container.appendChild(create("h2", "", section.title));
    }
    if (section.subtitle) {
      container.appendChild(create("p", "subtitle", section.subtitle));
    }

    const scroll = create("div", "gallery-scroll");
    let galleryIndex = 0;

    if (Array.isArray(section.gallery)) {
      section.gallery.forEach((item, idx) => {
        const card = create("article", "gallery-card");
        card.dataset.galleryIndex = String(idx);
        card.style.cursor = "pointer";

        const imageDiv = create("div", "gallery-image");

        const overlay = create("div", "gallery-overlay");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "12");
        circle.setAttribute("r", "10");
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", "10,8 16,12 10,16");
        svg.appendChild(circle);
        svg.appendChild(polygon);
        overlay.appendChild(svg);
        imageDiv.appendChild(overlay);

        const img = create("img");
        img.src = resolveImageSource(item.image);
        img.alt = item.name;
        img.loading = "lazy";
        imageDiv.appendChild(img);
        card.appendChild(imageDiv);

        const info = create("div", "gallery-info");
        const name = create("p", "gallery-name", item.name);
        info.appendChild(name);

        const desc = create("p", "gallery-description", item.description);
        info.appendChild(desc);

        card.appendChild(info);

        scroll.appendChild(card);
      });
    }

    scroll.addEventListener("click", (event) => {
      const card = event.target.closest(".gallery-card");
      if (!card || !scroll.contains(card)) {
        return;
      }

      const index = Number(card.dataset.galleryIndex);
      if (Number.isFinite(index)) {
        showGalleryModal(section.gallery, index);
      }
    });

    container.appendChild(addScrollControls(scroll, {
      prevLabel: "Scroll gallery left",
      nextLabel: "Scroll gallery right",
      stepRatio: 0.86
    }));
    gallerySection.appendChild(container);
    main.appendChild(gallerySection);
  };

  const showGalleryModal = (gallery, startIndex) => {
    let currentIndex = startIndex;

    // Create modal if it doesn't exist
    let modal = document.getElementById("galleryModal");
    if (!modal) {
      modal = create("div", "modal");
      modal.id = "galleryModal";

      const content = create("div", "modal-content");

      const img = create("img", "modal-image");
      content.appendChild(img);

      const prevBtn = create("button", "modal-nav prev");
      prevBtn.textContent = "❮";
      prevBtn.type = "button";
      content.appendChild(prevBtn);

      const nextBtn = create("button", "modal-nav next");
      nextBtn.textContent = "❯";
      nextBtn.type = "button";
      content.appendChild(nextBtn);

      const closeBtn = create("button", "modal-close");
      closeBtn.textContent = "✕";
      closeBtn.type = "button";
      content.appendChild(closeBtn);

      modal.appendChild(content);

      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
      });

      prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
        updateModalImage();
      });

      nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % gallery.length;
        updateModalImage();
      });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });

      document.body.appendChild(modal);
    }

    const updateModalImage = () => {
      const img = modal.querySelector(".modal-image");
      if (gallery[currentIndex]) {
        img.src = resolveImageSource(gallery[currentIndex].image);
        img.alt = gallery[currentIndex].name;
      }
    };

    updateModalImage();
    modal.classList.add("active");
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
      // New section types
      if (sectionConfig.type === "about") {
        renderAbout(main, sectionConfig);
      } else if (sectionConfig.type === "sponsors") {
        renderSponsors(main, sectionConfig);
      } else if (sectionConfig.type === "projects") {
        renderProjects(main, sectionConfig);
      } else if (sectionConfig.type === "members") {
        renderMembers(main, sectionConfig);
      } else if (sectionConfig.type === "testimonials") {
        renderTestimonials(main, sectionConfig);
      } else if (sectionConfig.type === "gallery") {
        renderGallery(main, sectionConfig);
      } else if (sectionConfig.type === "cards") {
        const rendered = renderCards(sectionConfig);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "metrics") {
        const rendered = renderMetrics(sectionConfig);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "timeline") {
        const rendered = renderTimeline(sectionConfig);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "list") {
        const rendered = renderList(sectionConfig);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "progress") {
        const rendered = renderProgress(sectionConfig);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "donate") {
        const rendered = renderDonate(sectionConfig, content);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "quotes") {
        const rendered = renderQuotes(sectionConfig);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "faq") {
        const rendered = renderFaq(sectionConfig);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "contact") {
        const rendered = renderContact(sectionConfig, content);
        if (rendered) main.appendChild(rendered);
      } else if (sectionConfig.type === "newsletter") {
        const rendered = renderNewsletter(sectionConfig, content);
        if (rendered) main.appendChild(rendered);
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

  const renderFooterContact = (content) => {
    const main = document.getElementById("pageMain");
    if (!main || document.getElementById("footerContactSection")) {
      return;
    }

    const section = create("section", "footer-contact-section section reveal");
    section.id = "footerContactSection";

    const container = create("div", "container footer-contact-grid");

    const copy = create("div", "footer-contact-copy");
    copy.appendChild(create("p", "kicker", "Get In Touch"));
    copy.appendChild(create("h2", "", "Send a message before the footer"));
    copy.appendChild(create("p", "footer-contact-text", "Use this form for membership interest, collaboration requests, event questions, or custom queries. We will route your message to the right team."));

    const form = create("form", "footer-contact-form");
    form.setAttribute("aria-label", "Footer contact form");

    const nameLabel = create("label", "", "Name");
    nameLabel.htmlFor = "footerContactName";
    const nameInput = create("input");
    nameInput.id = "footerContactName";
    nameInput.name = "name";
    nameInput.autocomplete = "name";
    nameInput.required = true;

    const phoneLabel = create("label", "", "Phone number");
    phoneLabel.htmlFor = "footerContactPhone";
    const phoneInput = create("input");
    phoneInput.id = "footerContactPhone";
    phoneInput.name = "phone";
    phoneInput.type = "tel";
    phoneInput.autocomplete = "tel";
    phoneInput.required = true;

    const emailLabel = create("label", "", "Mail id");
    emailLabel.htmlFor = "footerContactEmail";
    const emailInput = create("input");
    emailInput.id = "footerContactEmail";
    emailInput.name = "email";
    emailInput.type = "email";
    emailInput.autocomplete = "email";
    emailInput.required = true;

    const reasonGroup = create("fieldset", "reason-group");
    const reasonLegend = create("legend", "", "Reason");
    reasonGroup.appendChild(reasonLegend);

    const reasonWrap = create("div", "reason-options");
    [
      "Interested to join the club",
      "Collaboration Request",
      "Event Participation",
      "Sponsorship Opportunity",
      "Media / Press Inquiry",
      "Volunteer Support"
    ].forEach((reason, index) => {
      const option = create("label", "reason-option");
      const checkbox = create("input");
      checkbox.type = "checkbox";
      checkbox.name = "reasons";
      checkbox.value = reason;
      checkbox.id = `footerReason${index}`;

      option.appendChild(checkbox);
      option.appendChild(create("span", "", reason));
      reasonWrap.appendChild(option);
    });
    reasonGroup.appendChild(reasonWrap);

    const customLabel = create("label", "", "Custom queries");
    customLabel.htmlFor = "footerContactCustom";
    const customInput = create("textarea");
    customInput.id = "footerContactCustom";
    customInput.name = "customQuery";
    customInput.rows = 4;
    customInput.placeholder = "Tell us more about your request";

    const submit = create("button", "btn btn-solid footer-contact-submit", "Submit");
    submit.type = "submit";

    const status = create("p", "admin-message footer-contact-message");
    status.setAttribute("aria-live", "polite");

    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(phoneLabel);
    form.appendChild(phoneInput);
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
    form.appendChild(reasonGroup);
    form.appendChild(customLabel);
    form.appendChild(customInput);
    form.appendChild(submit);
    form.appendChild(status);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "";
      status.classList.remove("success", "error");

      const selectedReasons = Array.from(form.querySelectorAll('input[name="reasons"]:checked')).map((input) => input.value);

      const payload = {
        name: String(nameInput.value || "").trim(),
        phone: String(phoneInput.value || "").trim(),
        email: String(emailInput.value || "").trim(),
        reasons: selectedReasons,
        customQuery: String(customInput.value || "").trim(),
        sourcePage: pageKey
      };

      if (!payload.name || !payload.phone || !payload.email || selectedReasons.length === 0) {
        status.textContent = "Please complete the required fields and choose at least one reason.";
        status.classList.add("error");
        return;
      }

      try {
        const apiBase = resolveApiBase(content);
        const response = await fetch(`${apiBase}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const message = await response.json().catch(() => ({}));
          throw new Error(message.message || "Unable to submit the form");
        }

        form.reset();
        status.textContent = "Your message has been submitted successfully.";
        status.classList.add("success");
        showToast(content.messages.contactSuccess || "Thanks for reaching out.");
      } catch (_error) {
        status.textContent = "Submission failed. Please try again.";
        status.classList.add("error");
      }
    });

    container.appendChild(copy);
    container.appendChild(form);
    section.appendChild(container);
    main.appendChild(section);
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

  const setupAutoScroll = () => {
    const scrollConfigs = [
      { selector: ".sponsors-scroll", speed: 1 },
      { selector: ".members-scroll", speed: 0.8 },
      { selector: ".testimonials-scroll", speed: 0.7 },
      { selector: ".gallery-scroll", speed: 0.8 }
    ];

    scrollConfigs.forEach((config) => {
      const container = document.querySelector(config.selector);
      if (!container) {
        return;
      }

      prepareContinuousScroll(container);

      let isScrolling = true;
      let scrollInterval = null;

      scrollInterval = setInterval(() => {
        if (isScrolling) {
          container.scrollLeft += config.speed;
          wrapContinuousScroll(container);
        }
      }, 50);

      const stopAutoScroll = () => {
        isScrolling = false;
      };

      const startAutoScroll = () => {
        isScrolling = true;
      };

      container.addEventListener("scroll-autoplay-pause", stopAutoScroll);
      container.addEventListener("scroll-autoplay-resume", startAutoScroll);

      container.addEventListener("mouseenter", () => {
        stopAutoScroll();
      });

      container.addEventListener("mouseleave", () => {
        startAutoScroll();
      });

      container.addEventListener("touchstart", () => {
        stopAutoScroll();
      });

      container.addEventListener("touchend", () => {
        window.setTimeout(() => {
          startAutoScroll();
        }, 500);
      });
    });
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

    const eventMedia = pageKey === "events" ? await fetchEventMedia(content) : [];

    applyPageMetadata(content, pageData);
    renderHeader(content);
    renderMain(content, pageData, eventMedia);
    renderFooterContact(content);
    renderFooter(content);
    setupBackToTop();
    setupReveal();
    setupAutoScroll();
  };

  init();
})();
