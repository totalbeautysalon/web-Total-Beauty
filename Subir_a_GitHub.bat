@echo off
chcp 65001 >nul
title Total Beauty - Sincronizador de GitHub
color 0E
cd /d "%~dp0"

echo ================================================================
echo        TOTAL BEAUTY SALON ^& ACADEMIA - GITHUB SYNC
echo                  Publicacion en GitHub Pages
echo ================================================================
echo.
echo Repositorio: https://github.com/totalbeautysalon/web-Total-Beauty.git
echo Rama activa: main
echo.

where git >nul 2>nul
if errorlevel 1 goto :GIT_NOT_FOUND

REM Actualizacion automatica del catalogo de fotos para la galeria de academia
if exist "fotosacademia" (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$f = 'fotosacademia'; $imgs = @(Get-ChildItem $f | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$' } | Select-Object -ExpandProperty Name); if ($imgs.Count -gt 0) { $imgs | ConvertTo-Json | Set-Content (Join-Path $f 'manifest.json') -Encoding UTF8 }" >nul 2>nul
)
if exist "assets\fotosacademia" (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$f = 'assets\fotosacademia'; $imgs = @(Get-ChildItem $f | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$' } | Select-Object -ExpandProperty Name); if ($imgs.Count -gt 0) { $imgs | ConvertTo-Json | Set-Content (Join-Path $f 'manifest.json') -Encoding UTF8 }" >nul 2>nul
)

echo Verificando archivos modificados o nuevos...
echo ----------------------------------------------------------------
git status -s
echo ----------------------------------------------------------------
echo.

set "commit_msg="
set /p "commit_msg=Ingrese una descripcion de los cambios (ENTER para automatico): "

if not defined commit_msg (
    set "commit_msg=Actualizacion de contenido Total Beauty"
)

echo.
echo [1/3] Agregando archivos al control de versiones...
git add .

echo.
echo [2/3] Creando punto de confirmacion local...
git commit -m "%commit_msg%"

echo.
echo [3/3] Subiendo cambios a GitHub (origin/main)...
git push origin main
if errorlevel 1 goto :RETRY_PUSH

:SUCCESS
echo.
echo ================================================================
echo        PROCESO COMPLETADO EXITOSAMENTE
echo ================================================================
echo Los cambios se han subido correctamente al repositorio.
echo.
echo Enlace del repositorio:
echo https://github.com/totalbeautysalon/web-Total-Beauty
echo.
echo Enlace del sitio web publicado (GitHub Pages):
echo https://totalbeautysalon.github.io/web-Total-Beauty/
echo ================================================================
goto :END

:RETRY_PUSH
echo.
echo ================================================================
echo [AVISO] Sincronizando diferencias con el repositorio remoto...
echo ================================================================
git pull --rebase origin main
git push origin main
if errorlevel 1 goto :ERROR_PUSH
goto :SUCCESS

:ERROR_PUSH
echo.
echo [ERROR] No se pudo completar la subida a GitHub.
echo Verifique su conexion a internet o permisos del repositorio.
goto :END

:GIT_NOT_FOUND
echo.
echo [ERROR] Git no esta instalado o no se encuentra en el PATH.
echo Instale Git desde https://git-scm.com/
goto :END

:END
echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause >nul
exit /b 0
