async function loadProjects() {
  try {
    const response = await fetch('/info/projects/projects.json');
    const data = await response.json();
    return data.projects;
  } catch (error) {
    console.error('Error loading projects data:', error);
    return [];
  }
}

function createProjectCard(project) {
  return `
    <div class="project-card">
      <div class="project-info">
        <div class="project-title">${project.name}</div>
        <div class="project-description">${project.description}</div>
        <div class="project-links">
          <a href="${project.url}" class="project-link">Project Page</a>
        </div>
      </div>
    </div>
  `;
}

async function renderProjects() {
  const projects = await loadProjects();
  const grid = document.querySelector('.projects-grid');
  
  if (projects.length === 0) {
    grid.innerHTML = '<p>No projects found.</p>';
    return;
  }
  
  grid.innerHTML = projects.map(createProjectCard).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', renderProjects);