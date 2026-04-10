import { Fragment as FragmentDEV, jsxDEV } from "./jsx-dev-runtime.ts";

// Functions in this file get called when `NODE_ENV=production`.
// Otherwise `jsx-dev-runtime.ts` will be used for JSX transformations.

export function jsx(
  tag: string | ((props: PropsWithChildren) => string),
  props: PropsWithChildren,
  key?: string,
): string {
  return jsxDEV(tag, props, key);
}

export function jsxs(
  tag: string | ((props: PropsWithChildren) => string),
  props: PropsWithChildren,
  key?: string,
): string {
  return jsx(tag, props, key);
}

export function Fragment(props: PropsWithChildren) {
  return FragmentDEV(props);
}
