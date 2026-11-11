async function loadMembers() {
    const response = await fetch('info/members/info.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return (await response.json()).members || [];
}
function createMemberCard(member) {
    const esc = I18n.escape;
    const bio = I18n.field(member, 'bio').replace(/^(?:Research focus:\s*|研究方向[：:]\s*)/, '').replaceAll('&amp;', '&');
    const intro = I18n.field(member, 'introduction');
    const links = (member.links || []).map(link =>
        `<a href="${esc(I18n.url(link.url))}" target="_blank" rel="noreferrer">${esc(I18n.label(link.name))}</a>`
    ).join('');
    const scholar = member.googleScholar || member['google scholar'];
    return `<div class="member-card">
        <img src="${esc(member.avatar)}" alt="${esc(member.name)}" class="member-photo" loading="lazy">
        <div class="member-info">
            <div class="member-name">${esc(member.name)}</div>
            ${member.tag ? `<div class="member-tag">${esc(I18n.label(member.tag))}</div>` : ''}
            ${intro ? `<div class="member-introduction">${esc(intro)}</div>` : ''}
            <div class="member-bio"><span class="focus-label">${esc(I18n.t('common.researchFocus'))}</span> ${esc(bio)}</div>
            <div class="member-links">${links}${scholar && scholar !== '暂无' ? `<a href="${esc(scholar)}" target="_blank" rel="noreferrer">${I18n.label('Google Scholar')}</a>` : ''}</div>
        </div>
    </div>`;
}
function renderMembersByCategory(members, matcher, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const visible = members.filter(member => matcher(member.title || ''));
    container.innerHTML = visible.length ? visible.map(createMemberCard).join('') : `<p>${I18n.t('members.empty')}</p>`;
}
async function initializePage() {
    await I18n.ready;
    let members = [], failed = false;
    const groups = [
        ['leader-members', title => title === 'Leader'],
        ['phd-members', title => title.includes('Ph.D')],
        ['master-members', title => title === 'Master'],
        ['exchange-members', title => title === 'Exchange'],
        ['collaborator-members', title => title === 'Collaborator'],
        ['others-members', title => title === 'Others']
    ];
    function render() {
        groups.forEach(([id, matcher]) => {
            if (failed) document.getElementById(id).innerHTML = `<p>${I18n.t('members.error')}</p>`;
            else renderMembersByCategory(members, matcher, id);
        });
    }
    document.addEventListener('languagechange', render);
    try { members = await loadMembers(); }
    catch (error) { failed = true; console.error('Error loading member data:', error); }
    render();
}
document.addEventListener('DOMContentLoaded', initializePage);
