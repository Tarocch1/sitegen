function initAside() {
  const asideBtn = document.querySelector('.aside-button');
  asideBtn.addEventListener('click', operateAside.bind(window, 'toggle'));

  const asideMask = document.querySelector('.aside-mask');
  asideMask.addEventListener('click', operateAside.bind(window, 'remove'));
}

function operateAside(operate) {
  const aside = document.querySelector('aside');
  aside.classList[operate]('open');
}

export { initAside };
