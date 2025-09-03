@echo off
echo =========================================
echo  Brumisater Nuxt 4 - Script de deploiement Windows
echo =========================================
echo.

:: Verification des variables d'environnement
if "%DATABASE_URL%"=="" (
    echo ERREUR: DATABASE_URL n'est pas definie
    goto :error
)

if "%SESSION_SECRET%"=="" (
    echo ERREUR: SESSION_SECRET n'est pas definie
    goto :error
)

echo [1/8] Arret des processus existants...
pm2 stop brumisater-nuxt4 2>nul
pm2 delete brumisater-nuxt4 2>nul

echo [2/8] Nettoyage des caches...
call pnpm run clean

echo [3/8] Installation des dependances...
call pnpm install
if errorlevel 1 goto :error

echo [4/8] Generation du client Prisma...
call pnpm run db:generate
if errorlevel 1 goto :error

echo [5/8] Migration de la base de donnees...
call pnpm run db:migrate
if errorlevel 1 goto :error

echo [6/8] Verification des types TypeScript...
call pnpm run typecheck
if errorlevel 1 (
    echo ATTENTION: Erreurs de types detectees, mais on continue...
)

echo [7/8] Construction de l'application...
call pnpm run build
if errorlevel 1 goto :error

echo [8/8] Demarrage avec PM2...
if not exist "logs" mkdir logs
call pnpm run pm2:start
if errorlevel 1 goto :error

echo.
echo =========================================
echo  Deploiement reussi !
echo  Application disponible sur : http://localhost:3000
echo  Logs disponibles avec : pnpm run pm2:logs
echo =========================================
goto :end

:error
echo.
echo =========================================
echo  ERREUR lors du deploiement !
echo  Verifiez les logs ci-dessus
echo =========================================
exit /b 1

:end
pause