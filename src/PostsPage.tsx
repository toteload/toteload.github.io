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
    <BasicLayout title="Posts - David Bos" navImage="post">
      <p>
        This is where you can read bits of my writing. Most recent posts are at
        the top.
      </p>
      <ol class="posts-list">
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
