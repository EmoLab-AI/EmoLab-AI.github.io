const siteLinks = [
    { href: "index.html", label: "Home", page: "home" },
    { href: "members.html", label: "Members", page: "members" },
    { href: "publications.html", label: "Publications", page: "publications" },
    { href: "datasets.html", label: "Datasets", page: "datasets" },
    { href: "projects.html", label: "Projects", page: "projects" },
    { href: "gallery.html", label: "Gallery", page: "gallery" },
    { href: "lab-coding.html", label: "Lab Coding", page: "lab-coding" }
];

function renderSiteNav() {
    const navMount = document.querySelector("[data-site-nav]");
    if (!navMount) {
        return;
    }

    const currentPage = document.body.dataset.page;
    const navLinks = siteLinks.map((link) => {
        const activeClass = link.page === currentPage ? "active" : "";
        return `<a href="${I18n.url(link.href)}" class="${activeClass}" ${activeClass ? 'aria-current="page"' : ''}>${I18n.t('nav.' + link.page)}</a>`;
    }).join("");

    navMount.innerHTML = `
        <nav class="site-nav">
            <div class="container site-nav__inner">
                <a href="${I18n.url('index.html')}" class="site-brand">
                    <img src="logo.png" alt="${I18n.t('common.logo')}">
                    <span>CARE Lab</span>
                </a>
                <button type="button" class="site-nav__hamburger" aria-label="${I18n.t('common.menu')}" aria-expanded="false">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div class="site-nav__overlay"></div>
                <div class="site-nav__links">${navLinks}</div>
                <div class="language-switch" role="group" aria-label="${I18n.t('common.language')}">
                    <button type="button" data-language="zh-CN" lang="zh-CN" aria-pressed="${I18n.language === 'zh-CN'}">中文</button>
                    <button type="button" data-language="en" lang="en" aria-pressed="${I18n.language === 'en'}">EN</button>
                </div>
            </div>
        </nav>
    `;

    const hamburger = navMount.querySelector(".site-nav__hamburger");
    const nav = navMount.querySelector(".site-nav");
    const overlay = navMount.querySelector(".site-nav__overlay");
    const links = navMount.querySelectorAll(".site-nav__links a");

    navMount.querySelectorAll('[data-language]').forEach(button => {
        button.addEventListener('click', async () => {
            closeNav();
            const language = button.dataset.language;
            await I18n.setLanguage(language);
            navMount.querySelector(`[data-language="${language}"]`)?.focus();
        });
    });

    function closeNav() {
        nav.classList.remove("nav--open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    function openNav() {
        nav.classList.add("nav--open");
        hamburger.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    hamburger.addEventListener("click", () => {
        if (nav.classList.contains("nav--open")) {
            closeNav();
        } else {
            openNav();
        }
    });

    overlay.addEventListener("click", closeNav);

    links.forEach(link => {
        link.addEventListener("click", closeNav);
    });

    // The nav is rebuilt on language changes; scope this listener to its mount.
    navMount.onkeydown = (e) => {
        if (e.key === "Escape" && nav.classList.contains("nav--open")) {
            closeNav();
            hamburger.focus();
        }
    };
}

function renderSiteFooter() {
    const footerMount = document.querySelector("[data-site-footer]");
    if (!footerMount) {
        return;
    }

    const footerLinks = siteLinks.map((link) =>
        `<a href="${I18n.url(link.href)}">${I18n.t('nav.' + link.page)}</a>`
    ).join("");

    footerMount.innerHTML = `
        <footer class="site-footer">
            <div class="container site-footer__inner">
                <div class="site-footer__brand">
                    <a href="${I18n.url('index.html')}" class="site-footer__logo">
                        <img src="logo.png" alt="${I18n.t('common.logo')}">
                        <span>CARE Lab</span>
                    </a>
                    <p class="site-footer__tagline">${I18n.escape(I18n.t('home.tagline'))}</p>
                </div>
                <div class="site-footer__col">
                    <h3>${I18n.t('common.navigate')}</h3>
                    <nav class="site-footer__links">${footerLinks}</nav>
                </div>
                <div class="site-footer__col">
                    <h3>${I18n.t('common.contact')}</h3>
                    <address class="site-footer__address">
                        <span>${I18n.t('common.jiangning')}</span>
                        <span>${I18n.t('common.changzhou')}</span>
                    </address>
                    <div class="site-footer__external">
                        <a href="https://github.com/EmoLab-AI/" target="_blank" rel="noopener">GitHub</a>
                    </div>
                </div>
            </div>
            <div class="site-footer__bottom">
                <div class="container site-footer__bottom-inner">
                    <span>${I18n.t('common.rights')}</span>
                    <span>${I18n.t('common.school')}</span>
                </div>
            </div>
        </footer>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
    await I18n.ready;
    renderSiteNav();
    renderSiteFooter();
});

document.addEventListener('languagechange', () => {
    renderSiteNav();
    renderSiteFooter();
});
