async function loadGalleryData() {
    const response = await fetch('info/gallery/gallery.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return ((await response.json()).gallery || []).sort((a, b) => new Date(b.date) - new Date(a.date));
}
function createGalleryItem(item) {
    const esc = I18n.escape;
    return `<article class="card gallery-item">
        <img src="${esc(item.image)}" alt="${esc(I18n.field(item, 'title'))}" class="gallery-image">
        <div class="gallery-copy">
            <p class="gallery-date">${esc(I18n.date(item.date))}</p>
            <h3 class="gallery-title">${esc(I18n.field(item, 'title'))}</h3>
            <p class="gallery-description">${esc(I18n.field(item, 'description'))}</p>
        </div>
    </article>`;
}
function renderGalleryItems(items, category = 'All') {
    const visible = category === 'All' ? items : items.filter(item => item.category === category);
    document.querySelector('.gallery-grid').innerHTML = visible.length ? visible.map(createGalleryItem).join('')
        : `<p class="empty-state">${I18n.t('gallery.empty')}</p>`;
}
async function initializeGallery() {
    await I18n.ready;
    let items = [], filter = 'All', failed = false;
    const buttons = document.querySelectorAll('.filter-btn');
    function render() {
        if (failed) document.querySelector('.gallery-grid').innerHTML = `<p class="empty-state">${I18n.t('gallery.error')}</p>`;
        else renderGalleryItems(items, filter);
    }
    buttons.forEach(button => button.addEventListener('click', () => {
        filter = button.dataset.filter;
        buttons.forEach(btn => btn.classList.toggle('active', btn === button));
        render();
    }));
    document.addEventListener('languagechange', render);
    try { items = await loadGalleryData(); }
    catch (error) { failed = true; console.error('Error loading gallery:', error); }
    render();
}
document.addEventListener('DOMContentLoaded', initializeGallery);
