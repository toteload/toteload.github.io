export interface FigureProps {
  caption?: string;
}

export const Figure: Component<PropsWithChildren<FigureProps>> = ({children, caption}) => {
  return (
    <figure>
      {children}
      {caption && (<figcaption>{caption}</figcaption>)}
    </figure>
  );
};
