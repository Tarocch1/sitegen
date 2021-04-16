import feather from 'feather-icons';
import { initHash } from './hash';
import { initAside } from './aside';
import { initMermaid } from './mermaid';
import '../style/index.less';

window.addEventListener('load', function () {
  feather.replace();
  initHash();
  initAside();
  initMermaid();
});
