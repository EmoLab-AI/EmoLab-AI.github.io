document.addEventListener("DOMContentLoaded", () => {
    const datasetGrid = document.querySelector(".dataset-grid");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const accessModal = document.querySelector("#datasetAccessModal");
    const applicationFrame = document.querySelector("#datasetApplicationFrame");
    const applicationOpenLink = document.querySelector("#datasetApplicationOpenLink");
    let datasets = [];

    fetch("info/datasets/datastes.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            datasets = data.datasets || [];
            renderDatasets(datasets);
            setupFilterButtons();
        })
        .catch((error) => {
            console.error("Error loading datasets:", error);
            datasetGrid.innerHTML = '<p class="empty-state">Failed to load datasets. Please try again later.</p>';
        });

    function setupFilterButtons() {
        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                filterButtons.forEach((btn) => btn.classList.remove("active"));
                button.classList.add("active");

                const filterText = button.textContent.trim().toLowerCase();
                if (filterText === "all") {
                    renderDatasets(datasets);
                    return;
                }

                renderDatasets(
                    datasets.filter((dataset) => (dataset.tags || []).some((tag) => tag.toLowerCase() === filterText))
                );
            });
        });
    }

    function renderDatasets(datasetsToRender) {
        datasetGrid.innerHTML = "";

        if (datasetsToRender.length === 0) {
            datasetGrid.innerHTML = '<p class="empty-state">No datasets found matching your criteria.</p>';
            return;
        }

        datasetsToRender.forEach((dataset) => {
            const card = document.createElement("article");
            card.className = "card dataset-card";
            card.innerHTML = `
                <div class="dataset-preview" data-placeholder="CARE Lab dataset">
                    <img src="${escapeAttr(dataset.image || 'logo.png')}" alt="${escapeAttr(dataset.title)}" class="dataset-image" loading="lazy">
                    <span class="dataset-access-badge">${getAccessLabel(dataset)}</span>
                </div>
                <div class="dataset-info">
                    <div class="dataset-meta">
                        ${(dataset.tags || []).slice(0, 3).map((tag) => `<span class="dataset-tag dataset-tag--meta">${escapeHtml(tag)}</span>`).join("")}
                    </div>
                    <h3 class="dataset-title">${escapeHtml(dataset.title)}</h3>
                    <p class="dataset-description">${escapeHtml(dataset.description)}</p>
                    <div class="dataset-stats" aria-label="Dataset key metrics">
                        ${(dataset.stats || []).map((stat) => `
                            <span class="stat-item"><strong>${escapeHtml(stat.label)}</strong><em>${escapeHtml(stat.value)}</em></span>
                        `).join("")}
                    </div>
                    <div class="dataset-links">
                        ${(dataset.links || []).map((link, index) => renderDatasetLink(link, index)).join("")}
                    </div>
                </div>
            `;

            const img = card.querySelector(".dataset-image");
            img?.addEventListener("error", () => {
                const preview = card.querySelector(".dataset-preview");
                preview?.classList.add("is-missing");
                img.setAttribute("aria-hidden", "true");
                img.removeAttribute("src");
            });

            datasetGrid.appendChild(card);
        });
    }

    function getAccessLabel(dataset) {
        const hasApplication = (dataset.links || []).some((link) => link.action === "application-modal");
        const hasDataAction = (dataset.links || []).some((link) => /get data|request|access/i.test(link.label || ""));
        if (hasApplication) return "Application required";
        if (hasDataAction) return "Controlled access";
        return "Research resource";
    }

    function isPrimaryLink(link) {
        return link.action === "application-modal" || /get data|request|access/i.test(link.label || "");
    }

    function normalizeTarget(link) {
        return link.target === "_self" ? "_self" : "_blank";
    }

    function datasetIcon(name) {
        var icons = {
            data: '<svg class="dataset-link-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
            paper: '<svg class="dataset-link-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"/><path d="M13 2v7h7"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>',
            application: '<svg class="dataset-link-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15l3-3 3 3"/></svg>',
            link: '<svg class="dataset-link-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
        };
        return icons[name] || icons.link;
    }

    function getLinkIconName(link) {
        if (link.action === "application-modal") return "application";
        if (/data/i.test(link.label || "")) return "data";
        if (/publication|paper|doi/i.test(link.label || "")) return "paper";
        return "link";
    }

    function renderDatasetLink(link, index) {
        const primaryClass = isPrimaryLink(link) || (index === 0 && /data/i.test(link.label || "")) ? " dataset-link--primary" : "";
        const label = escapeHtml(link.label || "Open");
        const icon = datasetIcon(getLinkIconName(link));

        if (link.action === "application-modal") {
            return `<button type="button" class="dataset-link${primaryClass}" data-application-url="${escapeAttr(link.url)}">${icon}<span>${label}</span></button>`;
        }

        return `<a href="${escapeAttr(link.url)}" target="${normalizeTarget(link)}" rel="noreferrer" class="dataset-link${primaryClass}">${icon}<span>${label}</span></a>`;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    datasetGrid.addEventListener("click", (event) => {
        const accessButton = event.target.closest("[data-application-url]");
        if (!accessButton) {
            return;
        }

        openAccessModal(accessButton.dataset.applicationUrl);
    });

    document.querySelectorAll("[data-close-dataset-modal]").forEach((button) => {
        button.addEventListener("click", closeAccessModal);
    });

    accessModal?.addEventListener("click", (event) => {
        if (event.target === accessModal) {
            closeAccessModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && accessModal?.classList.contains("is-open")) {
            closeAccessModal();
        }
    });

    function openAccessModal(url) {
        if (!accessModal || !applicationFrame || !applicationOpenLink) {
            window.open(url, "_blank", "noopener,noreferrer");
            return;
        }

        applicationFrame.src = url;
        applicationOpenLink.href = url;
        accessModal.classList.add("is-open");
        accessModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeAccessModal() {
        if (!accessModal || !applicationFrame) {
            return;
        }

        accessModal.classList.remove("is-open");
        accessModal.setAttribute("aria-hidden", "true");
        applicationFrame.src = "";
        document.body.style.overflow = "";
    }
});
