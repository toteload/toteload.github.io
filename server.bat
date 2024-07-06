@echo off

start cmd /C python -m http.server

"C:\Program Files\Mozilla Firefox\firefox.exe" 127.168.0.0:8000
