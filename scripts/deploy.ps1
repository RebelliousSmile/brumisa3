# Brumisa3 Nuxt 4 - Script de déploiement PowerShell
param(
    [switch]$SkipTests,
    [switch]$SkipMigration,
    [string]$Environment = "production"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Brumisa3 Nuxt 4 - Déploiement Windows" -ForegroundColor Cyan  
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour vérifier le code de sortie
function Test-ExitCode {
    param($Message)
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: $Message" -ForegroundColor Red
        exit 1
    }
}

# Vérification des variables d'environnement
$requiredEnvVars = @("DATABASE_URL", "SESSION_SECRET")
foreach ($envVar in $requiredEnvVars) {
    if (-not (Get-ChildItem Env: | Where-Object Name -eq $envVar)) {
        Write-Host "ERREUR: Variable d'environnement $envVar manquante" -ForegroundColor Red
        exit 1
    }
}

try {
    Write-Host "[1/9] Arrêt des processus existants..." -ForegroundColor Yellow
    pm2 stop brumisa3-nuxt4 2>$null
    pm2 delete brumisa3-nuxt4 2>$null

    Write-Host "[2/9] Nettoyage des caches..." -ForegroundColor Yellow
    pnpm run clean
    Test-ExitCode "Nettoyage des caches"

    Write-Host "[3/9] Installation des dépendances..." -ForegroundColor Yellow
    pnpm install --frozen-lockfile
    Test-ExitCode "Installation des dépendances"

    Write-Host "[4/9] Génération du client Prisma..." -ForegroundColor Yellow
    pnpm run db:generate
    Test-ExitCode "Génération Prisma"

    if (-not $SkipMigration) {
        Write-Host "[5/9] Migration de la base de données..." -ForegroundColor Yellow
        pnpm run db:migrate
        Test-ExitCode "Migration base de données"
    } else {
        Write-Host "[5/9] Migration ignorée (--SkipMigration)" -ForegroundColor Gray
    }

    Write-Host "[6/9] Vérification des types TypeScript..." -ForegroundColor Yellow
    pnpm run typecheck
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ATTENTION: Erreurs de types détectées, mais on continue..." -ForegroundColor Yellow
    }

    if (-not $SkipTests) {
        Write-Host "[7/9] Exécution des tests..." -ForegroundColor Yellow
        pnpm run test:run
        Test-ExitCode "Tests"
    } else {
        Write-Host "[7/9] Tests ignorés (--SkipTests)" -ForegroundColor Gray
    }

    Write-Host "[8/9] Construction de l'application..." -ForegroundColor Yellow
    if ($Environment -eq "production") {
        pnpm run build
    } else {
        pnpm run build:analyze
    }
    Test-ExitCode "Construction"

    Write-Host "[9/9] Démarrage avec PM2..." -ForegroundColor Yellow
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Name "logs" | Out-Null
    }
    pnpm run pm2:start
    Test-ExitCode "Démarrage PM2"

    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host " Déploiement réussi !" -ForegroundColor Green
    Write-Host " Application: http://localhost:3000" -ForegroundColor Green
    Write-Host " Statut PM2: pm2 status" -ForegroundColor Green
    Write-Host " Logs: pnpm run pm2:logs" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green

    # Affichage du statut PM2
    Write-Host ""
    Write-Host "Statut actuel des processus:" -ForegroundColor Cyan
    pm2 status

} catch {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host " ERREUR lors du déploiement !" -ForegroundColor Red
    Write-Host " $_" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    exit 1
}