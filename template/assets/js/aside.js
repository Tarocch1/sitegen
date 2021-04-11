function initAside() {
  const asideBtn = document.querySelector('.aside-btton');
  asideBtn.addEventListener('click', toggleAside);

  const asideMask = document.querySelector('.aside-mask');
  asideMask.addEventListener('click', closeAside);
}

function toggleAside() {
  const aside = document.querySelector('aside');
  aside.classList.toggle('open');
}

function closeAside() {
  const aside = document.querySelector('aside');
  aside.classList.remove('open');
}

export { initAside };
