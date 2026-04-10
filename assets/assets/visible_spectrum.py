import csv

def read_csv(filename):
    f = open(filename)
    return list(csv.reader(f))

def scale_xyz(xyz, k):
    return [
        k * xyz[0],
        k * xyz[1],
        k * xyz[2],
    ]

def xyz_to_rgb(xyz):
    return [ 
         3.2406255 * xyz[0] - 1.5372080 * xyz[1] - 0.4986286 * xyz[2],
        -0.9689307 * xyz[0] + 1.8757561 * xyz[1] + 0.0415175 * xyz[2],
         0.0557101 * xyz[0] - 0.2040211 * xyz[1] + 1.0569959 * xyz[2],
    ]

def gamma(rgb):
    def f(s):
        if s <= 0.0031308:
            return 12.92 * s
        return 1.055 * (s ** (1 / 2.4)) - 0.055

    return [f(s) for s in rgb]

def compute_k(xyz_data, spd_d65):
    s = 0
    for (p, xyz) in zip(spd_d65, xyz_data):
        s += float(p) * float(xyz[1])
    return 1 / s

lambda_xyz = read_csv('CIE_xyz_1931_2deg.csv')
lambda_d65 = read_csv('CIE_std_illum_D65.csv')

xyz_data = list(zip(*list(zip(*lambda_xyz))[1:]))
spd_d65 = list(zip(*lambda_d65))[1][60:]

k = compute_k(xyz_data, spd_d65)
power = 4000

with open("rainbow.ppm", "w") as out:
    height = 81
    spectra = []

    for xyz in xyz_data:
        xyz = list(map(float, xyz))
        xyz = scale_xyz(xyz, power * k)
        rgb = xyz_to_rgb(xyz)
        rgb = [min(1, max(s, 0)) for s in rgb]
        rgb = gamma(rgb)
        spectra.append(f'{int(rgb[0] * 255)} {int(rgb[1] * 255)} {int(rgb[2] * 255)}')

    width = len(spectra)

    out.write(f'P3 {width} {height} 255\n')
    out.write('\n'.join(height * [' '.join(spectra)]))
