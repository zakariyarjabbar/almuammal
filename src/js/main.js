import { languages, defaultLanguage } from "../content/siteContent.js";
import { businessConfig, isConfigured } from "../data/businessConfig.js";
import { categories, services } from "../data/services.js";
import { projects } from "../data/projects.js";
import { icon } from "./icons.js";

const app = document.querySelector("#app");
const loader = document.querySelector("#loader");
const languageStorageKey = "almuammal-language";
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let eventController;
let sectionObserver;

const state = {
  language: getInitialLanguage(),
  activeCategory: "all",
  lightboxIndex: -1,
  previousFocus: null,
  menuOpen: false
};

const criticalAssets = [
  "/assets/brand/logo-mark.svg",
  "/assets/visuals/print-service-contact-sheet.png"
];

init();

function init() {
  document.body.classList.add("is-loading");
  renderApp();
  waitForCriticalAssets().finally(hideLoader);
}

function getInitialLanguage() {
  const saved = localStorage.getItem(languageStorageKey);
  return saved && languages[saved] ? saved : defaultLanguage;
}

function currentContent() {
  return languages[state.language];
}

function localized(item, key) {
  return item[`${key}${state.language === "ar" ? "Ar" : "En"}`];
}

function updateDocument() {
  const content = currentContent();
  document.documentElement.lang = content.code;
  document.documentElement.dir = content.dir;
  document.title = content.meta.title;
  updateMeta("description", content.meta.description);
  updateMeta("og:title", content.meta.title, "property");
  updateMeta("og:description", content.meta.description, "property");
}

function updateMeta(name, value, attribute = "name") {
  const tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (tag) tag.setAttribute("content", value);
}

function renderApp() {
  updateDocument();
  const content = currentContent();
  app.innerHTML = `
    ${renderHeader(content)}
    <main id="main-content">
      ${renderHero(content)}
      ${renderServices(content)}
      ${renderPortfolio(content)}
      ${renderAbout(content)}
      ${renderContact(content)}
    </main>
    ${renderFooter(content)}
    ${renderFloatingWhatsApp(content)}
    <div class="lightbox" id="portfolio-lightbox" aria-hidden="true"></div>
  `;
  syncLoaderText(content);
  attachGlobalEvents();
  setupSectionObserver();
  setupRevealObserver();
  renderPortfolioTrack();
}

function renderHeader(content) {
  const activeId = window.location.hash ? window.location.hash.slice(1) : "hero";
  const navLinks = content.nav
    .map(
      (item) => `
        <a class="nav-link ${item.id === activeId ? "is-active" : ""}" href="#${item.id}" data-nav="${item.id}">
          <span>${item.label}</span>
        </a>
      `
    )
    .join("");

  return `
    <header class="site-header" data-header>
      <div class="header-inner">
        <a class="brand" href="#hero" data-nav="hero" aria-label="${businessConfig.businessNameAr}">
          <img src="./assets/brand/logo-mark.svg" alt="" width="44" height="44" />
          <span class="brand-text">
            <strong>${state.language === "ar" ? "المؤمل" : "Almuammal"}</strong>
            <small>${state.language === "ar" ? "دعاية وإعلان" : "Printing & Advertising"}</small>
          </span>
        </a>
        <nav class="desktop-nav" aria-label="Primary navigation">
          ${navLinks}
        </nav>
        <div class="header-actions">
          ${renderLanguageSwitch()}
          <button class="menu-toggle" type="button" data-menu-open aria-label="${content.menu.open}" aria-expanded="false">
            ${icon("menu")}
          </button>
        </div>
      </div>
      <div class="mobile-drawer" id="mobile-menu" aria-hidden="true" data-menu>
        <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="${content.menu.open}">
          <div class="drawer-head">
            <span>${content.menu.language}</span>
            <button class="icon-button" type="button" data-menu-close aria-label="${content.menu.close}">
              ${icon("close")}
            </button>
          </div>
          ${renderLanguageSwitch("drawer-language")}
          <nav class="drawer-nav" aria-label="Mobile navigation">
            ${navLinks}
          </nav>
        </div>
      </div>
    </header>
  `;
}

function renderLanguageSwitch(extraClass = "") {
  return `
    <div class="language-switch ${extraClass}" role="group" aria-label="Language">
      <button type="button" data-lang="ar" class="${state.language === "ar" ? "is-active" : ""}">العربية</button>
      <span aria-hidden="true">|</span>
      <button type="button" data-lang="en" class="${state.language === "en" ? "is-active" : ""}">English</button>
    </div>
  `;
}

