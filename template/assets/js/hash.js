import { debounce } from 'lodash';

const hashs = [];

window.addEventListener('load', function () {
  document.querySelectorAll('aside a').forEach(function (element) {
    const url = new URL(element.href);
    hashs.push(decodeURIComponent(url.hash));
    element.addEventListener('click', onLinkClick);
  });
  document.querySelectorAll('.header-anchor').forEach(function (element) {
    element.addEventListener('click', onLinkClick);
  });

  window.addEventListener('hashchange', onHashChange);

  document
    .querySelector('article')
    .addEventListener('scroll', debounce(activeLink, 200));

  scrollToHash(location.hash);
});

function onLinkClick(e) {
  e.preventDefault();
  const url = new URL(e.target.href);
  history.pushState({}, '', url.hash);
  scrollToHash(url.hash);
}

function onHashChange(e) {
  e.preventDefault();
  scrollToHash(location.hash);
}

function scrollToHash(hash) {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (id) {
    const element = document.querySelector(`#${id}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  } else {
    document.querySelector('article').scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}

function activeLink() {
  let cur = '';
  for (const hash of hashs) {
    if (elementInView(document.querySelector(hash))) {
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

function elementInView(element) {
  return element.getBoundingClientRect().top > 0;
}
