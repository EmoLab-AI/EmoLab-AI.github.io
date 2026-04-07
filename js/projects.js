async function loadProjects() {
    try {
        const response = await fetch("info/projects/projects.json");
        const data = await response.json();
        return data.projects || [];
    } catch (error) {
        console.error("Error loading project data:", error);
        return [];
    }
}

function createProjectCard(project) {
    return `
        <article class="card project-card" data-status="${project.status}" data-tags="${(project.tags || []).join('|')}">
            <h3 class="project-title">${project.name}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-meta">
                <span class="project-badge">${project.status}</span>
                ${(project.tags || []).map((tag) => `<span class="project-badge">${tag}</span>`).join("")}
            </div>
            <a href="${project.url}" class="project-link" target="_blank" rel="noreferrer">Project Page</a>
        </article>
    `;
}

function projectMatchesFilter(project, filter) {
    if (filter === "All") {
        return true;
    }

    if (filter === "Active" || filter === "Completed") {
        return project.status === filter;
    }

    return (project.tags || []).includes(filter);
}

async function initializeProjects() {
    const projects = await loadProjects();
    const grid = document.querySelector(".projects-grid");
    const buttons = document.querySelectorAll(".filter-btn");

    function render(filter = "All") {
        const visibleProjects = projects.filter((project) => projectMatchesFilter(project, filter));
        grid.innerHTML = visibleProjects.length
            ? visibleProjects.map(createProjectCard).join("")
            : '<p class="empty-state">暂无</p>';
    }

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            buttons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            render(button.textContent.trim());
        });
    });

    render();
}

document.addEventListener("DOMContentLoaded", initializeProjects);
