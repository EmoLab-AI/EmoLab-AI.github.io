// Function to load member data from JSON file
async function loadMembers() {
    try {
        const response = await fetch('/info/members/info.json');
        const data = await response.json();
        return data.members;
    } catch (error) {
        console.error('Error loading member data:', error);
        return [];
    }
}

// Function to create a member card HTML element
function createMemberCard(member) {
    return `
        <div class="member-card">
            <img src="${member.avatar}" alt="${member.name}" class="member-photo">
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-title">${member.title}</div>
                <div class="member-bio">${member.bio}</div>
                <div class="member-links">
                    ${member.links.map(link => `
                        <a href="${link.url}" target="_blank">${link.name}</a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Function to render members by category
function renderMembersByCategory(members, category) {
    const categoryContainer = document.querySelector(`#${category.toLowerCase()}-members`);
    if (!categoryContainer) return;

    const filteredMembers = members.filter(member => member.title.includes(category));
    const membersHTML = filteredMembers.map(member => createMemberCard(member)).join('');
    categoryContainer.innerHTML = membersHTML;
}

// Initialize the page
async function initializePage() {
    const members = await loadMembers();
    
    // Render members by category
    renderMembersByCategory(members, 'Master');
    renderMembersByCategory(members, 'Ph.D');
    renderMembersByCategory(members, 'Alumni');
}

// Load members when the page is ready
document.addEventListener('DOMContentLoaded', initializePage); 