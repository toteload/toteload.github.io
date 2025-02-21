// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import GithubSlugger from 'github-slugger';

const codePreTransformer = {
  pre(hast) {
    hast.properties['class'] = 'border p-3 rounded';
    delete hast.properties['tabindex'];
  },
};

// remark plugin that replaces markdown links with my own Link component.
const remarkUseLinkComponent = (options) => {
  return function (root) {
    if (root.type !== 'root') {
      return;
    }

    for (const child of root.children) {
      if (child.type === 'paragraph') {
        const p = child;

        // This might not be a good general solution, because we only
        // search 1 level deep in a paragraph.
        for (const x of p.children) {
          if (x.type === 'link') {
            x.type = 'mdxJsxTextElement';
            x.name = 'Link';
            x.attributes = [
              {
                type: 'mdxJsxAttribute',
                name: 'href',
                value: x.url,
              }
            ];
          }
        }
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://davidbos.me',
  integrations: [tailwind(), mdx()],
  markdown: {
    remarkPlugins: [
      remarkUseLinkComponent,
    ],
    shikiConfig: {
      theme: 'github-light-default',
      //theme: 'github-light',
      //theme: 'one-light',

      transformers: [
        codePreTransformer,
      ],
    },
  },
});
