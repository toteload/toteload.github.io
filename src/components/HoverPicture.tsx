export interface HoverPictureProps {
  kind: "home" | "post";
}

export const HoverPicture: Component<HoverPictureProps> = ({ kind }) => {
  return (
    <div class="hover-picture">
      <img
        class="hover-picture-default"
        src={`/assets/${kind}-default.png`}
        alt=""
        width="48"
        height="48"
        style="image-rendering: pixelated;"
      />
      <img
        class="hover-picture-hover"
        src={`/assets/${kind}-hover.png`}
        alt=""
        width="48"
        height="48"
        style="image-rendering: pixelated;"
      />
    </div>
  );
};
