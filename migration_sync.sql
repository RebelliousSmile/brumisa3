-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'UTILISATEUR');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('GENERIQUE', 'CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER');

-- DropForeignKey
ALTER TABLE "public"."actualites" DROP CONSTRAINT "actualites_auteur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."demandes_changement_email" DROP CONSTRAINT "demandes_changement_email_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_moderation_historique" DROP CONSTRAINT "document_moderation_historique_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_moderation_historique" DROP CONSTRAINT "document_moderation_historique_moderateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_univers_jeu" DROP CONSTRAINT "fk_doc_univers_univers";

-- DropForeignKey
ALTER TABLE "public"."document_votes" DROP CONSTRAINT "document_votes_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_votes" DROP CONSTRAINT "document_votes_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_moderateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_personnage_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "fk_documents_univers";

-- DropForeignKey
ALTER TABLE "public"."logs_activite" DROP CONSTRAINT "logs_activite_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_cascades" DROP CONSTRAINT "oracle_cascades_oracle_enfant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_cascades" DROP CONSTRAINT "oracle_cascades_oracle_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_cascades" DROP CONSTRAINT "oracle_cascades_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_categories" DROP CONSTRAINT "oracle_categories_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_category_assignments" DROP CONSTRAINT "oracle_category_assignments_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_category_assignments" DROP CONSTRAINT "oracle_category_assignments_oracle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_drafts" DROP CONSTRAINT "oracle_drafts_admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_drafts" DROP CONSTRAINT "oracle_drafts_oracle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_draws" DROP CONSTRAINT "oracle_draws_oracle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_draws" DROP CONSTRAINT "oracle_draws_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_edit_history" DROP CONSTRAINT "oracle_edit_history_admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_edit_history" DROP CONSTRAINT "oracle_edit_history_oracle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_imports" DROP CONSTRAINT "oracle_imports_admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_imports" DROP CONSTRAINT "oracle_imports_oracle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_items" DROP CONSTRAINT "oracle_items_oracle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_propositions" DROP CONSTRAINT "oracle_propositions_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_votes" DROP CONSTRAINT "oracle_votes_oracle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracle_votes" DROP CONSTRAINT "oracle_votes_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracles" DROP CONSTRAINT "fk_oracles_univers";

-- DropForeignKey
ALTER TABLE "public"."oracles" DROP CONSTRAINT "oracles_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."oracles_personnalises" DROP CONSTRAINT "fk_oracle_parent";

-- DropForeignKey
ALTER TABLE "public"."oracles_personnalises" DROP CONSTRAINT "oracles_personnalises_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pdfs" DROP CONSTRAINT "fk_pdfs_univers";

-- DropForeignKey
ALTER TABLE "public"."pdfs" DROP CONSTRAINT "pdfs_personnage_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pdfs" DROP CONSTRAINT "pdfs_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."personnages" DROP CONSTRAINT "fk_personnages_univers";

-- DropForeignKey
ALTER TABLE "public"."personnages" DROP CONSTRAINT "personnages_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rgpd_consentements" DROP CONSTRAINT "rgpd_consentements_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."temoignages" DROP CONSTRAINT "temoignages_moderateur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."templates_pdf" DROP CONSTRAINT "templates_pdf_auteur_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."univers_jeu" DROP CONSTRAINT "fk_univers_systeme";

-- DropForeignKey
ALTER TABLE "public"."utilisateur_email_historique" DROP CONSTRAINT "utilisateur_email_historique_utilisateur_id_fkey";

-- DropIndex
DROP INDEX "public"."idx_actualites_auteur";

-- DropIndex
DROP INDEX "public"."idx_actualites_date_publication";

-- DropIndex
DROP INDEX "public"."idx_actualites_statut";

-- DropIndex
DROP INDEX "public"."idx_demandes_email_token";

-- DropIndex
DROP INDEX "public"."idx_document_votes_document";

-- DropIndex
DROP INDEX "public"."idx_document_votes_qualite";

