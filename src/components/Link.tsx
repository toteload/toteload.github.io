export interface LinkProps {
  href?: string;
}

export const Link: Component<PropsWithChildren<LinkProps>> = ({children, href}) => {
  return <a class="main-link" href={href}>{children}</a>;
};