function renderHero(content) {
  const heroPanels = services
    .slice(0, 4)
    .map(
      (service, index) => `
        <article class="hero-panel hero-panel-${index + 1}" style="--panel-pos: ${service.imagePosition}">
          <img
            src="${service.image}"
            alt="${localized(service, "title")}"
            width="443"
            height="887"
            decoding="async"
            fetchpriority="${index === 0 ? "high" : "auto"}"
            style="object-position: ${service.imagePosition}"
          />
          <span>${localized(service, "title")}</span>
        </article>
      `
    )
    .join("");

  return `
    <section class="hero section-anchor" id="hero" aria-labelledby="hero-title" data-section>
      <div class="hero-corner hero-corner-top" aria-hidden="true"></div>
      <div class="hero-corner hero-corner-bottom" aria-hidden="true"></div>
      <div class="hero-inner wide-shell">
        <div class="hero-copy">
          <p class="eyebrow hero-eyebrow">${businessConfig.businessNameAr}</p>
          <h1 id="hero-title">
            <span>${content.hero.main}</span>
            <small>${content.hero.secondary}</small>
          </h1>
          <p class="hero-tagline">${content.hero.tagline}</p>
          <div class="button-row">
            <a class="button button-dark" href="#contact" data-nav="contact">
              <span>${content.hero.contact}</span>
              ${icon("arrow", "icon-arrow")}
            </a>
            <a class="button button-ghost-on-yellow" href="#portfolio" data-nav="portfolio">
              <span>${content.hero.work}</span>
              ${icon("arrow", "icon-arrow")}
            </a>
          </div>
        </div>
        <div class="hero-showcase" aria-label="${content.sections.services.title}">
          <div class="hero-panel-track">
            ${heroPanels}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderServices(content) {
  const cards = services
    .map(
      (service) => `
        <button class="service-card reveal" type="button" data-service="${service.id}" style="--image-pos: ${service.imagePosition}">
          <span class="service-media">
            <img src="${service.image}" alt="${localized(service, "title")}" loading="lazy" decoding="async" style="object-position: ${service.imagePosition}" />
          </span>
          <span class="service-overlay"></span>
          <span class="service-content">
            <span class="service-icon">${icon(service.icon)}</span>
            <strong>${localized(service, "title")}</strong>
            <span>${localized(service, "summary")}</span>
          </span>
        </button>
      `
    )
    .join("");

  return `
    <section class="section section-black section-anchor" id="services" aria-labelledby="services-title" data-section>
      <div class="shell">
        ${renderSectionHeading(content.sections.services, "services-title")}
        <div class="services-grid">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

function renderPortfolio(content) {
  const filters = categories
    .map(
      (category) => `
        <button class="filter-chip ${state.activeCategory === category.id ? "is-active" : ""}" type="button" data-filter="${category.id}">
          ${localized(category, "label")}
        </button>
      `
    )
    .join("");

  return `
    <section class="section section-charcoal section-anchor" id="portfolio" aria-labelledby="portfolio-title" data-section>
      <div class="wide-shell">
        ${renderSectionHeading(content.sections.portfolio, "portfolio-title")}
        <div class="portfolio-controls">
          <div class="filter-row" role="list" aria-label="${content.sections.portfolio.title}">
            ${filters}
          </div>
          <div class="gallery-arrows" aria-hidden="false">
            <button class="icon-button" type="button" data-gallery-scroll="-1" aria-label="${content.actions.scrollLeft}">
              ${icon("arrow", "icon-arrow-left")}
            </button>
            <button class="icon-button" type="button" data-gallery-scroll="1" aria-label="${content.actions.scrollRight}">
              ${icon("arrow")}
            </button>
          </div>
        </div>
        <div class="portfolio-track" id="portfolio-track" tabindex="0" aria-live="polite"></div>
        <div class="portfolio-dots" id="portfolio-dots" aria-hidden="true"></div>
      </div>
    </section>
  `;
}

function renderAbout(content) {
  const reasons = content.sections.about.reasons
    .map(
      (reason) => `
        <article class="reason-card reveal">
          <span>${icon(reason.icon)}</span>
          <h3>${reason.title}</h3>
          <p>${reason.text}</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="section section-black about section-anchor" id="about" aria-labelledby="about-title" data-section>
      <div class="shell about-grid">
        <figure class="about-media reveal reveal-mask">
          <img src="./assets/placeholders/about-main.svg" alt="${content.sections.about.title}" loading="lazy" decoding="async" />
        </figure>
        <div class="about-copy">
          <p class="eyebrow">${state.language === "ar" ? "المطبعة" : "The Print House"}</p>
          <h2 id="about-title">${content.sections.about.title}</h2>
          <p class="section-copy">${content.sections.about.body}</p>
          <h3 class="why-title">${content.sections.about.whyTitle}</h3>
          <div class="reasons-grid">
            ${reasons}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderContact(content) {
  const contactItems = buildContactItems(content);
  const quickActions = buildQuickActions(content);
  const socialLinks = buildSocialLinks();
  const hasContactItems = contactItems.length > 0;
  const hasSocial = socialLinks.length > 0;

  return `
    <section class="section section-contact section-anchor" id="contact" aria-labelledby="contact-title" data-section>
      <div class="shell contact-grid">
        <div class="contact-copy">
          <p class="eyebrow">${state.language === "ar" ? "ابدأ مشروعك" : "Start Your Project"}</p>
          <h2 id="contact-title">${content.sections.contact.title}</h2>
          <p class="section-copy">${content.sections.contact.support}</p>
          <div class="quick-actions ${quickActions.length ? "" : "is-empty"}">
            ${quickActions.join("")}
          </div>
          ${
            hasContactItems
              ? `<div class="contact-list">${contactItems.join("")}</div>`
              : `<p class="contact-empty">${content.sections.contact.unavailable}</p>`
          }
          ${renderQuoteAction(content)}
          ${hasSocial ? `<div class="social-row">${socialLinks.join("")}</div>` : ""}
        </div>
        ${renderMap(content)}
      </div>
    </section>
  `;
}

function renderFooter(content) {
  const year = new Date().getFullYear();
  const serviceStrip = services
    .map(
      (service) => `
        <span class="footer-service">
          ${icon(service.icon)}
          <span>${localized(service, "title")}</span>
        </span>
      `
    )
    .join("");
  const contactSummary = buildContactItems(content, "footer-contact").slice(0, 3).join("");
  const copyright =
    state.language === "ar"
      ? `${content.sections.footer.copyrightPrefix} ${year} ${businessConfig.businessNameAr}`
      : `© ${year} ${businessConfig.businessNameEn}. ${content.sections.footer.copyrightSuffix}`;

  return `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-brand">
          <img src="./assets/brand/logo-mark.svg" alt="" width="54" height="54" />
          <strong>${state.language === "ar" ? businessConfig.businessNameAr : businessConfig.businessNameEn}</strong>
          <p>${content.sections.footer.brandLine}</p>
        </div>
        <div class="footer-services" aria-label="${content.sections.services.title}">
          ${serviceStrip}
        </div>
        <div class="footer-contact">
          ${contactSummary || `<p>${content.sections.contact.unavailable}</p>`}
          <div class="social-row">${buildSocialLinks().join("")}</div>
        </div>
      </div>
      <div class="shell footer-bottom">
        <p>${copyright}</p>
      </div>
    </footer>
  `;
}

function renderFloatingWhatsApp(content) {
  if (!isConfigured(businessConfig.whatsapp)) return "";
  return `
    <a class="floating-whatsapp" href="${whatsappUrl()}" target="_blank" rel="noreferrer" aria-label="${content.actions.whatsapp}">
      ${icon("whatsapp")}
      <span>${content.actions.whatsapp}</span>
    </a>
  `;
}

function renderSectionHeading(section, id) {
  return `
    <div class="section-heading reveal">
      <p class="eyebrow">${section.eyebrow}</p>
      <h2 id="${id}">${section.title}</h2>
      <p>${section.support}</p>
    </div>
  `;
}

function buildContactItems(content, extraClass = "") {
  const items = [];
  const labels = content.sections.contact.labels;
  if (isConfigured(businessConfig.whatsapp)) {
    items.push(contactItem(labels.whatsapp, businessConfig.whatsapp, "whatsapp", whatsappUrl(), extraClass));
  }
  if (isConfigured(businessConfig.phone)) {
    items.push(contactItem(labels.phone, businessConfig.phone, "phone", `tel:${businessConfig.phone}`, extraClass));
  }
  if (isConfigured(businessConfig.email)) {
    items.push(contactItem(labels.email, businessConfig.email, "email", `mailto:${businessConfig.email}`, extraClass));
  }
  const address = state.language === "ar" ? businessConfig.addressAr : businessConfig.addressEn;
  if (isConfigured(address)) {
    items.push(contactItem(labels.address, address, "map", businessConfig.mapExternalUrl, extraClass));
  }
  const hours = state.language === "ar" ? businessConfig.workingHoursAr : businessConfig.workingHoursEn;
  if (isConfigured(hours)) {
    items.push(contactItem(labels.hours, hours, "clock", "", extraClass));
  }
  return items;
}

function contactItem(label, value, iconName, href, extraClass) {
  const content = `
    <span class="contact-icon">${icon(iconName)}</span>
    <span>
      <small>${label}</small>
      <strong>${value}</strong>
    </span>
  `;
  if (isConfigured(href)) {
    return `<a class="contact-item ${extraClass}" href="${href}" target="${href.startsWith("http") ? "_blank" : "_self"}" rel="noreferrer">${content}</a>`;
  }
  return `<div class="contact-item ${extraClass}">${content}</div>`;
}

function buildQuickActions(content) {
  const actions = [];
  if (isConfigured(businessConfig.whatsapp)) {
    actions.push(`
      <a class="button button-whatsapp" href="${whatsappUrl()}" target="_blank" rel="noreferrer">
        ${icon("whatsapp")}
        <span>${content.sections.contact.labels.whatsapp}</span>
      </a>
    `);
  }
  if (isConfigured(businessConfig.phone)) {
    actions.push(`
      <a class="button button-primary" href="tel:${businessConfig.phone}">
        ${icon("phone")}
        <span>${content.actions.call}</span>
      </a>
    `);
  }
  return actions;
}

function renderQuoteAction(content) {
  if (isConfigured(businessConfig.whatsapp)) {
    return `
      <a class="button button-primary quote-button" href="${whatsappUrl()}" target="_blank" rel="noreferrer">
        <span>${content.sections.contact.quote}</span>
        ${icon("arrow", "icon-arrow")}
      </a>
    `;
  }
  if (isConfigured(businessConfig.email)) {
    return `
      <a class="button button-primary quote-button" href="mailto:${businessConfig.email}">
        <span>${content.sections.contact.quote}</span>
        ${icon("arrow", "icon-arrow")}
      </a>
    `;
  }
  return "";
}

function renderMap(content) {
  const hasMap = isConfigured(businessConfig.mapEmbedUrl);
  const externalMap = isConfigured(businessConfig.mapExternalUrl) ? businessConfig.mapExternalUrl : "";
  return `
    <aside class="map-panel reveal" aria-labelledby="map-title">
      <div class="map-frame">
        ${
          hasMap
            ? `<iframe title="${content.sections.contact.mapTitle}" src="${businessConfig.mapEmbedUrl}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
            : `<div class="map-placeholder">
                <span>${icon("map")}</span>
                <h3 id="map-title">${content.sections.contact.mapTitle}</h3>
                <p>${content.sections.contact.mapPlaceholder}</p>
              </div>`
        }
      </div>
      ${
        externalMap
          ? `<a class="map-link" href="${externalMap}" target="_blank" rel="noreferrer">${content.sections.contact.openMap} ${icon("arrow", "icon-arrow")}</a>`
          : ""
      }
    </aside>
  `;
}

function buildSocialLinks() {
  return Object.entries(businessConfig.social)
    .filter(([, value]) => isConfigured(value))
    .map(([name, url]) => `<a class="social-link" href="${url}" target="_blank" rel="noreferrer" aria-label="${name}">${icon(name)}</a>`);
}

function renderPortfolioTrack() {
  const content = currentContent();
  const filtered = getFilteredProjects();
  const track = document.querySelector("#portfolio-track");
  const dots = document.querySelector("#portfolio-dots");
  if (!track || !dots) return;
  track.innerHTML = filtered
    .map(
      (project, index) => `
        <button class="project-card reveal" type="button" data-project-id="${project.id}" style="--image-pos: ${project.imagePosition}">
          <img src="${project.image}" alt="${localized(project, "alt")}" loading="lazy" decoding="async" style="object-position: ${project.imagePosition}" />
          <span class="project-shade"></span>
          <span class="project-meta">
            <small>${categoryLabel(project.category)}</small>
            <strong>${localized(project, "title")}</strong>
            <em>${content.lightbox.view}</em>
          </span>
        </button>
      `
    )
    .join("");
  dots.innerHTML = filtered.map((_, index) => `<span class="${index === 0 ? "is-active" : ""}"></span>`).join("");
  track.querySelectorAll("[data-project-id]").forEach((card) => {
    card.addEventListener("click", () => openLightbox(card.dataset.projectId));
  });
  if (!track.dataset.dotsBound) {
    track.addEventListener("scroll", updatePortfolioDots, { passive: true });
    track.dataset.dotsBound = "true";
  }
  setupRevealObserver(track);
}

function updatePortfolioDots() {
  const track = document.querySelector("#portfolio-track");
  const dots = document.querySelectorAll("#portfolio-dots span");
  if (!track || !dots.length) return;
  const card = track.querySelector(".project-card");
  if (!card) return;
  const step = card.getBoundingClientRect().width + 16;
  const index = Math.max(0, Math.min(dots.length - 1, Math.round(Math.abs(track.scrollLeft) / step)));
  dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
}

function getFilteredProjects() {
  if (state.activeCategory === "all") return projects;
  return projects.filter((project) => project.category === state.activeCategory);
}

function categoryLabel(id) {
  const category = categories.find((item) => item.id === id);
  return category ? localized(category, "label") : "";
}

function attachGlobalEvents() {
  eventController?.abort();
  eventController = new AbortController();
  const { signal } = eventController;
  const header = document.querySelector("[data-header]");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true, signal });

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", handleNavClick, { signal });
  });

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => switchLanguage(button.dataset.lang), { signal });
  });

  document.querySelector("[data-menu-open]")?.addEventListener("click", openMenu, { signal });
  document.querySelector("[data-menu-close]")?.addEventListener("click", closeMenu, { signal });
  document.querySelector("[data-menu]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-menu]")) closeMenu();
  }, { signal });

  document.querySelectorAll("[data-service]").forEach((card) => {
    card.addEventListener("click", () => {
      setPortfolioCategory(card.dataset.service);
      scrollToSection("portfolio");
    }, { signal });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => setPortfolioCategory(button.dataset.filter), { signal });
  });

  document.querySelectorAll("[data-gallery-scroll]").forEach((button) => {
    button.addEventListener("click", () => scrollPortfolio(Number(button.dataset.galleryScroll)), { signal });
  });

  document.addEventListener("keydown", handleKeydown, { signal });
}

