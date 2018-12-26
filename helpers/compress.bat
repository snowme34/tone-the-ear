for /f "tokens=2 delims=:." %%x in ('chcp') do set cp=%%x
chcp 65001>nul

mkdir comp

rem FOR /F "tokens=*" %%G IN ('dir /b *.mp3') DO (ffmpeg -i "%%~nG.mp3" -vn -acodec libmp3lame -b:a 8k -ac 1 -ar 11025 "comp\%%~nG.mp3")
FOR /F "tokens=*" %%G IN ('dir /b *.mp3') DO (ffmpeg -i "%%~nG.mp3" -vn -acodec libmp3lame -b:a 64k -ar 22050 "comp\%%~nG.mp3")

chcp %cp%>nul