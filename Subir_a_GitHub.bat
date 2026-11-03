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

:: Verificar si git esta instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git no se encuentra instalado o no esta en el PATH del sistema.
    echo Por favor instale Git desde https://git-scm.com/
    echo.
    pause
    exit /b 1
)

:: Verificar estado de cambios
echo Verificando archivos modificados o nuevos...
echo ----------------------------------------------------------------
git status -s
echo ----------------------------------------------------------------
echo.

:: Solicitar mensaje de confirmacion
set /p "commit_msg=Ingrese una descripcion de los cambios (o presione ENTER para mensaje automatico): "

if "%commit_msg%"=="" (
    set "commit_msg=Actualizacion de contenido Total Beauty - %date% %time%"
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

if %errorlevel% equ 0 (
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
) else (
    echo.
    echo ================================================================
    echo [AVISO] Ocurrio una discrepancia al sincronizar con GitHub.
    echo Intentando sincronizar cambios remotos pendientes...
    echo ================================================================
    git pull --rebase origin main
    git push origin main
    if %errorlevel% equ 0 (
        echo.
        echo [EXITO] Sincronizacion completada tras resolver diferencias.
    ) else (
        echo.
        echo [ERROR] No se pudo completar la subida. Verifique su conexion o permisos.
    )
)

echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause >nul
exit /b 0