-- DropIndex
DROP INDEX "public"."idx_document_votes_utilisateur";

-- DropIndex
DROP INDEX "public"."idx_documents_date_creation";

-- DropIndex
DROP INDEX "public"."idx_documents_moderation";

-- DropIndex
DROP INDEX "public"."idx_documents_personnage";

-- DropIndex
DROP INDEX "public"."idx_documents_statut";

-- DropIndex
DROP INDEX "public"."idx_documents_type_systeme";

-- DropIndex
DROP INDEX "public"."idx_documents_univers";

-- DropIndex
DROP INDEX "public"."idx_documents_utilisateur";

-- DropIndex
DROP INDEX "public"."idx_documents_visibilite";

-- DropIndex
DROP INDEX "public"."idx_newsletter_email";

-- DropIndex
DROP INDEX "public"."idx_newsletter_statut";

-- DropIndex
DROP INDEX "public"."idx_oracles_active";

-- DropIndex
DROP INDEX "public"."idx_oracles_created_by";

-- DropIndex
DROP INDEX "public"."idx_oracles_filters";

-- DropIndex
DROP INDEX "public"."idx_oracles_game_system";

-- DropIndex
DROP INDEX "public"."idx_oracles_game_system_active";

-- DropIndex
DROP INDEX "public"."idx_oracles_name";

-- DropIndex
DROP INDEX "public"."idx_oracles_premium";

-- DropIndex
DROP INDEX "public"."idx_oracles_univers";

-- DropIndex
DROP INDEX "public"."idx_oracles_personnalises_parent";

-- DropIndex
DROP INDEX "public"."idx_oracles_personnalises_statut";

-- DropIndex
DROP INDEX "public"."idx_oracles_personnalises_systeme";

-- DropIndex
DROP INDEX "public"."idx_oracles_personnalises_utilisateur";

-- DropIndex
DROP INDEX "public"."idx_rgpd_utilisateur";

-- DropIndex
DROP INDEX "public"."idx_systemes_jeu_ordre";

-- DropIndex
DROP INDEX "public"."idx_systemes_jeu_statut";

-- DropIndex
DROP INDEX "public"."idx_temoignages_date";

-- DropIndex
DROP INDEX "public"."idx_temoignages_moderation";

-- DropIndex
DROP INDEX "public"."idx_temoignages_statut";

-- DropIndex
DROP INDEX "public"."idx_temoignages_systeme";

-- DropIndex
DROP INDEX "public"."idx_univers_ordre";

-- DropIndex
DROP INDEX "public"."idx_univers_statut";

-- DropIndex
DROP INDEX "public"."idx_univers_systeme";

-- DropIndex
DROP INDEX "public"."idx_univers_tags";

-- DropIndex
DROP INDEX "public"."idx_utilisateurs_anonyme";

-- DropIndex
DROP INDEX "public"."idx_utilisateurs_email";

-- DropIndex
DROP INDEX "public"."idx_utilisateurs_session";

-- DropIndex
DROP INDEX "public"."idx_utilisateurs_token";

-- DropIndex
DROP INDEX "public"."idx_utilisateurs_token_expiration";

-- DropIndex
DROP INDEX "public"."idx_utilisateurs_token_recuperation";

-- DropIndex
DROP INDEX "public"."idx_utilisateurs_type_compte";

