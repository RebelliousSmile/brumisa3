# Administration - Implémentation Technique

## Structure HTML Dashboard Admin

### Header Administrateur avec Badge de Notification

```html
<!-- Header utilisateur normal + lien admin pour Félix -->
<div class="user-header">
    <div class="user-info">
        <span>Félix Barbé</span>
        <span class="user-role">Premium</span>
    </div>
    
    <nav class="user-nav">
        <!-- Navigation utilisateur classique -->
        <a href="/dashboard">Mon tableau de bord</a>
        <a href="/documents/create/CHARACTER">Nouveau personnage</a>
        <a href="/oracles">Oracles</a>
        
        <!-- Lien admin unique pour Félix -->
        <a href="/admin" class="admin-link">
            Administration
            <span x-show="pendingModerations > 0" class="admin-badge" x-text="pendingModerations"></span>
        </a>
    </nav>
</div>
```

### Structure Dashboard Principal

**Organisation des composants :**
- **Header** : Titre + lien retour vers interface utilisateur normale
- **Cartes métriques** : Vue d'ensemble des statistiques clés
- **Alertes modération** : Section prioritaire si éléments en attente
- **Navigation sections** : Accès aux différents modules d'administration
- **Activité récente** : Timeline des dernières actions sur le site

**Sections d'Administration :**
- **Utilisateurs** : Gestion comptes, statistiques, support
- **Documents** : Modération, statistiques, suppressions
- **Oracles** : Gestion oracles officiels, import/export
- **Témoignages** : Validation témoignages utilisateurs
- **Communauté** : Modération, votes, signalements (v1.1)
- **Analytics** : Métriques détaillées produit
- **Système** : Configuration, maintenance, logs

## JavaScript Alpine.js Admin Dashboard

```javascript
// public/js/admin-dashboard.js
function adminDashboard() {
    return {
        pendingCount: 0,
        selectedFilters: {
            status: 'pending',
            system: 'all',
            dateRange: '7d'
        },
        
        async init() {
            await this.loadPendingCount();
            this.startPolling();
        },
        
        async loadPendingCount() {
            try {
                const response = await fetch('/api/admin/pending-count');
                const data = await response.json();
                this.pendingCount = data.count;
            } catch (error) {
                console.error('Erreur chargement pending count:', error);
            }
        },
        
        startPolling() {
            // Actualisation automatique toutes les 5 minutes
            setInterval(() => {
                this.loadPendingCount();
            }, 5 * 60 * 1000);
        },
        
        async previewDocument(documentId) {
            // Ouvre aperçu document dans modal ou nouvel onglet
            window.open(`/documents/${documentId}/preview`, '_blank');
        },
        
        async approveDocument(documentId) {
            await this.moderateDocument(documentId, 'approve');
        },
        
        async rejectDocument(documentId) {
            const reason = prompt('Raison du rejet (sera communiquée au créateur) :');
            if (reason) {
                await this.moderateDocument(documentId, 'reject', reason);
            }
        },
        
        async moderateDocument(documentId, action, reason = null) {
            try {
                const response = await fetch(`/admin/documents/${documentId}/moderate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action, reason })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Rafraîchir la page ou supprimer l'élément de la liste
                    window.location.reload();
                } else {
                    alert(`Erreur: ${result.error}`);
                }
                
            } catch (error) {
                console.error('Erreur modération:', error);
                alert('Erreur lors de la modération');
            }
        },
        
        async exportData(type, format = 'csv') {
            // Export données pour analyse externe
            window.open(`/admin/export/${type}?format=${format}`, '_blank');
        }
    };
}
```

## API Endpoints Administration

### Routes Admin Principales

```javascript
// Routes pour dashboard admin
GET /admin - Dashboard principal
GET /api/admin/pending-count - Nombre éléments en attente
POST /admin/documents/:id/moderate - Modération document
GET /admin/export/:type - Export données pour analyse
```

### Workflow Technique Modération

```
PUBLICATION DOCUMENT PUBLIC
         ↓
    Publication immédiate (visible communauté)
         ↓
    Notification admin (email/dashboard)
         ↓
    Félix modère dans les 48h
         ↓
    Validation OU Suppression + notification créateur
```

### Fonctionnalités Interface Modération

**Filtres et Actions :**
- **Filtrage** : Par statut (pending/approved/rejected) et système JDR
- **Vue liste** : Documents avec informations créateur, date, type, système
- **Actions rapides** : Aperçu, Approuver, Rejeter sur chaque document
- **Pagination** : Gestion des grandes listes de documents
- **Statistiques** : Nombre en attente, approuvés, rejetés

## Métriques Techniques Collectées

### Données Analytics Système

**Périodes d'Analyse :**
- **7 jours** : Suivi tendances hebdomadaires  
- **30 jours** : Métriques mensuelles standard
- **90 jours** : Analyse trimestrielle évolution
- **1 an** : Vision long terme et saisonnalité

**Types de Métriques Techniques :**
- Sessions anonymes vs connectées
- Conversion anonyme vers compte
- Pourcentage d'usage des oracles
- Répartition par systèmes JDR
- Performance génération PDF
- Temps de réponse moyen
- Erreurs système et debugging

### Base de Données Administration

**Tables impliquées :**
- `users` - Gestion utilisateurs et rôles admin
- `documents` - Statuts de modération
- `testimonials` - Validation témoignages
- `admin_actions` - Log des actions administratives
- `analytics_events` - Événements pour métriques

**Requêtes PostgreSQL types :**
```sql
-- Nombre documents en attente modération
SELECT COUNT(*) FROM documents WHERE status = 'pending';

-- Métriques utilisateurs dernières 24h
SELECT COUNT(*) as new_users 
FROM users 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Export données analytics
SELECT * FROM analytics_events 
WHERE event_date BETWEEN $1 AND $2 
ORDER BY event_date DESC;
```