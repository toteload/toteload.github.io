import { Icon } from "./Icon.tsx";

export interface LinkProps {
  href?: string;
}

export const Link: Component<PropsWithChildren<LinkProps>> = (
  { children, href },
) => {
  const isExternal = href[0] != "/";
  return (
    <a class="main-link" href={href}>
      {children}
      {isExternal ? <Icon name="open-in-new" fillColor="var(--base-dark)" /> : null}
    </a>
  );
};