function handleNavClick(event) {
  const id = event.currentTarget.dataset.nav;
  if (!id) return;
  event.preventDefault();
  closeMenu();
  scrollToSection(id);
}

function scrollToSection(id) {
  document.querySelector(`#${id}`)?.scrollIntoView({
    behavior: motionQuery.matches ? "auto" : "smooth",
    block: "start"
  });
  history.replaceState(null, "", `#${id}`);
}

function switchLanguage(language) {
  if (!languages[language] || language === state.language) return;
  state.language = language;
  localStorage.setItem(languageStorageKey, language);
  renderApp();
}

function setPortfolioCategory(category) {
  state.activeCategory = category;
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === category);
  });
  renderPortfolioTrack();
}

function scrollPortfolio(direction) {
  const track = document.querySelector("#portfolio-track");
  if (!track) return;
  const distance = Math.min(track.clientWidth * 0.86, 520) * direction;
  track.scrollBy({ left: distance, behavior: motionQuery.matches ? "auto" : "smooth" });
}

function setupSectionObserver() {
  sectionObserver?.disconnect();
  const sections = document.querySelectorAll("[data-section]");
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) updateActiveNav(active.target.id);
    },
    { rootMargin: "-36% 0px -52% 0px", threshold: [0.18, 0.35, 0.6] }
  );
  sections.forEach((section) => sectionObserver.observe(section));
  updateActiveNav(window.location.hash?.slice(1) || "hero");
}

