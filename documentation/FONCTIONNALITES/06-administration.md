# Administration - Dashboard Admin

## Vision : Administration Simple et Efficace

**Principe fondamental :** Félix utilise brumisater exactement comme les autres utilisateurs (dashboard normal, créations, oracles). Il a simplement accès à un **dashboard d'administration séparé** via un lien dans son header.

### Rôle de Félix
- **👤 Utilisateur premium normal** : Utilise toutes les fonctionnalités comme Alex et Sam
- **👑 Administrateur** : Accès au dashboard admin pour modération et métriques
- **🎯 Vision produit** : Les analytics l'aident à prendre des décisions sur l'évolution du produit

### Contraintes d'Administration
- **Interface séparée** : Dashboard admin accessible via `/admin`
- **Modération a posteriori** : Validation après publication (pas de bottleneck)
- **Métriques produit** : Focus sur validation des hypothèses MVP
- **Administration légère** : Pas de complexité technique inutile

## Architecture Dashboard Admin

### 1. Accès Administration - Lien Header Simple

#### Interface Header pour Félix
```html
<!-- Header utilisateur normal + lien admin pour Félix -->
<div class="user-header">
    <div class="user-info">
        <span>Félix Barbé</span>
        <span class="user-role">Premium</span>
    </div>
    
    <nav class="user-nav">
        <!-- Navigation utilisateur classique -->
        <a href="/dashboard">📊 Mon tableau de bord</a>
        <a href="/documents/create/CHARACTER">➕ Nouveau personnage</a>
        <a href="/oracles">🔮 Oracles</a>
        
        <!-- Lien admin unique pour Félix -->
        <a href="/admin" class="admin-link">
            🔧 Administration
            <span x-show="pendingModerations > 0" class="admin-badge" x-text="pendingModerations"></span>
        </a>
    </nav>
</div>
```

**Note :** Félix utilise le site exactement comme les autres utilisateurs. Le lien "Administration" est la seule différence dans son interface.

### 2. Dashboard Admin Principal

#### Données Affichées
**Statistiques Collectées :**
- **Utilisateurs** : Total inscrits, nouveaux aujourd'hui
- **Documents** : Total générés, créés aujourd'hui (anonymes vs connectés) 
- **Personnages** : Total sauvegardés, taux conversion (personnages/documents)
- **Oracles** : Nombre d'oracles disponibles par système
- **Témoignages** : Total soumis, en attente, approuvés

**Éléments en Attente Modération :**
- **Documents publics récents** : Publiés par la communauté, statut "pending"
- **Oracles personnalisés** : Créations utilisateurs partagées (v1.2)
- **Signalements** : Contenus signalés par la communauté (v1.1)
- **Témoignages** : Nouveaux témoignages utilisateurs à valider

#### Organisation du Dashboard Admin

**Structure Principale :**
- **Header** : Titre + lien retour vers interface utilisateur normale
- **Cartes métriques** : Vue d'ensemble des statistiques clés
- **Alertes modération** : Section prioritaire si éléments en attente
- **Navigation sections** : Accès aux différents modules d'administration
- **Activité récente** : Timeline des dernières actions sur le site

**Sections d'Administration Disponibles :**
- **👥 Utilisateurs** : Gestion comptes, statistiques, support
- **📄 Documents** : Modération, statistiques, suppressions
- **🔮 Oracles** : Gestion oracles officiels, import/export
- **💬 Témoignages** : Validation témoignages utilisateurs
- **👥 Communauté** : Modération, votes, signalements (v1.1)
- **📊 Analytics** : Métriques détaillées produit
- **⚙️ Système** : Configuration, maintenance, logs

### 3. Modération Documents Publics

#### Workflow Modération A Posteriori
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

#### Interface Modération Documents
**Fonctionnalités :**
- **Filtrage** : Par statut (pending/approved/rejected) et système JDR
- **Vue liste** : Documents avec informations créateur, date, type, système
- **Actions rapides** : Aperçu, Approuver, Rejeter sur chaque document
- **Pagination** : Gestion des grandes listes de documents
- **Statistiques** : Nombre en attente, approuvés, rejetés

**Workflow de Modération :**
1. **Aperçu document** → Prévisualisation du contenu avant décision
2. **Approbation** → Document reste public, notification positive au créateur  
3. **Rejet + raison** → Document masqué, notification avec explication
4. **Traçabilité** : Logs des actions admin, historique modérations

### 4. Gestion des Témoignages

#### Fonctionnalités de Modération
**Interface de Gestion :**
- **Filtres par statut** : En attente, Approuvés, Rejetés, Tous
- **Informations témoignage** : Auteur, rôle, contenu, contexte, date
- **Statistiques** : Nombre en attente, approuvés, mis en avant
- **Actions disponibles** : Approuver, Rejeter, Mettre en avant, Retirer

**Workflow Témoignages :**
1. **Nouveau témoignage** → Statut "pending" par défaut
2. **Modération Félix** → Approbation simple ou avec mise en avant
3. **Mise en avant** → Témoignage apparaît en priorité sur site public
4. **Rejet** → Témoignage masqué définitivement

### 5. Analytics et Métriques Produit

#### Types de Métriques Collectées
**Métriques MVP Essentielles :**
- **Sessions anonymes vs connectées** : Validation du mode "sur le pouce"
- **Conversion anonyme → compte** : Mesure d'adoption long terme
- **Usage oracles** : % de sessions utilisant oracles (objectif >50%)
- **Systèmes populaires** : Répartition Monsterhearts vs autres systèmes
- **Performance génération** : Temps moyen création documents/PDF

**Périodes d'Analyse :**
- **7 jours** : Suivi tendances hebdomadaires  
- **30 jours** : Métriques mensuelles standard
- **90 jours** : Analyse trimestrielle évolution
- **1 an** : Vision long terme et saisonnalité

### 5. JavaScript Alpine.js Admin

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

## Usage Quotidien de Félix

### Scénario Typique d'une Journée
```
08h00 - Connexion brumisater (utilisation normale)
├─ Va sur son tableau de bord utilisateur
├─ Crée un nouveau personnage Monsterhearts pour sa partie
├─ Utilise oracles pour générer des révélations
└─ Génère et télécharge le PDF

15h00 - Vérification administration
├─ Clique "Administration" dans son header
├─ Voit 3 documents en attente de modération
├─ Approuve 2 documents, rejette 1 avec raison
└─ Retour au site normal (← Retour tableau de bord)

20h00 - Après sa partie de JDR  
├─ Met à jour son personnage (évolution stats)
├─ Consulte la communauté Monsterhearts
├─ Vote sur des créations d'autres joueurs
└─ Aucune action admin, juste utilisateur normal
```

**Principe :** Félix est d'abord un utilisateur, occasionnellement un administrateur.

## Métriques de Succès Administration

### 📊 Efficacité Modération
- **Temps modération moyen** : < 24h (objectif: réactivité communauté)
- **Taux de modération** : < 5% documents rejetés (qualité communauté)
- **Satisfaction post-modération** : > 80% (communication transparente)

### 👤 Usage Personnel Félix
- **Utilisation personnelle** : > 10 créations/mois (Félix reste un utilisateur actif)
- **Accès administration** : < 15min/jour en moyenne (administration légère)
- **Temps admin vs user** : 10/90 ratio (priorité à l'usage utilisateur)

### 📈 Vision Produit
- **Décisions basées données** : 100% features justifiées par analytics
- **Réactivité problèmes** : < 2h détection + résolution
- **Evolution communauté** : Croissance saine sans modération excessive