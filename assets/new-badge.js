(() => {
  const card = document.querySelector('.case-new');
  const badge = card?.querySelector('.new-badge');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!badge || motion.matches || !('IntersectionObserver' in window)) return;

  let timer;
  const reveal = () => {
    clearTimeout(timer);
    badge.classList.replace('is-waiting', 'is-revealed');
    observer.disconnect();
    motion.removeEventListener('change', onMotionChange);
  };
  const onMotionChange = () => { if (motion.matches) reveal(); };
  const observer = new IntersectionObserver(entries => {
    clearTimeout(timer);
    if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5) {
      timer = setTimeout(reveal, 1000);
    }
  }, { threshold: 0.5 });

  // Static HTML is visible without JavaScript; only enhance this small label.
  badge.classList.add('is-waiting');
  observer.observe(card.querySelector('summary'));
  motion.addEventListener('change', onMotionChange);
})();
