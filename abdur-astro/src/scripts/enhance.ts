// Soft reveal on scroll. CSS gates the hidden state behind `html.js` and
// `prefers-reduced-motion: no-preference`, so without JS or with reduced
// motion everything is simply visible.
const reveals = document.querySelectorAll<HTMLElement>('.reveal');

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  reveals.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );
  reveals.forEach((el) => observer.observe(el));

  // Insurance: nothing may stay hidden if observation never fires
  // (printing, odd embedders, browser quirks).
  window.setTimeout(() => {
    reveals.forEach((el) => el.classList.add('is-visible'));
    observer.disconnect();
  }, 3000);
}
