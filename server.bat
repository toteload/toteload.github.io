@echo off

pushd docs
start cmd /C python -m http.server
popd

"C:\Program Files\Mozilla Firefox\firefox.exe" 127.168.0.0:8000
