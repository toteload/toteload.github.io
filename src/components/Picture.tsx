export interface PictureProps {
  alt?: string;
  id?: string;
  style?: string;
  width: string;
  height: string;
  src: string;
}

export const Picture: Component<PictureProps> = (props) => {
  return <img {...props} />;
};
