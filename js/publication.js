async function fetchPublications() {
    try {
        const response = await fetch("info/publications/publications.json");
        const data = await response.json();
        return data.publications || [];
    } catch (error) {
        console.error("Error fetching publications:", error);
        return [];
    }
}

function getUniqueTypes(publications) {
    return ["All", ...new Set(publications.map((pub) => pub.type))];
}

function getUniqueYears(publications) {
    return [...new Set(publications.map((pub) => pub.year))].sort((a, b) => b - a);
}

function formatAuthors(authors) {
    return authors.join(", ");
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function createPublicationCard(publication) {
    const card = document.createElement("article");
    card.className = "card publication-card";

    const imageUrl = publication.image || "homepage/img/overiew.svg";
    const imageModeClass = /\.png(?:[?#].*)?$/i.test(imageUrl) ? "publication-image--contain" : "";
    const venueText = publication.presentation
        ? `${publication.venue} | ${publication.presentation}`
        : publication.venue;

    const titleLink = publication.links?.paper || publication.links?.doi || "#";
    const links = [
        publication.links?.paper ? `<a href="${publication.links.paper}" class="pub-link" target="_blank" rel="noreferrer">Paper</a>` : "",
        publication.links?.project ? `<a href="${publication.links.project}" class="pub-link" target="_blank" rel="noreferrer">Code</a>` : "",
        publication.abstract ? '<button class="show-abstract-btn" type="button">Abstract</button>' : ""
    ].join("");

    card.innerHTML = `
        <div class="publication-media">
            <img src="${imageUrl}" class="${imageModeClass}" alt="${escapeHtml(publication.title)}">
        </div>
        <div class="publication-body">
            <h3 class="publication-title"><a href="${titleLink}" target="_blank" rel="noreferrer">${escapeHtml(publication.title)}</a></h3>
            <p class="publication-authors">${escapeHtml(formatAuthors(publication.authors))}</p>
            <p class="publication-venue">${escapeHtml(venueText)}</p>
            <div class="publication-links">${links}</div>
            ${publication.note ? `<p class="publication-note">${escapeHtml(publication.note)}</p>` : ""}
            ${publication.abstract ? `<div class="publication-abstract">${escapeHtml(publication.abstract)}</div>` : ""}
        </div>
    `;

    const abstractBtn = card.querySelector(".show-abstract-btn");
    if (abstractBtn) {
        abstractBtn.addEventListener("click", () => {
            const abstract = card.querySelector(".publication-abstract");
            const willShow = !abstract.style.display || abstract.style.display === "none";
            abstract.style.display = willShow ? "block" : "none";
            abstractBtn.textContent = willShow ? "Hide Abstract" : "Abstract";
        });
    }

    return card;
}

function renderPublications(publications, selectedType = "All") {
    const container = document.getElementById("publicationsContainer");
    container.innerHTML = "";

    const visiblePublications = publications.filter((pub) => selectedType === "All" || pub.type === selectedType);
    if (visiblePublications.length === 0) {
        container.innerHTML = '<p class="empty-state">No publications found for this filter.</p>';
        return;
    }

    getUniqueYears(visiblePublications).forEach((year) => {
        const yearSection = document.createElement("section");
        yearSection.className = "year-section";

        const list = document.createElement("div");
        list.className = "publication-list";

        visiblePublications
            .filter((pub) => pub.year === year)
            .forEach((pub) => list.appendChild(createPublicationCard(pub)));

        yearSection.innerHTML = `<h2 class="year-title">${year}</h2>`;
        yearSection.appendChild(list);
        container.appendChild(yearSection);
    });
}

function createFilterButtons(types, publications) {
    const filtersContainer = document.getElementById("publicationFilters");
    filtersContainer.innerHTML = "";

    types.forEach((type) => {
        const button = document.createElement("button");
        button.className = `filter-btn${type === "All" ? " active" : ""}`;
        button.textContent = type;
        button.addEventListener("click", () => {
            document.querySelectorAll("#publicationFilters .filter-btn").forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            renderPublications(publications, type);
        });
        filtersContainer.appendChild(button);
    });
}

async function initializePage() {
    const publications = await fetchPublications();
    createFilterButtons(getUniqueTypes(publications), publications);
    renderPublications(publications);
}

document.addEventListener("DOMContentLoaded", initializePage);
