import mermaid from 'mermaid';

function initMermaid() {
  if (mermaid) {
    mermaid.initialize(_MERMAID_CONFIG_);
  }
}

export { initMermaid };
