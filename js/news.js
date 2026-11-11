/* Homepage research highlights and optional news data. */
(function () {
    'use strict';
    const container = document.querySelector('[data-news-list]');
    let newsItems = null;
    const cards = [
        ['icon-vr.png', 'vrTitle', 'vrDesc'],
        ['icon-affective.png', 'affectiveTitle', 'affectiveDesc'],
        ['icon-embodied.png', 'embodiedTitle', 'embodiedDesc']
    ];
    function renderResearchCards() {
        const grid = document.getElementById('researchGrid');
        if (!grid) return;
        grid.innerHTML = cards.map(([icon, title, description]) => `
            <div class="research-card">
                <div class="research-card__icon"><img src="homepage/img/${icon}" alt="" loading="lazy"></div>
                <h3 class="research-card__title">${I18n.t('home.' + title)}</h3>
                <p class="research-card__desc">${I18n.t('home.' + description)}</p>
            </div>`).join('');
    }
    function renderNews() {
        if (!container) return;
        if (newsItems === null) {
            container.innerHTML = `
                <div class="news-item">
                    <p class="news-date">${I18n.t('home.welcome')}</p>
                    <h3>${I18n.t('home.launched')}</h3>
                    <p>${I18n.t('home.launchedDesc')}</p>
                </div>
                <div class="news-item">
                    <p class="news-date">${I18n.t('home.ongoing')}</p>
                    <h3>${I18n.t('home.join')}</h3>
                    <p>${I18n.t('home.joinDesc')}</p>
                </div>`;
        } else if (!newsItems.length) {
            container.innerHTML = `<p class="news-loading">${I18n.t('home.noNews')}</p>`;
        } else {
            container.innerHTML = newsItems.map(item => `
                <div class="news-item fade-in">
                    <p class="news-date">${I18n.escape(I18n.date(item.date))}</p>
                    <h3>${I18n.escape(I18n.field(item, 'title'))}</h3>
                    <p>${I18n.escape(I18n.field(item, 'summary'))}</p>
                    ${item.link ? `<a href="${I18n.escape(I18n.url(item.link))}" class="news-readmore" target="_blank" rel="noopener">${I18n.t('home.more')}</a>` : ''}
                </div>`).join('');
            const observer = new IntersectionObserver(entries => entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            }), { threshold: 0.15 });
            container.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        }
    }
    function animateStats() {
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            const el = entry.target;
            const target = parseInt(el.dataset.statTarget, 10);
            const start = performance.now();
            function tick(now) {
                const progress = Math.min((now - start) / 1200, 1);
                el.textContent = Math.round((1 - (1 - progress) ** 3) * target);
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }), { threshold: 0.5 });
        document.querySelectorAll('[data-stat-target]').forEach(el => observer.observe(el));
    }
    document.addEventListener('DOMContentLoaded', async () => {
        await I18n.ready;
        renderResearchCards();
        animateStats();
        document.addEventListener('languagechange', () => {
            renderResearchCards();
            renderNews();
        });
        if (!container) return;
        try {
            const response = await fetch('info/news.json');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            newsItems = Array.isArray(data) ? data : [];
        } catch (_) { newsItems = null; }
        renderNews();
    });
})();
