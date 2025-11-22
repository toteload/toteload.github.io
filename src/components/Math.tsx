import katex from 'katex';

export const Math: Component<PropsWithChildren> = ({children}) => {
  const output = katex.renderToString(children, {
    output: 'html',
  });

  return output;
};
