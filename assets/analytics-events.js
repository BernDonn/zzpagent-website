(() => {
  'use strict';

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || typeof window.gtag !== 'function') return;

    let destination;
    try {
      destination = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    if (destination.origin !== window.location.origin) return;

    const path = destination.pathname.replace(/\/+$/, '') || '/';
    let eventName = '';

    if (path === '/over-ons') {
      eventName = 'over_ons_click';
    } else if (path === '/blog/china-ai-studiereis' || path === '/en/blog/china-ai-study-trip') {
      eventName = 'china_blog_click';
    } else if (/^\/(?:en\/)?blog\//.test(path)) {
      eventName = 'blog_click';
    }

    if (!eventName) return;

    window.gtag('event', eventName, {
      link_text: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
      link_url: destination.href,
      source_path: window.location.pathname,
      transport_type: 'beacon'
    });
  });
})();
