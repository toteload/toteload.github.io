import { Link, CodeBlock, Picture, Figure } from '../components';

export const meta = {
  title: '🌈 Building a rainbow',
  publishDate: '16-01-2026',
  published: { day: 16, month: 1, year: 2026, },
  blurb: 'How to generate an image of the visible color spectrum from human color vision data.',
} as const;

export const Content: Component = () => {
  return (
    <>
<p>
  We are going to generate an image of the human visible color spectrum.
  Not quite a rainbow, but very colorful either way!
</p>
<p>
  But first: what determines the perceived color of light?
  That would be <Link href="https://en.wikipedia.org/wiki/Cone_cell">cone cells</Link> in your eyes, these are cells sensitive to light.
  A typical human has three different kinds of cone cells, that respond differently based on the wavelength of the light that hits the cell.
  The combined activation of these cone cells determines the perceived color.
</p>
<h2>Get human color vision data</h2>
<p>
  The human color vision data we will use is <Link href="https://cie.co.at/datatable/cie-1931-colour-matching-functions-2-degree-observer">publicly available</Link> and was originally published in 1931 (almost 100 years ago!).
  It is a mapping of wavelengths (in nm) to three values defining the <Link href="https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_XYZ_color_space">CIE XYZ color space</Link> and was gathered through a series of experiments where people had to match colors.
</p>
<p>
  Note that the three values are <em>not</em> activation values of the three different cone cells.
  You can still think of the values as some other kind of light sensitive sensors.
  The values produced by the mapping are called tristimulus values X, Y and Z.
  Y is an important value as it encodes the brightness.
</p>
<h2>Normalize XYZ values</h2>
<p>
  We will normalize our tristimulus relative to a <Link href="https://en.wikipedia.org/wiki/Standard_illuminant">standard illuminant</Link>.
  There are different such illuminants, but we will use D65 (usually assumed choice).
  Each standard illuminant is defined by a spectral power distribution which basically describes how much light at each wavelength that illuminant emits.
  This data is also <Link href="https://cie.co.at/datatable/cie-standard-illuminant-d65">available for download</Link>.
</p>
<p>
  We are going to integrate over this spectral power distribution to find the Y value for the D65 illuminant.
  This Y value encodes the brightness of D65 and we will accept it as unit brightness.
  To integrate we take all the D65 powers between 360 nm and 830 nm and multiply them with the y values from the CIE 1931 data between 360 nm and 830 nm, and then sum them.
</p>
<p>
  Interestingly, the XYZ data goes over a range of 360 to 830 nm, but the D65 data starts at 300 nm.
  So if you want to integrate yourself, make sure to map to the right wavelengths and not assume that both start at the same wavelength.
</p>
<p>
  Also, even though the CIE XYZ data goes from 360 nm to 830 nm, we can only see wavelengths between approximately 380 nm and 700 nm. 
  This means that the sides of our spectrum should be black in the end.
</p>
<h2>Convert XYZ to sRGB</h2>
<p>
  Lucky for us, a <Link href="https://en.wikipedia.org/wiki/SRGB#Primaries">CIE XYZ to sRGB mapping</Link> is readily available in the form of a matrix!
  According to Wikipedia, the X, Y, and Z values must be scaled such that the Y of D65 is 1.0.
  Good thing we already did this ☺️
</p>
<p>
  Also, the RGB color after the matrix multiplication is "linear", but RGB colors are not actually saved in this format for sRGB.
  You still need to apply so called <Link href="https://en.wikipedia.org/wiki/SRGB#Transfer_function_(%22gamma%22)">gamma correction</Link>.
  This changes how brightness values are distributed: instead of evenly spaced (linearly), more precision is given to dark values and less precision to bright values.
</p>
<h2>Lo and behold</h2>
<p>
  If we now render our spectrum it would be black, because the wavelength emissions are too weak.
  Remember that we are rendering light of a single wavelength, each with only a power of 1.
  This is very weak compared to our reference D65 illuminant.
  In order to get something visible we just have to increase the power.
  I have chosen 4,000 because it gives a nice, bright image without capping out any RGB channels.
  Now, we can finally see our beautiful, spectral rainbow in all its glory! 
</p>
<Figure caption="Wavelengths from 360 nm to 830 nm rendered as RGB colors.">
  <Picture 
    src="/assets/rainbow.png"
    width="471"
    height="81"
    style="align-self: center;"
  />
</Figure>
<h2>Corrections</h2>
<p>
  Actually, this image is not an accurate representation of the perceived color of each wavelength.
  Almost no purely spectral color can be displayed with sRGB.
  After the mapping from XYZ to RGB some of the channels will be negative, but we cannot display negative RGB values.
  A little disappointing 😔
  These values I clamped to 0, so that they are as close as possible to being accurate, but they will not look the same as real monochromatic light.
</p>
<h2>Afterthoughts</h2>
<p>
  You can use <Link href="/assets/visible_spectrum.py">this Python script</Link> to generate the image yourself.
  Data required for the script: <Link href="https://cie.co.at/datatable/cie-1931-colour-matching-functions-2-degree-observer">CIE XYZ data</Link> and <Link href="https://cie.co.at/datatable/cie-standard-illuminant-d65">D65 standard illuminant data</Link>.
</p>
<p>
  This colorspace stuff is pretty complicated, man.
</p>
    </>
  );
};
