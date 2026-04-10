import { HomePage } from "@/HomePage.tsx";
import { PostsPage } from "@/PostsPage.tsx";
import { Post, type PostProps } from "@/Post.tsx";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outputDir = "./docs";
const postsPath = "@/posts/";

type Unpacked<T, F extends keyof T> = Omit<T, F> & T[F];

type PostData = Unpacked<PostProps, "meta"> & { url: string; name: string };

async function getPostsData() {
  const baseURL = import.meta.resolve(postsPath);
  const postsDir = fileURLToPath(baseURL);
  const files = await fs.readdir(postsDir, { withFileTypes: true });

  const data: PostData[] = [];
  for (const file of files) {
    if (!file.isFile() || path.extname(file.name) !== ".tsx") {
      continue;
    }

    try {
      const { meta, Content } = await import(new URL(file.name, baseURL));

      if (meta.exclude) {
        continue;
      }

      const name = path.basename(file.name, ".tsx");
      const url = "/posts/" + name;
      data.push({ ...meta, url, name, Content });
    } catch (e) {
      console.error(e);
    }
  }

  data.sort(({ published: a }, { published: b }) => {
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

  return data;
}

async function buildPosts() {
  const data = await getPostsData();

  await fs.mkdir(path.join(outputDir, "posts"));

  const index = fs.writeFile(
    path.join(outputDir, "posts", "index.html"),
    <PostsPage entries={data} />,
  );

  await Promise.all([
    index,
    ...data.map((props) => {
      console.log(`Generate "${props.name}"`);
      fs.writeFile(
        path.join(outputDir, "posts", `${props.name}.html`),
        <Post meta={props} Content={props.Content} />,
      );
    }),
  ]);
}

async function copyAssets() {
  const asset = (name) => path.join("assets", name);
  const out = (name) => path.join(outputDir, name);

  await Promise.all([
    fs.cp(asset("CNAME"), out("CNAME")),
    fs.cp(asset("style.css"), out("style.css")),
    fs.cp(asset("favicon.png"), out("favicon.png")),
    fs.cp(asset("assets"), outputDir, { recursive: true }),
  ]);
}

async function build() {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir);

  await Promise.all([
    fs.writeFile(path.join(outputDir, "index.html"), <HomePage />),
    copyAssets(),
    buildPosts(),
  ]);
}

await build();

console.log("Done!");
