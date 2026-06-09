/**
 * news.js — Loads and renders news items on the homepage.
 * Expects: info/news.json
 * Renders into: [data-news-list]
 */

;(function () {
    "use strict"

    const NEWS_PATH = "info/news.json"
    const container = document.querySelector("[data-news-list]")

    /* ---- Research cards ---- */
    function renderResearchCards() {
        const grid = document.getElementById("researchGrid")
        if (!grid) return

        const cards = [
            {
                iconImg: "icon-vr.png",
                title: "VR & Multimodal Cognitive Computing",
                desc: "Designing immersive rehabilitation scenarios and cognitive tasks that combine behavior, physiology, and interaction data."
            },
            {
                iconImg: "icon-affective.png",
                title: "Multimodal Affective Computing",
                desc: "Modeling emotion and mental states through facial, audio, physiological, and contextual signals."
            },
            {
                iconImg: "icon-embodied.png",
                title: "Embodied AI & Bionic Robotics",
                desc: "Building adaptive robotic and embodied systems for natural communication, assistance, and rehabilitation training."
            }
        ]

        grid.innerHTML = cards.map(c => `
            <div class="research-card">
                <div class="research-card__icon">
                    <img src="homepage/img/${c.iconImg}" alt="" loading="lazy">
                </div>
                <h3 class="research-card__title">${c.title}</h3>
                <p class="research-card__desc">${c.desc}</p>
            </div>
        `).join("")
    }

    /* ---- Stats counter animation (kept for potential reuse) ---- */
    function animateStats() {
        const stats = document.querySelectorAll("[data-stat-target]")
        if (!stats.length) return

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return
                observer.unobserve(entry.target)
                const el = entry.target
                const target = parseInt(el.dataset.statTarget, 10)
                const duration = 1200
                const start = performance.now()

                function tick(now) {
                    const elapsed = now - start
                    const progress = Math.min(elapsed / duration, 1)
                    // ease-out quad
                    const eased = 1 - (1 - progress) * (1 - progress)
                    el.textContent = Math.round(eased * target)
                    if (progress < 1) requestAnimationFrame(tick)
                    else el.textContent = target
                }

                requestAnimationFrame(tick)
            })
        }, { threshold: 0.5 })

        stats.forEach(el => observer.observe(el))
    }

    /* ---- News rendering ---- */

    if (!container) return

    fetch(NEWS_PATH)
        .then(res => {
            if (!res.ok) throw new Error("Failed to load news.json")
            return res.json()
        })
        .then(data => renderNews(data))
        .catch(() => {
            container.innerHTML = `
                <div class="news-item">
                    <p class="news-date">Welcome!</p>
                    <h3>CARE Lab Website Launched</h3>
                    <p>Our new lab website is now online. Stay tuned for updates on research, publications, and lab events.</p>
                </div>
                <div class="news-item">
                    <p class="news-date">Ongoing</p>
                    <h3>Join Our Research</h3>
                    <p>We are looking for motivated students and researchers. Contact us via email for opportunities.</p>
                </div>
            `
        })

    function renderNews(items) {
        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = '<p class="news-loading">No news yet. Check back soon!</p>'
            return
        }

        container.innerHTML = items.map(item => `
            <div class="news-item fade-in">
                <p class="news-date">${escapeHtml(item.date || "")}</p>
                <h3>${escapeHtml(item.title || "")}</h3>
                <p>${escapeHtml(item.summary || "")}</p>
                ${item.link ? `<a href="${escapeAttr(item.link)}" class="news-readmore" target="_blank" rel="noopener">Read more →</a>` : ""}
            </div>
        `).join("")

        // Trigger fade-in on scroll
        requestAnimationFrame(() => {
            document.querySelectorAll(".fade-in").forEach(el => {
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible")
                            observer.unobserve(entry.target)
                        }
                    })
                }, { threshold: 0.15 })
                observer.observe(el)
            })
        })
    }

    function escapeHtml(str) {
        const div = document.createElement("div")
        div.textContent = str
        return div.innerHTML
    }

    function escapeAttr(str) {
        return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }

    /* ---- Boot ---- */
    document.addEventListener("DOMContentLoaded", () => {
        renderResearchCards()
        animateStats()
    })
})()
