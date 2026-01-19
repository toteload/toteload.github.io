import { Picture } from './Picture';

export interface NavigationBarProps {
  image: 'home' | 'post';
}

export const NavigationBar: Component<NavigationBarProps> = ({image}) => {
  return (
    <header class="navigation-bar">
      <nav>
        <a href="/">HOME</a>
        <a href="/posts">POSTS</a>
      </nav>
      <div id="nav-status">
        <Picture
          id="img-default"
          src={`/assets/${image}-default.png`}
          alt=""
          width="48"
          height="48"
          style="image-rendering: pixelated;"
        />
        <Picture
          id="img-hover"
          src={`/assets/${image}-hover.png`}
          alt=""
          width="48"
          height="48"
          style="image-rendering: pixelated;"
        />
      </div>
    </header>
  );
};
