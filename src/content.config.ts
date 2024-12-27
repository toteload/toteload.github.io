import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/posts' }),
});

export const collections = { posts };
