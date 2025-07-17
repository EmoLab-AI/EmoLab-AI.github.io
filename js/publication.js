// Function to fetch publications data
async function fetchPublications() {
    try {
        const response = await fetch('../info/publications/publications.json');
        const data = await response.json();
        return data.publications;
    } catch (error) {
        console.error('Error fetching publications:', error);
        return [];
    }
}

// Function to get unique publication types
function getUniqueTypes(publications) {
    const types = new Set(publications.map(pub => pub.type));
    return ['All', ...Array.from(types)];
}

// Function to get unique years
function getUniqueYears(publications) {
    return [...new Set(publications.map(pub => pub.year))].sort((a, b) => b - a);
}

// Function to create publication card
function createPublicationCard(publication) {
    const card = document.createElement('div');
    card.className = 'publication-card';
    card.setAttribute('data-type', publication.type);

    const venueText = publication.presentation 
        ? `${publication.venue} - ${publication.presentation}`
        : publication.venue;

    card.innerHTML = `
        <div class="publication-title">${publication.title}</div>
        <div class="publication-authors">${publication.authors.join(', ')}</div>
        <div class="publication-venue">${venueText}</div>
        <div class="publication-links">
            ${publication.links.pdf ? `<a href="${publication.links.pdf}" class="pub-link">PDF</a>` : ''}
            ${publication.links.code ? `<a href="${publication.links.code}" class="pub-link">Code</a>` : ''}
            ${publication.links.project ? `<a href="${publication.links.project}" class="pub-link">Project Page</a>` : ''}
            ${publication.links.video ? `<a href="${publication.links.video}" class="pub-link">Video</a>` : ''}
            ${publication.abstract ? `<button class="show-abstract-btn">Show Abstract</button>` : ''}
        </div>
        ${publication.abstract ? `
            <div class="publication-abstract">
                ${publication.abstract}
            </div>
        ` : ''}
    `;

    // Add abstract toggle functionality
    const abstractBtn = card.querySelector('.show-abstract-btn');
    if (abstractBtn) {
        abstractBtn.addEventListener('click', () => {
            const abstract = card.querySelector('.publication-abstract');
            const isHidden = abstract.style.display === 'none' || abstract.style.display === '';
            abstract.style.display = isHidden ? 'block' : 'none';
            abstractBtn.textContent = isHidden ? 'Hide Abstract' : 'Show Abstract';
        });
    }

    return card;
}

// Function to render publications
function renderPublications(publications, selectedType = 'All') {
    const container = document.getElementById('publicationsContainer');
    container.innerHTML = '';

    const years = getUniqueYears(publications);

    years.forEach(year => {
        const yearPublications = publications.filter(pub => 
            pub.year === year && 
            (selectedType === 'All' || pub.type === selectedType)
        );

        if (yearPublications.length > 0) {
            const yearSection = document.createElement('div');
            yearSection.className = 'year-section';
            yearSection.innerHTML = `<h2 class="year-title">${year}</h2>`;

            yearPublications.forEach(pub => {
                yearSection.appendChild(createPublicationCard(pub));
            });

            container.appendChild(yearSection);
        }
    });
}

// Function to create filter buttons
function createFilterButtons(types) {
    const filtersContainer = document.getElementById('publicationFilters');
    filtersContainer.innerHTML = '';

    types.forEach(type => {
        const button = document.createElement('button');
        button.className = 'filter-btn' + (type === 'All' ? ' active' : '');
        button.textContent = type;
        filtersContainer.appendChild(button);
    });
}

// Initialize the page
async function initializePage() {
    const publications = await fetchPublications();
    const types = getUniqueTypes(publications);

    createFilterButtons(types);
    renderPublications(publications);

    // Add filter functionality
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            renderPublications(publications, button.textContent);
        });
    });
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);