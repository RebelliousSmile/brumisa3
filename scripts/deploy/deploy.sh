#!/bin/bash

# =============================================================================
# Script de déploiement production - Brumisater
# =============================================================================

set -e  # Sortir en cas d'erreur

# Configuration
PROJECT_NAME="brumisater"
PROJECT_DIR="/var/www/brumisater"
BACKUP_DIR="/var/backups/brumisater"
LOG_FILE="/var/log/brumisater/deploy.log"
BRANCH="${DEPLOY_BRANCH:-main}"
ENVIRONMENT="${DEPLOY_ENV:-production}"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier pnpm
    if ! command -v pnpm &> /dev/null; then
        error "pnpm n'est pas installé"
        exit 1
    fi
    
    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        error "PM2 n'est pas installé"
        exit 1
    fi
    
    # Vérifier PostgreSQL
    if ! command -v psql &> /dev/null; then
        warning "PostgreSQL client non trouvé, certaines fonctionnalités pourraient ne pas marcher"
    fi
    
    log "Prérequis validés"
}

# Création des répertoires nécessaires
setup_directories() {
    log "Création des répertoires..."
    
    # Répertoires principaux
    sudo mkdir -p "$PROJECT_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "/var/log/brumisater"
    sudo mkdir -p "/var/app/data"
    sudo mkdir -p "/var/app/output"
    sudo mkdir -p "/var/app/uploads"
    
    # Permissions
    sudo chown -R $USER:$USER "$PROJECT_DIR"
    sudo chown -R $USER:$USER "$BACKUP_DIR"
    sudo chown -R $USER:$USER "/var/log/brumisater"
    sudo chown -R $USER:$USER "/var/app"
    
    log "Répertoires créés et permissions appliquées"
}

# Sauvegarde avant déploiement
backup_current() {
    log "Sauvegarde de la version actuelle..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME="${PROJECT_NAME}_${TIMESTAMP}"
    
    # Sauvegarder l'application
    if [ -d "$PROJECT_DIR/source" ]; then
        sudo tar -czf "$BACKUP_DIR/${BACKUP_NAME}_app.tar.gz" -C "$PROJECT_DIR" source
        log "Application sauvegardée dans $BACKUP_DIR/${BACKUP_NAME}_app.tar.gz"
    fi
    
    # Sauvegarder la base de données
    if [ ! -z "$DATABASE_URL" ]; then
        pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/${BACKUP_NAME}_db.sql.gz"
        log "Base de données sauvegardée dans $BACKUP_DIR/${BACKUP_NAME}_db.sql.gz"
    fi
    
    # Nettoyer les anciennes sauvegardes (garder 7 dernières)
    find "$BACKUP_DIR" -name "${PROJECT_NAME}_*" -type f -mtime +7 -delete
    
    log "Sauvegarde terminée"
}

# Tests pré-déploiement
run_tests() {
    log "Exécution des tests..."
    
    cd "$PROJECT_DIR/source"
    
    # Tests unitaires
    if ! pnpm test:ci; then
        error "Tests unitaires échoués"
        exit 1
    fi
    
    # Linting
    if ! pnpm lint:check; then
        error "Linting échoué"
        exit 1
    fi
    
    # Format check
    if ! pnpm format:check; then
        error "Format check échoué"
        exit 1
    fi
    
    log "Tests passés avec succès"
}

# Construction des assets
build_assets() {
    log "Construction des assets..."
    
    cd "$PROJECT_DIR/source"
    
    # Installation des dépendances de production
    pnpm install --production --frozen-lockfile
    
    # Build CSS
    pnpm run build:css
    
    # Validation que les assets existent
    if [ ! -f "public/css/style.css" ]; then
        error "CSS non généré"
        exit 1
    fi
    
    log "Assets construits avec succès"
}

# Migration de base de données
migrate_database() {
    log "Migration de la base de données..."
    
    cd "$PROJECT_DIR/source"
    
    # Vérifier la connexion à la base
    if ! node -e "require('./src/database/db.js').query('SELECT 1')" &> /dev/null; then
        error "Impossible de se connecter à la base de données"
        exit 1
    fi
    
    # Exécuter les migrations
    if ! pnpm run db:migrate; then
        error "Migration de base de données échouée"
        exit 1
    fi
    
    log "Migration de base de données terminée"
}

