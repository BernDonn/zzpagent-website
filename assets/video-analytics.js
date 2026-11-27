/* aggregate native video counts; no Google, cookies or visitor identifiers. */
(() => {
  'use strict';
  if (window.siteVideoAnalyticsLoaded) return;
  window.siteVideoAnalyticsLoaded = true;
  // Fail closed without the shared privacy loader; independent from GA permission.
  const allowed = () => window.siteAnalyticsPrivacy?.isVideoDisabled() === false;
  const titles = {
  "/assets/workshop.mp4": "Workshop AI meets Business Amsterdam",
  "/assets/zzpagent-intro-met-openingsfoto-atelier-replaced-deba74940a33.mp4": "Hermes, je eigen digitale assistent (verdieping)",
  "/assets/atelier-zzpagent-04-c4fba270ea8866b6.mp4": "Waarom Hermes?",
  "/assets/atelier-zzpagent-15-ed563953d9fa3294.mp4": "Wat is een AI-agent?",
  "/assets/atelier-zzpagent-10-87f5efd851bbbf82.mp4": "Een persoonlijke AI-assistent",
  "/assets/atelier-zzpagent-28-624e529501085463.mp4": "Een tweede brein voor je werk",
  "/assets/atelier-zzpagent-05-81b0abb4ee174793.mp4": "Je AI inwerken",
  "/assets/atelier-zzpagent-08-d96e9ff8e5182f1a.mp4": "Inbox, agenda en overzicht",
  "/assets/atelier-zzpagent-07-9a5c72c3419b5e03.mp4": "Gesprekken, mail en documenten",
  "/assets/atelier-zzpagent-29-204c7fed73b21497.mp4": "WhatsApp: antwoorden voorbereiden",
  "/assets/atelier-zzpagent-17-d1a043ad69eacf21.mp4": "Een AI-agent via WhatsApp Business",
  "/assets/atelier-zzpagent-13-cb3d812327030570.mp4": "De telefoonassistent",
  "/assets/atelier-zzpagent-18-bc85dee034893054.mp4": "Workflowautomatisering",
  "/assets/atelier-zzpagent-06-14b7ea53a0d58cc1.mp4": "Bonnetjes en administratie",
  "/assets/atelier-zzpagent-11-d8c9a6c019210ef8.mp4": "Dit is inbegrepen",
  "/assets/atelier-zzpagent-09-cfd308d19cc1e4ae.mp4": "Inrichten en testen",
  "/assets/atelier-zzpagent-12-ae039347b3c4c9ed.mp4": "Technische inrichting en OAuth",
  "/assets/atelier-zzpagent-20-f2e9a412c84e9e48.mp4": "Modelkeuze en toegang",
  "/assets/atelier-zzpagent-02-7d8680ee40b01a62.mp4": "Vijf vragen over AI-afhankelijkheid",
  "/assets/hermes-tips/korte-samenvatting-b4a2e1740ca1.mp4": "Korte samenvatting",
  "/assets/hermes-tips/tokengebruik.mp4": "1. Begrijp je tokengebruik",
  "/assets/hermes-tips/nieuw-gesprek.mp4": "2. Begin een nieuw gesprek als het onderwerp verandert",
  "/assets/hermes-tips/vaste-basis-ea7de40ce5c0.mp4": "3. Houd je vaste basis compact en correct",
  "/assets/atelier-zzpagent-03-9e3c9e3c71edc459.mp4": "Hermes 0.23: Rewind",
  "/assets/atelier-zzpagent-16-add95501ccbf5952.mp4": "Een website verbeteren of maken",
  "/assets/atelier-zzpagent-00-3c54773408d36176.mp4": "De AI-zichtbaarheidscheck",
  "/assets/atelier-zzpagent-21-d773eeef69f4f0ab.mp4": "ChatGPT: een fietsslot bestellen",
  "/assets/atelier-zzpagent-26-def98d6baa258593.mp4": "ChatGPT: leveranciers selecteren",
  "/assets/atelier-zzpagent-27-db6cf7077ae4af9e.mp4": "ChatGPT als data-analist",
  "/assets/atelier-zzpagent-24-f895f4aec1d97c1b.mp4": "Agentic browsing met ChatGPT Atlas",
  "/assets/atelier-zzpagent-25-413f666eafd8a1ff.mp4": "Agentic browsing met Perplexity Comet",
  "/assets/restored-blogs/6da01a2430dbb83bf457-atelier-replaced-f090858b29f0.mp4": "AI: bouwen, kopen of samenwerken?",
  "/assets/restored-blogs/52ec0af5ab08d47d9642-atelier-replaced-4a9db7575af5.mp4": "AI en het internetmodel",
  "/assets/hermes-vaste-prijs-uitgebreid-zzpagent-cd412f2c654e.mp4": "Vaste prijs",
  "/assets/china-ai-studiereis/dr-herbert-diess-drives-et9.mp4": "China AI studiereis"
};
  const bound = new WeakSet();
  const bind = video => {
    if (bound.has(video)) return;
    bound.add(video);
    let started = false, finished = false, running = false, lastMedia = 0, lastClock = 0;
    let seconds = 0, pending = 0, milestones = new Set();
    const source = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src') || '';
    const path = new URL(source || location.pathname, location.href).pathname;
    const emit = (name, extra = {}) => {
      if (!allowed() || !Object.hasOwn(titles,path)) return;
      const kind = {video_start:'start',video_watch_time:'watch',video_complete:'complete'}[name];
      if (!kind) return;
      // No retry or persistent queue: failures undercount rather than double-count.
      fetch('https://sophie.zzpagent.nl/video-count', {
        method:'POST', mode:'cors', credentials:'omit', referrerPolicy:'no-referrer', keepalive:true,
        headers:{'Content-Type':'text/plain'},
        body:JSON.stringify({video:path,kind,seconds:extra.watch_seconds || 0})
      }).catch(() => {});
    };
    const reset = () => { started = finished = running = false; seconds = pending = 0; milestones = new Set(); };
    const baseline = () => { lastMedia = video.currentTime; lastClock = performance.now(); };
    const flush = () => {
      if (pending >= 0.01) emit('video_watch_time',{watch_seconds:Math.round(pending*1000)/1000});
      pending = 0;
    };
    const sample = () => {
      const now = performance.now(), media = video.currentTime;
      const wall = (now-lastClock)/1000, delta = media-lastMedia;
      // Reject discontinuities. Seek, waiting and pause handlers reset baselines.
      if (allowed() && !document.hidden && running && !video.seeking && wall > 0 && wall <= 2 && delta > 0 && delta <= wall*video.playbackRate + 0.35) {
        const watched = Math.min(wall, delta/video.playbackRate);
        seconds += watched; pending += watched;
        for (const percent of [25,50,75]) {
          const point = video.duration * percent/100;
          if (lastMedia < point && media >= point && !milestones.has(percent)) {
            milestones.add(percent); emit('video_progress',{video_percent:percent});
          }
        }
        if (pending >= 10) flush();
      }
      lastMedia = media; lastClock = now;
    };
    const begin = () => {
      if (!allowed()) return;
      if (finished) reset();
      if (!started) { started = true; emit('video_start'); }
      running = true; baseline();
    };
    video.addEventListener('playing', begin);
    // Video permission is observed through site-analytics-change, not GA startup.
    video.addEventListener('timeupdate',sample);
    video.addEventListener('seeking', () => { running = false; baseline(); });
    video.addEventListener('seeked', () => { running = started && !video.paused && allowed(); baseline(); });
    video.addEventListener('waiting', () => { sample(); running = false; baseline(); });
    video.addEventListener('pause', () => { sample(); running = false; flush(); });
    video.addEventListener('ratechange', () => { baseline(); });
    video.addEventListener('ended', () => {
      sample(); running = false;
      if (started && !finished) { flush(); emit('video_complete',{video_percent:100}); finished = true; }
    });
    video.addEventListener('emptied', () => { flush(); reset(); });
    window.addEventListener('pagehide', () => { sample(); flush(); running = false; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { sample(); flush(); } baseline(); });
    window.addEventListener('site-analytics-change', () => { if (!allowed()) reset(); else if (!video.paused) begin(); });
  };
  const scan = () => document.querySelectorAll('video').forEach(bind);
  scan(); new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
