@echo off
title Shivrakshak Academy - Restart Server
echo ==========================================
echo   शिवरक्षक अकॅडमी - Server Restart
echo ==========================================
echo.

cd /d "C:\Users\Asus\shivrakshak-academy"

echo [1/3] जुना server बंद करत आहे...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Cache साफ करत आहे...
if exist ".next" rmdir /s /q ".next" >nul 2>&1

echo [3/3] नवीन server सुरू करत आहे...
echo.
echo ==========================================
echo   Browser मध्ये उघडा:  http://localhost:3000
echo   (हे window बंद करू नका!)
echo ==========================================
echo.

call npm run dev
pause
