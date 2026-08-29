// Gallery lightbox on a native <dialog>: Esc + focus containment come free;
// arrow keys, swipe, backdrop click, and adjacent preloading added here.
// Without JS the gallery cards are plain links to detail pages.
const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
const triggers = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-lightbox]'));

if (dialog && triggers.length > 0 && typeof dialog.showModal === 'function') {
  const image = document.getElementById('lb-image') as HTMLImageElement;
  const title = document.getElementById('lb-title')!;
  const log = document.getElementById('lb-log')!;
  const link = document.getElementById('lb-link') as HTMLAnchorElement;
  const status = document.getElementById('lb-status')!;
  const inner = dialog.querySelector<HTMLElement>('[data-lb-inner]')!;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = triggers.length;
  let current = 0;
  let opener: HTMLElement | null = null;

  const preload = (index: number) => {
    const src = triggers[(index + count) % count]?.dataset.lbSrc;
    if (src) new Image().src = src;
  };

  const render = (index: number) => {
    current = (index + count) % count;
    const data = triggers[current].dataset;
    if (!reducedMotion) {
      image.classList.add('lb-loading');
    }
    image.src = data.lbSrc ?? '';
    image.alt = data.lbAlt ?? '';
    title.textContent = data.lbTitle ?? '';
    log.textContent = data.lbLog ?? '';
    link.href = data.lbHref ?? '#';
    status.textContent = `${data.lbTitle}, photograph ${current + 1} of ${count}`;
    preload(current + 1);
    preload(current - 1);
  };

  image.addEventListener('load', () => image.classList.remove('lb-loading'));

  const open = (index: number, trigger: HTMLElement) => {
    opener = trigger;
    render(index);
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', (event) => {
      // Let modified clicks (new tab etc.) behave like the plain link they are.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(index, trigger);
    });
  });

  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    image.src = '';
    opener?.focus();
  });

  document.getElementById('lb-close')?.addEventListener('click', () => dialog.close());
  document.getElementById('lb-prev')?.addEventListener('click', () => render(current - 1));
  document.getElementById('lb-next')?.addEventListener('click', () => render(current + 1));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      render(current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      render(current + 1);
    }
  });

  // A click on the dialog surface outside the content closes the viewer.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === inner) dialog.close();
  });

  // Horizontal swipe navigates.
  let startX = 0;
  let startY = 0;
  dialog.addEventListener(
    'touchstart',
    (event) => {
      startX = event.changedTouches[0].clientX;
      startY = event.changedTouches[0].clientY;
    },
    { passive: true },
  );
  dialog.addEventListener(
    'touchend',
    (event) => {
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        render(dx < 0 ? current + 1 : current - 1);
      }
    },
    { passive: true },
  );
}
