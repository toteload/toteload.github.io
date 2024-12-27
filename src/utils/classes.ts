type ClassLike = (false | null | undefined | string)[];

export function classes(...cs: ClassLike): string {
  return cs.filter((s) => !!s).join(' ');
}
