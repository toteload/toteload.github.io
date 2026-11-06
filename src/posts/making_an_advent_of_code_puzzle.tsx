import { CodeBlock, Link, Math } from "../components/index.tsx";

export const meta = {
  title: "Designing an Advent of Code puzzle",
  published: { day: 22, month: 9, year: 2026 },
  exclude: true,
} as const;

export const Content: Component = () => {
  return (
    <>
      <p>
        For my work at Infi I designed a puzzle for Advent of Code.
        Each year, we sponsor Advent of Code and in the side bar on the Advent of Code website
        we then link to our own yearly puzzle.
        This post is about how I designed the puzzle and some of the challenges I encountered along the way.
        The puzzle can be found on <Link href="https://aoc.infi.nl">Infi's Advent of Code page</Link>. 
      </p>
      <p>
        I already had a vague idea for what I wanted the puzzle to be about; speeding up a calculation that is presented as a loop over a large <code>N</code> where the result of the previous iteration feeds into the next iteration. 
        The <code>N</code> will be large enough to make simply executing the loop infeasible.
        At first glance this would seem impossible due to the loop dependency, but of course there is some clever trickery you can do.
      </p>
      <h2>Puzzle description</h2>
      <p>
        Short description of the puzzle here (both part one and two).
      </p>
      <h2>Turning an O(n) loop O(log(n))</h2>
      <p>
        As a demonstration, we are going to optimize a loop that computes a multiplication in the way mentioned above.
      </p>
      <CodeBlock
        lang="typescript"
        code={`
function mul(a: number, b: number) {
  let res = 0;
  while (b--) {
    res += a;
  }

  return res;
}`} />
      <p>
        The function adds <code>a</code> <code>b</code> times to an accumulator that is initialized to 0.
        If we write out this expansion you get <code>((((0 + a) + a) ...) + a)</code> with <code>a</code> occuring <code>b</code> times.
        I added the parentheses to clarify the order of the calculations, but from an algebraic perspective they add nothing because addition is associative.
        In other words, we can add parentheses however we wish and it will not change the result.
        So we could, using some completely arbitrarily chosen example, write
        <code>0 + (((a + a) + (a + a)) + ((a + a) + (a + a))) + ...</code>.
      </p>
      <CodeBlock
        code={`
(((a + a) + (a + a)) + ((a + a) + (a + a))) =
(((  b  ) + (  b  )) + ((  b  ) + (  b  ))) =
((        c        ) + (        c        )) =
(                    d                    )
`} />
    </>
  );
};
