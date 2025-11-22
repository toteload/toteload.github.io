import { jsxDEV, Fragment as FragmentDEV } from './jsx-dev-runtime';

// Functions in this file get called when `NODE_ENV=production`.
// Otherwise `jsx-dev-runtime.ts` will be used for JSX transformations.

export function jsx(
  tag: string | ((props: PropsWithChildren) => string), 
  props: PropsWithChildren, 
  ...rest: any[]): string 
{
  return jsxDEV(tag, props);
}

export function jsxs(
  tag: string | ((props: PropsWithChildren) => string), 
  props: PropsWithChildren, 
  ...rest: any[]): string 
{
  return jsx(tag, props, ...rest);
}

export function Fragment(props: PropsWithChildren) {
  return FragmentDEV(props);
}
