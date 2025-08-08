#!/bin/bash

# =============================================================================
# Script de configuration des permissions - Brumisater Production
# =============================================================================

set -e

# Configuration
PROJECT_DIR="/var/www/brumisater"
DATA_DIR="/var/app"
LOG_DIR="/var/log/brumisater"
USER="deploy"
GROUP="deploy"
WEB_USER="www-data"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1"
}

# Vérification des utilisateurs
check_users() {
    log "Vérification des utilisateurs..."
    
    # Vérifier que l'utilisateur deploy existe
    if ! id "$USER" &>/dev/null; then
        error "Utilisateur $USER n'existe pas"
        exit 1
    fi
    
    # Vérifier que le groupe deploy existe
    if ! getent group "$GROUP" &>/dev/null; then
        warning "Groupe $GROUP n'existe pas, création..."
        sudo groupadd "$GROUP"
    fi
    
    # Ajouter l'utilisateur au groupe si nécessaire
    if ! groups "$USER" | grep -q "$GROUP"; then
        sudo usermod -a -G "$GROUP" "$USER"
        log "Utilisateur $USER ajouté au groupe $GROUP"
    fi
    
    log "Utilisateurs vérifiés"
}

# Configuration des permissions sur les répertoires
setup_directory_permissions() {
    log "Configuration des permissions des répertoires..."
    
    # Répertoire principal de l'application
    if [ -d "$PROJECT_DIR" ]; then
        sudo chown -R "$USER:$GROUP" "$PROJECT_DIR"
        sudo chmod -R 755 "$PROJECT_DIR"
        
        # Permissions spéciales pour certains dossiers
        if [ -d "$PROJECT_DIR/source/node_modules" ]; then
            sudo chmod -R 755 "$PROJECT_DIR/source/node_modules"
        fi
        
        log "Permissions appliquées sur $PROJECT_DIR"
    else
        warning "Répertoire $PROJECT_DIR n'existe pas"
    fi
    
    # Répertoires de données
    for dir in "$DATA_DIR/data" "$DATA_DIR/output" "$DATA_DIR/uploads"; do
        if [ -d "$dir" ]; then
            sudo chown -R "$USER:$GROUP" "$dir"
            sudo chmod -R 775 "$dir"
            log "Permissions appliquées sur $dir"
        else
            sudo mkdir -p "$dir"
            sudo chown -R "$USER:$GROUP" "$dir"
            sudo chmod -R 775 "$dir"
            log "Répertoire $dir créé avec permissions"
        fi
    done
    
    # Répertoire des logs
    if [ -d "$LOG_DIR" ]; then
        sudo chown -R "$USER:$GROUP" "$LOG_DIR"
        sudo chmod -R 775 "$LOG_DIR"
        log "Permissions appliquées sur $LOG_DIR"
    else
        sudo mkdir -p "$LOG_DIR"
        sudo chown -R "$USER:$GROUP" "$LOG_DIR"
        sudo chmod -R 775 "$LOG_DIR"
        log "Répertoire de logs créé avec permissions"
    fi
}