function updateActiveNav(id) {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === id);
  });
}

function setupRevealObserver(scope = document) {
  const revealItems = scope.querySelectorAll(".reveal:not(.is-visible)");
  if (motionQuery.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );
  revealItems.forEach((item) => observer.observe(item));
}

function openMenu() {
  const menu = document.querySelector("[data-menu]");
  const toggle = document.querySelector("[data-menu-open]");
  if (!menu || state.menuOpen) return;
  state.menuOpen = true;
  state.previousFocus = document.activeElement;
  menu.setAttribute("aria-hidden", "false");
  toggle?.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
  const first = menu.querySelector("button, a");
  first?.focus();
}

function closeMenu() {
  const menu = document.querySelector("[data-menu]");
  const toggle = document.querySelector("[data-menu-open]");
  if (!menu || !state.menuOpen) return;
  state.menuOpen = false;
  menu.setAttribute("aria-hidden", "true");
  toggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  state.previousFocus?.focus?.();
}

function openLightbox(projectId) {
  const filtered = getFilteredProjects();
  const index = filtered.findIndex((project) => project.id === projectId);
  if (index < 0) return;
  state.lightboxIndex = index;
  state.previousFocus = document.activeElement;
  renderLightbox();
  document.body.classList.add("lightbox-open");
  document.querySelector("#portfolio-lightbox")?.setAttribute("aria-hidden", "false");
  document.querySelector("[data-lightbox-close]")?.focus();
}

