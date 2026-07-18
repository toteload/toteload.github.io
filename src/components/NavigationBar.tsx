export interface NavigationBarProps {
}

export const NavigationBar: Component<NavigationBarProps> = ({}) => {
  return (
    <nav class="nav-top">
      <a href="/">About me</a>
      <a href="/posts">Posts</a>
    </nav>
  );
};
