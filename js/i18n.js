/* Shared language state. Load before site.js and page scripts. */
(function () {
    'use strict';

    const STORAGE_KEY = 'care-lab-language';
    const dictionaries = {};
    const normalize = value => /^zh(?:-|$)/i.test(value || '') ? 'zh-CN'
        : /^en(?:-|$)/i.test(value || '') ? 'en' : null;
    let saved;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) { /* Storage may be blocked. */ }
    let language = normalize(new URL(location.href).searchParams.get('lang'))
        || normalize(saved) || normalize(navigator.language) || 'en';
    document.documentElement.lang = language;

    function t(key, values = {}) {
        const text = dictionaries[language]?.[key] ?? dictionaries.en?.[key] ?? key;
        return String(text).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
    }

    function field(record, name) {
        return record?.translations?.[language]?.[name] ?? record?.[name] ?? '';
    }

    function label(value) {
        const key = 'labels.' + value;
        return dictionaries[language]?.[key] ?? dictionaries.en?.[key] ?? value;
    }

    function escape(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[ch]);
    }

    function url(href) {
        const target = new URL(href, location.href);
        if (target.origin === location.origin && /(?:\.html|\/)$/i.test(target.pathname)) {
            target.searchParams.set('lang', language);
            return target.pathname + target.search + target.hash;
        }
        return href;
    }

    function date(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value || '';
        const [year, month, day] = value.split('-').map(Number);
        return new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long', day: 'numeric' })
            .format(new Date(year, month - 1, day));
    }

    function apply(root = document) {
        const selector = '[data-i18n], [data-i18n-placeholder], [data-i18n-aria-label], [data-i18n-title], [data-i18n-alt]';
        root.querySelectorAll(selector).forEach(el => {
            if (el.dataset.i18n) el.textContent = t(el.dataset.i18n);
            ['placeholder', 'aria-label', 'title', 'alt'].forEach(attr => {
                const key = el.getAttribute('data-i18n-' + attr);
                if (key) el.setAttribute(attr, t(key));
            });
        });
        root.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('#')) a.setAttribute('href', url(href));
        });
    }

    async function setLanguage(value, updateUrl = true) {
        await ready;
        const next = normalize(value);
        if (!next) return;
        language = next;
        document.documentElement.lang = language;
        try { localStorage.setItem(STORAGE_KEY, language); } catch (_) { /* Optional persistence. */ }
        if (updateUrl) {
            const target = new URL(location.href);
            target.searchParams.set('lang', language);
            try { history.replaceState(null, '', target); } catch (_) { /* file:// preview */ }
        }
        apply();
        document.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
    }

    const ready = Promise.all(['en', 'zh-CN'].map(async lang => {
        try {
            const response = await fetch('info/i18n/' + lang + '.json');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            dictionaries[lang] = await response.json();
        } catch (error) {
            console.error('Cannot load language dictionary:', lang, error);
            dictionaries[lang] = {};
        }
    }));
    window.I18n = { t, field, label, escape, url, date, apply, setLanguage, ready, get language() { return language; } };
    document.addEventListener('DOMContentLoaded', async () => {
        await ready;
        apply();
    });
    window.addEventListener('popstate', () => {
        const requested = normalize(new URL(location.href).searchParams.get('lang'));
        if (requested && requested !== language) setLanguage(requested, false);
    });
})();