function renderLightbox() {
  const content = currentContent();
  const filtered = getFilteredProjects();
  const project = filtered[state.lightboxIndex];
  const lightbox = document.querySelector("#portfolio-lightbox");
  if (!project || !lightbox) return;
  lightbox.innerHTML = `
    <div class="lightbox-backdrop" data-lightbox-close></div>
    <div class="lightbox-panel" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
      <button class="icon-button lightbox-close" type="button" data-lightbox-close aria-label="${content.lightbox.close}">
        ${icon("close")}
      </button>
      <button class="icon-button lightbox-prev" type="button" data-lightbox-prev aria-label="${content.lightbox.previous}">
        ${icon("arrow", "icon-arrow-left")}
      </button>
      <figure>
        <img src="${project.image}" alt="${localized(project, "alt")}" style="object-position: ${project.imagePosition}" />
        <figcaption>
          <small>${categoryLabel(project.category)}</small>
          <h3 id="lightbox-title">${localized(project, "title")}</h3>
          <p>${localized(project, "description")}</p>
        </figcaption>
      </figure>
      <button class="icon-button lightbox-next" type="button" data-lightbox-next aria-label="${content.lightbox.next}">
        ${icon("arrow")}
      </button>
    </div>
  `;
  lightbox.querySelectorAll("[data-lightbox-close]").forEach((button) => button.addEventListener("click", closeLightbox));
  lightbox.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => moveLightbox(-1));
  lightbox.querySelector("[data-lightbox-next]")?.addEventListener("click", () => moveLightbox(1));
}

