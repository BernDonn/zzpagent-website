/* Basic opt-in: no Google requests, including cookieless pings, before consent. */
(() => {
  'use strict';
  if (window.siteAnalyticsPrivacy) return;
  const key = 'site-analytics-opt-out', consentKey = 'site-analytics-consent-v1';
  const ids = ['G-4BBKJXQGWV', 'G-FEM9HLKQ43'];
  const id = location.hostname.includes('mkbagents') ? ids[1] : ids[0];
  const excludedPage = location.pathname.replace(/\/+$/, '') === '/analytics-uit';
  let optedOut = false, choice = '', loaded = false;
  const read = () => { try { optedOut = localStorage.getItem(key) === '1'; choice = localStorage.getItem(consentKey) || ''; } catch (_) {} };
  const isDisabled = () => {
    read();
    const disabled = optedOut || choice !== 'accepted' || excludedPage;
    ids.forEach(x => { window['ga-disable-' + x] = disabled; });
    return disabled;
  };
  const eraseCookies = () => {
    document.cookie.split(';').forEach(pair => {
      const name = pair.split('=')[0].trim();
      if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) return;
      ['', location.hostname, '.' + location.hostname.replace(/^www\./, '')].forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
      });
    });
  };
  const start = () => {
    if (isDisabled() || loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { if (!isDisabled()) window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, {allow_google_signals:false, allow_ad_personalization_signals:false,
      page_location:location.origin + location.pathname, page_referrer:''});
    const script = document.createElement('script');
    script.async = true; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
    window.dispatchEvent(new Event('site-analytics-allowed'));
  };
  const update = () => {
    const disabled = isDisabled();
    if (disabled) eraseCookies();
    window.dispatchEvent(new Event('site-analytics-change'));
    if (disabled && loaded) { location.reload(); return; }
    start();
  };
  window.siteAnalyticsPrivacy = {
    isDisabled,
    runWhenAllowed(fn) {
      let ran = false;
      const run = () => { if (!ran && !isDisabled()) { ran = true; fn(); } };
      window.addEventListener('site-analytics-allowed', run); run();
    },
    setDisabled(value) {
      optedOut = value;
      let saved = false;
      try { if (value) localStorage.setItem(key,'1'); else localStorage.removeItem(key); saved = (localStorage.getItem(key)==='1')===value; } catch (_) {}
      update(); return saved;
    },
    setConsent(value) {
      choice = value === 'accepted' ? 'accepted' : 'refused';
      try { localStorage.setItem(consentKey, choice); } catch (_) {}
      update();
    }
  };
  isDisabled();
  window.addEventListener('storage', e => { if ([key,consentKey,null].includes(e.key)) update(); });
  window.addEventListener('pageshow', event => { if (event.persisted) update(); });
  const ui = () => {
    if (excludedPage) return;
    const style = document.createElement('style');
    style.textContent = '#site-consent{position:fixed;bottom:16px;left:16px;z-index:2147483646;max-width:400px;width:calc(100% - 32px);box-sizing:border-box;background:#fff;color:#18332d;border:1px solid #769186;border-radius:12px;padding:18px;box-shadow:0 4px 22px #0002;font:14px/1.5 system-ui,sans-serif}#site-consent[hidden]{display:none}#site-consent p{margin:0 0 12px;font:inherit;color:inherit}#site-consent button,#site-consent-settings{font:14px/1.4 system-ui,sans-serif;border:1px solid #587368;border-radius:6px;background:#fff;color:#18332d;padding:9px 13px;cursor:pointer}#site-consent button{margin:0 8px 0 0}#site-consent-settings{display:block;margin:16px auto;padding:6px 10px}';
    document.head.appendChild(style);
    const panel = document.createElement('section'); panel.id = 'site-consent';
    panel.setAttribute('aria-label','Keuze voor bezoekersmeting');
    panel.innerHTML = '<p>Met je toestemming gebruiken we Google Analytics om te zien welke pagina’s en video’s worden bekeken en hoelang video’s afspelen. Ook de bestaande bezoekersmeting start pas na akkoord. Je kunt weigeren of je keuze later wijzigen via Meetvoorkeuren.</p><button type="button" data-choice="accepted">Accepteren</button><button type="button" data-choice="refused">Weigeren</button><p id="site-consent-note" style="margin:10px 0 0"></p>';
    const settings = document.createElement('button'); settings.id = 'site-consent-settings'; settings.type = 'button'; settings.textContent = 'Meetvoorkeuren';
    settings.addEventListener('click', () => { panel.hidden = false; panel.querySelector('button').focus(); });
    panel.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => { window.siteAnalyticsPrivacy.setConsent(button.dataset.choice); panel.hidden = true; settings.focus(); }));
    const render = () => { read(); panel.hidden = !!choice || optedOut; panel.querySelector('#site-consent-note').textContent = optedOut ? 'Je bestaande browseruitsluiting heeft voorrang: meting blijft uit.' : ''; };
    window.addEventListener('site-analytics-change', render);
    document.body.append(panel); (document.querySelector('footer') || document.body).append(settings); render(); start();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ui); else ui();
})();
