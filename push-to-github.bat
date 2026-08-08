@echo off
echo ======================================
echo  शिवरक्षक अकॅडमी - GitHub Push
echo ======================================
echo.

cd /d "C:\Users\Asus\shivrakshak-academy"

echo Step 1: Git setup...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/jangalenavnath333/shivrakshak-academy.git

echo.
echo Step 2: Files add करत आहे...
git add .

echo.
echo Step 3: Commit करत आहे...
git commit -m "Complete Shivrakshak Academy website - all features"

echo.
echo Step 4: GitHub ला push करत आहे...
echo (Browser मध्ये GitHub login window येईल - login करा)
git push -u origin main --force

echo.
echo ======================================
if %ERRORLEVEL% EQU 0 (
  echo  SUCCESS! Code GitHub वर गेला!
  echo  https://github.com/jangalenavnath333/shivrakshak-academy
) else (
  echo  ERROR! पुन्हा try करा.
  echo  git push -u origin main --force
)
echo ======================================
pause
