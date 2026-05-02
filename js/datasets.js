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
                <img src="${dataset.image || 'logo.png'}" alt="${dataset.title}" class="dataset-image">
                <div class="dataset-info">
                    <h3 class="dataset-title">${dataset.title}</h3>
                    <p class="dataset-description">${dataset.description}</p>
                    <div class="dataset-stats">
                        ${(dataset.stats || []).map((stat) => `
                            <span class="stat-item"><strong>${stat.label}:</strong> ${stat.value}</span>
                        `).join("")}
                    </div>
                    <div class="dataset-tags">
                        ${(dataset.tags || []).map((tag) => `<span class="dataset-tag">${tag}</span>`).join("")}
                    </div>
                    <div class="dataset-links">
                        ${(dataset.links || []).map((link) => renderDatasetLink(link)).join("")}
                    </div>
                </div>
            `;
            datasetGrid.appendChild(card);
        });
    }

    function renderDatasetLink(link) {
        if (link.action === "application-modal") {
            return `<button type="button" class="dataset-link" data-application-url="${link.url}">${link.label}</button>`;
        }

        return `<a href="${link.url}" target="${link.target || '_blank'}" rel="noreferrer" class="dataset-link">${link.label}</a>`;
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