# Déploiement de l'application
deploy_application() {
    log "Déploiement de l'application..."
    
    # Arrêter PM2 gracefully
    if pm2 list | grep -q "$PROJECT_NAME"; then
        pm2 stop "$PROJECT_NAME-app" || true
        pm2 stop "$PROJECT_NAME-queue" || true
        pm2 stop "$PROJECT_NAME-maintenance" || true
        sleep 5
    fi
    
    cd "$PROJECT_DIR/source"
    
    # Démarrer avec la nouvelle configuration
    NODE_ENV="$ENVIRONMENT" pm2 start ecosystem.config.js --env "$ENVIRONMENT"
    
    # Sauvegarder la configuration PM2
    pm2 save
    
    log "Application déployée"
}

# Vérification post-déploiement
verify_deployment() {
    log "Vérification du déploiement..."
    
    # Attendre que l'application démarre
    sleep 10
    
    # Vérifier que PM2 fonctionne
    if ! pm2 list | grep -q "online"; then
        error "Aucun processus PM2 en ligne"
        exit 1
    fi
    
    # Health check HTTP
    PORT=$(grep '^PORT=' "$PROJECT_DIR/source/.env" | cut -d '=' -f2 || echo "3000")
    
    if ! curl -f "http://localhost:$PORT/health" &> /dev/null; then
        error "Health check échoué"
        exit 1
    fi
    
    log "Déploiement vérifié avec succès"
}

# Nettoyage post-déploiement
cleanup() {
    log "Nettoyage..."
    
    cd "$PROJECT_DIR/source"
    
    # Nettoyer node_modules dev
    pnpm prune --production
    
    # Nettoyer les logs anciens
    find "/var/log/brumisater" -name "*.log" -mtime +7 -delete || true
    
    # Nettoyer les fichiers temporaires
    find "/tmp" -name "*brumisater*" -mtime +1 -delete || true
    
    log "Nettoyage terminé"
}

# Notification de fin
notify_completion() {
    log "🎉 Déploiement terminé avec succès!"
    
    # Afficher les informations de déploiement
    info "Environnement: $ENVIRONMENT"
    info "Branche: $BRANCH"
    info "Timestamp: $(date)"
    info "Processus PM2:"
    pm2 list
    
    # Log final
    log "Déploiement $ENVIRONMENT terminé à $(date)"
}

# Rollback en cas d'erreur
rollback() {
    error "Erreur détectée, rollback en cours..."
    
    # Arrêter les processus actuels
    pm2 stop all || true
    
    # Restaurer la sauvegarde si elle existe
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*_app.tar.gz 2>/dev/null | head -n1)
    if [ ! -z "$LATEST_BACKUP" ]; then
        cd "$PROJECT_DIR"
        tar -xzf "$LATEST_BACKUP"
        pm2 start ecosystem.config.js --env production || true
        warning "Rollback effectué vers la sauvegarde: $LATEST_BACKUP"
    else
        error "Aucune sauvegarde trouvée pour le rollback"
    fi
    
    exit 1
}

# Configuration des signaux d'erreur
trap rollback ERR

# =============================================================================
# EXECUTION PRINCIPALE
# =============================================================================

main() {
    log "🚀 Début du déploiement $ENVIRONMENT"
    
    check_prerequisites
    setup_directories
    backup_current
    run_tests
    build_assets
    migrate_database
    deploy_application
    verify_deployment
    cleanup
    notify_completion
}

# Vérifier les arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    cat << EOF
Usage: $0 [options]

Options:
  --help, -h          Afficher cette aide
  --env ENVIRONMENT   Environnement de déploiement (défaut: production)
  --branch BRANCH     Branche Git à déployer (défaut: main)
  --no-tests          Ignorer les tests
  --no-backup         Ignorer la sauvegarde

Variables d'environnement:
  DEPLOY_ENV          Environnement de déploiement
  DEPLOY_BRANCH       Branche Git à déployer
  DATABASE_URL        URL de connexion PostgreSQL
  NO_TESTS            Ignorer les tests (true/false)
  NO_BACKUP          Ignorer la sauvegarde (true/false)

Exemple:
  $0 --env production --branch release/v2.0
EOF
    exit 0
fi

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        --no-tests)
            NO_TESTS="true"
            shift
            ;;
        --no-backup)
            NO_BACKUP="true"
            shift
            ;;
        *)
            error "Option inconnue: $1"
            exit 1
            ;;
    esac
done

# Exécuter le déploiement
main