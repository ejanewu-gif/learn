@echo off
chcp 65001 >nul
echo ========================================================
echo   正在啟動「EJ的研習講義」本機預覽伺服器...
echo ========================================================
echo.
echo 伺服器啟動成功後，將自動開啟瀏覽器：http://localhost:8000
echo 若要停止伺服器，請直接關閉此黑底視窗即可。
echo.
start http://localhost:8000
python -m http.server 8000
