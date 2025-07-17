// Function to load news data from JSON files
async function loadNews() {
    try {
        // Load publications
        const pubResponse = await fetch('/info/publications/publications.json');
        const pubData = await pubResponse.json();
        
        // Load gallery events
        const galleryResponse = await fetch('/info/gallery/gallery.json');
        const galleryData = await galleryResponse.json();
        
        // Filter gallery items with Events category
        const galleryEvents = galleryData.gallery.filter(
            item => item.category === 'Events' || item.category === 'Awards'
        );
        
        // Combine and sort all news items by date
        const allNews = [
            ...pubData.publications.map(pub => ({
                type: 'publication',
                date: pub.date,
                title: pub.title,
                description: pub.description || `New publication: ${pub.title}`
            })),
            ...galleryEvents.map(event => ({
                type: 'event',
                date: event.date,
                title: event.title,
                description: event.description
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return allNews.slice(0, 5); // Return top 5 news
    } catch (error) {
        console.error('Error loading news:', error);
        return [];
    }
}

// Function to render news items
function renderNews(newsItems) {
    const newsContainer = document.querySelector('.news-content');
    if (!newsContainer) return;
    
    // Clear existing content except the header
    newsContainer.innerHTML = '<h2>News</h2>';
    
    if (newsItems.length === 0) {
        newsContainer.innerHTML += '<p>No recent news found.</p>';
        return;
    }
    
    // Add news items
    newsItems.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <div class="news-date">[${news.date}]</div>
            <p>${news.description}</p>
        `;
        newsContainer.appendChild(newsItem);
    });
}

// Initialize news when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const newsItems = await loadNews();
    renderNews(newsItems);
});