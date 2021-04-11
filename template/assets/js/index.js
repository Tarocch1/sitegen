import { initHash } from './hash';
import { initAside } from './aside';
import { initMermaid } from './mermaid';

window.addEventListener('load', function () {
  initHash();
  initAside();
  initMermaid();
});
