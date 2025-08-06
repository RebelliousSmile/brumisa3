-- Migration 006: Système de votes et modération pour documents

-- Table des votes sur documents
CREATE TABLE IF NOT EXISTS document_votes (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    qualite_generale INTEGER NOT NULL CHECK (qualite_generale >= 1 AND qualite_generale <= 5),
    utilite_pratique INTEGER NOT NULL CHECK (utilite_pratique >= 1 AND utilite_pratique <= 5),
    respect_gamme INTEGER NOT NULL CHECK (respect_gamme >= 1 AND respect_gamme <= 5),
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, utilisateur_id)
);

-- Ajout des champs de modération et mise en avant aux documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS est_mis_en_avant BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS date_mise_en_avant TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS moderateur_id INTEGER REFERENCES utilisateurs(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS statut_moderation VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' 
    CHECK (statut_moderation IN ('EN_ATTENTE', 'APPROUVE', 'REJETE', 'SIGNALE'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS date_moderation TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS motif_rejet TEXT;

-- Table pour l'historique de modération
CREATE TABLE IF NOT EXISTS document_moderation_historique (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    moderateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    action VARCHAR(50) NOT NULL,
    ancien_statut VARCHAR(20),
    nouveau_statut VARCHAR(20),
    motif TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_document_votes_document ON document_votes(document_id);
CREATE INDEX IF NOT EXISTS idx_document_votes_utilisateur ON document_votes(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_document_votes_qualite ON document_votes(qualite_generale);
CREATE INDEX IF NOT EXISTS idx_documents_mis_en_avant ON documents(est_mis_en_avant, date_mise_en_avant) WHERE est_mis_en_avant = TRUE;
CREATE INDEX IF NOT EXISTS idx_documents_moderation ON documents(statut_moderation, date_moderation);
CREATE INDEX IF NOT EXISTS idx_moderation_historique_document ON document_moderation_historique(document_id);
CREATE INDEX IF NOT EXISTS idx_moderation_historique_moderateur ON document_moderation_historique(moderateur_id);