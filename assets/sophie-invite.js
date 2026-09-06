(() => {
  'use strict';
  const host = document.querySelector('.sophie-invite');
  const trigger = document.querySelector('.sophie-invite-trigger');
  const choices = document.querySelector('.sophie-invite-choices');
  const voice = document.querySelector('.floating-voice[data-voice-action]');
  const phone = document.querySelector('.sophie-call-widget[data-callback-open]');
  if (!host || !trigger || !choices || !voice || !phone) return;
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'sophie-invite-close';
  closeButton.setAttribute('aria-label', 'Sluiten / Close');
  closeButton.textContent = '×';
  choices.append(closeButton);
  const launchers = [voice, phone];
  // Move the real buttons, not copies: their existing event handlers and canvas stay intact.
  const homes = launchers.map(button => {
    const marker = document.createComment('Sophie launcher home');
    button.before(marker);
    return marker;
  });
  let opened = false;
  function close(returnFocus = false) {
    if (!opened) return;
    opened = false;
    launchers.forEach((button, index) => {
      button.getAnimations().forEach(animation => animation.cancel());
      homes[index].after(button);
    });
    choices.hidden = true;
    host.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus({preventScroll:true});
  }
  function open() {
    opened = true;
    choices.hidden = false;
    host.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    launchers.forEach((button, index) => {
      choices.insertBefore(button, closeButton);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && button.animate) {
        button.animate([
          {opacity:0, transform:`translate(${index ? 20 : -20}px, 10px) scale(.94)`},
          {opacity:1, transform:'translate(0, 0) scale(1)'}
        ], {duration:320,easing:'cubic-bezier(.2,.75,.2,1)'});
      }
      button.querySelectorAll('canvas').forEach(canvas => canvas.dispatchEvent(new Event('sophie:resize')));
    });
    voice.focus({preventScroll:true});
  }
  trigger.addEventListener('click', () => opened ? close(true) : open());
  closeButton.addEventListener('click', () => close(true));
  launchers.forEach(button => button.addEventListener('click', () => {
    if (!opened) return;
    close(false);
    button.focus({preventScroll:true});
    // Existing click handlers open only the chosen panel, not a call or microphone.
  }, true));
  document.addEventListener('keydown', event => {
    if (opened && event.key === 'Escape') {event.preventDefault();close(true);}
  });
  document.addEventListener('pointerdown', event => {
    if (opened && !host.contains(event.target)) close(false);
  });
  // If the contact row leaves the screen, restore both persistent corner launchers.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(() => {
      const rect = host.getBoundingClientRect();
      if (opened && (rect.bottom <= 0 || rect.top >= window.innerHeight)) close(false);
    }).observe(host);
  }
})();
