export interface HoverPictureProps {
  kind: "home" | "post";
}

export const HoverPicture: Component<HoverPictureProps> = ({ kind }) => {
  return (
    <div class="hover-picture">
      <Picture
        class="hover-picture-default"
        src={`/assets/${image}-default.png`}
        alt=""
        width="48"
        height="48"
        style="image-rendering: pixelated;"
      />
      <Picture
        id="hover-picture-hover"
        src={`/assets/${image}-hover.png`}
        alt=""
        width="48"
        height="48"
        style="image-rendering: pixelated;"
      />
    </div>
  );
};
