const siteLinks = [
    { href: "index.html", label: "Home", page: "home" },
    { href: "members.html", label: "Members", page: "members" },
    { href: "publications.html", label: "Publications", page: "publications" },
    { href: "datasets.html", label: "Datasets", page: "datasets" },
    { href: "projects.html", label: "Projects", page: "projects" },
    { href: "gallery.html", label: "Gallery", page: "gallery" }
];

function renderSiteNav() {
    const navMount = document.querySelector("[data-site-nav]");
    if (!navMount) {
        return;
    }

    const currentPage = document.body.dataset.page;
    const navLinks = siteLinks.map((link) => {
        const activeClass = link.page === currentPage ? "is-active" : "";
        return `<a href="${link.href}" class="${activeClass}">${link.label}</a>`;
    }).join("");

    navMount.innerHTML = `
        <nav class="site-nav">
            <div class="container site-nav__inner">
                <a href="index.html" class="site-brand">
                    <img src="logo.png" alt="EmoLab-AI logo">
                    <span>EmoLab-AI</span>
                </a>
                <div class="site-nav__links">${navLinks}</div>
            </div>
        </nav>
    `;
}

function renderSiteFooter() {
    const footerMount = document.querySelector("[data-site-footer]");
    if (!footerMount) {
        return;
    }

    footerMount.innerHTML = `
        <footer class="site-footer">
            <div class="site-footer__inner">
                <p>&copy; 2025 EmoLab-AI</p>
            </div>
        </footer>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    renderSiteNav();
    renderSiteFooter();
});
