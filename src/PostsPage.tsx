import { BasicLayout } from "@/BasicLayout.tsx";
import {PostMetaData} from "@/Post.tsx";
import {HoverPicture} from "@/components/index.tsx";

export type PostEntry = {
  url: string;
  meta: PostMetaData;
};

interface Props {
  entries: PostEntry[];
}

const pad2 = (n: number): string => String(n).padStart(2, "0");
const dateString = ({day, month, year}: Date): string => `${pad2(day)}-${pad2(month)}-${year}`;

export const PostsPage: Component<Props> = ({ entries }) => {
  return (
    <BasicLayout title="Posts - David Bos" useMainAsContainer>
      <HoverPicture kind="post" />
      <ol class="posts-list">
        {entries.map(({ url, meta: {title, published, exclude} }) => (
          <li class="post-entry">
            <time>{dateString(published)}</time>
            <a href={url}>{exclude ? '🚧' : ''}{title}</a>
          </li>
        ))}
      </ol>
    </BasicLayout>
  );
};
