export function showOverlay(msg = '', { duration = 2000, persist = false } = {}) {
  const el = document.createElement('div');
  el.className = 'overlay';
  el.textContent = msg;
  document.body.appendChild(el);

  if (!persist) {
    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => {
        el.remove();
      }, 300);
    }, duration);
  }

  return el;
}

export function showPopup(msg, { duration = 2000, corner = 'top-right' } = {}) {
  let container = document.querySelector(`.popup-container.${corner}`);
  if (!container) {
    container = document.createElement('div');
    container.className = `popup-container ${corner}`;
    document.body.appendChild(container);
  }

  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.textContent = msg;
  container.appendChild(popup);

  setTimeout(() => {
    popup.classList.add('fade-out');
    setTimeout(() => {
      popup.remove();
      if (container.childElementCount === 0) {
        container.remove();
      }
    }, 300);
  }, duration);

  return popup;
}
