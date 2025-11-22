import { Picture } from './Picture';

export interface NavigationBarProps {
  image: 'home' | 'post';
}

export const NavigationBar: Component<NavigationBarProps> = ({image}) => {
  return (
    <header class="navigation-bar">
      <div id="nav-status">
        <Picture
          id="img-default"
          src={`/assets/${image}-default.png`}
          width="48"
          height="48"
        />
        <Picture
          id="img-hover"
          src={`/assets/${image}-hover.png`}
          width="48"
          height="48"
        />
      </div>
      <nav>
        <a href="/">HOME</a>
        <a href="/posts">POSTS</a>
      </nav>
    </header>
  );
};
