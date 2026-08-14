@echo off
echo.
echo =============================================
echo   Sambhaji Mahadik Photo Copy Script
echo =============================================
echo.
echo Copying photo to public\images\director\...
copy /Y "All Data\Raje pawar sir\Mahadik sir\WhatsApp Image 2026-08-13 at 1.40.02 PM.jpeg" "public\images\director\sambhaji-mahadik.jpg"
if %errorlevel%==0 (
    echo.
    echo ✅ Photo copied successfully!
    echo    sambhaji-mahadik.jpg is now in public\images\director\
) else (
    echo.
    echo ❌ Error copying file. Please copy manually.
)
echo.
pause
