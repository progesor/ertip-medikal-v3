type HastNode = {
  type?: string;
  children?: HastNode[];
};

function removeRawNodes(node: HastNode) {
  if (!Array.isArray(node.children)) return;

  node.children = node.children.filter((child) => child.type !== "raw");

  for (const child of node.children) {
    removeRawNodes(child);
  }
}

/**
 * Rehype plugin used in place of rehype-raw. Product descriptions keep
 * Markdown/GFM rendering, but embedded HTML is discarded before React renders
 * the tree. This prevents CMS-authored script, iframe and event-handler HTML
 * from becoming executable markup.
 */
export default function stripRawHtml() {
  return (tree: HastNode) => {
    removeRawNodes(tree);
  };
}
