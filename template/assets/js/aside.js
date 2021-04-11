function initAside() {
  const asideBtn = document.querySelector('.aside-btton');
  if (asideBtn) {
    asideBtn.addEventListener('click', openAside);
  }
  const asideMask = document.querySelector('.aside-mask');
  if (asideMask) {
    asideMask.addEventListener('click', closeAside);
  }
}

function openAside() {
  const aside = document.querySelector('aside');
  if (aside) {
    aside.classList.add('open');
  }
}

function closeAside() {
  const aside = document.querySelector('aside');
  if (aside) {
    aside.classList.remove('open');
  }
}

export { initAside };
