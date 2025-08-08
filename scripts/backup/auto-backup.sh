#!/bin/bash

# =============================================================================
# Script de sauvegarde automatique - Brumisater
# =============================================================================

set -e

# Configuration
BACKUP_DIR="/var/backups/brumisater"
PROJECT_DIR="/var/www/brumisater/source"
DATA_DIR="/var/app"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PREFIX="brumisater_${TIMESTAMP}"

# Couleurs pour logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$BACKUP_DIR/backup.log"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$BACKUP_DIR/backup.log"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$BACKUP_DIR/backup.log"
}

# Fonction de notification (email, Slack, etc.)
notify() {
    local status=$1
    local message=$2
    
    # Log local
    log "Backup $status: $message"
    
    # Email notification (si configuré)
    if [ ! -z "$BACKUP_NOTIFY_EMAIL" ]; then
        echo "$message" | mail -s "Brumisater Backup $status" "$BACKUP_NOTIFY_EMAIL" || true
    fi
    
    # Webhook notification (si configuré)
    if [ ! -z "$BACKUP_WEBHOOK_URL" ]; then
        curl -X POST "$BACKUP_WEBHOOK_URL" \
             -H "Content-Type: application/json" \
             -d "{\"status\":\"$status\",\"message\":\"$message\",\"timestamp\":\"$(date -Iseconds)\"}" || true
    fi
}

# Créer le répertoire de sauvegarde
setup_backup_directory() {
    log "Configuration du répertoire de sauvegarde..."
    
    mkdir -p "$BACKUP_DIR"
    chmod 750 "$BACKUP_DIR"
    
    # Vérifier l'espace disponible (au moins 1GB)
    available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    required_space=1048576  # 1GB en KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        error "Espace insuffisant pour la sauvegarde: ${available_space}KB disponible, ${required_space}KB requis"
        exit 1
    fi
    
    log "Répertoire de sauvegarde prêt: $BACKUP_DIR"
}

# Sauvegarde de la base de données
backup_database() {
    log "Sauvegarde de la base de données..."
    
    if [ -z "$DATABASE_URL" ]; then
        warning "DATABASE_URL non défini, sauvegarde base de données ignorée"
        return 0
    fi
    
    local db_backup_file="$BACKUP_DIR/${BACKUP_PREFIX}_database.sql.gz"
    local db_info_file="$BACKUP_DIR/${BACKUP_PREFIX}_database.info"
    
    # Informations sur la base avant sauvegarde
    {
        echo "Database backup info"
        echo "Timestamp: $(date -Iseconds)"
        echo "Database URL: ${DATABASE_URL%%:*}://***:***@${DATABASE_URL#*@}"
        
        # Taille des tables
        psql "$DATABASE_URL" -c "
            SELECT schemaname, tablename, 
                   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
                   pg_stat_get_tuples_returned(C.oid) AS n_tup_ret,
                   pg_stat_get_tuples_fetched(C.oid) AS n_tup_fetch,
                   pg_stat_get_tuples_inserted(C.oid) AS n_tup_ins,
                   pg_stat_get_tuples_updated(C.oid) AS n_tup_upd,
                   pg_stat_get_tuples_deleted(C.oid) AS n_tup_del
            FROM pg_tables pt
            JOIN pg_class C ON C.relname = pt.tablename
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        " || true
    } > "$db_info_file"
    
    # Sauvegarde avec compression
    if pg_dump "$DATABASE_URL" --verbose --no-owner --no-acl | gzip > "$db_backup_file"; then
        local file_size=$(du -h "$db_backup_file" | cut -f1)
        log "Sauvegarde base de données réussie: $file_size"
        
        # Vérifier l'intégrité de l'archive
        if gzip -t "$db_backup_file"; then
            log "Intégrité de l'archive base de données vérifiée"
        else
            error "Intégrité de l'archive base de données corrompue"
            return 1
        fi
    else
        error "Échec de la sauvegarde base de données"
        return 1
    fi
}

