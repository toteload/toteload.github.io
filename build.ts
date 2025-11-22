import fs from 'node:fs/promises';
import path from 'node:path';
import { HomePage } from '@/HomePage';
import { PostsPage } from '@/PostsPage';
import { Post } from '@/Post';

const dist = 'docs';

await fs.rm(dist, {force: true, recursive: true});

await Promise.all([
  fs.cp('assets', path.join(dist, 'assets'), {recursive: true}),
  fs.cp('style.css', path.join(dist, 'style.css')),
  fs.cp('favicon.png', path.join(dist, 'favicon.png')),
]);

const renderPosts = async (postsPath: string) => {
  const filenames = await fs.readdir(postsPath, {withFileTypes: true});

  const promises = [];
  for (const f of filenames) {
    if (!f.isFile() || path.extname(f.name) !== '.tsx') {
      continue;
    }

    console.log(`Found post ${f.name}`);

    const filename = path.join(postsPath, f.name);
    const { meta, Content } = require(Bun.pathToFileURL(filename).href);
    if (meta.isDraft) {
      console.log(`${f.name} is in draft. Skipping...`);
      continue;
    }
    const p = Bun.write(path.join(dist, 'posts', path.basename(f.name, '.tsx')) + '.html', Post({meta, Content}));
    promises.push(p);
  }

  await Promise.all(promises);
};

await Promise.all([
  Bun.write(path.join(dist, 'index.html'), HomePage()),
  Bun.write(path.join(dist, 'posts', 'index.html'), PostsPage({postsPath: 'src/posts'})),
  renderPosts('src/posts'),
]);