# Configuration des permissions sur les fichiers
setup_file_permissions() {
    log "Configuration des permissions des fichiers..."
    
    cd "$PROJECT_DIR/source" || exit 1
    
    # Scripts exécutables
    find . -name "*.sh" -exec chmod +x {} \;
    log "Scripts rendus exécutables"
    
    # Workers Node.js
    if [ -d "src/workers" ]; then
        chmod +x src/workers/*.js
        log "Workers rendus exécutables"
    fi
    
    # Fichiers de configuration sensibles
    if [ -f ".env" ]; then
        chmod 600 ".env"
        log "Permissions sécurisées appliquées sur .env"
    fi
    
    if [ -f ".env.production" ]; then
        chmod 600 ".env.production"
        log "Permissions sécurisées appliquées sur .env.production"
    fi
    
    # Configuration PM2
    if [ -f "ecosystem.config.js" ]; then
        chmod 644 "ecosystem.config.js"
        log "Permissions appliquées sur ecosystem.config.js"
    fi
    
    # Fichiers package
    chmod 644 package.json package-lock.json pnpm-lock.yaml 2>/dev/null || true
}

# Configuration des permissions SSL
setup_ssl_permissions() {
    log "Configuration des permissions SSL..."
    
    SSL_DIR="/etc/letsencrypt/live"
    
    if [ -d "$SSL_DIR" ]; then
        # Permettre à l'utilisateur de lire les certificats
        sudo chmod 755 "$SSL_DIR"
        
        # Trouver le domaine configuré
        DOMAIN=$(grep '^BASE_URL=' "$PROJECT_DIR/source/.env" 2>/dev/null | cut -d '/' -f3 || echo "")
        
        if [ ! -z "$DOMAIN" ] && [ -d "$SSL_DIR/$DOMAIN" ]; then
            sudo chmod 755 "$SSL_DIR/$DOMAIN"
            sudo chmod 644 "$SSL_DIR/$DOMAIN"/*.pem
            log "Permissions SSL configurées pour $DOMAIN"
        else
            warning "Domaine SSL non trouvé ou certificats non présents"
        fi
    else
        warning "Répertoire SSL non trouvé"
    fi
}

# Configuration des permissions système
setup_system_permissions() {
    log "Configuration des permissions système..."
    
    # Ajouter l'utilisateur aux groupes nécessaires
    sudo usermod -a -G adm "$USER" 2>/dev/null || true
    sudo usermod -a -G systemd-journal "$USER" 2>/dev/null || true
    
    # Permissions pour PM2
    if [ -d "/home/$USER/.pm2" ]; then
        sudo chown -R "$USER:$GROUP" "/home/$USER/.pm2"
        chmod -R 755 "/home/$USER/.pm2"
        log "Permissions PM2 configurées"
    fi
    
    # Permissions pour les logs système
    if [ -f "/var/log/syslog" ]; then
        sudo usermod -a -G syslog "$USER" 2>/dev/null || true
    fi
}

# Configuration logrotate pour les logs de l'application
setup_logrotate() {
    log "Configuration logrotate..."
    
    sudo tee /etc/logrotate.d/brumisater > /dev/null << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 664 $USER $GROUP
    postrotate
        # Redémarrer PM2 pour recharger les logs
        su $USER -c "pm2 reloadLogs" || true
    endscript
}
EOF
    
    log "Configuration logrotate créée"
}

# Configuration des limites système
setup_system_limits() {
    log "Configuration des limites système..."
    
    # Limites pour l'utilisateur deploy
    sudo tee -a /etc/security/limits.conf > /dev/null << EOF

# Limites pour brumisater
$USER soft nofile 65536
$USER hard nofile 65536
$USER soft nproc 32768
$USER hard nproc 32768
EOF
    
    # Configuration systemd pour les services
    if [ -d "/etc/systemd/system" ]; then
        sudo mkdir -p "/etc/systemd/system/user@$(id -u $USER).service.d"
        
        sudo tee "/etc/systemd/system/user@$(id -u $USER).service.d/override.conf" > /dev/null << EOF
[Service]
LimitNOFILE=65536
LimitNPROC=32768
EOF
        
        sudo systemctl daemon-reload
        log "Limites systemd configurées"
    fi
}

# Vérification des permissions
verify_permissions() {
    log "Vérification des permissions..."
    
    # Vérifier les répertoires principaux
    for dir in "$PROJECT_DIR" "$DATA_DIR" "$LOG_DIR"; do
        if [ -d "$dir" ]; then
            owner=$(stat -c "%U:%G" "$dir")
            perms=$(stat -c "%a" "$dir")
            log "  $dir : $owner ($perms)"
        else
            warning "  $dir : N'EXISTE PAS"
        fi
    done
    
    # Vérifier les fichiers sensibles
    if [ -f "$PROJECT_DIR/source/.env" ]; then
        perms=$(stat -c "%a" "$PROJECT_DIR/source/.env")
        log "  .env : $perms (devrait être 600)"
    fi
    
    # Vérifier les groupes de l'utilisateur
    groups_list=$(groups "$USER")
    log "Groupes de $USER : $groups_list"
    
    log "Vérification terminée"
}

# Fonction de nettoyage en cas d'erreur
cleanup_on_error() {
    error "Erreur détectée, nettoyage..."
    # Pas de nettoyage spécifique pour les permissions
    exit 1
}

# Configuration du trap d'erreur
trap cleanup_on_error ERR

# =============================================================================
# EXECUTION PRINCIPALE
# =============================================================================

main() {
    log "🔒 Configuration des permissions de production"
    
    check_users
    setup_directory_permissions
    setup_file_permissions
    setup_ssl_permissions
    setup_system_permissions
    setup_logrotate
    setup_system_limits
    verify_permissions
    
    log "✅ Configuration des permissions terminée"
}

# Exécuter si appelé directement
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi