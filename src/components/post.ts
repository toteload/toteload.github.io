import type { CollectionEntry } from 'astro:content';

export interface PostDate {year: number; month: number; day: number}

export interface Post {
  id: string;
  title: string;
  publishDate: PostDate;
  isDraft: boolean;
  tags: string[];
}

export function parsePostDate(d: string): PostDate {
  const year = parseInt(d.slice(-4));
  const month = parseInt(d.slice(3, -5));
  const day = parseInt(d.slice(0, 2));

  return { year, month, day };
}

export function postDateToString({year, month, day}: PostDate): string {
  // Padding year is not necessary, because I, nor this website, will make it to the year 10,000
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function comparePostDate(a: PostDate, b: PostDate): (-1 | 0 | 1) {
  const dYear = a.year - b.year;
  const dMonth = a.month - b.month;
  const dDay = a.day - b.day;

  if (dYear !== 0) {
    return Math.sign(dYear) as (-1 | 0 | 1);
  }

  if (dMonth !== 0) {
    return Math.sign(dMonth) as (-1 | 0 | 1);
  }

  if (dDay !== 0) {
    return Math.sign(dDay) as (-1 | 0 | 1);
  }

  return 0;
}

export function parsePostData({id, data: {title, isDraft, publishDate, tags}}: CollectionEntry<'posts'>): Post {
  return {
    id,
    title,
    isDraft: isDraft ?? false,
    publishDate: parsePostDate(publishDate),
    tags: tags ?? [],
  };
}