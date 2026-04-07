async function loadGalleryData() {
    try {
        const response = await fetch("info/gallery/gallery.json");
        const data = await response.json();
        return (data.gallery || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error("Error loading gallery data:", error);
        return [];
    }
}

function createGalleryItem(item) {
    return `
        <article class="card gallery-item">
            <img src="${item.image}" alt="${item.title}" class="gallery-image">
            <div class="gallery-copy">
                <p class="gallery-date">${item.date}</p>
                <h3 class="gallery-title">${item.title}</h3>
                <p class="gallery-description">${item.description}</p>
            </div>
        </article>
    `;
}

function renderGalleryItems(items, category = "All") {
    const galleryGrid = document.querySelector(".gallery-grid");
    const filteredItems = category === "All"
        ? items
        : items.filter((item) => item.category === category);

    galleryGrid.innerHTML = filteredItems.length
        ? filteredItems.map(createGalleryItem).join("")
        : '<p class="empty-state">No gallery items found for this filter.</p>';
}

async function initializeGallery() {
    const items = await loadGalleryData();
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            buttons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            renderGalleryItems(items, button.textContent.trim());
        });
    });

    renderGalleryItems(items);
}

document.addEventListener("DOMContentLoaded", initializeGallery);
