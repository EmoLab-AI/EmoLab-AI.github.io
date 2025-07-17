document.addEventListener('DOMContentLoaded', () => {
    const datasetGrid = document.querySelector('.dataset-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let datasets = [];

    // 从JSON文件加载数据集
    fetch('info/datasets/datastes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
        datasets = data.datasets || [];
        renderDatasets(datasets);
        setupFilterButtons();
    })
    .catch(error => {
        console.error('Error loading datasets:', error);
        datasetGrid.innerHTML = '<p>Failed to load datasets. Please try again later.</p>';
    });

    // 设置筛选按钮功能
    function setupFilterButtons() {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 移除所有按钮的active类
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // 为当前点击的按钮添加active类
                button.classList.add('active');

                const filterText = button.textContent.trim().toLowerCase();

                if (filterText === 'all') {
                    renderDatasets(datasets);
                } else {
                    const filteredDatasets = datasets.filter(
                        dataset => dataset.tags.some(tag => tag.toLowerCase() === filterText)
                    );
                    renderDatasets(filteredDatasets);
                }
            });
        });
    }

    // 渲染数据集卡片
    function renderDatasets(datasetsToRender) {
        datasetGrid.innerHTML = '';

        if (datasetsToRender.length === 0) {
            datasetGrid.innerHTML = '<p>No datasets found matching your criteria.</p>';
            return;
        }

        datasetsToRender.forEach(dataset => {
            const card = createDatasetCard(dataset);
            datasetGrid.appendChild(card);
        });
    }

    // 创建单个数据集卡片
    function createDatasetCard(dataset) {
        const card = document.createElement('div');
        card.className = 'dataset-card';

        // 构建卡片HTML
        card.innerHTML = `
            <img src="${dataset.image || 'default-dataset.jpg'}" alt="${dataset.title}" class="dataset-image">
            <div class="dataset-info">
                <div class="dataset-title">${dataset.title}</div>
                <div class="dataset-description">${dataset.description}</div>
                <div class="dataset-stats">
                    ${dataset.stats.map(stat => `
                        <div class="stat-item">
                            <span class="stat-label">${stat.label}:</span>
                            <span class="stat-value">${stat.value}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="dataset-tags">
                    ${dataset.tags.map(tag => `<span class="dataset-tag">${tag}</span>`).join('')}
                </div>
                <div class="dataset-links">
                    ${dataset.links.map(link => `
                        <a href="${link.url}" target="${link.target || '_self'}" class="dataset-link">${link.label}</a>
                    `).join('')}
                </div>
            </div>
        `;

        return card;
    }
});