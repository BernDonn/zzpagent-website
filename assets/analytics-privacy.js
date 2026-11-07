/* Browser-local preference; no network requests or identifiers. */
(() => {
  'use strict';
  const key = 'site-analytics-opt-out';
  const ids = ['G-4BBKJXQGWV', 'G-FEM9HLKQ43'];
  let sessionDisabled = false;
  const isDisabled = () => {
    let stored = false;
    try { stored = localStorage.getItem(key) === '1'; } catch (_) {}
    const disabled = sessionDisabled || stored;
    ids.forEach(id => { window['ga-disable-' + id] = disabled; });
    return disabled;
  };
  window.siteAnalyticsPrivacy = {
    isDisabled,
    setDisabled(disabled) {
      sessionDisabled = disabled;
      let saved = false;
      try {
        if (disabled) localStorage.setItem(key, '1');
        else localStorage.removeItem(key);
        saved = (localStorage.getItem(key) === '1') === disabled;
      } catch (_) {}
      isDisabled();
      return saved;
    }
  };
  isDisabled();
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) isDisabled();
  });
  window.addEventListener('pageshow', isDisabled);
})();
