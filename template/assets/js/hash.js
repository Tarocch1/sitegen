import { debounce } from 'lodash-es';

const hashs = [];

function initHash() {
  document.querySelectorAll('aside ul a').forEach(function (element) {
    hashs.push(decodeURIComponent(element.hash));
  });

  window.addEventListener('scroll', onScroll);
}

const onScroll = debounce(activeAsideLink, 200);

function activeAsideLink() {
  let cur = '';
  for (const hash of hashs) {
    if (elementUnderTopEdge(document.querySelector(hash))) {
      break;
    }
    cur = hash;
  }
  document.querySelectorAll('aside a.active').forEach(function (element) {
    element.classList.remove('active');
  });
  if (cur) {
    document.querySelector(`aside a[href="${cur}"]`).classList.add('active');
  }
}

function elementUnderTopEdge(element) {
  return element.getBoundingClientRect().top > 57;
}

export { initHash };