-- AlterTable
ALTER TABLE "public"."actualites" DROP COLUMN "date_envoi",
DROP COLUMN "date_modification",
DROP COLUMN "systemes_concernes",
DROP COLUMN "type",
ALTER COLUMN "titre" SET DATA TYPE TEXT,
ALTER COLUMN "auteur_id" DROP NOT NULL,
ALTER COLUMN "statut" SET DATA TYPE TEXT,
ALTER COLUMN "date_publication" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "date_creation" SET NOT NULL,
ALTER COLUMN "date_creation" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."demandes_changement_email" DROP COLUMN "date_demande",
DROP COLUMN "date_validation",
DROP COLUMN "ip_demande",
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_traitement" TIMESTAMP(3),
ALTER COLUMN "ancien_email" SET DATA TYPE TEXT,
ALTER COLUMN "nouvel_email" SET DATA TYPE TEXT,
ALTER COLUMN "token_validation" SET DATA TYPE TEXT,
ALTER COLUMN "statut" SET DATA TYPE TEXT,
ALTER COLUMN "date_expiration" SET NOT NULL,
ALTER COLUMN "date_expiration" DROP DEFAULT,
ALTER COLUMN "date_expiration" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."document_univers_jeu" DROP CONSTRAINT "document_univers_jeu_pkey",
DROP COLUMN "date_ajout",
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "document_type" SET DATA TYPE TEXT,
ALTER COLUMN "univers_jeu" SET DATA TYPE TEXT,
ALTER COLUMN "actif" SET NOT NULL,
ALTER COLUMN "ordre_affichage" SET NOT NULL,
ALTER COLUMN "configuration" SET NOT NULL,
ALTER COLUMN "date_modification" SET NOT NULL,
ALTER COLUMN "date_modification" DROP DEFAULT,
ALTER COLUMN "date_modification" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "document_univers_jeu_pkey" PRIMARY KEY ("document_type", "univers_jeu");

