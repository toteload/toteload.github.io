import { BasicLayout } from "@/BasicLayout.tsx";

export type PostEntry = {
  url: string;
  title: string;
  blurb: string;
};

interface Props {
  entries: PostEntry[];
}

export const PostsPage: Component<Props> = ({ entries }) => {
  return (
    <BasicLayout title="Posts - David Bos">
      <ol class="posts-list basic-container">
        {entries.map(({ url, title, blurb }) => (
          <li class="post-entry">
            <a href={url}>{title}</a>
            <p>{blurb}</p>
          </li>
        ))}
      </ol>
    </BasicLayout>
  );
};
