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
        return `<a href="${link.href}" class="${activeClass}">${link.label}</a>`;
    }).join("");

    navMount.innerHTML = `
        <nav class="site-nav">
            <div class="container site-nav__inner">
                <a href="index.html" class="site-brand">
                    <img src="logo.png" alt="CARE Lab logo">
                    <span>CARE Lab</span>
                </a>
                <button class="site-nav__hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div class="site-nav__overlay"></div>
                <div class="site-nav__links">${navLinks}</div>
            </div>
        </nav>
    `;

    const hamburger = navMount.querySelector(".site-nav__hamburger");
    const nav = navMount.querySelector(".site-nav");
    const overlay = navMount.querySelector(".site-nav__overlay");
    const links = navMount.querySelectorAll(".site-nav__links a");

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

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("nav--open")) {
            closeNav();
            hamburger.focus();
        }
    });
}

function renderSiteFooter() {
    const footerMount = document.querySelector("[data-site-footer]");
    if (!footerMount) {
        return;
    }

    const footerLinks = siteLinks.map((link) =>
        `<a href="${link.href}">${link.label}</a>`
    ).join("");

    footerMount.innerHTML = `
        <footer class="site-footer">
            <div class="container site-footer__inner">
                <div class="site-footer__brand">
                    <a href="index.html" class="site-footer__logo">
                        <img src="logo.png" alt="CARE Lab logo">
                        <span>CARE Lab</span>
                    </a>
                    <p class="site-footer__tagline">Cognitive &amp; Affective Computing<br>for Rehabilitation &amp; Embodied Intelligence</p>
                </div>
                <div class="site-footer__col">
                    <h3>Navigate</h3>
                    <nav class="site-footer__links">${footerLinks}</nav>
                </div>
                <div class="site-footer__col">
                    <h3>Contact</h3>
                    <address class="site-footer__address">
                        <span>南京医科大学 · 江宁校区学海楼629</span>
                        <span>南京医科大学 · 常州校区工信楼408</span>
                    </address>
                    <div class="site-footer__external">
                        <a href="https://github.com/EmoLab-AI/" target="_blank" rel="noopener">GitHub</a>
                    </div>
                </div>
            </div>
            <div class="site-footer__bottom">
                <div class="container site-footer__bottom-inner">
                    <span>&copy; 2026 CARE Lab. All rights reserved.</span>
                    <span>南京医科大学 · 生物医学工程与信息学院</span>
                </div>
            </div>
        </footer>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    renderSiteNav();
    renderSiteFooter();
});
