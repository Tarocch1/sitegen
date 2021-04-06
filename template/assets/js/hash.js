import { debounce } from 'lodash';

const hashs = [];

window.addEventListener('load', function () {
  document.querySelectorAll('aside a').forEach(function (element) {
    hashs.push(decodeURIComponent(element.hash));
  });

  window.addEventListener('scroll', debounce(activeAsideLink, 200));

  activeAsideLink();
});

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
  return element.getBoundingClientRect().top > 0;
}
