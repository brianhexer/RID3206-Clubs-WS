(function () {
  const content = window.SITE_CONTENT;

  if (!content) {
    return;
  }

  const select = (id) => document.getElementById(id);

  const setText = (id, value) => {
    const el = select(id);
    if (el) {
      el.textContent = value;
    }
  };

  const createLink = (item, className) => {
    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.label;
    if (className) {
      a.className = className;
    }
    return a;
  };

  const createButtonLink = (item) => {
    const a = createLink(item, `btn ${item.type === "outline" ? "btn-outline" : "btn-solid"}`);
    return a;
  };

  const formatNumber = (num) => new Intl.NumberFormat("en-IN").format(num);

  const showToast = (text) => {
    const toast = select("toast");
    if (!toast) {
      return;
    }

    toast.textContent = text;
    toast.classList.add("show");

    window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  };

  const renderNavigation = () => {
    setText("brandName", content.site.title);

    const desktopNav = select("desktopNav");
    const mobileNav = select("mobileNav");

    content.site.nav.forEach((item) => {
      desktopNav.appendChild(createLink(item));
      mobileNav.appendChild(createLink(item));
    });

    const ctaLink = createLink({ label: "Donate", href: "#testimonialsSection" }, "btn btn-solid");
    desktopNav.appendChild(ctaLink);

    const menuToggle = select("menuToggle");

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
  };

  const renderHero = () => {
    setText("heroKicker", content.hero.kicker);
    setText("heroTitle", content.hero.title);
    setText("heroSubtitle", content.hero.subtitle);

    const heroActions = select("heroActions");
    content.hero.actions.forEach((action) => {
      heroActions.appendChild(createButtonLink(action));
    });

    const heroFacts = select("heroFacts");
    content.hero.facts.forEach((fact) => {
      const pill = document.createElement("span");
      pill.className = "fact-pill";
      pill.textContent = fact;
      heroFacts.appendChild(pill);
    });

    const panel = select("heroPanel");
    const title = document.createElement("h3");
    title.textContent = content.hero.panel.title;
    panel.appendChild(title);

    const list = document.createElement("ul");
    content.hero.panel.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    panel.appendChild(list);

    const note = document.createElement("p");
    note.className = "panel-note";
    note.textContent = content.hero.panel.note;
    panel.appendChild(note);
  };

  const renderImpact = () => {
    setText("impactKicker", content.impact.kicker);
    setText("impactTitle", content.impact.title);

    const grid = select("impactGrid");

    content.impact.stats.forEach((stat) => {
      const card = document.createElement("article");
      card.className = "impact-card reveal";

      const value = document.createElement("h3");
      value.dataset.target = String(stat.value);
      value.dataset.suffix = stat.suffix;
      value.textContent = `0${stat.suffix}`;

      const label = document.createElement("p");
      label.textContent = stat.label;

      card.appendChild(value);
      card.appendChild(label);
      grid.appendChild(card);
    });
  };

  const renderPrograms = () => {
    setText("programsKicker", content.programs.kicker);
    setText("programsTitle", content.programs.title);
    setText("programsIntro", content.programs.intro);

    const grid = select("programsGrid");

    content.programs.cards.forEach((cardData) => {
      const card = document.createElement("article");
      card.className = "program-card reveal";

      const title = document.createElement("h3");
      title.textContent = cardData.title;

      const desc = document.createElement("p");
      desc.textContent = cardData.description;

      const tags = document.createElement("div");
      tags.className = "tags";

      cardData.tags.forEach((tag) => {
        const badge = document.createElement("span");
        badge.textContent = tag;
        tags.appendChild(badge);
      });

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(tags);
      grid.appendChild(card);
    });
  };

  const renderEvents = () => {
    setText("eventsKicker", content.events.kicker);
    setText("eventsTitle", content.events.title);

    const timeline = select("eventsTimeline");

    content.events.timeline.forEach((eventData) => {
      const event = document.createElement("article");
      event.className = "event-item reveal";

      const date = document.createElement("p");
      date.className = "event-date";
      date.textContent = eventData.date;

      const title = document.createElement("h3");
      title.textContent = eventData.title;

      const location = document.createElement("p");
      location.className = "event-location";
      location.textContent = eventData.location;

      const desc = document.createElement("p");
      desc.textContent = eventData.description;

      event.appendChild(date);
      event.appendChild(title);
      event.appendChild(location);
      event.appendChild(desc);
      timeline.appendChild(event);
    });

    const volunteerCard = select("volunteerCard");
    const info = content.events.volunteerCard;

    const title = document.createElement("h3");
    title.textContent = info.title;

    const text = document.createElement("p");
    text.textContent = info.text;

    const ul = document.createElement("ul");
    info.points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      ul.appendChild(li);
    });

    const cta = createLink(info.cta, "btn btn-outline");

    volunteerCard.appendChild(title);
    volunteerCard.appendChild(text);
    volunteerCard.appendChild(ul);
    volunteerCard.appendChild(cta);
  };

  const renderCampaigns = () => {
    setText("campaignsKicker", content.campaigns.kicker);
    setText("campaignsTitle", content.campaigns.title);

    const list = select("campaignList");

    content.campaigns.list.forEach((campaign) => {
      const progress = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));

      const card = document.createElement("article");
      card.className = "campaign-card reveal";

      const title = document.createElement("h3");
      title.textContent = campaign.title;

      const desc = document.createElement("p");
      desc.textContent = campaign.description;

      const meta = document.createElement("p");
      meta.className = "campaign-meta";
      meta.textContent = `Raised $${formatNumber(campaign.raised)} of $${formatNumber(campaign.goal)}`;

      const track = document.createElement("div");
      track.className = "progress-track";
      const fill = document.createElement("span");
      fill.className = "progress-fill";
      fill.style.width = `${progress}%`;
      track.appendChild(fill);

      const percent = document.createElement("p");
      percent.className = "campaign-percent";
      percent.textContent = `${progress}% funded`;

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(meta);
      card.appendChild(track);
      card.appendChild(percent);
      list.appendChild(card);
    });
  };

  const renderTestimonials = () => {
    setText("testimonialsKicker", content.testimonials.kicker);
    setText("testimonialsTitle", content.testimonials.title);

    const quoteCard = select("quoteCard");
    let index = 0;

    const paint = () => {
      const quote = content.testimonials.quotes[index];
      quoteCard.innerHTML = "";

      const text = document.createElement("p");
      text.className = "quote";
      text.textContent = `\"${quote.text}\"`;

      const person = document.createElement("p");
      person.className = "quote-person";
      person.textContent = quote.name;

      const role = document.createElement("p");
      role.className = "quote-role";
      role.textContent = quote.role;

      quoteCard.appendChild(text);
      quoteCard.appendChild(person);
      quoteCard.appendChild(role);
    };

    select("prevTestimonial").addEventListener("click", () => {
      index = (index - 1 + content.testimonials.quotes.length) % content.testimonials.quotes.length;
      paint();
    });

    select("nextTestimonial").addEventListener("click", () => {
      index = (index + 1) % content.testimonials.quotes.length;
      paint();
    });

    window.setInterval(() => {
      index = (index + 1) % content.testimonials.quotes.length;
      paint();
    }, 6500);

    paint();
  };

  const renderDonate = () => {
    setText("donateKicker", content.donate.kicker);
    setText("donateTitle", content.donate.title);
    setText("donateText", content.donate.text);
    setText("donateButton", content.donate.buttonLabel);
    setText("donationNote", content.donate.note);

    const presets = select("donationPresets");
    const amountInput = select("donationAmount");

    content.donate.presets.forEach((amount) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `$${amount}`;
      button.addEventListener("click", () => {
        amountInput.value = String(amount);
      });
      presets.appendChild(button);
    });

    select("donateButton").addEventListener("click", () => {
      const amount = Number(amountInput.value);
      if (!amount || amount <= 0) {
        showToast(content.messages.amountRequired);
        return;
      }
      showToast(`${content.messages.donationReady} Amount: $${amount}`);
    });
  };

  const renderGallery = () => {
    setText("galleryKicker", content.gallery.kicker);
    setText("galleryTitle", content.gallery.title);

    const grid = select("galleryGrid");

    content.gallery.images.forEach((imgData) => {
      const item = document.createElement("figure");
      item.className = "gallery-item reveal";

      const img = document.createElement("img");
      img.src = imgData.src;
      img.alt = imgData.alt;
      img.loading = "lazy";

      item.appendChild(img);
      grid.appendChild(item);
    });
  };

  const renderBlogAndFaq = () => {
    setText("blogKicker", content.blog.kicker);
    setText("blogTitle", content.blog.title);

    const blogGrid = select("blogGrid");
    content.blog.posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card reveal";

      const title = document.createElement("h3");
      title.textContent = post.title;

      const excerpt = document.createElement("p");
      excerpt.textContent = post.excerpt;

      const link = createLink({ label: "Read story", href: post.link }, "text-link");

      card.appendChild(title);
      card.appendChild(excerpt);
      card.appendChild(link);
      blogGrid.appendChild(card);
    });

    setText("faqKicker", content.faq.kicker);
    setText("faqTitle", content.faq.title);

    const faqList = select("faqList");
    content.faq.items.forEach((faq, idx) => {
      const details = document.createElement("details");
      details.className = "faq-item reveal";
      if (idx === 0) {
        details.open = true;
      }

      const summary = document.createElement("summary");
      summary.textContent = faq.question;

      const answer = document.createElement("p");
      answer.textContent = faq.answer;

      details.appendChild(summary);
      details.appendChild(answer);
      faqList.appendChild(details);
    });
  };

  const renderContact = () => {
    setText("contactKicker", content.contact.kicker);
    setText("contactTitle", content.contact.title);
    setText("contactIntro", content.contact.intro);

    const details = select("contactDetails");

    content.contact.details.forEach((item) => {
      const row = document.createElement("p");
      row.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
      details.appendChild(row);
    });

    setText("nameLabel", content.contact.form.nameLabel);
    setText("emailLabel", content.contact.form.emailLabel);
    setText("messageLabel", content.contact.form.messageLabel);
    setText("contactSubmit", content.contact.form.submitLabel);
    setText("contactNote", content.contact.form.note);

    const form = select("contactForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      showToast(content.messages.contactSuccess);
    });
  };

  const renderNewsletter = () => {
    setText("newsletterKicker", content.newsletter.kicker);
    setText("newsletterTitle", content.newsletter.title);
    setText("newsletterText", content.newsletter.text);
    setText("newsletterLabel", content.newsletter.label);
    setText("newsletterSubmit", content.newsletter.submitLabel);

    const form = select("newsletterForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      showToast(content.messages.newsletterSuccess);
    });
  };

  const renderFooter = () => {
    const footer = select("footerGrid");

    const colOne = document.createElement("div");
    const brand = document.createElement("h3");
    brand.textContent = content.site.title;
    const about = document.createElement("p");
    about.textContent = content.footer.about;
    colOne.appendChild(brand);
    colOne.appendChild(about);

    const colTwo = document.createElement("div");
    const quickTitle = document.createElement("h4");
    quickTitle.textContent = content.footer.quickTitle;
    colTwo.appendChild(quickTitle);
    content.site.footerLinks.forEach((item) => colTwo.appendChild(createLink(item)));

    const colThree = document.createElement("div");
    const legalTitle = document.createElement("h4");
    legalTitle.textContent = content.footer.legalTitle;
    colThree.appendChild(legalTitle);
    content.footer.legalLinks.forEach((item) => colThree.appendChild(createLink(item)));

    footer.appendChild(colOne);
    footer.appendChild(colTwo);
    footer.appendChild(colThree);

    const year = new Date().getFullYear();
    setText("copyright", `${year} ${content.site.title}. ${content.footer.copyright}`);
  };

  const setupCountersAndReveal = () => {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("visible");

          if (entry.target.matches(".impact-card")) {
            const valueEl = entry.target.querySelector("h3");
            const target = Number(valueEl.dataset.target || 0);
            const suffix = valueEl.dataset.suffix || "";
            const duration = 1200;
            const start = performance.now();

            const tick = (now) => {
              const elapsed = now - start;
              const progress = Math.min(1, elapsed / duration);
              const current = Math.floor(target * progress);
              valueEl.textContent = `${formatNumber(current)}${suffix}`;
              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };

            requestAnimationFrame(tick);
          }

          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    revealElements.forEach((el) => observer.observe(el));
  };

  const setupBackToTop = () => {
    const button = select("backToTop");

    const onScroll = () => {
      button.classList.toggle("visible", window.scrollY > 500);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const init = () => {
    renderNavigation();
    renderHero();
    renderImpact();
    renderPrograms();
    renderEvents();
    renderCampaigns();
    renderTestimonials();
    renderDonate();
    renderGallery();
    renderBlogAndFaq();
    renderContact();
    renderNewsletter();
    renderFooter();
    setupCountersAndReveal();
    setupBackToTop();
  };

  init();
})();