# Sauvegarde des fichiers de l'application
backup_application() {
    log "Sauvegarde des fichiers de l'application..."
    
    local app_backup_file="$BACKUP_DIR/${BACKUP_PREFIX}_application.tar.gz"
    
    # Fichiers à inclure
    local include_patterns=(
        "package.json"
        "pnpm-lock.yaml"
        "ecosystem.config.js"
        ".env.production"
        "src/"
        "public/"
        "documentation/"
        "scripts/"
    )
    
    # Fichiers à exclure
    local exclude_patterns=(
        "node_modules"
        "logs"
        "*.log"
        ".git"
        "output"
        "uploads"
        "temp"
        "*.tmp"
    )
    
    cd "$PROJECT_DIR" || exit 1
    
    # Créer la liste des fichiers à exclure
    local exclude_args=""
    for pattern in "${exclude_patterns[@]}"; do
        exclude_args="$exclude_args --exclude=$pattern"
    done
    
    # Créer l'archive
    if tar czf "$app_backup_file" $exclude_args "${include_patterns[@]}" 2>/dev/null; then
        local file_size=$(du -h "$app_backup_file" | cut -f1)
        log "Sauvegarde application réussie: $file_size"
        
        # Vérifier l'intégrité de l'archive
        if tar -tzf "$app_backup_file" > /dev/null 2>&1; then
            log "Intégrité de l'archive application vérifiée"
        else
            error "Intégrité de l'archive application corrompue"
            return 1
        fi
    else
        error "Échec de la sauvegarde application"
        return 1
    fi
}

# Sauvegarde des données utilisateur
backup_user_data() {
    log "Sauvegarde des données utilisateur..."
    
    local data_backup_file="$BACKUP_DIR/${BACKUP_PREFIX}_userdata.tar.gz"
    
    if [ -d "$DATA_DIR" ]; then
        # Sauvegarde avec préservation des permissions
        if tar czf "$data_backup_file" -C "$DATA_DIR" data uploads 2>/dev/null; then
            local file_size=$(du -h "$data_backup_file" | cut -f1)
            log "Sauvegarde données utilisateur réussie: $file_size"
        else
            warning "Échec de la sauvegarde données utilisateur (répertoires inexistants?)"
        fi
    else
        warning "Répertoire de données utilisateur non trouvé: $DATA_DIR"
    fi
}

