async function loadMembers() {
    try {
        const response = await fetch("info/members/info.json");
        const data = await response.json();
        return data.members || [];
    } catch (error) {
        console.error("Error loading member data:", error);
        return [];
    }
}

function createMemberCard(member) {
    const bioContent = (member.bio || "").replace(
        "Research focus:",
        "<span class='focus-label'>Research focus:</span>"
    );

    const introduction = member.introduction
        ? `<div class="member-introduction">${member.introduction}</div>`
        : "";

    const links = (member.links || []).map((link) => (
        `<a href="${link.url}" target="_blank" rel="noreferrer">${link.name}</a>`
    )).join("");

    const scholarUrl = member.googleScholar || member["google scholar"];
    const scholarLink = scholarUrl && scholarUrl !== "暂无"
        ? `<a href="${scholarUrl}" target="_blank" rel="noreferrer">Google Scholar</a>`
        : "";

    return `
        <div class="member-card">
            <img src="${member.avatar}" alt="${member.name}" class="member-photo">
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                ${introduction}
                <div class="member-bio">${bioContent}</div>
                <div class="member-links">${links}${scholarLink}</div>
            </div>
        </div>
    `;
}

function renderMembersByCategory(members, matcher, containerId) {
    const categoryContainer = document.getElementById(containerId);
    if (!categoryContainer) {
        return;
    }

    const filteredMembers = members.filter((member) => matcher(member.title || ""));
    categoryContainer.innerHTML = filteredMembers.length
        ? filteredMembers.map(createMemberCard).join("")
        : "<p>No members in this category yet.</p>";
}

async function initializePage() {
    const members = await loadMembers();
    renderMembersByCategory(members, (title) => title === "Leader", "leader-members");
    renderMembersByCategory(members, (title) => title.includes("Ph.D"), "phd-members");
    renderMembersByCategory(members, (title) => title === "Master", "master-members");
    renderMembersByCategory(members, (title) => title === "Exchange", "exchange-members");
    renderMembersByCategory(members, (title) => title === "Others", "others-members");
}

document.addEventListener("DOMContentLoaded", initializePage);
