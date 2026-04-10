import { Picture } from "./Picture.tsx";

export interface NavigationBarProps {
  image: "home" | "post";
}

export const NavigationBar: Component<NavigationBarProps> = ({ image }) => {
  return (
    <header class="navigation-bar">
      <nav>
        <a href="/">About me</a>
        <a href="/posts">Posts</a>
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