# Sauvegarde des configurations système
backup_system_config() {
    log "Sauvegarde des configurations système..."
    
    local config_backup_file="$BACKUP_DIR/${BACKUP_PREFIX}_config.tar.gz"
    local config_files=()
    
    # Fichiers de configuration à sauvegarder
    local potential_configs=(
        "/etc/nginx/sites-available/brumisater"
        "/etc/systemd/system/brumisater.service"
        "/etc/logrotate.d/brumisater"
        "/etc/crontab"
        "$HOME/.pm2/dump.pm2"
    )
    
    # Vérifier quels fichiers existent
    for config_file in "${potential_configs[@]}"; do
        if [ -f "$config_file" ]; then
            config_files+=("$config_file")
        fi
    done
    
    if [ ${#config_files[@]} -gt 0 ]; then
        if tar czf "$config_backup_file" "${config_files[@]}" 2>/dev/null; then
            local file_size=$(du -h "$config_backup_file" | cut -f1)
            log "Sauvegarde configurations système réussie: $file_size"
        else
            warning "Échec partiel de la sauvegarde configurations système"
        fi
    else
        warning "Aucun fichier de configuration système trouvé"
    fi
}

# Nettoyage des anciennes sauvegardes
cleanup_old_backups() {
    log "Nettoyage des anciennes sauvegardes (> $RETENTION_DAYS jours)..."
    
    local deleted_count=0
    local total_size_freed=0
    
    # Trouver et supprimer les anciennes sauvegardes
    while IFS= read -r -d '' file; do
        local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
        rm "$file"
        deleted_count=$((deleted_count + 1))
        total_size_freed=$((total_size_freed + file_size))
    done < <(find "$BACKUP_DIR" -name "brumisater_*" -type f -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    
    if [ $deleted_count -gt 0 ]; then
        local size_mb=$((total_size_freed / 1024 / 1024))
        log "Nettoyage terminé: $deleted_count fichiers supprimés, ${size_mb}MB libérés"
    else
        log "Aucune ancienne sauvegarde à nettoyer"
    fi
}

# Génération du rapport de sauvegarde
generate_backup_report() {
    log "Génération du rapport de sauvegarde..."
    
    local report_file="$BACKUP_DIR/${BACKUP_PREFIX}_report.json"
    local backup_files=("$BACKUP_DIR"/${BACKUP_PREFIX}_*)
    
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -Iseconds)\","
        echo "  \"backup_id\": \"$BACKUP_PREFIX\","
        echo "  \"retention_days\": $RETENTION_DAYS,"
        echo "  \"files\": ["
        
        local first=true
        for file in "${backup_files[@]}"; do
            if [ -f "$file" ] && [[ "$file" != *"_report.json" ]]; then
                [ "$first" = false ] && echo ","
                local filename=$(basename "$file")
                local filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
                local checksum=$(sha256sum "$file" | cut -d' ' -f1 2>/dev/null || echo "unknown")
                
                echo "    {"
                echo "      \"name\": \"$filename\","
                echo "      \"size\": $filesize,"
                echo "      \"checksum\": \"$checksum\""
                echo -n "    }"
                first=false
            fi
        done
        
        echo ""
        echo "  ],"
        echo "  \"system_info\": {"
        echo "    \"hostname\": \"$(hostname)\","
        echo "    \"os\": \"$(uname -s)\","
        echo "    \"disk_usage\": \"$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}')\","
        echo "    \"backup_size\": \"$(du -sh "$BACKUP_DIR"/${BACKUP_PREFIX}_* | awk '{sum+=$1} END {print sum}')\""
        echo "  }"
        echo "}"
    } > "$report_file"
    
    log "Rapport de sauvegarde généré: $report_file"
}

# Test de restauration (optionnel)
test_backup_integrity() {
    log "Test d'intégrité des sauvegardes..."
    
    local test_dir="/tmp/brumisater_backup_test_$$"
    mkdir -p "$test_dir"
    
    local success=true
    
    # Test de l'archive application
    local app_backup="$BACKUP_DIR/${BACKUP_PREFIX}_application.tar.gz"
    if [ -f "$app_backup" ]; then
        if ! tar -tzf "$app_backup" > /dev/null 2>&1; then
            error "Archive application corrompue"
            success=false
        fi
    fi
    
    # Test de l'archive base de données
    local db_backup="$BACKUP_DIR/${BACKUP_PREFIX}_database.sql.gz"
    if [ -f "$db_backup" ]; then
        if ! gzip -t "$db_backup" 2>/dev/null; then
            error "Archive base de données corrompue"
            success=false
        fi
    fi
    
    rm -rf "$test_dir"
    
    if [ "$success" = true ]; then
        log "Test d'intégrité réussi"
    else
        error "Test d'intégrité échoué"
        return 1
    fi
}

# Fonction principale
main() {
    local start_time=$(date +%s)
    
    log "🗄️ Début de la sauvegarde automatique"
    
    # Charger les variables d'environnement si disponibles
    if [ -f "$PROJECT_DIR/.env" ]; then
        source "$PROJECT_DIR/.env"
    fi
    
    # Exécuter les sauvegardes
    setup_backup_directory
    backup_database
    backup_application
    backup_user_data
    backup_system_config
    generate_backup_report
    test_backup_integrity
    cleanup_old_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Calculer la taille totale des sauvegardes créées
    local total_size=$(du -sh "$BACKUP_DIR"/${BACKUP_PREFIX}_* 2>/dev/null | awk '{sum+=$1} END {print sum "B"}' || echo "unknown")
    
    local success_message="Sauvegarde terminée avec succès en ${duration}s (${total_size})"
    log "$success_message"
    
    notify "SUCCESS" "$success_message"
}

# Gestion des erreurs
trap 'error "Erreur lors de la sauvegarde"; notify "FAILED" "Sauvegarde échouée avec erreur"; exit 1' ERR

# Gestion des signaux
trap 'log "Sauvegarde interrompue par signal"; exit 1' INT TERM

# Vérifier les arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    cat << EOF
Usage: $0 [options]

Options:
  --help, -h              Afficher cette aide
  --test-only             Tester l'intégrité des sauvegardes existantes uniquement
  --no-cleanup            Ne pas nettoyer les anciennes sauvegardes

Variables d'environnement:
  BACKUP_RETENTION_DAYS   Nombre de jours de rétention (défaut: 30)
  BACKUP_NOTIFY_EMAIL     Email pour notifications
  BACKUP_WEBHOOK_URL      URL webhook pour notifications
  DATABASE_URL            URL de connexion PostgreSQL

EOF
    exit 0
fi

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --test-only)
            echo "Mode test uniquement"
            test_backup_integrity
            exit 0
            ;;
        --no-cleanup)
            SKIP_CLEANUP=true
            shift
            ;;
        *)
            error "Option inconnue: $1"
            exit 1
            ;;
    esac
done

# Exécuter la sauvegarde
main