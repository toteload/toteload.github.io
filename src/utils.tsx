export const esc = (text: string): string => {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll(`'`, '&apos;');
};

export const render = <TProps extends BaseProps>(component: Component<TProps>, props: TProps): string => {
  return component(props);
};
