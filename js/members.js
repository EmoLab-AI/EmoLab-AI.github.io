// Function to load member data from JSON file
async function loadMembers() {
    try {
        // Add cache-busting parameter to prevent browser caching
        const response = await fetch('/info/members/info.json?t=' + new Date().getTime());
        const data = await response.json();
        console.log('Loaded members data:', data.members); // Debug log
        return data.members;
    } catch (error) {
        console.error('Error loading member data:', error);
        return [];
    }
}

// Function to create a member card HTML element
function createMemberCard(member) {
    // 处理研究方向，将"Research focus:"和具体方向分开
    const bioContent = member.bio.replace("Research focus:", "<span class='focus-label'>Research focus:</span>");
    
    return `
        <div class="member-card">
            <img src="${member.avatar}" alt="${member.name}" class="member-photo">
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                ${member.introduction && member.introduction !== "暂无" ? 
                    `<div class="member-introduction">${member.introduction}</div>` : ''}
                <div class="member-bio">${bioContent}</div>
                <div class="member-links">
                    ${member.links.map(link => `
                        <a href="${link.url}" target="_blank">${link.name}</a>
                    `).join('')}
                    ${member["google scholar"] && member["google scholar"] !== "暂无" ? 
                    `<a href="${member["google scholar"]}" target="_blank">Google Scholar</a>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Function to render members by category
function renderMembersByCategory(members, category, containerId) {
    const categoryContainer = document.getElementById(containerId);
    if (!categoryContainer) {
        console.error(`Container not found for category: ${category}, containerId: ${containerId}`);
        return;
    }

    const filteredMembers = members.filter(member => {
        const lowerCaseTitle = member.title.toLowerCase();
        const lowerCaseCategory = category.toLowerCase();
        return lowerCaseTitle.includes(lowerCaseCategory);
    });
    
    console.log(`Filtered members for ${category}:`, filteredMembers); // Debug log
    
    const membersHTML = filteredMembers.map(member => createMemberCard(member)).join('');
    categoryContainer.innerHTML = membersHTML || '<p>No members in this category yet.</p>';
}

// Initialize the page
async function initializePage() {
    const members = await loadMembers();
    
    // Define category mappings (category name -> container ID)
    const categoryMappings = [
        { category: 'Leader', containerId: 'leader-members' },
        { category: 'Ph.D', containerId: 'phd-members' },
        { category: 'Master', containerId: 'master-members' },
        { category: 'Exchange', containerId: 'exchange-members' },
        { category: 'Others', containerId: 'others-members' }
    ];
    
    // Render members for each category
    categoryMappings.forEach(mapping => {
        console.log(`Processing category: ${mapping.category}`); // Debug log
        renderMembersByCategory(members, mapping.category, mapping.containerId);
    });
}

// Load members when the page is ready
document.addEventListener('DOMContentLoaded', initializePage);