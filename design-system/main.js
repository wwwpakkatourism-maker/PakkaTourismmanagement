/* ════════════════════════════════════════════════════
   PAKKA TOURISM — JAVASCRIPT INTERACTIONS
   main.js
   ════════════════════════════════════════════════════ */

'use strict';

// ─── THEME TOGGLE ─────────────────────────────────
(function initTheme() {
  const btn   = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('pt-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn(saved);

  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pt-theme', next);
    updateThemeBtn(next);
  });

  function updateThemeBtn(theme) {
    btn.innerHTML = theme === 'dark'
      ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 1.5a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 13.5zm0-12a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 1.5zm6.5 6a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 14.5 8zM2.5 8a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 2.5 8z"/></svg> Light`
      : `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/></svg> Dark`;
  }
})();

// ─── SIDEBAR ACTIVE NAV ────────────────────────────
(function initSidebarNav() {
  const items = document.querySelectorAll('.sidebar-item');
  const sections = document.querySelectorAll('.ds-section');

  function setActive(id) {
    items.forEach(i => i.classList.remove('active'));
    const target = document.getElementById('nav-' + id);
    if (target) target.classList.add('active');
  }

  // Click
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.slice(1);
        setActive(id);
      }
    });
  });

  // Scroll spy
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();

// ─── TOAST CLOSE ──────────────────────────────────
document.querySelectorAll('.toast-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const toast = btn.closest('.toast');
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(16px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  });
});

// ─── BANNER CLOSE ─────────────────────────────────
document.querySelectorAll('.banner-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const banner = btn.closest('.banner');
    banner.style.opacity = '0';
    banner.style.maxHeight = banner.offsetHeight + 'px';
    banner.style.transition = 'all 0.25s ease';
    requestAnimationFrame(() => {
      banner.style.maxHeight = '0';
      banner.style.padding = '0';
      banner.style.marginBottom = '0';
    });
    setTimeout(() => banner.remove(), 260);
  });
});

// ─── NOTIFICATION BELL OUTSIDE CLICK ──────────────
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  const btn   = document.getElementById('bell-btn');
  if (panel && btn && !btn.contains(e.target) && !panel.contains(e.target)) {
    panel.classList.remove('open');
  }
});

// ─── MARK ALL READ ────────────────────────────────
const markAll = document.querySelector('.notif-mark-all');
if (markAll) {
  markAll.addEventListener('click', () => {
    document.querySelectorAll('.notif-item.unread').forEach(item => {
      item.classList.remove('unread');
    });
    document.querySelectorAll('.notif-unread-dot').forEach(dot => dot.remove());
    const badge = document.querySelector('.notif-badge');
    if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
  });
}

// ─── TOAST TRIGGER ────────────────────────────────
const toastMessages = [
  { type: 'success', icon: '✓', title: 'Booking Saved',    msg: 'PKG-00435 created successfully' },
  { type: 'info',    icon: 'ℹ', title: 'Lead Assigned',    msg: 'Corporate group assigned to Priya' },
  { type: 'warning', icon: '⚠', title: 'Invoice Due',      msg: 'INV-2025-083 due in 2 days' },
  { type: 'error',   icon: '✗', title: 'Sync Failed',      msg: 'WhatsApp integration timeout — retry' },
];
let toastIdx = 0;

window.triggerToast = function() {
  const area = document.getElementById('toast-area');
  const data = toastMessages[toastIdx % toastMessages.length];
  toastIdx++;

  const toast = document.createElement('div');
  toast.className = `toast ${data.type}`;
  toast.innerHTML = `
    <div class="toast-icon">${data.icon}</div>
    <div class="toast-content">
      <div class="toast-title">${data.title}</div>
      <div class="toast-msg">${data.msg}</div>
    </div>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;
  area.prepend(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(16px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  });

  // Auto-dismiss after 5s
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(16px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 260);
    }
  }, 5000);
};

// ─── TAB BUTTONS ──────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const group = this.closest('.card-header-actions');
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

// ─── EXPORT TOKENS ────────────────────────────────
document.getElementById('export-btn').addEventListener('click', () => {
  const styles = getComputedStyle(document.documentElement);
  const tokens = [
    '--color-bg-primary', '--color-bg-surface', '--color-bg-elevated',
    '--color-border', '--color-text-primary', '--color-text-secondary',
    '--color-accent', '--color-success', '--color-warning', '--color-danger',
    '--color-info', '--blue-500', '--emerald-500', '--slate-500',
    '--font-sans', '--font-mono',
    '--text-display', '--text-h1', '--text-h2', '--text-h3', '--text-body',
    '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-2xl',
    '--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl',
    '--duration-fast', '--duration-normal', '--duration-slow',
  ];

  let output = '/* Pakka Tourism Design Tokens — Exported */\n:root {\n';
  tokens.forEach(t => {
    const val = styles.getPropertyValue(t).trim();
    output += `  ${t}: ${val};\n`;
  });
  output += '}';

  const blob = new Blob([output], { type: 'text/css' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pakka-tourism-tokens.css';
  a.click();
  URL.revokeObjectURL(a.href);
});

// ─── KANBAN DRAG (BASIC) ──────────────────────────
(function initKanban() {
  let dragged = null;

  document.querySelectorAll('.kanban-card').forEach(card => {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', function(e) {
      dragged = this;
      setTimeout(() => this.style.opacity = '0.4', 0);
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', function() {
      this.style.opacity = '1';
      dragged = null;
      document.querySelectorAll('.kanban-cards').forEach(col => {
        col.classList.remove('drag-over');
      });
    });
  });

  document.querySelectorAll('.kanban-cards').forEach(col => {
    col.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.classList.add('drag-over');
    });
    col.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });
    col.addEventListener('drop', function(e) {
      e.preventDefault();
      if (dragged && dragged.closest('.kanban-cards') !== this) {
        this.appendChild(dragged);
        // Update column count
        const col = this.closest('.kanban-col');
        const countEl = col.querySelector('.kanban-col-count');
        const oldCol  = dragged._originCol;
        if (countEl) countEl.textContent = this.children.length;
      }
      this.classList.remove('drag-over');
    });
  });
})();

// ─── COLOR SWATCH COPY ────────────────────────────
document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.setAttribute('title', 'Click to copy color');
  swatch.style.cursor = 'pointer';
  swatch.addEventListener('click', function() {
    const bg = getComputedStyle(this).backgroundColor;
    navigator.clipboard.writeText(bg).then(() => {
      const tip = document.createElement('span');
      tip.textContent = 'Copied!';
      tip.style.cssText = `
        position:fixed;bottom:20px;right:20px;
        background:#0F172A;color:#fff;
        padding:8px 16px;border-radius:12px;
        font-size:13px;font-family:Inter,sans-serif;
        z-index:9999;animation:slideIn .3s ease;
      `;
      document.body.appendChild(tip);
      setTimeout(() => tip.remove(), 1500);
    });
  });
});

// ─── SMOOTH SCROLL ────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

console.log('%c Pakka Tourism Design System v1.0 ', 'background:#2563EB;color:#fff;padding:4px 12px;border-radius:6px;font-weight:bold;');
