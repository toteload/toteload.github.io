@echo off

pushd assets\assets

fonttools subset NotoSerif-Regular.woff2 ^
  --unicodes-file=unicodes.txt ^
  --output-file=NotoSerif-Regular-smol.woff2 --flavor=woff2

fonttools subset NotoSerif-Bold.woff2 ^
  --unicodes-file=unicodes.txt ^
  --output-file=NotoSerif-Bold-smol.woff2 --flavor=woff2

fonttools subset Roboto-Regular.ttf ^
  --unicodes-file=unicodes.txt ^
  --output-file=Roboto-Regular-smol.woff2 --flavor=woff2

fonttools subset Roboto-Bold.ttf ^
  --unicodes-file=unicodes.txt ^
  --output-file=Roboto-Bold-smol.woff2 --flavor=woff2

fonttools subset RobotoMono-Regular.ttf ^
  --unicodes-file=unicodes.txt ^
  --output-file=RobotoMono-Regular-smol.woff2 --flavor=woff2

fonttools subset RobotoMono-Bold.ttf ^
  --unicodes-file=unicodes.txt ^
  --output-file=RobotoMono-Bold-smol.woff2 --flavor=woff2

popd