-- AlterTable
ALTER TABLE "public"."document_votes" DROP COLUMN "date_creation",
DROP COLUMN "respect_gamme",
ADD COLUMN     "clarte_presentation" INTEGER NOT NULL,
ADD COLUMN     "date_vote" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "facilite_utilisation" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."documents" DROP COLUMN "contexte_utilisation",
DROP COLUMN "date_mise_en_avant",
DROP COLUMN "date_moderation",
DROP COLUMN "donnees",
DROP COLUMN "est_mis_en_avant",
DROP COLUMN "moderateur_id",
DROP COLUMN "motif_rejet",
DROP COLUMN "notes_creation",
DROP COLUMN "personnage_id",
DROP COLUMN "statut_moderation",
DROP COLUMN "visibilite",
DROP COLUMN "visible_admin_only",
ADD COLUMN     "contenu" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "date_publication" TIMESTAMP(3),
ADD COLUMN     "nombre_utilisations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nombre_vues" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."DocumentType" NOT NULL,
ALTER COLUMN "titre" SET DATA TYPE TEXT,
ALTER COLUMN "systeme_jeu" SET DATA TYPE TEXT,
ALTER COLUMN "utilisateur_id" SET NOT NULL,
ALTER COLUMN "statut" SET DEFAULT 'BROUILLON',
ALTER COLUMN "statut" SET DATA TYPE TEXT,
ALTER COLUMN "date_creation" SET NOT NULL,
ALTER COLUMN "date_creation" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "date_modification" SET NOT NULL,
ALTER COLUMN "date_modification" DROP DEFAULT,
ALTER COLUMN "date_modification" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "univers_jeu" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."newsletter_abonnes" DROP COLUMN "date_confirmation",
DROP COLUMN "date_creation",
DROP COLUMN "date_modification",
DROP COLUMN "derniere_communication",
DROP COLUMN "preferences",
DROP COLUMN "source",
DROP COLUMN "statut",
DROP COLUMN "token_confirmation",
ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "date_desinscription" TIMESTAMP(3),
ADD COLUMN     "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "frequence_envoi" TEXT NOT NULL DEFAULT 'MENSUELLE',
ADD COLUMN     "systemes_interets" TEXT[],
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "nom" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."oracles" DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "filters",
DROP COLUMN "game_system",
DROP COLUMN "is_active",
DROP COLUMN "name",
DROP COLUMN "premium_required",
DROP COLUMN "total_weight",
DROP COLUMN "updated_at",
ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "donnees_oracle" JSONB NOT NULL,
ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "systeme_jeu" TEXT NOT NULL,
ALTER COLUMN "univers_jeu" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."oracles_personnalises" DROP CONSTRAINT "oracles_personnalises_pkey",
DROP COLUMN "donnees",
DROP COLUMN "nombre_utilisations",
DROP COLUMN "oracle_parent_id",
DROP COLUMN "statut",
DROP COLUMN "systeme_jeu",
ADD COLUMN     "donnees_oracle" JSONB NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "nom" SET DATA TYPE TEXT,
ALTER COLUMN "date_creation" SET NOT NULL,
ALTER COLUMN "date_creation" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "date_modification" SET NOT NULL,
ALTER COLUMN "date_modification" DROP DEFAULT,
ALTER COLUMN "date_modification" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "oracles_personnalises_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."rgpd_consentements" DROP COLUMN "ip_adresse",
ADD COLUMN     "adresse_ip" TEXT,
ALTER COLUMN "type_consentement" SET DATA TYPE TEXT,
ALTER COLUMN "date_consentement" SET NOT NULL,
ALTER COLUMN "date_consentement" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."systemes_jeu" DROP CONSTRAINT "systemes_jeu_pkey",
DROP COLUMN "couleur_theme",
DROP COLUMN "date_ajout",
DROP COLUMN "date_derniere_maj_structure",
DROP COLUMN "icone",
DROP COLUMN "message_maintenance",
DROP COLUMN "statut",
DROP COLUMN "structure_donnees",
ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "couleur_primaire" TEXT,
ADD COLUMN     "couleur_secondaire" TEXT,
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pictogramme" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "nom_complet" SET DATA TYPE TEXT,
ALTER COLUMN "site_officiel" SET DATA TYPE TEXT,
ALTER COLUMN "version_supportee" SET DATA TYPE TEXT,
ALTER COLUMN "ordre_affichage" SET NOT NULL,
ALTER COLUMN "date_modification" SET NOT NULL,
ALTER COLUMN "date_modification" DROP DEFAULT,
ALTER COLUMN "date_modification" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "systemes_jeu_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."temoignages" DROP COLUMN "date_modification",
DROP COLUMN "ip_adresse",
DROP COLUMN "lien_contact",
DROP COLUMN "moderateur_id",
DROP COLUMN "motif_rejet",
DROP COLUMN "systeme_jeu",
DROP COLUMN "user_agent",
ALTER COLUMN "auteur_nom" SET DATA TYPE TEXT,
ALTER COLUMN "auteur_email" SET DATA TYPE TEXT,
ALTER COLUMN "note" DROP NOT NULL,
ALTER COLUMN "statut" SET DATA TYPE TEXT,
ALTER COLUMN "date_moderation" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "date_creation" SET NOT NULL,
ALTER COLUMN "date_creation" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."univers_jeu" DROP CONSTRAINT "univers_jeu_pkey",
DROP COLUMN "annee_sortie",
DROP COLUMN "configuration",
DROP COLUMN "couleur_accent",
DROP COLUMN "couleur_theme",
DROP COLUMN "date_derniere_maj_structure",
DROP COLUMN "editeur",
DROP COLUMN "icone",
DROP COLUMN "image_hero",
DROP COLUMN "langue_principale",
DROP COLUMN "langues_disponibles",
DROP COLUMN "message_maintenance",
DROP COLUMN "statut",
DROP COLUMN "structure_donnees",
DROP COLUMN "systeme_jeu",
DROP COLUMN "tags",
DROP COLUMN "version_supportee",
ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "couleur_primaire" TEXT,
ADD COLUMN     "couleur_secondaire" TEXT,
ADD COLUMN     "pictogramme" TEXT,
ADD COLUMN     "systeme_jeu_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "nom_complet" SET DATA TYPE TEXT,
ALTER COLUMN "site_officiel" SET DATA TYPE TEXT,
ALTER COLUMN "ordre_affichage" SET NOT NULL,
ALTER COLUMN "date_creation" SET NOT NULL,
ALTER COLUMN "date_creation" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "date_modification" SET NOT NULL,
ALTER COLUMN "date_modification" DROP DEFAULT,
ALTER COLUMN "date_modification" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "univers_jeu_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."utilisateurs" DROP COLUMN "actif",
DROP COLUMN "avatar",
DROP COLUMN "code_acces",
DROP COLUMN "communication_preferences",
DROP COLUMN "date_creation",
DROP COLUMN "date_demande_changement_email",
DROP COLUMN "date_modification",
DROP COLUMN "derniere_connexion",
DROP COLUMN "derniere_modification_email",
DROP COLUMN "email_changement_expire_le",
DROP COLUMN "email_precedent",
DROP COLUMN "email_validation_token",
DROP COLUMN "est_anonyme",
DROP COLUMN "historique_emails",
DROP COLUMN "mot_de_passe",
DROP COLUMN "newsletter_abonne",
DROP COLUMN "nom",
DROP COLUMN "preferences",
DROP COLUMN "premium_expire_le",
DROP COLUMN "pseudo_public",
DROP COLUMN "session_id",
DROP COLUMN "statut",
DROP COLUMN "token_changement_email",
DROP COLUMN "token_expiration",
DROP COLUMN "token_recuperation",
DROP COLUMN "type_compte",
DROP COLUMN "type_premium",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "email" SET DATA TYPE TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'UTILISATEUR';

