const Handlebars = require('handlebars');
const { isIndex } = require('./utils');

const _HOME = '_HOME';

const breadcrumb = {
  path: '',
  title: '',
  children: [],
};

// 将查询到的文件排序，使 index 文件排在前面
function sort(a, b) {
  const aIsIndex = isIndex(a);
  const bIsIndex = isIndex(b);
  if ((aIsIndex && bIsIndex) || (!aIsIndex && !bIsIndex)) {
    return 0;
  }
  if (aIsIndex) return -1;
  return 1;
}

function saveBreadcrumb(pathName, title) {
  const paths = pathName.split('/').slice(0, -1);
  let cur = breadcrumb;
  for (let p of paths) {
    const index = cur.children.findIndex((c) => c.path === p);
    if (index >= 0) {
      cur = cur.children[index];
    } else {
      const next = {
        path: p,
        title: p,
        children: [],
      };
      cur.children.push(next);
      cur = next;
    }
  }
  if (paths.length > 0) {
    cur.title = title;
  }
}

function getBreadcrumb(pathName) {
  let path = '';
  const result = [
    {
      path,
      name: _HOME,
    },
  ];
  let cur = breadcrumb;
  const paths = pathName.split('/').slice(0, isIndex(pathName) ? -2 : -1);
  for (let p of paths) {
    const index = cur.children.findIndex((c) => c.path === p);
    path = `${path}${p}/`;
    const next = {
      path,
      name: cur.children[index].title,
    };
    result.push(next);
    cur = cur.children[index];
  }
  return result;
}

function renderBreadcrumb(breadcrumbs, base) {
  const divider = '<span class="breadcrumb-divider">/</span>';
  let result = '';
  for (let b of breadcrumbs) {
    const text =
      b.name === _HOME
        ? '<i data-feather="home" width="1em" height="1em"></i>'
        : b.name;
    result += `<span><a href="${base}${b.path}">${text}</a></span>`;
    result += divider;
  }
  return new Handlebars.SafeString(`<div class="breadcrumb">${result}</div>`);
}

module.exports = {
  sort,
  saveBreadcrumb,
  getBreadcrumb,
  renderBreadcrumb,
};
