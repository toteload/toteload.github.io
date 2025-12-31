import fs from 'node:fs';
import path from 'node:path';
import { BasicLayout } from '@/BasicLayout';
import { type PostMetaData } from '@/Post';

interface Props {
  postsPath: string;
}

export const PostsPage: Component<Props> = ({postsPath}) => {
  const files = fs.readdirSync(postsPath, {withFileTypes: true});
  const postData = [];
  for (const file of files) {
    if (!file.isFile() || path.extname(file.name) !== '.tsx') {
      continue;
    }

    try {
      const { meta } = require(Bun.pathToFileURL(path.join(file.path, file.name)).href);
      const url = '/posts/' + path.basename(file.name, '.tsx');
      postData.push({...meta, url });
    } catch (e) {
      console.error(e);
    }
  }

  postData.sort(({published: a}, {published: b}) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    if (a.month !== b.month) {
      return a.month - b.month;
    }

    if (a.day !== b.day) {
      return a.day - b.day;
    }

    return 0;
  }).reverse();

  return (
    <BasicLayout title="Posts - David Bos" navImage="post">
      <p>
        This is where you can read bits of my writing.
        Most recent posts are at the top.
      </p>
      <ol class="posts-list">
      {postData.map((data) => <PostEntry {...data} as="li" />)}
      </ol>
    </BasicLayout>
  );
};

type PostEntryProps = {
  as: string;
  url: string;
} & PostMetaData;

const PostEntry: Component<PostEntryProps> = ({as: Tag, url, title, publishDate, blurb}) => {
  return (
    <Tag class="post-entry">
      <a href={url}>{title}</a>
      <p>{blurb}</p>
    </Tag>
  );
};

