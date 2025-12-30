@echo off

pushd assets

fonttools subset NotoSerif-Regular.woff2 ^
  --unicodes-file=unicodes.txt ^
  --output-file=NotoSerif-Regular-smol.woff2 --flavor=woff2

fonttools subset NotoSerif-Bold.woff2 ^
  --unicodes-file=unicodes.txt ^
  --output-file=NotoSerif-Bold-smol.woff2 --flavor=woff2

popd
