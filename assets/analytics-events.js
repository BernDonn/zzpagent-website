(() => {
  'use strict';

  const cleanText = (value, limit = 100) =>
    String(value || '').trim().replace(/\s+/g, ' ').slice(0, limit);

  const sendEvent = (name, parameters = {}) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, {
      ...parameters,
      transport_type: 'beacon'
    });
  };

  const normalizedPath = (pathname) => pathname.replace(/\/+$/, '') || '/';
  const isOverOns = normalizedPath(window.location.pathname) === '/over-ons';

  const contentMeta = (element) => {
    const blogCard = element.closest?.('.blog-card');
    if (blogCard) {
      const cards = [...document.querySelectorAll('.blog-card')];
      return {
        content_type: 'blog',
        content_title: cleanText(blogCard.querySelector('h4')?.textContent),
        content_position: String(cards.indexOf(blogCard) + 1)
      };
    }

    const linkedInPost = element.closest?.('.linkedin-post');
    if (linkedInPost) {
      const posts = [...document.querySelectorAll('.linkedin-post')];
      return {
        content_type: 'linkedin_post',
        content_title: cleanText(linkedInPost.querySelector('.linkedin-text strong')?.textContent),
        content_position: String(posts.indexOf(linkedInPost) + 1)
      };
    }

    const linkedInProfile = element.closest?.('.linkedin-header a[href*="linkedin.com/in/"]');
    if (linkedInProfile) {
      return {
        content_type: 'linkedin_profile',
        content_title: 'Bernard Donners op LinkedIn',
        content_position: '1'
      };
    }

    return null;
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    let destination;
    try {
      destination = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    if (isOverOns) {
      const meta = contentMeta(link);
      if (meta) {
        let linkAction = 'card';
        if (link.closest('h4')) linkAction = 'headline';
        else if (link.closest('.read-more')) linkAction = 'read_more';
        else if (meta.content_type === 'linkedin_profile') linkAction = 'follow';

        sendEvent('over_ons_content_click', {
          ...meta,
          link_action: linkAction,
          destination_host: cleanText(destination.hostname),
          destination_path: cleanText(destination.pathname)
        });
        return;
      }
    }

    if (destination.origin !== window.location.origin) return;

    const path = normalizedPath(destination.pathname);
    let eventName = '';

    if (path === '/over-ons') {
      eventName = 'over_ons_click';
    } else if (path === '/blog/china-ai-studiereis' || path === '/en/blog/china-ai-study-trip') {
      eventName = 'china_blog_click';
    } else if (/^\/(?:en\/)?blog\//.test(path)) {
      eventName = 'blog_click';
    }

    if (!eventName) return;

    sendEvent(eventName, {
      link_text: cleanText(link.textContent),
      link_url: destination.href,
      source_path: window.location.pathname
    });
  });

  if (!isOverOns) return;

  const seenContent = new WeakSet();
  const contentObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5 || seenContent.has(entry.target)) continue;
      seenContent.add(entry.target);
      const meta = contentMeta(entry.target);
      if (meta) {
        sendEvent('over_ons_content_view', {
          ...meta,
          link_action: 'impression',
          non_interaction: true
        });
      }
      contentObserver.unobserve(entry.target);
    }
  }, { threshold: [0.5] });

  document.querySelectorAll('.blog-card, .linkedin-post').forEach((element) => contentObserver.observe(element));

  const sections = [
    ['bio', document.querySelector('.bio-section')],
    ['blogs', document.querySelector('.blog-section')],
    ['linkedin', document.querySelector('.linkedin-section')]
  ];
  const seenSections = new WeakSet();
  const sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || seenSections.has(entry.target)) continue;
      seenSections.add(entry.target);
      const section = sections.find(([, element]) => element === entry.target);
      if (section) {
        sendEvent('over_ons_section_view', {
          section_name: section[0],
          non_interaction: true
        });
      }
      sectionObserver.unobserve(entry.target);
    }
  }, { threshold: [0.01], rootMargin: '0px 0px -35% 0px' });
  sections.forEach(([, element]) => element && sectionObserver.observe(element));

  const sentScrollDepths = new Set();
  const scrollMilestones = [25, 50, 75, 90, 100];
  const measureScroll = () => {
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const scrollable = Math.max(documentHeight - window.innerHeight, 1);
    const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    for (const milestone of scrollMilestones) {
      if (percent >= milestone && !sentScrollDepths.has(milestone)) {
        sentScrollDepths.add(milestone);
        sendEvent('over_ons_scroll_depth', {
          scroll_percent: String(milestone),
          non_interaction: true
        });
      }
    }
  };
  window.addEventListener('scroll', measureScroll, { passive: true });
  measureScroll();

  const engagementMilestones = [15, 30, 60, 120];
  const sentEngagement = new Set();
  let activeSeconds = 0;
  window.setInterval(() => {
    if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
    activeSeconds += 1;
    for (const milestone of engagementMilestones) {
      if (activeSeconds >= milestone && !sentEngagement.has(milestone)) {
        sentEngagement.add(milestone);
        sendEvent('over_ons_engagement_time', {
          engagement_seconds: String(milestone),
          non_interaction: true
        });
      }
    }
  }, 1000);
})();