function moveLightbox(direction) {
  const filtered = getFilteredProjects();
  state.lightboxIndex = (state.lightboxIndex + direction + filtered.length) % filtered.length;
  renderLightbox();
  document.querySelector("[data-lightbox-close]")?.focus();
}

function closeLightbox() {
  const lightbox = document.querySelector("#portfolio-lightbox");
  if (state.lightboxIndex < 0) return;
  state.lightboxIndex = -1;
  lightbox?.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = "";
  document.body.classList.remove("lightbox-open");
  state.previousFocus?.focus?.();
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    if (state.lightboxIndex >= 0) closeLightbox();
    if (state.menuOpen) closeMenu();
  }
  if (state.lightboxIndex >= 0 && event.key === "ArrowRight") {
    moveLightbox(state.language === "ar" ? -1 : 1);
  }
  if (state.lightboxIndex >= 0 && event.key === "ArrowLeft") {
    moveLightbox(state.language === "ar" ? 1 : -1);
  }
  if (event.key === "Tab") {
    trapFocus(event);
  }
}

function trapFocus(event) {
  const container = state.lightboxIndex >= 0 ? document.querySelector("#portfolio-lightbox") : state.menuOpen ? document.querySelector("[data-menu]") : null;
  if (!container) return;
  const focusable = [...container.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")].filter(
    (element) => element.offsetParent !== null
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

async function waitForCriticalAssets() {
  const startedAt = performance.now();
  const fontReady = document.fonts?.ready ?? Promise.resolve();
  const assetReady = criticalAssets.map(loadImage);
  await Promise.race([Promise.allSettled([fontReady, ...assetReady]), timeout(3000)]);
  const elapsed = performance.now() - startedAt;
  if (elapsed < 1200) await timeout(1200 - elapsed);
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      if (img.decode) {
        try {
          await img.decode();
        } catch {
          // Decoding can fail after load in some browsers; the load event is enough here.
        }
      }
      resolve();
    };
    img.onerror = resolve;
    img.src = src;
  });
}

function hideLoader() {
  loader?.classList.add("loader--settle");
  window.setTimeout(() => {
    loader?.classList.add("loader--hidden");
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  }, motionQuery.matches ? 120 : 620);
}

function syncLoaderText(content) {
  const loaderText = document.querySelector(".loader__text");
  if (loaderText) loaderText.textContent = content.loader;
}

function whatsappUrl() {
  const clean = businessConfig.whatsapp.replace(/[^\d+]/g, "");
  return `https://wa.me/${clean.replace(/^\+/, "")}`;
}

function timeout(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
