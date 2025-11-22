function isVoidElement(tag: string): boolean {
  const tags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ];

  return tags.includes(tag);
}

export function jsxDEV(
  tag: string | Component, 
  props: PropsWithChildren, 
  ...rest: any[]): string 
{
  if (typeof tag === "function") {
    return tag(props);
  }

  let inner = "";
  if (typeof props.children === "string") {
    inner = props.children;
  } else if (Array.isArray(props.children)) {
    inner = props.children.flat(Infinity).join("");
  }

  let attributes = "";
  for (const [attrName, val] of Object.entries(props)) {
    if (attrName === 'children') {
      continue;
    }

    attributes += ` ${attrName}="${val}"`;
  }

  if (isVoidElement(tag)) {
    if (inner) {
      console.warn(`${tag} should not have children, but has "${inner}"`);
    }

    return `<${tag}${attributes}>`;
  }

  return `<${tag}${attributes}>${inner}</${tag}>`;
}

export function Fragment(props: PropsWithChildren): string {
  let inner = "";
  if (typeof props.children === "string") {
    inner = props.children;
  } else if (Array.isArray(props.children)) {
    inner = props.children.join("");
  }

  return inner;
}
