import { debounce } from 'lodash';

const hashs = [];

window.addEventListener('load', function () {
  document.querySelectorAll('aside a').forEach(function (element) {
    hashs.push(decodeURIComponent(element.hash));
  });

  window.addEventListener('hashchange', onHashChange);

  document.querySelector('main').addEventListener('scroll', onScroll);

  scrollToHash(decodeURIComponent(location.hash));
});

function onHashChange(e) {
  e.preventDefault();
  scrollToHash(decodeURIComponent(location.hash));
}

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

const onScroll = debounce(activeAsideLink, 200);

function scrollToHash(hash) {
  const id = hash.replace(/^#/, '');
  if (id) {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView();
    }
  } else {
    document.querySelector('main').scrollTo(0, 0);
  }
}

function elementUnderTopEdge(element) {
  return element.getBoundingClientRect().top > 57;
}
