// Accordion behavior for top-level and nested accordions
document.addEventListener('DOMContentLoaded', () => {
  const toggles = document.querySelectorAll('.accordion-toggle');

  // Simplified toggle: show/hide panels without animated height to avoid race conditions
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      let panel = btn.nextElementSibling;
      while (panel && !panel.classList.contains('accordion-panel')) {
        panel = panel.nextElementSibling;
      }
      if (!panel) return;

      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        panel.setAttribute('hidden', '');
        panel.style.maxHeight = null;
        panel.classList.remove('panel-open');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
        panel.style.maxHeight = null;
        panel.classList.add('panel-open');
      }
    });
  });

  // Optional: close other sibling panels when opening one (accordion behavior)
  // For nested accordions and top-level, keep independent; if you want exclusive open, implement here.

  // Certifications gallery controls: prev/next scrolling
  const galleries = document.querySelectorAll('.cert-gallery');
  galleries.forEach(gallery => {
    const track = gallery.querySelector('.cert-track');
    const prev = gallery.querySelector('.gallery-control.prev');
    const next = gallery.querySelector('.gallery-control.next');

    if (!track) return;

    const scrollBy = () => {
      const item = track.querySelector('.cert-item');
      return item ? Math.round(item.getBoundingClientRect().width + 12) : 300;
    };

    if (prev) prev.addEventListener('click', () => {
      track.scrollBy({ left: -scrollBy(), behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', () => {
      track.scrollBy({ left: scrollBy(), behavior: 'smooth' });
    });
  });

  // Theme toggle (persisted in localStorage)
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    body.classList.add('light-theme');
    if (themeToggle) themeToggle.checked = true;
  } else {
    // enforce dark-mode by default unless user previously selected light
    body.classList.remove('light-theme');
    if (themeToggle) themeToggle.checked = false;
  }

  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      const isLight = e.target.checked;
      body.classList.toggle('light-theme', isLight);
      try {
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
      } catch (err) {
        // ignore storage errors
      }
    });
  }

  // Certificate thumbnails -> modal PDF viewer
  function createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-content';

    const header = document.createElement('div');
    header.className = 'modal-header';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = 'Close';
    closeBtn.type = 'button';
    header.appendChild(closeBtn);

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'modal-body';
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-label', 'Certificate preview');
    iframe.style.display = 'none';
    const img = document.createElement('img');
    img.setAttribute('alt', '');
    img.style.display = 'none';
    bodyWrap.appendChild(iframe);
    bodyWrap.appendChild(img);

    modal.appendChild(header);
    modal.appendChild(bodyWrap);
    overlay.appendChild(modal);

    function close() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e){ if(e.key === 'Escape') close(); }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    // focus close button for accessibility
    closeBtn.focus();
    return { overlay, iframe, img, close };
  }

  const thumbs = document.querySelectorAll('.cert-thumb, .art-thumb');
  thumbs.forEach(t => {
    t.addEventListener('click', () => {
      const src = t.getAttribute('data-src');
      if (!src) return;
      const { iframe, img } = createModal();
      const lower = src.toLowerCase();
      if (lower.endsWith('.pdf')) {
        iframe.style.display = '';
        img.style.display = 'none';
        iframe.src = src;
      } else {
        img.style.display = '';
        iframe.style.display = 'none';
        img.src = src;
        // set alt from thumbnail if available
        const thumbImg = t.querySelector('img');
        if (thumbImg && thumbImg.alt) img.alt = thumbImg.alt;
      }
    });
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); } });
  });
});
