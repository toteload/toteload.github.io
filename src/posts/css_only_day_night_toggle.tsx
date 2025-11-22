import { Figure, Picture, Gallery } from '../components';
import { esc } from '../utils';

export const meta = {
  title: 'An animated, CSS-only day/night toggle',
  publishDate: '16-10-2023',
  published: { day: 16, month: 10, year: 2023, },
  blurb: 'Showing off a pretty, animated toggle (ab)using CSS box shadows.',
} as const;

export const Content: Component = () => {
  return (
    <>
      <Figure caption="Press me!">
        <input class="theme-toggle" type="checkbox" checked />
      </Figure>
      <h2>The toggle</h2>
      <p>
I made a fancy toggle switch that can switch from day to night
(enlarged on this page so you can see it better). Originally, I made it to be
used for switching between dark and light mode for a work related website.
However, in the end we didn't use it because it was _too_ fancy which didn't
match the overall style. In HTML the toggle is just <code>{esc('<input class="theme-toggle" type="checkbox" />')}</code>.
      </p>
<p>
All the styling and animation is done (ab)using CSS. It could use some
cleaning up, but I am not interested on working on it anymore 😅 Still, I find
it pretty unique so I wanted to show it off. Apart from the stars everything is
drawn using circles. The round button (sun or moon) is a square CSS
pseudo-element that had its corners rounded to make it a circle. Every other
circle is a just a box shadow of this element. The stars are created with
another pseudo-element where the contents are a Unicode symbol 🟄 (U+1F7C4). That
star is then copied using box shadows. 
</p>
<h2>Browser differences</h2>
<Gallery>
  <Figure caption="Render of the toggle in Chrome. The shape of the sunshine grows square.">
    <Picture 
      src="/assets/chrome_box_shadow.png"
      alt="Render of the toggle in Chrome"
      width="373"
      height="373"
      />
  </Figure>
  <Figure caption="Render of the toggle in Firefox. The shape of the sunshine stays a circle.">
  <Picture 
    src="/assets/firefox_box_shadow.png"
    alt="Render of the toggle in Chrome"
    width="373"
    height="373"
    />
  </Figure>
</Gallery>
<p>
I tested the toggle in Firefox and Chrome, and found some differences. Chrome
annoyingly stopped rendering the dark circle of the moon at certain zoom levels.
But what I found really interesting is that the two browsers determine box
shadow shapes differently! Firefox renders the bigger box shadows of the circle
as bigger circles, where as Chrome renders the bigger box shadows as bigger
squares with rounded corners. I don't know if there is an official spec for
this, but I find Firefox's behaviour to be more intuitive. I expect the shape of
the box shadow to be the same as the shape of the source element.
</p>
    </>
  );
}
