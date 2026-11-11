async function loadProjects() {
    const response = await fetch('info/projects/projects.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return (await response.json()).projects || [];
}
function createProjectCard(project) {
    const esc = I18n.escape;
    return `<article class="card project-card" data-status="${esc(project.status)}" data-tags="${esc((project.tags || []).join('|'))}">
        <h3 class="project-title">${esc(I18n.field(project, 'name'))}</h3>
        <p class="project-description">${esc(I18n.field(project, 'description'))}</p>
        <div class="project-meta">
            <span class="project-badge">${esc(I18n.label(project.status))}</span>
            ${(project.tags || []).map(tag => `<span class="project-badge">${esc(I18n.label(tag))}</span>`).join('')}
        </div>
        <a href="${esc(I18n.url(project.url))}" class="project-link" target="_blank" rel="noreferrer">${I18n.label('Project Page')}</a>
    </article>`;
}
function projectMatchesFilter(project, filter) {
    if (filter === 'All') return true;
    if (filter === 'Active' || filter === 'Completed') return project.status === filter;
    return (project.tags || []).includes(filter);
}
async function initializeProjects() {
    await I18n.ready;
    let projects = [], filter = 'All', failed = false;
    const grid = document.querySelector('.projects-grid');
    const buttons = document.querySelectorAll('.filter-btn');
    function render() {
        const visible = projects.filter(project => projectMatchesFilter(project, filter));
        grid.innerHTML = failed ? `<p class="empty-state">${I18n.t('projects.error')}</p>`
            : visible.length ? visible.map(createProjectCard).join('')
            : `<p class="empty-state">${I18n.t('projects.empty')}</p>`;
    }
    buttons.forEach(button => button.addEventListener('click', () => {
        filter = button.dataset.filter;
        buttons.forEach(btn => btn.classList.toggle('active', btn === button));
        render();
    }));
    document.addEventListener('languagechange', render);
    try { projects = await loadProjects(); }
    catch (error) { failed = true; console.error('Error loading projects:', error); }
    render();
}
document.addEventListener('DOMContentLoaded', initializeProjects);