-- DropTable
DROP TABLE "public"."document_moderation_historique";

-- DropTable
DROP TABLE "public"."document_systeme_jeu";

-- DropTable
DROP TABLE "public"."logs_activite";

-- DropTable
DROP TABLE "public"."migrations";

-- DropTable
DROP TABLE "public"."oracle_cascades";

-- DropTable
DROP TABLE "public"."oracle_categories";

-- DropTable
DROP TABLE "public"."oracle_category_assignments";

-- DropTable
DROP TABLE "public"."oracle_drafts";

-- DropTable
DROP TABLE "public"."oracle_draws";

-- DropTable
DROP TABLE "public"."oracle_edit_history";

-- DropTable
DROP TABLE "public"."oracle_imports";

-- DropTable
DROP TABLE "public"."oracle_items";

-- DropTable
DROP TABLE "public"."oracle_propositions";

-- DropTable
DROP TABLE "public"."oracle_votes";

-- DropTable
DROP TABLE "public"."parametres";

-- DropTable
DROP TABLE "public"."pdf_templates_premium";

-- DropTable
DROP TABLE "public"."pdfs";

-- DropTable
DROP TABLE "public"."personnages";

-- DropTable
DROP TABLE "public"."sessions";

-- DropTable
DROP TABLE "public"."templates_pdf";

-- DropTable
DROP TABLE "public"."test_migration";

-- DropTable
DROP TABLE "public"."utilisateur_email_historique";

-- AddForeignKey
ALTER TABLE "public"."univers_jeu" ADD CONSTRAINT "univers_jeu_systeme_jeu_id_fkey" FOREIGN KEY ("systeme_jeu_id") REFERENCES "public"."systemes_jeu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_univers_jeu_fkey" FOREIGN KEY ("univers_jeu") REFERENCES "public"."univers_jeu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_univers_jeu" ADD CONSTRAINT "document_univers_jeu_univers_jeu_fkey" FOREIGN KEY ("univers_jeu") REFERENCES "public"."univers_jeu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."oracles" ADD CONSTRAINT "oracles_univers_jeu_fkey" FOREIGN KEY ("univers_jeu") REFERENCES "public"."univers_jeu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."oracles_personnalises" ADD CONSTRAINT "oracles_personnalises_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_votes" ADD CONSTRAINT "document_votes_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_votes" ADD CONSTRAINT "document_votes_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rgpd_consentements" ADD CONSTRAINT "rgpd_consentements_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."demandes_changement_email" ADD CONSTRAINT "demandes_changement_email_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

