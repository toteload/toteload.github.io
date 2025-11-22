import { BasicLayout } from './BasicLayout';

interface Date {
  day: number;
  month: number;
  year: number;
}

export interface PostMetaData {
  title: string;
  publishDate: string;
  published: Date;
  blurb: string;
  tags?: string[];
}

export interface Post {
  meta: PostMetaData;
  Content: Component;
}

const monthName = (month: number): string => {
  switch (month) {
    case 1: return 'January';
    case 2: return 'February';
    case 3: return 'March';
    case 4: return 'April';
    case 5: return 'May';
    case 6: return 'June';
    case 7: return 'July';
    case 8: return 'August';
    case 9: return 'September';
    case 10: return 'October';
    case 11: return 'November';
    case 12: return 'December';
    default: throw new Error(`Invalid month number ${month}`);
  }
};

const dateToHumanReadable = (date: Date): string => {
  const month = monthName(date.month);
  const { day, year } = date;

  return `${day} ${month} ${year}`;
};

export const Post: Component<Post> = ({meta, Content}) => {
  return (
    <BasicLayout title={meta.title} navImage="post">
      <article class="post-article">
        <header>
          <h1>{meta.title}</h1>
          <span id="published">Published on <time>{dateToHumanReadable(meta.published)}</time></span>
        </header>
        <Content />
      </article>
    </BasicLayout>
  );
};
