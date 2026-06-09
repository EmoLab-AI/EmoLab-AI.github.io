var PUB_DATA = [];

var currentTypeFilter = 'All';
var currentSearchQuery = '';

async function fetchPublications() {
    try {
        const response = await fetch('info/publications/publications.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        return data.publications || [];
    } catch (error) {
        console.error('Error fetching publications:', error);
        if (window.location.protocol === 'file:') {
            throw new Error('LOCAL_FILE_PROTOCOL');
        }
        return [];
    }
}

function getUniqueTypes(pubs) {
    return ['All', ...new Set(pubs.map(p => p.type))];
}

function getUniqueYears(pubs) {
    return [...new Set(pubs.map(p => p.year))].sort((a, b) => b - a);
}

function formatAuthors(authors) {
    if (!authors || authors.length === 0) return '';
    return authors.join(', ');
}

function escapeHtml(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatAbstract(text) {
    if (!text) return '';
    return text
        .split(/\n\n+/)
        .map(function(para) { return '<p>' + escapeHtml(para.trim()) + '</p>'; })
        .join('');
}

function iconSvg(name) {
    var icons = {
        paper: '<svg class="pub-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"/><path d="M13 2v7h7"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>',
        abstract: '<svg class="pub-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        cite: '<svg class="pub-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
        code: '<svg class="pub-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>',
        doi: '<svg class="pub-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    };
    return icons[name] || '';
}

function actionLabel(iconName, text) {
    return iconSvg(iconName) + '<span>' + text + '</span>';
}

function formatTypeLabel(pub) {
    if (pub.note) return pub.note;
    if (pub.type === 'Journal Articles') return 'Journal article';
    if (pub.type === 'Conference Papers') return 'Conference paper';
    return pub.type || 'Publication';
}

/* --- Combined Filtering --- */
function getFilteredPubs() {
    var pubs = PUB_DATA;

    if (currentTypeFilter !== 'All') {
        pubs = pubs.filter(function(p) { return p.type === currentTypeFilter; });
    }

    if (currentSearchQuery) {
        var q = currentSearchQuery.toLowerCase();
        pubs = pubs.filter(function(p) {
            var inTitle = p.title && p.title.toLowerCase().indexOf(q) !== -1;
            var inAuthors = p.authors && p.authors.some(function(a) { return a.toLowerCase().indexOf(q) !== -1; });
            var inAbstract = p.abstract && p.abstract.toLowerCase().indexOf(q) !== -1;
            var inVenue = p.venue && p.venue.toLowerCase().indexOf(q) !== -1;
            return inTitle || inAuthors || inAbstract || inVenue;
        });
    }

    return pubs;
}

/* --- Skeleton Loading --- */
function createSkeletonCard() {
    var el = document.createElement('div');
    el.className = 'publication-skeleton';
    el.innerHTML = '<div class="skeleton-media"></div><div class="skeleton-body"><div class="skeleton-line long"></div><div class="skeleton-line medium"></div><div class="skeleton-line short"></div><div class="skeleton-line xs"></div></div>';
    return el;
}

function showLoadingSkeleton(container) {
    container.innerHTML = '';
    for (var i = 0; i < 2; i++) {
        container.appendChild(createSkeletonCard());
    }
}

/* --- Cite Toast --- */
function showCiteToast(msg) {
    var toast = document.querySelector('.cite-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'cite-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 2000);
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
}

/* --- Card Creation --- */
function createPublicationCard(pub) {
    var card = document.createElement('article');
    card.className = 'card publication-card fade-in';

    var imageUrl = pub.image || 'info/publications/img/placeholder.svg';
    var isPng = /\.png(?:[?#].*)?$/i.test(imageUrl);
    var imgClass = isPng ? 'publication-image--contain' : '';
    var venueText = pub.presentation ? pub.venue + ' | ' + pub.presentation : pub.venue;
    var titleLink = (pub.links && pub.links.paper) ? pub.links.paper : ((pub.links && pub.links.doi) ? pub.links.doi : '#');

    var parts = [];
    if (pub.links && pub.links.paper) parts.push('<a href="' + pub.links.paper + '" class="pub-link pub-link--primary" target="_blank" rel="noreferrer">' + actionLabel('paper', 'Paper') + '</a>');
    if (pub.links && pub.links.doi && !(pub.links && pub.links.paper)) parts.push('<a href="' + pub.links.doi + '" class="pub-link pub-link--primary" target="_blank" rel="noreferrer">' + actionLabel('doi', 'DOI') + '</a>');
    if (pub.links && pub.links.project) parts.push('<a href="' + pub.links.project + '" class="pub-link" target="_blank" rel="noreferrer">' + actionLabel('code', 'Code') + '</a>');
    if (pub.abstract) parts.push('<button class="show-abstract-btn" type="button">' + actionLabel('abstract', 'Abstract') + '</button>');
    if (pub.citation) parts.push('<button class="cite-btn" type="button">' + actionLabel('cite', 'Cite') + '</button>');

    var imgAlt = escapeHtml(pub.title);
    var imgHtml = '<div class="publication-media" data-placeholder="CARE Lab publication"><img src="' + imageUrl + '" class="' + imgClass + '" alt="' + imgAlt + '" loading="lazy"></div>';
    var metaHtml = '<div class="publication-meta"><span class="publication-type">' + escapeHtml(formatTypeLabel(pub)) + '</span><span class="publication-year">' + escapeHtml(String(pub.year || '')) + '</span></div>';
    var titleHtml = '<h3 class="publication-title"><a href="' + titleLink + '" target="_blank" rel="noreferrer">' + escapeHtml(pub.title) + '</a></h3>';
    var authorsHtml = '<p class="publication-authors">' + escapeHtml(formatAuthors(pub.authors)) + '</p>';
    var venueHtml = '<p class="publication-venue">' + escapeHtml(venueText) + '</p>';
    var linksHtml = '<div class="publication-links">' + parts.join('') + '</div>';
    var noteHtml = pub.note ? '<p class="publication-note">' + escapeHtml(pub.note) + '</p>' : '';
    var abstractHtml = pub.abstract ? '<div class="publication-abstract">' + formatAbstract(pub.abstract) + '</div>' : '';

    card.innerHTML = imgHtml + '<div class="publication-body">' + metaHtml + titleHtml + authorsHtml + venueHtml + linksHtml + noteHtml + abstractHtml + '</div>';

    var img = card.querySelector('.publication-media img');
    if (img) {
        img.addEventListener('error', function() {
            var media = card.querySelector('.publication-media');
            media.classList.add('is-missing');
            img.setAttribute('aria-hidden', 'true');
            img.removeAttribute('src');
        });
    }

    /* Abstract toggle */
    var absBtn = card.querySelector('.show-abstract-btn');
    if (absBtn) {
        absBtn.addEventListener('click', function() {
            var ab = card.querySelector('.publication-abstract');
            var isOpen = ab.classList.contains('show');
            ab.classList.toggle('show', !isOpen);
            absBtn.innerHTML = actionLabel('abstract', isOpen ? 'Abstract' : 'Hide Abstract');
        });
    }

    /* Cite button */
    var citeBtn = card.querySelector('.cite-btn');
    if (citeBtn) {
        citeBtn.addEventListener('click', function() {
            var cit = pub.citation;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(cit).catch(function() { fallbackCopy(cit); });
            } else {
                fallbackCopy(cit);
            }
            showCiteToast('Citation copied to clipboard');
        });
    }

    return card;
}

/* --- Rendering --- */
function renderPublications() {
    var container = document.getElementById('publicationsContainer');
    container.classList.add('fade-out');

    setTimeout(function() {
        container.innerHTML = '';
        container.classList.remove('fade-out');

        var visible = getFilteredPubs();

        /* Update result count */
        var countEl = document.getElementById('pubResultCount');
        if (countEl) {
            countEl.textContent = 'Showing ' + visible.length + ' of ' + PUB_DATA.length;
            countEl.style.display = visible.length < PUB_DATA.length ? '' : 'none';
        }

        if (visible.length === 0) {
            var emptyMsg = currentSearchQuery
                ? 'No publications match "' + escapeHtml(currentSearchQuery) + '". Try different keywords.'
                : 'No publications found for this filter.';
            container.innerHTML = '<p class="empty-state">' + emptyMsg + '</p>';
            return;
        }

        getUniqueYears(visible).forEach(function(year) {
                var section = document.createElement('section');
                section.className = 'year-section';
                var list = document.createElement('div');
                list.className = 'publication-list';
                visible.filter(function(p) { return p.year === year; }).forEach(function(p) {
                    list.appendChild(createPublicationCard(p));
                });
                var h2 = document.createElement('h2');
                h2.className = 'year-title';
                h2.textContent = year;
                section.appendChild(h2);
                section.appendChild(list);
                container.appendChild(section);
            });

        requestAnimationFrame(function() {
            container.classList.add('fade-in');
            var cards = container.querySelectorAll('.publication-card');
            cards.forEach(function(card, i) {
                setTimeout(function() { card.classList.add('visible'); }, i * 80);
            });
        });
    }, 150);
}

function createFilterButtons(types, allPubs) {
    var fc = document.getElementById('publicationFilters');
    fc.innerHTML = '';

    types.forEach(function(type) {
        var btn = document.createElement('button');
        btn.className = 'filter-btn' + (type === currentTypeFilter ? ' active' : '');
        var cnt = type === 'All' ? allPubs.length : allPubs.filter(function(p) { return p.type === type; }).length;
        btn.innerHTML = '<span>' + escapeHtml(type) + '</span><strong>' + cnt + '</strong>';
        btn.addEventListener('click', function() {
            currentTypeFilter = type;
            document.querySelectorAll('#publicationFilters .filter-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            renderPublications();
        });
        fc.appendChild(btn);
    });
}

/* --- Search --- */
function initSearch() {
    var input = document.getElementById('pubSearch');
    if (!input) return;

    var debounceTimer;
    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            currentSearchQuery = input.value.trim();
            renderPublications();
        }, 250);
    });

    /* Clear search on Escape */
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            input.value = '';
            currentSearchQuery = '';
            renderPublications();
            input.blur();
        }
    });
}

/* --- Init --- */
async function initializePage() {
    var container = document.getElementById('publicationsContainer');
    showLoadingSkeleton(container);

    await new Promise(function(r) { setTimeout(r, 300); });

    try {
        PUB_DATA = await fetchPublications();
    } catch (err) {
        if (err.message === 'LOCAL_FILE_PROTOCOL') {
            container.innerHTML = '<div class="empty-state"><p><strong>Cannot load data from local file.</strong></p><p>Please serve this site via a local web server (e.g., <code>python -m http.server</code> or <code>npx serve</code>) instead of opening the HTML file directly.</p></div>';
        } else {
            container.innerHTML = '<p class="empty-state">Failed to load publications. Please check your network connection and try again.</p>';
        }
        return;
    }

    if (PUB_DATA.length === 0) {
        container.innerHTML = '<p class="empty-state">No publications found. Please check back later.</p>';
        return;
    }

    createFilterButtons(getUniqueTypes(PUB_DATA), PUB_DATA);
    initSearch();
    renderPublications();
}

document.addEventListener('DOMContentLoaded', initializePage);
