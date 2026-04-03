import csv
import numpy as np
from PIL import Image

def read_csv(filename):
    f = open(filename)
    return list(csv.reader(f))

# M_RGB_TO_XYZ and M_XYZ_TO_RGB are from Bruce Lindbloom.
# Wikipedia also has a matrix for XYZ to RGB, but it is slightly different!
# https://en.wikipedia.org/wiki/SRGB#Primaries
# http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
M_XYZ_TO_RGB = np.array([
    [ 3.2404542, -1.5371385, -0.4985314],
    [-0.9692660,  1.8760108,  0.0415560],
    [ 0.0556434, -0.2040259,  1.0572252],
])

M_RGB_TO_XYZ = np.linalg.inv(M_XYZ_TO_RGB)

def XYZ_to_RGB(xyz):
    return M_XYZ_TO_RGB @ xyz

def RGB_to_XYZ(rgb):
    return M_RGB_TO_XYZ @ rgb

def RGB_to_sRGB(c):
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * (c ** (1 / 2.4)) - 0.055)

def sRGB_to_RGB(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

# https://en.wikipedia.org/wiki/ICtCp#In_IPT
M_XYZ_TO_LMS = np.array([
    [ 0.4002, 0.7075, -0.0807],
    [-0.2280, 1.1500,  0.0612],
    [ 0.0000, 0.0000,  0.9184],
])

M_LMS_TO_IPT = np.array([
    [0.4000,  0.4000,  0.2000],
    [4.4550, -4.8510,  0.3960],
    [0.8056,  0.3572, -1.1628],
])

M_LMS_TO_XYZ = np.linalg.inv(M_XYZ_TO_LMS)
M_IPT_TO_LMS = np.linalg.inv(M_LMS_TO_IPT)

def XYZ_to_IPT(XYZ):
    LMS = M_XYZ_TO_LMS @ XYZ
    LMS_prime = np.sign(LMS) * np.abs(LMS) ** 0.43
    return M_LMS_TO_IPT @ LMS_prime

def IPT_to_XYZ(IPT):
    LMS = M_IPT_TO_LMS @ IPT
    LMS_prime = np.sign(LMS) * np.abs(LMS) ** (1.0 / 0.43)
    XYZ = M_LMS_TO_XYZ @ LMS_prime
    return XYZ

def XYZ_to_xyY(XYZ):
    x,y,z = XYZ
    return np.array([x / (x+y+z), y / (x+y+z), y])

def xyY_to_XYZ(xyY):
    x,y,Y = xyY
    return np.array([Y/y*x, Y, Y/y*(1-x-y)])

def compute_k(xyz_cmf, spd_d65):
    s = 0
    for (p, xyz) in zip(spd_d65, xyz_cmf):
        s += float(p) * float(xyz[1])
    return 1 / s

def eval_spd(xyz_cmf, spd):
    return (xyz_cmf * spd[:, np.newaxis]).sum(axis=0) 

#lambda_xyz = read_csv('CIE_xyz_1931_2deg.csv')
lambda_xyz = read_csv('./lin2012xyz2e_1_7sf.csv')
lambda_d65 = read_csv('CIE_std_illum_D65.csv')

xyz_cmf = np.array(list(np.array(list(map(float, xyz))) for xyz in zip(*list(zip(*lambda_xyz))[1:])))
spd_d65 = np.array(list(float(s) for s in list(zip(*lambda_d65))[1][90:]))

#assert len(xyz_cmf) == len(spd_d65)

#k = compute_k(xyz_cmf, spd_d65)
#power = float(10 * len(spd_d65))

#with open("rainbow.ppm", "w") as out:
#    height = 81
#    spectra = []
#
#    for xyz in xyz_data:
#        xyz = list(map(float, xyz))
#        xyz = scale_xyz(xyz, power * k)
#        rgb = xyz_to_rgb(xyz)
#        rgb = [min(1, max(s, 0)) for s in rgb]
#        rgb = gamma(rgb)
#        spectra.append(f'{int(rgb[0] * 255)} {int(rgb[1] * 255)} {int(rgb[2] * 255)}')
#
#    width = len(spectra)
#
#    out.write(f'P3 {width} {height} 255\n')
#    out.write('\n'.join(height * [' '.join(spectra)]))

def chromaticity_diagram():
    width = 400
    height = 400

    red   = XYZ_to_xyY(RGB_to_XYZ(sRGB_to_RGB(np.array([1.0, 0.0, 0.0]))))
    green = XYZ_to_xyY(RGB_to_XYZ(sRGB_to_RGB(np.array([0.0, 1.0, 0.0]))))
    blue  = XYZ_to_xyY(RGB_to_XYZ(sRGB_to_RGB(np.array([0.0, 0.0, 1.0]))))

    # TODO this white is incorrect, but im not sure why. investigate this
    #white = XYZ_to_xyY(eval_spd(xyz_cmf, spd_d65))


    XYZ_white = eval_spd(xyz_cmf, spd_d65)
    XYZ_white /= XYZ_white[1]

    #white = np.array([0.3127, 0.3290, 1.0])
    white = XYZ_to_xyY(XYZ_white)

    with open("chromaticity_diagram.svg", "w") as out:
        svg = f"""<svg version="1.1" width="{width+100}" height="{height+100}" xmlns="http://www.w3.org/2000/svg">
          <rect x="50" y="50" width="{width}" height="{height}" stroke="black" fill="transparent" />
        """
        out.write(svg)

        for (x,y,Y) in [white]:
            out.write(f'<circle cx="{50+x*width}" cy="{50+y*height}" r="5" />')

        # Gamut triangle
        out.write('<polygon points="')
        for (x,y,_) in [red, green, blue]:
            out.write(f'{50 + x * width} {50 + y * height} ')
        out.write('" fill="transparent" stroke="black"/>')

        # spectral locus line
        out.write('<polyline points="')
        for xyz in xyz_cmf:
            x,y,_ = XYZ_to_xyY(xyz)
            out.write(f'{50+x*width} {50+y*height} ')
        out.write('" fill="transparent" stroke="black" stroke-width="0.5" />')

        # output colors
        for i, xyz in enumerate(xyz_cmf):
            spd = len(xyz_cmf) * [0.0]
            spd[i] = 0.1

            XYZ_spectral = eval_spd(xyz_cmf, np.array(spd))

            c = calculate_alpha(XYZ_white, XYZ_spectral) 
            IPT = c * XYZ_to_IPT(XYZ_white) + (1 - c) * XYZ_to_IPT(XYZ_spectral)
            XYZ = IPT_to_XYZ(IPT)

            #rgb = [min(1, max(s, 0)) for s in rgb]
            x,y,_ = XYZ_to_xyY(XYZ)
            out.write(f'<circle cx="{50+x*width}" cy="{50+y*height}" r="0.8" fill="blue" />')

        idx = len(xyz_cmf)//3

        #xw,yw,_ = white
        #xyz = xyz_cmf[idx]
        #x,y,_ = XYZ_to_xyY(xyz)
        #out.write(f'<polyline points="{50+xw*width} {50+yw*height} {50+x*width} {50+y*height}" stroke="blue" stroke-width="0.2" />')
        #x,y,_ = XYZ_to_xyY(RGB_to_XYZ(c * np.array([1.0, 1.0, 1.0]) + (1 - c) * XYZ_to_RGB(xyz * k * 1000)))
        #out.write(f'<polyline points="{50+xw*width} {50+yw*height} {50+x*width} {50+y*height}" stroke="red" stroke-width="0.2" />')

        out.write("</svg>")

def render_white():
    img = Image.new('RGB', (64,64))
    pixels = img.load()
    for y in range(64):
        for x in range(64):
            xyz = [0.0,0.0,0.0]
            for s,cmf in zip(spd_d65, xyz_data):
                xyz[0] += s * cmf[0]
                xyz[1] += s * cmf[1]
                xyz[2] += s * cmf[2]
            xyz = scale(xyz, 0.2 * k)
            rgb = xyz_to_rgb(xyz)
            rgb = gamma(rgb)
            pixels[x,y] = tuple(int(a * 255) for a in rgb)
    img.save('white.png')

def calculate_alpha(XYZ_white, XYZ_sample):
    c = 0.5
    d = 0.25

    for i in range(12):
        IPT = c * XYZ_to_IPT(XYZ_white) + (1 - c) * XYZ_to_IPT(XYZ_sample)
        XYZ = IPT_to_XYZ(IPT)
        RGB = XYZ_to_RGB(XYZ)

        is_out_gamut = any(a < 0 or a > 1 for a in RGB)
        if is_out_gamut:
            c += d
        else:
            c -= d

        d /= 2

    return c

def render_spectrum():
    height = 80
    img = Image.new('RGB', (len(xyz_cmf), height + 20))
    pixels = img.load()

    XYZ_white = eval_spd(xyz_cmf, spd_d65)
    XYZ_white /= XYZ_white[1]

    #white = np.array([1.0, 1.0, 1.0])

    for i, xyz in enumerate(xyz_cmf):
        spd = len(xyz_cmf) * [0.0]
        spd[i] = 0.1

        XYZ_spectral = eval_spd(xyz_cmf, np.array(spd))

        c = calculate_alpha(XYZ_white, XYZ_spectral) 
        IPT = c * XYZ_to_IPT(XYZ_white) + (1 - c) * XYZ_to_IPT(XYZ_spectral)
        XYZ = IPT_to_XYZ(IPT)
        RGB = XYZ_to_RGB(XYZ)

        if any(a < 0 or a > 1 for a in RGB):
            print("out of gamut: ", RGB)

        RGB = np.array([min(1, max(s, 0)) for s in RGB])
        RGB = RGB_to_sRGB(RGB)
        for y in range(height):
            pixels[i,y] = tuple(int(x * 255) for x in RGB)

        for y in range(height, height + 20):
            RGB = RGB_to_sRGB(XYZ_to_RGB(c * XYZ_white))
            pixels[i,y] = tuple(int(x * 255) for x in RGB)

    img.save('spectrum.png')

chromaticity_diagram()
render_spectrum()
