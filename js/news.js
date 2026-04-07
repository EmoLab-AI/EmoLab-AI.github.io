async function loadNews() {
    try {
        const [pubResponse, galleryResponse] = await Promise.all([
            fetch("info/publications/publications.json"),
            fetch("info/gallery/gallery.json")
        ]);

        const pubData = await pubResponse.json();
        const galleryData = await galleryResponse.json();

        const galleryEvents = (galleryData.gallery || []).filter(
            (item) => item.category === "Events" || item.category === "Awards"
        );

        const allNews = [
            ...(pubData.publications || []).map((pub) => ({
                date: pub.date || `${pub.year}-01-01`,
                description: pub.description || `New publication: ${pub.title}`
            })),
            ...galleryEvents.map((event) => ({
                date: event.date,
                description: event.description || event.title
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        return allNews.slice(0, 5);
    } catch (error) {
        console.error("Error loading news:", error);
        return [];
    }
}

function renderNews(newsItems) {
    const newsContainer = document.querySelector(".news-content");
    if (!newsContainer) {
        return;
    }

    newsContainer.innerHTML = "<h2>News</h2>";

    if (newsItems.length === 0) {
        newsContainer.innerHTML += '<p class="empty-state">No recent news found.</p>';
        return;
    }

    newsItems.forEach((news) => {
        const newsItem = document.createElement("div");
        newsItem.className = "news-item";
        newsItem.innerHTML = `
            <div class="news-date">${news.date}</div>
            <p>${news.description}</p>
        `;
        newsContainer.appendChild(newsItem);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    renderNews(await loadNews());
});
