// Function to load gallery data from JSON file
async function loadGalleryData() {
    try {
        const response = await fetch('/info/gallery/gallery.json');
        const data = await response.json();
        return data.gallery;
    } catch (error) {
        console.error('Error loading gallery data:', error);
        return [];
    }
}

// Function to create a gallery item HTML element
function createGalleryItem(item) {
    return `
        <div class="gallery-item" data-category="${item.category}">
            <img src="/${item.image}" alt="${item.title}" class="gallery-image">
            <div class="gallery-overlay">
                <div class="gallery-title">${item.title}</div>
                <div class="gallery-description">${item.description}</div>
            </div>
        </div>
    `;
}

// Function to render gallery items by category
function renderGalleryItems(items, category = 'All') {
    const galleryGrids = document.querySelectorAll('.gallery-grid');
    
    galleryGrids.forEach(grid => {
        const sectionTitle = grid.previousElementSibling.textContent.trim();
        const filteredItems = items.filter(item => {
            if (category === 'All') {
                return sectionTitle.includes(item.category);
            }
            return item.category === category;
        });
        
        const galleryHTML = filteredItems.map(item => createGalleryItem(item)).join('');
        grid.innerHTML = galleryHTML || '<p>No items in this category</p>';
    });
}

// Initialize modal functionality
function initializeModal() {
    const modal = document.querySelector('.modal');
    const modalImage = modal.querySelector('.modal-image');
    const modalTitle = modal.querySelector('.modal-title');
    const modalDescription = modal.querySelector('.modal-description');
    const modalClose = modal.querySelector('.modal-close');

    // Add click event to gallery items
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const image = item.querySelector('.gallery-image');
            const title = item.querySelector('.gallery-title');
            const description = item.querySelector('.gallery-description');

            modalImage.src = image.src;
            modalImage.alt = image.alt;
            modalTitle.textContent = title.textContent;
            modalDescription.textContent = description.textContent;
            modal.classList.add('active');
        });
    });

    // Close modal events
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Initialize filter buttons
function initializeFilters(items) {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            // Add active class to clicked button
            button.classList.add('active');
            
            const category = button.textContent;
            renderGalleryItems(items, category);
            initializeModal();
        });
    });
}

// Initialize the page
async function initializePage() {
    const galleryItems = await loadGalleryData();
    if (galleryItems.length > 0) {
        renderGalleryItems(galleryItems);
        initializeFilters(galleryItems);
        initializeModal();
    }
}

// Load gallery when the page is ready
document.addEventListener('DOMContentLoaded', initializePage); 