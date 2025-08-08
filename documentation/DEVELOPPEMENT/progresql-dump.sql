--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: utilisateurs; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.utilisateurs (id, nom, email, role, code_acces, session_id, derniere_connexion, date_creation, date_modification, actif, mot_de_passe, token_recuperation, token_expiration, type_compte, est_anonyme, avatar, preferences, statut, type_premium, premium_expire_le, newsletter_abonne, communication_preferences, pseudo_public, email_precedent, email_validation_token, email_changement_expire_le, derniere_modification_email, token_changement_email, date_demande_changement_email, historique_emails) FROM stdin;
3	tnn	internet@fxguillois.email	UTILISATEUR	\N	\N	2025-08-05 16:03:20.129	2025-07-20 12:36:07.18	2025-08-05 14:03:20.142	t	32176198d15c3999b53b73565b6f61b0:24f3aff1e33c5d20d2893a45ba2378d8b1fbd5a4385d035091351c90c3ac67389db935df9cecd0c0dc8bbf6e005996efaeb22f82331a7ed2d4d065521c4e9024	\N	\N	STANDARD	f	\N	{}	ACTIF	\N	\N	f	{}	\N	\N	\N	\N	\N	\N	\N	[]
0	Utilisateur Anonyme	\N	UTILISATEUR	\N	\N	\N	2025-07-22 10:24:02.416545	2025-07-22 10:24:02.416545	t	\N	\N	\N	STANDARD	t	\N	{}	ACTIF	\N	\N	f	{}	\N	\N	\N	\N	\N	\N	\N	[]
4	Test User	test@example.com	UTILISATEUR	\N	\N	2025-07-20 15:13:56.592	2025-07-20 13:13:56.694	2025-07-23 08:33:31.491	t	548156a29f04eb18b31dd0baf5904ad4:890f13e5f5d98a63c3bf7610f4a3f94cbb5edb158be697553c88d99a01c168f69a38785fe87142c68153dc8ac7fa5840fb89c0e521ac84a80ff947c04da716b1	\N	\N	STANDARD	f	\N	{}	ACTIF	\N	\N	f	{}	\N	\N	\N	\N	\N	\N	\N	[]
1	Administrateur	activation@brumisa3.fr	ADMIN	\N	\N	2025-08-05 11:27:51.647	2025-07-19 16:03:27.583722	2025-08-05 09:29:02.736	t	a4c6a2842a11aedf3ff36895b1c90455:9a23058759dd61fb1ad03c7df2511b04f2a5599a8053d5410d7b7978f3d7c70143939c906bc42ad289a55d11c439bd72b4380dcdd09c7350bdfe1a0285dfb555	\N	\N	STANDARD	f	\N	{}	ACTIF	\N	\N	f	{}	\N	\N	\N	\N	\N	\N	\N	[]
\.


--
-- Data for Name: actualites; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.actualites (id, titre, resume, contenu_html, auteur_id, systemes_concernes, type, statut, date_publication, date_envoi, date_creation, date_modification) FROM stdin;
\.


--
-- Data for Name: demandes_changement_email; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.demandes_changement_email (id, utilisateur_id, ancien_email, nouvel_email, token_validation, statut, date_demande, date_expiration, date_validation, ip_demande) FROM stdin;
\.


--
-- Data for Name: personnages; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.personnages (id, utilisateur_id, nom, systeme_jeu, attributs, competences, avantages, equipement, historique, notes, sante_actuelle, sante_maximale, experience_actuelle, experience_totale, avatar_url, couleur_theme, public, date_creation, date_modification, tags, derniere_utilisation, nombre_modifications) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.documents (id, type, titre, systeme_jeu, utilisateur_id, personnage_id, donnees, notes_creation, contexte_utilisation, statut, visibilite, visible_admin_only, date_creation, date_modification, est_mis_en_avant, date_mise_en_avant, moderateur_id, statut_moderation, date_moderation, motif_rejet) FROM stdin;
\.


--
-- Data for Name: document_moderation_historique; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.document_moderation_historique (id, document_id, moderateur_id, action, ancien_statut, nouveau_statut, motif, date_action) FROM stdin;
\.


--
-- Data for Name: document_systeme_jeu; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration, date_ajout, date_modification) FROM stdin;
CHARACTER	monsterhearts	t	1	{"template": "monsterhearts-character", "required_fields": ["nom", "skin"]}	2025-08-06 20:21:28.256918	2025-08-06 20:21:28.256918
TOWN	monsterhearts	t	2	{"template": "monsterhearts-town", "required_fields": ["nom", "description"]}	2025-08-06 20:21:28.269579	2025-08-06 20:21:28.269579
GROUP	monsterhearts	t	3	{"template": "monsterhearts-group", "required_fields": ["nom", "etablissement"]}	2025-08-06 20:21:28.281103	2025-08-06 20:21:28.281103
ORGANIZATION	monsterhearts	t	4	{"template": "organization-list", "required_fields": ["nom", "membres"]}	2025-08-06 20:21:28.292819	2025-08-06 20:21:28.292819
CHARACTER	mistengine	t	1	{"template": "mistengine-character", "required_fields": ["nom"]}	2025-08-06 20:21:28.304495	2025-08-06 20:21:28.304495
DANGER	mistengine	t	2	{"template": "mistengine-danger", "required_fields": ["nom", "type_front"]}	2025-08-06 20:21:28.316164	2025-08-06 20:21:28.316164
ORGANIZATION	mistengine	t	3	{"template": "organization-list", "required_fields": ["nom", "membres"]}	2025-08-06 20:21:28.328737	2025-08-06 20:21:28.328737
CHARACTER	engrenages	t	1	{"template": "engrenages-character", "required_fields": ["nom", "concept"]}	2025-08-06 20:21:28.341517	2025-08-06 20:21:28.341517
ORGANIZATION	engrenages	t	2	{"template": "organization-list", "required_fields": ["nom", "membres"]}	2025-08-06 20:21:28.354928	2025-08-06 20:21:28.354928
CHARACTER	metro2033	t	1	{"template": "metro2033-character", "required_fields": ["nom", "station_origine"]}	2025-08-06 20:21:28.367481	2025-08-06 20:21:28.367481
ORGANIZATION	metro2033	t	2	{"template": "organization-list", "required_fields": ["nom", "faction"]}	2025-08-06 20:21:28.379257	2025-08-06 20:21:28.379257
CHARACTER	zombiology	t	1	{"template": "zombiology-character", "required_fields": ["nom"]}	2025-08-06 20:21:28.391296	2025-08-06 20:21:28.391296
ORGANIZATION	zombiology	t	2	{"template": "organization-list", "required_fields": ["nom", "survivants"]}	2025-08-06 20:21:28.402375	2025-08-06 20:21:28.402375
\.


--
-- Data for Name: document_votes; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.document_votes (id, document_id, utilisateur_id, qualite_generale, utilite_pratique, respect_gamme, commentaire, date_creation) FROM stdin;
\.


--
-- Data for Name: logs_activite; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.logs_activite (id, utilisateur_id, action, ressource, ressource_id, details, adresse_ip, user_agent, date_creation) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.migrations (id, version, migration_name, executed_at) FROM stdin;
1	1.1.0	add_password_authentication	2025-07-20 10:49:50.26465
2	1.1.0	add_password_indexes	2025-07-20 10:50:04.272178
3	1.1.0	add_password_expiration_index	2025-07-20 10:50:04.296869
\.


--
-- Data for Name: newsletter_abonnes; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.newsletter_abonnes (id, email, nom, preferences, statut, token_confirmation, date_confirmation, source, derniere_communication, date_creation, date_modification) FROM stdin;
\.


--
-- Data for Name: oracles_personnalises; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracles_personnalises (id, nom, description, systeme_jeu, utilisateur_id, oracle_parent_id, donnees, statut, nombre_utilisations, date_creation, date_modification) FROM stdin;
\.


--
-- Data for Name: oracle_cascades; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_cascades (id, oracle_parent_id, oracle_enfant_id, parametre_liaison, utilisateur_id, ordre_execution, date_creation) FROM stdin;
\.


--
-- Data for Name: oracle_categories; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_categories (id, name, description, parent_id, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: oracles; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracles (id, name, description, premium_required, total_weight, filters, is_active, created_at, updated_at, created_by, game_system) FROM stdin;
dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Révélations - Monsterhearts	Secrets qui éclatent au grand jour dans l'univers torturé des adolescents monstres	f	170	\N	t	2025-07-22 08:04:03.015475	2025-08-06 20:38:13.082562	1	monsterhearts
11111111-1111-1111-1111-111111111111	Armes médiévales	Collection d'armes pour jeux médiévaux fantastiques	f	500	\N	t	2025-07-22 08:01:05.063873	2025-07-23 15:24:08.352457	\N	\N
22222222-2222-2222-2222-222222222222	Sorts de magie	Grimoire de sorts variés (Premium)	t	500	\N	t	2025-07-22 08:01:05.063873	2025-07-23 15:24:08.352457	\N	\N
33333333-3333-3333-3333-333333333333	Événements aléatoires	Événements pour pimenter vos aventures	f	500	\N	t	2025-07-22 08:01:05.063873	2025-07-23 15:24:08.352457	\N	\N
43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Relations - Monsterhearts	Complications romantiques et sociales dans l'enfer du lycée monstre	f	206	\N	t	2025-07-22 08:04:49.357718	2025-07-23 15:24:08.352457	1	monsterhearts
78e8a092-b04d-475c-864a-d76e225a6cdc	Événements - Monsterhearts	Incidents au lycée et en ville qui bouleversent le quotidien des adolescents monstres	f	243	\N	t	2025-07-22 08:05:50.562843	2025-07-23 15:24:08.352457	1	monsterhearts
9733827e-93d2-4f37-b6fe-4a76ef5977bb	Monstruosités - Monsterhearts	Manifestations de votre nature monstrueuse et surnaturelle	f	237	\N	t	2025-07-22 08:05:19.963196	2025-07-23 15:24:08.352457	1	monsterhearts
63bea9fd-b95b-4d9b-abc9-f4d137466d67	Monstres - Roue du Temps	Créatures et monstres du monde de la Roue du Temps	f	185	\N	t	2025-07-23 07:20:56.783039	2025-07-23 15:24:08.352457	1	engrenages
ef230508-a4c9-433b-ab42-02c15b4af97b	PNJ Connus - Roue du Temps	Personnages notables du monde de la Roue du Temps	f	271	\N	t	2025-07-23 07:22:05.519495	2025-07-23 15:24:08.352457	1	engrenages
0016cb30-f280-4190-85d2-5aa4a7e51a06	Nations - Roue du Temps	Sélection aléatoire d'une nation du monde de la Roue du Temps	f	227	\N	t	2025-07-23 07:21:31.242382	2025-07-23 15:24:08.352457	1	engrenages
\.


--
-- Data for Name: oracle_category_assignments; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_category_assignments (oracle_id, category_id) FROM stdin;
\.


--
-- Data for Name: oracle_drafts; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_drafts (id, oracle_id, admin_user_id, draft_name, oracle_data, items_data, is_published, created_at, updated_at, published_at) FROM stdin;
\.


--
-- Data for Name: oracle_draws; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_draws (id, oracle_id, user_id, session_id, results, filters_applied, draw_count, ip_address, user_agent, created_at) FROM stdin;
d8a25e3b-4aa5-45c2-a9af-cfe32f3d4df2	11111111-1111-1111-1111-111111111111	\N	\N	[{"id": "26181d22-f976-40bd-90b3-d90d881da925", "value": "Arc long", "weight": 25, "metadata": {"type": "arme", "damage": "1d8", "rarity": "commune"}}, {"id": "52d250d5-36c6-4f03-82e0-c931ce57fc72", "value": "Dague", "weight": 30, "metadata": {"type": "arme", "damage": "1d4", "rarity": "commune"}}, {"id": "0fc86948-8c8e-4a1c-b9f6-8c8332316064", "value": "Dague", "weight": 30, "metadata": {"type": "arme", "damage": "1d4", "rarity": "commune"}}]	\N	3	\N	\N	2025-07-22 11:38:16.137991
\.


--
-- Data for Name: oracle_edit_history; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_edit_history (id, oracle_id, admin_user_id, action_type, entity_type, entity_id, old_values, new_values, change_reason, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: oracle_imports; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_imports (id, admin_user_id, oracle_id, filename, file_size, file_hash, import_type, import_mode, items_imported, items_failed, validation_errors, import_status, processing_time_ms, created_at, completed_at) FROM stdin;
\.


--
-- Data for Name: oracle_items; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_items (id, oracle_id, value, weight, metadata, is_active, created_at) FROM stdin;
eda14aaf-4422-43a9-aa38-1a67ec576880	11111111-1111-1111-1111-111111111111	Épée longue	20	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-22 08:01:05.063873
52d250d5-36c6-4f03-82e0-c931ce57fc72	11111111-1111-1111-1111-111111111111	Dague	30	{"type": "arme", "damage": "1d4", "rarity": "commune"}	t	2025-07-22 08:01:05.063873
26181d22-f976-40bd-90b3-d90d881da925	11111111-1111-1111-1111-111111111111	Arc long	25	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-22 08:01:05.063873
6b3ccb8d-8297-4e93-8f49-269e708986f9	11111111-1111-1111-1111-111111111111	Hache de guerre	15	{"type": "arme", "damage": "1d10", "rarity": "peu_commune"}	t	2025-07-22 08:01:05.063873
1003e1da-e17f-4692-98b4-0bbcfa1f4084	11111111-1111-1111-1111-111111111111	Épée magique +1	8	{"type": "arme", "damage": "1d8+1", "rarity": "rare", "magical": true}	t	2025-07-22 08:01:05.063873
7bb51bc8-0ee2-4761-84d9-34747ad9f9f3	11111111-1111-1111-1111-111111111111	Excalibur	2	{"type": "arme", "damage": "2d8+3", "rarity": "legendaire", "magical": true}	t	2025-07-22 08:01:05.063873
87ab6995-42ee-46f2-9ece-78f07bc84cf5	22222222-2222-2222-2222-222222222222	Boule de feu	25	{"type": "sort", "level": 3, "damage": "3d6", "school": "evocation"}	t	2025-07-22 08:01:05.063873
b8386f71-92f1-43fd-a8e9-19aecd1fef9c	22222222-2222-2222-2222-222222222222	Soins légers	30	{"type": "sort", "level": 1, "school": "evocation", "healing": "1d8+1"}	t	2025-07-22 08:01:05.063873
7e9c5214-3263-41b5-8f84-40edbfa75581	22222222-2222-2222-2222-222222222222	Invisibilité	20	{"type": "sort", "level": 2, "school": "illusion", "duration": "1h"}	t	2025-07-22 08:01:05.063873
cc7060b4-4a91-4e7e-bddb-0d6a2597daf5	22222222-2222-2222-2222-222222222222	Téléportation	15	{"type": "sort", "level": 4, "range": "500ft", "school": "conjuration"}	t	2025-07-22 08:01:05.063873
c3376de4-dcf6-45f0-8bed-4ca85ebf515f	22222222-2222-2222-2222-222222222222	Arrêt du temps	5	{"type": "sort", "level": 9, "school": "transmutation", "duration": "1d4+1 tours"}	t	2025-07-22 08:01:05.063873
894261a8-aaec-4427-9174-a2ff74a00762	22222222-2222-2222-2222-222222222222	Résurrection	3	{"type": "sort", "level": 7, "school": "necromancy"}	t	2025-07-22 08:01:05.063873
35cf25a0-37e8-4b30-a87b-701b9a10071c	22222222-2222-2222-2222-222222222222	Météore	2	{"type": "sort", "level": 9, "damage": "20d6", "school": "evocation"}	t	2025-07-22 08:01:05.063873
3ef32170-af79-46c6-8be9-bd61eaf3f004	33333333-3333-3333-3333-333333333333	Une caravane de marchands approche	25	{"mood": "neutral", "type": "encounter"}	t	2025-07-22 08:01:05.063873
df558719-a9a5-4881-948e-29b61aa03c90	33333333-3333-3333-3333-333333333333	Des bandits attaquent !	20	{"mood": "hostile", "type": "encounter"}	t	2025-07-22 08:01:05.063873
c7fee438-af7c-421d-bfa7-af6fd3131bf5	33333333-3333-3333-3333-333333333333	Vous trouvez un coffre au trésor	15	{"mood": "positive", "type": "treasure"}	t	2025-07-22 08:01:05.063873
2ffe33a6-7a26-406a-92c0-ebe48cd6a724	33333333-3333-3333-3333-333333333333	Un orage violent éclate	20	{"mood": "negative", "type": "weather"}	t	2025-07-22 08:01:05.063873
030f5f7a-e24a-420b-b97a-6e991e09a55a	33333333-3333-3333-3333-333333333333	Un sage offre ses conseils	10	{"mood": "positive", "type": "encounter"}	t	2025-07-22 08:01:05.063873
a8305d13-0c28-40cd-ae58-6e8be80fcb37	33333333-3333-3333-3333-333333333333	Votre monture tombe malade	8	{"mood": "negative", "type": "complication"}	t	2025-07-22 08:01:05.063873
41427d31-f55a-4246-be6a-80a1ad0ba9e7	33333333-3333-3333-3333-333333333333	Vous découvrez des ruines antiques	2	{"mood": "mysterious", "type": "discovery"}	t	2025-07-22 08:01:05.063873
961014ff-e274-4586-b262-09de59d3ed97	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Le père de quelqu'un n'est pas celui qu'on croit	8	{"type": "famille", "intensité": "forte"}	t	2025-07-22 08:04:03.030371
c1307f4a-e4e7-498d-9b8a-b7c9c63a8335	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Un PNJ influent est secrètement un monstre	10	{"type": "identité", "intensité": "forte"}	t	2025-07-22 08:04:03.04487
0e351872-da08-4e4a-bb42-4b255deb3aa8	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Quelqu'un ment sur son passé depuis toujours	12	{"type": "passé", "intensité": "moyenne"}	t	2025-07-22 08:04:03.058377
c5643e17-1197-445a-abee-f2ca215835f2	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Une relation cachée entre deux personnes éclate	15	{"type": "romance", "intensité": "moyenne"}	t	2025-07-22 08:04:03.071023
f2376baf-8c8b-42fe-a900-0485b4bfb8f5	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Un crime du passé refait surface	7	{"type": "crime", "intensité": "forte"}	t	2025-07-22 08:04:03.083538
03fce085-56ad-411f-adf0-e6fec3e07f45	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Quelqu'un découvre ta vraie nature monstrueuse	20	{"type": "identité", "intensité": "forte"}	t	2025-07-22 08:04:03.097023
6b3bcc27-5ad4-4769-9b42-1e23acef0205	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Un secret de famille bouleversant est révélé	9	{"type": "famille", "intensité": "forte"}	t	2025-07-22 08:04:03.109621
560e45da-4ca0-42ac-a8ed-5ad3500203a6	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Les vrais sentiments de quelqu'un sont exposés	18	{"type": "sentiments", "intensité": "moyenne"}	t	2025-07-22 08:04:03.123204
dcf5d0ef-bb4d-4a77-b702-e27dde72cf4d	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Un mensonge répété depuis des années s'écroule	11	{"type": "mensonge", "intensité": "moyenne"}	t	2025-07-22 08:04:03.135834
54c6ca99-9a89-4f1f-88e6-48bd8e0b0f96	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Une double vie est découverte	13	{"type": "identité", "intensité": "forte"}	t	2025-07-22 08:04:03.14754
ce740529-36e3-4ea4-9774-a5b9e7e76be4	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Un chantage secret devient public	6	{"type": "manipulation", "intensité": "forte"}	t	2025-07-22 08:04:03.159207
21b4d941-6193-4f5c-9360-eaff5370a473	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	La vérité sur une mort suspecte éclate	5	{"type": "mort", "intensité": "très forte"}	t	2025-07-22 08:04:03.171837
deb03a76-f8ca-4e12-b219-f0fbac6a5e4c	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Quelqu'un découvre un pouvoir caché	14	{"type": "pouvoir", "intensité": "moyenne"}	t	2025-07-22 08:04:03.183494
6d62c8d5-87a9-42ca-8d3c-630bdbf1fa85	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Une rivalité secrète devient guerre ouverte	10	{"type": "conflit", "intensité": "forte"}	t	2025-07-22 08:04:03.195211
3b1b3dbd-dd6d-4ec8-9c37-8d9e255b757d	dd2ac6b7-c529-41ea-8a29-09d41bb2096b	Un plan secret pour nuire à quelqu'un est dévoilé	12	{"type": "trahison", "intensité": "forte"}	t	2025-07-22 08:04:03.206833
0a6efe43-ae46-4aef-8ca2-f61c19398e13	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Triangle amoureux inattendu se forme	18	{"type": "triangle", "intensité": "forte"}	t	2025-07-22 08:04:49.374542
1f7aaee0-5774-455d-8c7f-69c5f121f846	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Rupture publique dramatique	15	{"type": "rupture", "intensité": "forte"}	t	2025-07-22 08:04:49.390038
3d7623dc-9c51-4a6c-a631-3323fdf792a5	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Quelqu'un développe un crush obsessionnel	12	{"type": "obsession", "intensité": "forte"}	t	2025-07-22 08:04:49.403536
f773a606-1470-4d2c-933c-5a346c56def4	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Amitié de longue date se brise pour une raison futile	14	{"type": "amitié", "intensité": "moyenne"}	t	2025-07-22 08:04:49.415217
dcf5c744-f808-4393-9c30-64f33c648279	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Rivalité amoureuse devient guerre sociale	11	{"type": "rivalité", "intensité": "forte"}	t	2025-07-22 08:04:49.427842
3cc895be-0bb1-460b-9fac-57db391de8ef	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Couple 'parfait' cache un secret toxique	9	{"type": "toxique", "intensité": "forte"}	t	2025-07-22 08:04:49.43955
c5e5795e-3640-40a4-977c-443adb14ae1f	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Quelqu'un avoue ses sentiments au mauvais moment	20	{"type": "confession", "intensité": "moyenne"}	t	2025-07-22 08:04:49.451166
fe1641c8-4215-4568-adb5-6dab923d1381	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Liaison secrète entre personnes improbables	13	{"type": "liaison", "intensité": "forte"}	t	2025-07-22 08:04:49.462854
a9741361-5905-48cb-bd70-33819b7dd781	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Jalousie mène à un acte de vengeance	10	{"type": "vengeance", "intensité": "forte"}	t	2025-07-22 08:04:49.474489
b521e1e7-58f9-408e-b108-2b049cdaca3b	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Premier amour tourne à l'obsession dangereuse	8	{"type": "premier amour", "intensité": "très forte"}	t	2025-07-22 08:04:49.48617
8eb87349-0b6a-48e2-b287-245f6244d684	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Relation interdite (prof/élève, famille, etc.)	6	{"type": "interdit", "intensité": "très forte"}	t	2025-07-22 08:04:49.497777
4a7d617c-6931-44ed-be8f-f08b5d46d1b9	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Quelqu'un utilise la séduction pour manipuler	12	{"type": "manipulation", "intensité": "forte"}	t	2025-07-22 08:04:49.509433
1f33f344-107b-4d65-a5d2-ef9470d03306	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Ragots et rumeurs détruisent une réputation	16	{"type": "rumeur", "intensité": "moyenne"}	t	2025-07-22 08:04:49.521065
b5f01325-492e-4bcf-9740-5fc1d26f15f7	0016cb30-f280-4190-85d2-5aa4a7e51a06	Cairhien	18	{"type": "monarchie", "région": "est"}	t	2025-07-23 07:21:31.271992
46c754b8-b2a2-45c8-925c-c940266a017c	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Alliance inattendue contre un ennemi commun	14	{"type": "alliance", "intensité": "moyenne"}	t	2025-07-22 08:04:49.532724
be4f0938-f050-4c0a-b6da-7015587c1851	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Quelqu'un découvre qu'on parle dans son dos	17	{"type": "trahison", "intensité": "moyenne"}	t	2025-07-22 08:04:49.544413
91adb685-1c77-4b35-9f53-3c3a7570c49a	43a5a9a5-c3c4-4c08-9ae8-c112933c4be5	Ancienne relation revient compliquer le présent	11	{"type": "passé", "intensité": "forte"}	t	2025-07-22 08:04:49.5646
634645d2-eb9d-4e3d-836c-a7cce972c403	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tes émotions déclenchent un phénomène surnaturel	20	{"type": "émotionnel", "intensité": "forte"}	t	2025-07-22 08:05:19.976759
3a518e31-97da-4fd0-b1fe-1fe42d949bd2	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tu perds le contrôle et révèles ta vraie forme	15	{"type": "transformation", "intensité": "très forte"}	t	2025-07-22 08:05:19.989249
e3ca0d95-74c2-4034-8bb8-910ba1d1815c	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Ton instinct prédateur prend le dessus	12	{"type": "instinct", "intensité": "forte"}	t	2025-07-22 08:05:20.000845
b912dbb5-294b-42fc-af9d-fa64b32d1d7c	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tu ressens la présence d'autres créatures surnaturelles	18	{"type": "perception", "intensité": "moyenne"}	t	2025-07-22 08:05:20.01338
01c309e6-6f31-4d0a-99e1-b5c4b0798a88	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tes pouvoirs s'activent involontairement	17	{"type": "pouvoir", "intensité": "forte"}	t	2025-07-22 08:05:20.0279
c51b3c8b-c3c9-4eb1-a4b5-ca162fa0bf0d	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tu entends/vois des choses que les autres ne perçoivent pas	16	{"type": "perception", "intensité": "moyenne"}	t	2025-07-22 08:05:20.043293
4a1b8c88-109a-4b22-9f9a-783be9fb91b6	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Ton côté sombre murmure des suggestions terribles	14	{"type": "tentation", "intensité": "forte"}	t	2025-07-22 08:05:20.054833
3c1d848c-0723-4b7a-9c18-22ec17badada	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tu ressens une faim/soif surnaturelle irrépressible	13	{"type": "besoin", "intensité": "forte"}	t	2025-07-22 08:05:20.066505
866eddab-36b4-4fb4-abb4-d208da1e0c37	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tes yeux changent de couleur selon tes humeurs	19	{"type": "physique", "intensité": "faible"}	t	2025-07-22 08:05:20.078084
927c4d79-38e0-41a8-a803-5ef39392e793	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tu influences inconsciemment l'humeur des autres	15	{"type": "influence", "intensité": "moyenne"}	t	2025-07-22 08:05:20.089715
e144874c-992e-4c93-845d-55e2e64ba59b	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Des marques étranges apparaissent sur ta peau	11	{"type": "physique", "intensité": "moyenne"}	t	2025-07-22 08:05:20.101238
3b5ec83a-9527-48fa-8592-f4ea42443ac6	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tu rêves de souvenirs qui ne sont pas les tiens	10	{"type": "mémoire", "intensité": "moyenne"}	t	2025-07-22 08:05:20.112885
612e2f57-ea0c-4215-8693-471e37a5ba54	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Ta présence fait dysfonctionner la technologie	12	{"type": "technologie", "intensité": "moyenne"}	t	2025-07-22 08:05:20.124505
7fcc0189-4a72-46b0-a876-bd8f8b5b7cd6	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tu sens l'odeur des émotions des autres	14	{"type": "perception", "intensité": "moyenne"}	t	2025-07-22 08:05:20.136209
ec132737-8d49-43e1-a8b3-b55d83bcdb0b	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tes cicatrices se rouvrent dans des moments d'émotion	8	{"type": "physique", "intensité": "forte"}	t	2025-07-22 08:05:20.147835
20f3afac-a558-4c67-b341-0b0246d16cfb	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Tu parles dans une langue que tu ne connais pas	7	{"type": "possession", "intensité": "très forte"}	t	2025-07-22 08:05:20.159453
8a1c6697-d514-4308-887c-8e5ff1fc3235	9733827e-93d2-4f37-b6fe-4a76ef5977bb	Les animaux réagissent étrangement à ta présence	16	{"type": "nature", "intensité": "faible"}	t	2025-07-22 08:05:20.171151
c01114bf-0158-434d-bdc6-1844fa2a7c73	78e8a092-b04d-475c-864a-d76e225a6cdc	Blackout total pendant une soirée importante	12	{"lieu": "ville", "type": "incident"}	t	2025-07-22 08:05:50.577206
86d935f6-a1f2-4a85-adce-dc0cf6100b74	78e8a092-b04d-475c-864a-d76e225a6cdc	Bagarre générale éclate à la cafétéria	18	{"lieu": "lycée", "type": "violence"}	t	2025-07-22 08:05:50.590801
213c695c-ceb7-40bd-b067-534d82b4fca2	78e8a092-b04d-475c-864a-d76e225a6cdc	Incendie mystérieux dans un lieu symbolique	10	{"lieu": "ville", "type": "catastrophe"}	t	2025-07-22 08:05:50.602434
d7b4ea64-b3a6-4680-aa2e-952e548436f8	78e8a092-b04d-475c-864a-d76e225a6cdc	Fête sauvage qui dégénère complètement	20	{"lieu": "privé", "type": "social"}	t	2025-07-22 08:05:50.615389
a43aebc2-810a-451c-b752-ef62a41f0b75	78e8a092-b04d-475c-864a-d76e225a6cdc	Quelqu'un disparaît sans laisser de traces	8	{"lieu": "ville", "type": "mystère"}	t	2025-07-22 08:05:50.627669
cfc47a93-f2da-4c00-a663-0a5de3c92689	78e8a092-b04d-475c-864a-d76e225a6cdc	Accident de voiture impliquant des élèves	11	{"lieu": "ville", "type": "accident"}	t	2025-07-22 08:05:50.639323
fd1eaa8b-bda5-4d50-b60d-7043be5f738e	78e8a092-b04d-475c-864a-d76e225a6cdc	Scandale sexuel secoue l'établissement	14	{"lieu": "lycée", "type": "scandale"}	t	2025-07-22 08:05:50.6509
fea170fa-faed-4f12-9e8e-cc7906945306	78e8a092-b04d-475c-864a-d76e225a6cdc	Phénomène étrange terrorise la ville	9	{"lieu": "ville", "type": "surnaturel"}	t	2025-07-22 08:05:50.662597
387574d4-8008-46a5-9eb3-3ca261bdfb2f	78e8a092-b04d-475c-864a-d76e225a6cdc	Élection catastrophique au conseil étudiant	15	{"lieu": "lycée", "type": "politique"}	t	2025-07-22 08:05:50.674167
c767728d-d39a-44a9-9420-3f90cb2a44d9	78e8a092-b04d-475c-864a-d76e225a6cdc	Surdose ou intoxication lors d'une soirée	7	{"lieu": "privé", "type": "drogue"}	t	2025-07-22 08:05:50.685883
a584e56b-7316-4246-a085-ae95fbfd2bba	78e8a092-b04d-475c-864a-d76e225a6cdc	Menaces de fermeture du lycée	13	{"lieu": "lycée", "type": "administratif"}	t	2025-07-22 08:05:50.697717
b4ee13be-25aa-43c1-ac84-f58383c39cc4	78e8a092-b04d-475c-864a-d76e225a6cdc	Suicide ou tentative choque la communauté	5	{"lieu": "ville", "type": "tragédie"}	t	2025-07-22 08:05:50.709443
83cebb87-f73c-4c20-889f-250de2d23dab	78e8a092-b04d-475c-864a-d76e225a6cdc	Épidémie mystérieuse frappe l'école	10	{"lieu": "lycée", "type": "maladie"}	t	2025-07-22 08:05:50.721016
cebdc172-58b5-4f38-b64a-47610e831dd4	78e8a092-b04d-475c-864a-d76e225a6cdc	Contrôle de police inattendu au lycée	16	{"lieu": "lycée", "type": "autorité"}	t	2025-07-22 08:05:50.732796
df874295-5bc0-4e60-8b2b-55a585b811c0	78e8a092-b04d-475c-864a-d76e225a6cdc	Nouveaux élèves arrivent avec des secrets	17	{"lieu": "lycée", "type": "arrivée"}	t	2025-07-22 08:05:50.750564
329a3574-b8a6-47a8-9249-9de1eff3461e	78e8a092-b04d-475c-864a-d76e225a6cdc	Professeur a une crise nerveuse en cours	14	{"lieu": "lycée", "type": "personnel"}	t	2025-07-22 08:05:50.762673
7cdcfb3b-e6d0-4258-ae6d-7d02a0ade568	78e8a092-b04d-475c-864a-d76e225a6cdc	Manifestation ou émeute en centre-ville	8	{"lieu": "ville", "type": "social"}	t	2025-07-22 08:05:50.774493
8905c5ab-853d-4c63-8704-4f3213a724d3	78e8a092-b04d-475c-864a-d76e225a6cdc	Ancien élève revient avec de mauvaises intentions	11	{"lieu": "lycée", "type": "retour"}	t	2025-07-22 08:05:50.786085
41a044b0-f0cc-4fec-af86-129c013ac910	78e8a092-b04d-475c-864a-d76e225a6cdc	Inondation ou catastrophe naturelle	9	{"lieu": "ville", "type": "catastrophe"}	t	2025-07-22 08:05:50.797832
ce4dfe03-3889-4604-a76a-63950fef8c3b	78e8a092-b04d-475c-864a-d76e225a6cdc	Compétition sportive vire au drame	16	{"lieu": "lycée", "type": "sport"}	t	2025-07-22 08:05:50.809517
0f649289-5762-4fad-8f3b-2b4fc22c01ec	11111111-1111-1111-1111-111111111111	Épée longue	20	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-22 10:24:02.449794
ef284a17-17b4-48d2-b9b7-9f2e955f7e25	11111111-1111-1111-1111-111111111111	Dague	30	{"type": "arme", "damage": "1d4", "rarity": "commune"}	t	2025-07-22 10:24:02.449794
1f5a2ecb-189a-49bd-a41d-5ff7ccae49c9	11111111-1111-1111-1111-111111111111	Arc long	25	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-22 10:24:02.449794
887dec7e-7785-4ba2-93e5-b94ce921d8a1	11111111-1111-1111-1111-111111111111	Hache de guerre	15	{"type": "arme", "damage": "1d10", "rarity": "peu_commune"}	t	2025-07-22 10:24:02.449794
34e824c5-c8ec-4060-aa96-82226d729eab	11111111-1111-1111-1111-111111111111	Épée magique +1	8	{"type": "arme", "damage": "1d8+1", "rarity": "rare", "magical": true}	t	2025-07-22 10:24:02.449794
7254a0e0-791e-4b37-895b-ddd4348dc86f	11111111-1111-1111-1111-111111111111	Excalibur	2	{"type": "arme", "damage": "2d8+3", "rarity": "legendaire", "magical": true}	t	2025-07-22 10:24:02.449794
d08b4e1d-f01c-4621-a78e-fc5ec987e54c	22222222-2222-2222-2222-222222222222	Boule de feu	25	{"type": "sort", "level": 3, "damage": "3d6", "school": "evocation"}	t	2025-07-22 10:24:02.449794
c0fc38e1-7f07-4d01-a23b-b1ea6edd89b8	22222222-2222-2222-2222-222222222222	Soins légers	30	{"type": "sort", "level": 1, "school": "evocation", "healing": "1d8+1"}	t	2025-07-22 10:24:02.449794
cdb611f6-d089-4f12-8ac6-4f226957403a	22222222-2222-2222-2222-222222222222	Invisibilité	20	{"type": "sort", "level": 2, "school": "illusion", "duration": "1h"}	t	2025-07-22 10:24:02.449794
cfab41b4-218b-4482-9de7-40de46f460a5	22222222-2222-2222-2222-222222222222	Téléportation	15	{"type": "sort", "level": 4, "range": "500ft", "school": "conjuration"}	t	2025-07-22 10:24:02.449794
9ea4e3a2-c864-4b9b-bafe-1afb6f8feaf8	22222222-2222-2222-2222-222222222222	Arrêt du temps	5	{"type": "sort", "level": 9, "school": "transmutation", "duration": "1d4+1 tours"}	t	2025-07-22 10:24:02.449794
b561276c-97ca-4b5c-889a-ccf047739ed5	22222222-2222-2222-2222-222222222222	Résurrection	3	{"type": "sort", "level": 7, "school": "necromancy"}	t	2025-07-22 10:24:02.449794
54ddfa2c-a4c5-483f-8244-835cda84709b	22222222-2222-2222-2222-222222222222	Météore	2	{"type": "sort", "level": 9, "damage": "20d6", "school": "evocation"}	t	2025-07-22 10:24:02.449794
94c3ce41-7653-40c8-ab94-b188f3eebe48	33333333-3333-3333-3333-333333333333	Une caravane de marchands approche	25	{"mood": "neutral", "type": "encounter"}	t	2025-07-22 10:24:02.449794
b06c8ef7-cd15-4940-a996-dc76fb759858	33333333-3333-3333-3333-333333333333	Des bandits attaquent !	20	{"mood": "hostile", "type": "encounter"}	t	2025-07-22 10:24:02.449794
d33b8fa9-9904-4c32-865f-3c8bc3feb9ae	33333333-3333-3333-3333-333333333333	Vous trouvez un coffre au trésor	15	{"mood": "positive", "type": "treasure"}	t	2025-07-22 10:24:02.449794
e4dff187-75f4-4039-bc5c-0f7f14ec46be	33333333-3333-3333-3333-333333333333	Un orage violent éclate	20	{"mood": "negative", "type": "weather"}	t	2025-07-22 10:24:02.449794
70b1917c-f358-443f-a096-7620a67b11c6	33333333-3333-3333-3333-333333333333	Un sage offre ses conseils	10	{"mood": "positive", "type": "encounter"}	t	2025-07-22 10:24:02.449794
cf97cd8a-04db-417b-9a60-a72955ed038c	33333333-3333-3333-3333-333333333333	Votre monture tombe malade	8	{"mood": "negative", "type": "complication"}	t	2025-07-22 10:24:02.449794
8b1eb5ef-c0f5-4bfd-bb66-df0abd5df70e	33333333-3333-3333-3333-333333333333	Vous découvrez des ruines antiques	2	{"mood": "mysterious", "type": "discovery"}	t	2025-07-22 10:24:02.449794
26ec1c2f-70fc-4ffd-a7b4-e5e70f0c7a62	11111111-1111-1111-1111-111111111111	Épée longue	20	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-22 10:40:36.949826
0fc86948-8c8e-4a1c-b9f6-8c8332316064	11111111-1111-1111-1111-111111111111	Dague	30	{"type": "arme", "damage": "1d4", "rarity": "commune"}	t	2025-07-22 10:40:36.949826
d693c941-b8bd-42fa-84e3-6b1db9c9b9c4	11111111-1111-1111-1111-111111111111	Arc long	25	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-22 10:40:36.949826
7e2b1354-92fa-48cb-a442-a754d4e0734c	11111111-1111-1111-1111-111111111111	Hache de guerre	15	{"type": "arme", "damage": "1d10", "rarity": "peu_commune"}	t	2025-07-22 10:40:36.949826
411b5e24-e2d4-44b6-a69c-5e08e2a1ca3e	11111111-1111-1111-1111-111111111111	Épée magique +1	8	{"type": "arme", "damage": "1d8+1", "rarity": "rare", "magical": true}	t	2025-07-22 10:40:36.949826
9af3c40b-7d0a-436b-b5f4-6972f54fe510	11111111-1111-1111-1111-111111111111	Excalibur	2	{"type": "arme", "damage": "2d8+3", "rarity": "legendaire", "magical": true}	t	2025-07-22 10:40:36.949826
fafae2d5-b048-4635-a120-2f13967f68a1	22222222-2222-2222-2222-222222222222	Boule de feu	25	{"type": "sort", "level": 3, "damage": "3d6", "school": "evocation"}	t	2025-07-22 10:40:36.949826
b8f2c19d-6a23-4697-8cfb-945a37ce2c98	22222222-2222-2222-2222-222222222222	Soins légers	30	{"type": "sort", "level": 1, "school": "evocation", "healing": "1d8+1"}	t	2025-07-22 10:40:36.949826
b88d3769-e1b7-4cfd-9ed5-9382f1fa9c8d	22222222-2222-2222-2222-222222222222	Invisibilité	20	{"type": "sort", "level": 2, "school": "illusion", "duration": "1h"}	t	2025-07-22 10:40:36.949826
f3f05cd2-8c3f-4777-b0d4-a952dfd540ee	22222222-2222-2222-2222-222222222222	Téléportation	15	{"type": "sort", "level": 4, "range": "500ft", "school": "conjuration"}	t	2025-07-22 10:40:36.949826
e46a23f3-82b1-4a58-b36b-89a8128ef4c0	22222222-2222-2222-2222-222222222222	Arrêt du temps	5	{"type": "sort", "level": 9, "school": "transmutation", "duration": "1d4+1 tours"}	t	2025-07-22 10:40:36.949826
92e92565-3145-4ea4-839e-2ef0197f5e1e	22222222-2222-2222-2222-222222222222	Résurrection	3	{"type": "sort", "level": 7, "school": "necromancy"}	t	2025-07-22 10:40:36.949826
d1048a3b-3ad7-4158-b718-39305f6ced4e	22222222-2222-2222-2222-222222222222	Météore	2	{"type": "sort", "level": 9, "damage": "20d6", "school": "evocation"}	t	2025-07-22 10:40:36.949826
d9d6b035-8d51-4a88-b846-496fbad200eb	33333333-3333-3333-3333-333333333333	Une caravane de marchands approche	25	{"mood": "neutral", "type": "encounter"}	t	2025-07-22 10:40:36.949826
2fb2e507-0d30-4417-88bc-a1ca709f0ff4	33333333-3333-3333-3333-333333333333	Des bandits attaquent !	20	{"mood": "hostile", "type": "encounter"}	t	2025-07-22 10:40:36.949826
2459c206-1327-4ad3-a579-3f70e78af133	33333333-3333-3333-3333-333333333333	Vous trouvez un coffre au trésor	15	{"mood": "positive", "type": "treasure"}	t	2025-07-22 10:40:36.949826
d10d11ec-b9db-486b-b5cc-a339ea2e745f	33333333-3333-3333-3333-333333333333	Un orage violent éclate	20	{"mood": "negative", "type": "weather"}	t	2025-07-22 10:40:36.949826
ad708fee-960d-4aa7-8948-625f1afda12c	33333333-3333-3333-3333-333333333333	Un sage offre ses conseils	10	{"mood": "positive", "type": "encounter"}	t	2025-07-22 10:40:36.949826
4c9fd2e0-f53e-46d0-863a-953e1a15f2dd	33333333-3333-3333-3333-333333333333	Votre monture tombe malade	8	{"mood": "negative", "type": "complication"}	t	2025-07-22 10:40:36.949826
2819ccb9-3b7f-41c3-9c98-f74fbb1a71fe	33333333-3333-3333-3333-333333333333	Vous découvrez des ruines antiques	2	{"mood": "mysterious", "type": "discovery"}	t	2025-07-22 10:40:36.949826
e2085f6a-765e-484c-8749-5279574ce671	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Trolloc	25	{"type": "engeance", "danger": "élevé"}	t	2025-07-23 07:20:56.801683
5c71778c-9331-44ae-a417-0ee22bbb1a0e	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Myrddraal (Fondu)	15	{"type": "engeance", "danger": "très élevé"}	t	2025-07-23 07:20:56.820848
9954fd25-531e-45eb-b4e2-e96dfc019221	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Draghkar	12	{"type": "engeance", "danger": "élevé"}	t	2025-07-23 07:20:56.833512
069bf690-dccf-48e5-b05f-ae0c4af40747	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Gholam	5	{"type": "construit", "danger": "extrême"}	t	2025-07-23 07:20:56.846142
3492ead2-8317-48e9-b911-bc6e73ec3ab6	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Rat Noir	18	{"type": "créature-ombre", "danger": "modéré"}	t	2025-07-23 07:20:56.858837
82358850-c87f-40b4-9389-07cea45fc24d	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Darkhound (Chien de l'Ombre)	10	{"type": "créature-ombre", "danger": "très élevé"}	t	2025-07-23 07:20:56.871401
36a5b965-0127-402b-b453-f87761f6773b	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Cafar gris	8	{"type": "construit", "danger": "élevé"}	t	2025-07-23 07:20:56.88417
df81ffa9-a531-4f9d-9d45-b80ec17d1f33	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Ver sauteur	7	{"type": "engeance", "danger": "modéré"}	t	2025-07-23 07:20:56.896781
8437985c-0335-4206-b0d5-3ad774f16089	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Mashadar (Shadar Logoth)	3	{"type": "corruption", "danger": "mortel"}	t	2025-07-23 07:20:56.9094
a24ce306-3eb1-4467-8431-c6e80cafb38a	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Machin Shin (Vent Noir)	4	{"type": "anomalie", "danger": "mortel"}	t	2025-07-23 07:20:56.922039
13bbde15-41b6-4e3a-a63d-98ebc09ba41a	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Gars	20	{"type": "naturel", "danger": "modéré"}	t	2025-07-23 07:20:56.933713
fd689e96-225b-440e-9be0-b1014b71975e	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Torm	6	{"type": "seanchan", "danger": "élevé"}	t	2025-07-23 07:20:56.945385
3d9bc8a8-1193-4443-8bb9-119022d1fb6e	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Raken	9	{"type": "seanchan", "danger": "modéré"}	t	2025-07-23 07:20:56.958056
ea8abbec-86ed-4044-9589-7878e43fc656	63bea9fd-b95b-4d9b-abc9-f4d137466d67	To'raken	7	{"type": "seanchan", "danger": "modéré"}	t	2025-07-23 07:20:56.970667
7dbdadb1-4730-45e8-99a8-ef3da8ec12a4	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Corlm	8	{"type": "seanchan", "danger": "modéré"}	t	2025-07-23 07:20:56.982387
df363523-f919-4639-b5c1-a1b4b05a8d0f	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Lopar	11	{"type": "seanchan", "danger": "faible"}	t	2025-07-23 07:20:56.994051
260fec65-c1b1-4a25-9b27-f606c2cb3afc	63bea9fd-b95b-4d9b-abc9-f4d137466d67	S'redit	5	{"type": "seanchan", "danger": "élevé"}	t	2025-07-23 07:20:57.006175
7e448c52-d016-4e1a-b507-cc61509ff71c	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Mordeth (entité)	2	{"type": "esprit", "danger": "extrême"}	t	2025-07-23 07:20:57.018833
38901c44-7766-4356-8d96-b1d1c97bf29b	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Bubble of Evil	6	{"type": "anomalie", "danger": "variable"}	t	2025-07-23 07:20:57.030566
854985c4-f52f-4e95-ac83-4da70e54d7e4	63bea9fd-b95b-4d9b-abc9-f4d137466d67	Créature du Monde des Rêves	4	{"type": "rêve", "danger": "variable"}	t	2025-07-23 07:20:57.042391
80c5bfed-3337-4663-990e-c4f6c025231a	0016cb30-f280-4190-85d2-5aa4a7e51a06	Andor	20	{"type": "monarchie", "région": "central"}	t	2025-07-23 07:21:31.257377
75199244-6975-454e-b6e0-dfb1772ca93a	0016cb30-f280-4190-85d2-5aa4a7e51a06	Tear	17	{"type": "monarchie", "région": "sud-est"}	t	2025-07-23 07:21:31.28656
f5593287-c2d1-4aaf-b8c7-376356b1d9ee	0016cb30-f280-4190-85d2-5aa4a7e51a06	Illian	16	{"type": "conseil", "région": "sud"}	t	2025-07-23 07:21:31.298402
774888d5-421e-4f2f-b450-72da4fdf5043	0016cb30-f280-4190-85d2-5aa4a7e51a06	Tar Valon	15	{"type": "cité-état", "région": "central"}	t	2025-07-23 07:21:31.310648
dd9cc0b3-7501-4728-a8c2-cc0ce4698c9b	0016cb30-f280-4190-85d2-5aa4a7e51a06	Terres des Aiels	14	{"type": "tribal", "région": "désert"}	t	2025-07-23 07:21:31.32312
45fa18f2-ade0-4981-833a-e557597c59b2	0016cb30-f280-4190-85d2-5aa4a7e51a06	Seanchan	12	{"type": "empire", "région": "outre-mer"}	t	2025-07-23 07:21:31.334966
2625e2ca-160e-408f-9796-e6d0a8be41ae	0016cb30-f280-4190-85d2-5aa4a7e51a06	Amadicia	13	{"type": "théocratie", "région": "sud-ouest"}	t	2025-07-23 07:21:31.346708
0ed22622-e9a0-4a20-94c3-97ab1edb1125	0016cb30-f280-4190-85d2-5aa4a7e51a06	Altara	11	{"type": "monarchie", "région": "sud"}	t	2025-07-23 07:21:31.358441
7a700900-2d0f-40aa-a1f5-0147895b8bd3	0016cb30-f280-4190-85d2-5aa4a7e51a06	Arafel	10	{"type": "monarchie", "région": "terres-frontières"}	t	2025-07-23 07:21:31.371366
37183620-1c54-40bd-8f46-91f0aa7fc7e6	0016cb30-f280-4190-85d2-5aa4a7e51a06	Shienar	12	{"type": "monarchie", "région": "terres-frontières"}	t	2025-07-23 07:21:31.383362
cc3afcbb-fc41-4fc4-a5ec-cd70f6e32c14	0016cb30-f280-4190-85d2-5aa4a7e51a06	Kandor	9	{"type": "monarchie", "région": "terres-frontières"}	t	2025-07-23 07:21:31.395977
5ebf36dc-1834-4bed-b68f-18a5d3c8683d	0016cb30-f280-4190-85d2-5aa4a7e51a06	Saldaea	10	{"type": "monarchie", "région": "terres-frontières"}	t	2025-07-23 07:21:31.40777
86fc9ce6-7d75-4fad-bd15-c7796f956bf4	0016cb30-f280-4190-85d2-5aa4a7e51a06	Arad Doman	8	{"type": "monarchie", "région": "ouest"}	t	2025-07-23 07:21:31.419565
32e7b65b-2eae-4c3f-98e5-6203db4c064b	0016cb30-f280-4190-85d2-5aa4a7e51a06	Tarabon	8	{"type": "monarchie", "région": "ouest"}	t	2025-07-23 07:21:31.431342
43e913c9-36f2-4e46-86d8-00991d49f146	0016cb30-f280-4190-85d2-5aa4a7e51a06	Mayene	7	{"type": "cité-état", "région": "sud-est"}	t	2025-07-23 07:21:31.443057
f1fe2570-e2e0-4f05-bd1b-eeb2bba53c71	0016cb30-f280-4190-85d2-5aa4a7e51a06	Ghealdan	9	{"type": "monarchie", "région": "central"}	t	2025-07-23 07:21:31.454846
5f167abb-838b-4637-99cc-dfee3965167b	0016cb30-f280-4190-85d2-5aa4a7e51a06	Murandy	6	{"type": "monarchie", "région": "central"}	t	2025-07-23 07:21:31.466646
4f842f35-9e41-4094-9eb1-379c6eefaeb1	0016cb30-f280-4190-85d2-5aa4a7e51a06	Far Madding	5	{"type": "cité-état", "région": "central"}	t	2025-07-23 07:21:31.478437
00d06639-523e-49f6-a2c8-5e1d1c42a7bd	0016cb30-f280-4190-85d2-5aa4a7e51a06	Peuple de la Mer	7	{"type": "maritime", "région": "îles"}	t	2025-07-23 07:21:31.490211
399fc2d0-56ef-4781-9639-575baa9d67b6	ef230508-a4c9-433b-ab42-02c15b4af97b	Rand al'Thor	20	{"type": "ta'veren", "affiliation": "dragon_réincarné"}	t	2025-07-23 07:22:05.536534
7edf82d7-de44-4f96-8876-bf2b739148b9	ef230508-a4c9-433b-ab42-02c15b4af97b	Moiraine Damodred	18	{"type": "aes_sedai", "affiliation": "ajah_bleue"}	t	2025-07-23 07:22:05.550252
86d3dcbe-80b0-4a6a-b4b4-3f7026698d6d	ef230508-a4c9-433b-ab42-02c15b4af97b	Lan Mandragoran	16	{"type": "lige", "affiliation": "malkier"}	t	2025-07-23 07:22:05.563534
44732ad8-6547-4e1b-9d5b-a6c7532846c9	ef230508-a4c9-433b-ab42-02c15b4af97b	Perrin Aybara	17	{"type": "ta'veren", "affiliation": "frère_loup"}	t	2025-07-23 07:22:05.575163
55eaa343-b2ab-492f-8e52-49006eabb7dd	ef230508-a4c9-433b-ab42-02c15b4af97b	Mat Cauthon	17	{"type": "ta'veren", "affiliation": "fils_de_batailles"}	t	2025-07-23 07:22:05.586778
3827b089-3f9e-4def-84d8-dc27a8e1e642	ef230508-a4c9-433b-ab42-02c15b4af97b	Egwene al'Vere	15	{"type": "aes_sedai", "affiliation": "amyrlin"}	t	2025-07-23 07:22:05.598515
ee47589b-1ea7-4168-9f5a-5fb74124b4cf	ef230508-a4c9-433b-ab42-02c15b4af97b	Nynaeve al'Meara	14	{"type": "aes_sedai", "affiliation": "ajah_jaune"}	t	2025-07-23 07:22:05.611177
e6a92b4c-ac03-4923-aa2f-cd6a6a651ee9	ef230508-a4c9-433b-ab42-02c15b4af97b	Elayne Trakand	13	{"type": "aes_sedai", "affiliation": "reine_andor"}	t	2025-07-23 07:22:05.622707
6a4fc5d6-ca9a-45f5-b6ca-5559b0a9c2ab	ef230508-a4c9-433b-ab42-02c15b4af97b	Aviendha	12	{"type": "sagette", "affiliation": "aiel"}	t	2025-07-23 07:22:05.634346
46d18b46-41d3-490b-83ba-df0a8454a752	ef230508-a4c9-433b-ab42-02c15b4af97b	Min Farshaw	11	{"type": "voyante", "affiliation": "dragon"}	t	2025-07-23 07:22:05.64603
6107ee03-1bde-4afe-b8d5-b5441c68031d	ef230508-a4c9-433b-ab42-02c15b4af97b	Thom Merrilin	10	{"type": "ménestrel", "affiliation": "maison_royale"}	t	2025-07-23 07:22:05.657633
6f9baee4-1353-4c9d-955b-c3e8ec7c08d3	ef230508-a4c9-433b-ab42-02c15b4af97b	Siuan Sanche	9	{"type": "aes_sedai", "affiliation": "ex_amyrlin"}	t	2025-07-23 07:22:05.66961
efde44cb-b1b4-4563-aa46-9cf6d404bfca	ef230508-a4c9-433b-ab42-02c15b4af97b	Gareth Bryne	8	{"type": "général", "affiliation": "andor"}	t	2025-07-23 07:22:05.68129
b94c7307-d4c5-4e53-b3d3-e886957d0a9c	ef230508-a4c9-433b-ab42-02c15b4af97b	Loial	12	{"type": "ogier", "affiliation": "stedding"}	t	2025-07-23 07:22:05.692972
cd508a5e-3110-421e-badf-971aa103c533	ef230508-a4c9-433b-ab42-02c15b4af97b	Verin Mathwin	7	{"type": "aes_sedai", "affiliation": "ajah_brune"}	t	2025-07-23 07:22:05.706503
73a959b2-a491-41d2-8ba5-be188cccab8b	ef230508-a4c9-433b-ab42-02c15b4af97b	Padan Fain	6	{"type": "ténébreux", "affiliation": "mordeth"}	t	2025-07-23 07:22:05.720017
bc8441f2-ee73-4f52-bbe9-cc97b5fb541e	ef230508-a4c9-433b-ab42-02c15b4af97b	Ba'alzamon/Ishamael	5	{"type": "réprouvé", "affiliation": "ténèbre"}	t	2025-07-23 07:22:05.732629
836b2b82-dbfb-49a4-a0f9-4fe74d553a4c	ef230508-a4c9-433b-ab42-02c15b4af97b	Lanfear	7	{"type": "réprouvé", "affiliation": "ténèbre"}	t	2025-07-23 07:22:05.744354
baa155c6-56c1-4d02-884b-e68c3cff597e	ef230508-a4c9-433b-ab42-02c15b4af97b	Mazrim Taim	8	{"type": "asha'man", "affiliation": "tour_noire"}	t	2025-07-23 07:22:05.756048
c58e4f88-a62c-496f-a383-a620b694d838	ef230508-a4c9-433b-ab42-02c15b4af97b	Logain Ablar	9	{"type": "asha'man", "affiliation": "dragon"}	t	2025-07-23 07:22:05.767177
f631e7f9-c038-42fe-a685-111d006fc267	ef230508-a4c9-433b-ab42-02c15b4af97b	Cadsuane Melaidhrin	6	{"type": "aes_sedai", "affiliation": "ajah_verte"}	t	2025-07-23 07:22:05.778315
15a98234-6a57-47d5-b07f-0db217fb7fca	ef230508-a4c9-433b-ab42-02c15b4af97b	Tuon	8	{"type": "impératrice", "affiliation": "seanchan"}	t	2025-07-23 07:22:05.790045
fe05ba25-848e-4c55-ade2-9b2c9cf5ebb4	ef230508-a4c9-433b-ab42-02c15b4af97b	Faile Bashere	10	{"type": "noble", "affiliation": "saldaea"}	t	2025-07-23 07:22:05.801739
1e34ceb2-7ad7-45d0-a3a5-5beb31e38b02	ef230508-a4c9-433b-ab42-02c15b4af97b	Rhuarc	7	{"type": "chef_de_clan", "affiliation": "aiel"}	t	2025-07-23 07:22:05.813399
0f809b94-2354-4fb2-bc71-86cd85175ac7	ef230508-a4c9-433b-ab42-02c15b4af97b	Berelain	6	{"type": "première", "affiliation": "mayene"}	t	2025-07-23 07:22:05.825145
bbe28f55-83ec-478a-b80d-7360827a1f6a	11111111-1111-1111-1111-111111111111	Épée longue	20	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-23 12:34:54.233596
bd1a919b-71ae-4325-8a9b-22d9f31f6363	11111111-1111-1111-1111-111111111111	Dague	30	{"type": "arme", "damage": "1d4", "rarity": "commune"}	t	2025-07-23 12:34:54.233596
ef3c0429-8a0d-4621-ad0f-d75778116964	11111111-1111-1111-1111-111111111111	Arc long	25	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-23 12:34:54.233596
c693264d-2296-460a-8927-21b128463247	11111111-1111-1111-1111-111111111111	Hache de guerre	15	{"type": "arme", "damage": "1d10", "rarity": "peu_commune"}	t	2025-07-23 12:34:54.233596
b23ea043-603f-4cbd-9a37-285cf3313fdd	11111111-1111-1111-1111-111111111111	Épée magique +1	8	{"type": "arme", "damage": "1d8+1", "rarity": "rare", "magical": true}	t	2025-07-23 12:34:54.233596
4fdd4252-e090-4383-b1cb-a6cb1d640748	11111111-1111-1111-1111-111111111111	Excalibur	2	{"type": "arme", "damage": "2d8+3", "rarity": "legendaire", "magical": true}	t	2025-07-23 12:34:54.233596
8e73b583-46f3-4c12-8891-96d735cab3ea	22222222-2222-2222-2222-222222222222	Boule de feu	25	{"type": "sort", "level": 3, "damage": "3d6", "school": "evocation"}	t	2025-07-23 12:34:54.233596
6278ec7f-ec81-40c1-adc4-2cc5a2edc22d	22222222-2222-2222-2222-222222222222	Soins légers	30	{"type": "sort", "level": 1, "school": "evocation", "healing": "1d8+1"}	t	2025-07-23 12:34:54.233596
b2f8169a-fd57-494f-b972-52fa651db759	22222222-2222-2222-2222-222222222222	Invisibilité	20	{"type": "sort", "level": 2, "school": "illusion", "duration": "1h"}	t	2025-07-23 12:34:54.233596
7024f187-fadc-496e-b739-e9e3277ede8b	22222222-2222-2222-2222-222222222222	Téléportation	15	{"type": "sort", "level": 4, "range": "500ft", "school": "conjuration"}	t	2025-07-23 12:34:54.233596
9d67fe41-9731-4fe9-921c-119cfce0cd84	22222222-2222-2222-2222-222222222222	Arrêt du temps	5	{"type": "sort", "level": 9, "school": "transmutation", "duration": "1d4+1 tours"}	t	2025-07-23 12:34:54.233596
05ead1ab-54d7-4335-ac24-8ba3c9682545	22222222-2222-2222-2222-222222222222	Résurrection	3	{"type": "sort", "level": 7, "school": "necromancy"}	t	2025-07-23 12:34:54.233596
85f1218f-3a35-44d5-9fb5-31252184dd3c	22222222-2222-2222-2222-222222222222	Météore	2	{"type": "sort", "level": 9, "damage": "20d6", "school": "evocation"}	t	2025-07-23 12:34:54.233596
f9e8d7d5-352b-4c0d-96af-59ac2e8820b9	33333333-3333-3333-3333-333333333333	Une caravane de marchands approche	25	{"mood": "neutral", "type": "encounter"}	t	2025-07-23 12:34:54.233596
fa9de9aa-ce0d-444c-9525-bd159626135f	33333333-3333-3333-3333-333333333333	Des bandits attaquent !	20	{"mood": "hostile", "type": "encounter"}	t	2025-07-23 12:34:54.233596
a3361651-6481-4590-ac97-f4de512d7650	33333333-3333-3333-3333-333333333333	Vous trouvez un coffre au trésor	15	{"mood": "positive", "type": "treasure"}	t	2025-07-23 12:34:54.233596
ea8a9376-04c2-46c1-aba3-8990077aeebd	33333333-3333-3333-3333-333333333333	Un orage violent éclate	20	{"mood": "negative", "type": "weather"}	t	2025-07-23 12:34:54.233596
86ea9ff0-7106-4622-9df7-b64ed075de8d	33333333-3333-3333-3333-333333333333	Un sage offre ses conseils	10	{"mood": "positive", "type": "encounter"}	t	2025-07-23 12:34:54.233596
1b97eccb-14ff-45aa-bbe7-3c888115ec04	33333333-3333-3333-3333-333333333333	Votre monture tombe malade	8	{"mood": "negative", "type": "complication"}	t	2025-07-23 12:34:54.233596
40ecd54a-98e1-4302-bd17-f8944d21aa7f	33333333-3333-3333-3333-333333333333	Vous découvrez des ruines antiques	2	{"mood": "mysterious", "type": "discovery"}	t	2025-07-23 12:34:54.233596
9ee7da24-09a0-4dd7-bc53-3d1405cff6a0	11111111-1111-1111-1111-111111111111	Épée longue	20	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-23 15:24:08.352457
626192a3-1af0-4abc-8a67-c8b4473c249f	11111111-1111-1111-1111-111111111111	Dague	30	{"type": "arme", "damage": "1d4", "rarity": "commune"}	t	2025-07-23 15:24:08.352457
7e349c32-fa0e-4a7e-92eb-c7ff8a617c30	11111111-1111-1111-1111-111111111111	Arc long	25	{"type": "arme", "damage": "1d8", "rarity": "commune"}	t	2025-07-23 15:24:08.352457
adad1f54-04e6-46b5-93dd-4464566fa5c1	11111111-1111-1111-1111-111111111111	Hache de guerre	15	{"type": "arme", "damage": "1d10", "rarity": "peu_commune"}	t	2025-07-23 15:24:08.352457
d93678d4-465c-48ee-9277-bf9d65655f39	11111111-1111-1111-1111-111111111111	Épée magique +1	8	{"type": "arme", "damage": "1d8+1", "rarity": "rare", "magical": true}	t	2025-07-23 15:24:08.352457
a6872897-3ea5-4ce3-9922-15f7f458b743	11111111-1111-1111-1111-111111111111	Excalibur	2	{"type": "arme", "damage": "2d8+3", "rarity": "legendaire", "magical": true}	t	2025-07-23 15:24:08.352457
bdb0b2a0-b369-46ce-a522-cb924229aba1	22222222-2222-2222-2222-222222222222	Boule de feu	25	{"type": "sort", "level": 3, "damage": "3d6", "school": "evocation"}	t	2025-07-23 15:24:08.352457
a6095764-6ad7-40f4-83fb-99be1fcc47aa	22222222-2222-2222-2222-222222222222	Soins légers	30	{"type": "sort", "level": 1, "school": "evocation", "healing": "1d8+1"}	t	2025-07-23 15:24:08.352457
63ed5929-80e9-4e9c-adcf-b8d9d253657c	22222222-2222-2222-2222-222222222222	Invisibilité	20	{"type": "sort", "level": 2, "school": "illusion", "duration": "1h"}	t	2025-07-23 15:24:08.352457
69f6f257-c5a7-4890-9a87-8581d0fdd9c1	22222222-2222-2222-2222-222222222222	Téléportation	15	{"type": "sort", "level": 4, "range": "500ft", "school": "conjuration"}	t	2025-07-23 15:24:08.352457
c005857f-3aef-462d-a46f-195febb436f8	22222222-2222-2222-2222-222222222222	Arrêt du temps	5	{"type": "sort", "level": 9, "school": "transmutation", "duration": "1d4+1 tours"}	t	2025-07-23 15:24:08.352457
4f72aa5c-5bfd-4d32-b94a-02b2fd608920	22222222-2222-2222-2222-222222222222	Résurrection	3	{"type": "sort", "level": 7, "school": "necromancy"}	t	2025-07-23 15:24:08.352457
80c24ff2-bf7f-4874-94bd-c4416a923f2d	22222222-2222-2222-2222-222222222222	Météore	2	{"type": "sort", "level": 9, "damage": "20d6", "school": "evocation"}	t	2025-07-23 15:24:08.352457
98e18b4a-76a3-42f3-82a7-2f64d53ac6f6	33333333-3333-3333-3333-333333333333	Une caravane de marchands approche	25	{"mood": "neutral", "type": "encounter"}	t	2025-07-23 15:24:08.352457
735ab7a6-f5f4-4389-b195-f75051d2a111	33333333-3333-3333-3333-333333333333	Des bandits attaquent !	20	{"mood": "hostile", "type": "encounter"}	t	2025-07-23 15:24:08.352457
55ad1b9b-ba84-41a9-8447-b47f2dffb40d	33333333-3333-3333-3333-333333333333	Vous trouvez un coffre au trésor	15	{"mood": "positive", "type": "treasure"}	t	2025-07-23 15:24:08.352457
4356bb6f-59eb-4814-8b00-17667e8de452	33333333-3333-3333-3333-333333333333	Un orage violent éclate	20	{"mood": "negative", "type": "weather"}	t	2025-07-23 15:24:08.352457
a770432d-9585-4c67-9a69-6557ae35af53	33333333-3333-3333-3333-333333333333	Un sage offre ses conseils	10	{"mood": "positive", "type": "encounter"}	t	2025-07-23 15:24:08.352457
c137f5e3-d862-470d-9482-216f03aecb28	33333333-3333-3333-3333-333333333333	Votre monture tombe malade	8	{"mood": "negative", "type": "complication"}	t	2025-07-23 15:24:08.352457
8b5134d9-f251-4ef5-afdc-ea350334db9e	33333333-3333-3333-3333-333333333333	Vous découvrez des ruines antiques	2	{"mood": "mysterious", "type": "discovery"}	t	2025-07-23 15:24:08.352457
\.


--
-- Data for Name: oracle_propositions; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_propositions (id, oracle_id, utilisateur_id, option_proposee, statut, motif_rejet, date_proposition, date_traitement) FROM stdin;
\.


--
-- Data for Name: oracle_votes; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.oracle_votes (id, oracle_id, utilisateur_id, qualite_generale, utilite_pratique, respect_gamme, commentaire, date_creation) FROM stdin;
\.


--
-- Data for Name: parametres; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.parametres (cle, valeur, type, description, modifiable, date_creation, date_modification) FROM stdin;
pdf_cleanup_enabled	true	boolean	Nettoyage automatique des PDFs	t	2025-07-19 16:03:27.532781	2025-07-19 16:03:27.532781
pdf_cleanup_max_age	86400000	number	Âge maximum des PDFs en millisecondes (24h)	t	2025-07-19 16:03:27.547443	2025-07-19 16:03:27.547443
max_personnages_par_utilisateur	50	number	Nombre maximum de personnages par utilisateur	t	2025-07-19 16:03:27.559268	2025-07-19 16:03:27.559268
max_pdfs_simultanes	5	number	Nombre maximum de PDFs en génération simultanée	t	2025-07-19 16:03:27.570937	2025-07-19 16:03:27.570937
app_version	1.1.0	string	Version de l'application	f	2025-07-19 16:03:27.520009	2025-07-20 10:50:04.308554
mode_anonyme_active	true	boolean	Active le mode de création anonyme sur le pouce	t	2025-08-06 20:19:34.883015	2025-08-06 20:19:34.883015
duree_token_partage_pdf	24	number	Durée de validité en heures des tokens de partage PDF	t	2025-08-06 20:19:34.895842	2025-08-06 20:19:34.895842
premium_cout_par_mois	1.00	number	Coût en euros pour 1 mois de premium	f	2025-08-06 20:19:34.907612	2025-08-06 20:19:34.907612
nettoyage_auto_pdfs	true	boolean	Nettoyage automatique des anciens PDFs	t	2025-08-06 20:19:34.919362	2025-08-06 20:19:34.919362
duree_conservation_pdfs_anonymes	7	number	Durée en jours de conservation des PDFs créés en mode anonyme	t	2025-08-06 20:19:34.93117	2025-08-06 20:19:34.93117
\.


--
-- Data for Name: pdf_templates_premium; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.pdf_templates_premium (id, nom, systeme_jeu, type_document, configuration_template, disponible_premium_seulement, date_creation) FROM stdin;
\.


--
-- Data for Name: pdfs; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.pdfs (id, personnage_id, utilisateur_id, type_pdf, statut, progression, nom_fichier, chemin_fichier, taille_fichier, url_temporaire, options_generation, template_utilise, temps_generation, erreur_message, date_creation, date_expiration, telecharge, nombre_telechargements, system_rights, titre, date_fin_generation, document_id, systeme_jeu, statut_visibilite, options_export, partage_token, hash_fichier, type_export, template_premium, personnalisation, date_expiration_partage) FROM stdin;
\.


--
-- Data for Name: rgpd_consentements; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.rgpd_consentements (id, utilisateur_id, type_consentement, consentement_donne, date_consentement, ip_adresse, user_agent) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.sessions (id, utilisateur_id, donnees, adresse_ip, user_agent, actif, date_creation, date_expiration, donnees_supplementaires) FROM stdin;
\.


--
-- Data for Name: systemes_jeu; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.systemes_jeu (id, nom_complet, description, site_officiel, version_supportee, structure_donnees, statut, message_maintenance, ordre_affichage, couleur_theme, icone, date_ajout, date_modification, date_derniere_maj_structure) FROM stdin;
monsterhearts	Monsterhearts 2	Jeu de rôle sur les adolescents monstres	\N	\N	{}	ACTIF	\N	1	#8B0000	\N	2025-08-06 20:38:14.125924	2025-08-06 20:38:14.125924	\N
engrenages	Engrenages et Sortilèges	Jeu de rôle steampunk fantasy	\N	\N	{}	ACTIF	\N	2	#8B4513	\N	2025-08-06 20:38:14.138512	2025-08-06 20:38:14.138512	\N
metro2033	Métro 2033	Jeu de rôle post-apocalyptique	\N	\N	{}	ACTIF	\N	3	#4F4F4F	\N	2025-08-06 20:38:14.150113	2025-08-06 20:38:14.150113	\N
mistengine	Mist Engine	Système générique narratif	\N	\N	{}	ACTIF	\N	4	#2F4F4F	\N	2025-08-06 20:38:14.161847	2025-08-06 20:38:14.161847	\N
zombiology	Zombiology	Jeu de rôle de survie zombie	\N	\N	{}	ACTIF	\N	5	#8B008B	\N	2025-08-06 20:38:14.17351	2025-08-06 20:38:14.17351	\N
\.


--
-- Data for Name: temoignages; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.temoignages (id, auteur_nom, auteur_email, lien_contact, contenu, note, systeme_jeu, statut, date_moderation, moderateur_id, motif_rejet, ip_adresse, user_agent, date_creation, date_modification) FROM stdin;
\.


--
-- Data for Name: templates_pdf; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.templates_pdf (id, nom, systeme_jeu, type_template, contenu_html, styles_css, variables_disponibles, description, auteur_id, public, version, actif, date_creation, date_modification) FROM stdin;
\.


--
-- Data for Name: test_migration; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.test_migration (id, name) FROM stdin;
1	test1
\.


--
-- Data for Name: utilisateur_email_historique; Type: TABLE DATA; Schema: public; Owner: jdrspace_pg
--

COPY public.utilisateur_email_historique (id, utilisateur_id, ancien_email, nouvel_email, date_changement, ip_changement, statut) FROM stdin;
\.


--
-- Name: actualites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.actualites_id_seq', 1, false);


--
-- Name: demandes_changement_email_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.demandes_changement_email_id_seq', 1, false);


--
-- Name: document_moderation_historique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.document_moderation_historique_id_seq', 1, false);


--
-- Name: document_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.document_votes_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: logs_activite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.logs_activite_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.migrations_id_seq', 3, true);


--
-- Name: newsletter_abonnes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.newsletter_abonnes_id_seq', 1, false);


--
-- Name: oracle_cascades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.oracle_cascades_id_seq', 1, false);


--
-- Name: oracle_propositions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.oracle_propositions_id_seq', 1, false);


--
-- Name: oracle_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.oracle_votes_id_seq', 1, false);


--
-- Name: oracles_personnalises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.oracles_personnalises_id_seq', 1, false);


--
-- Name: pdf_templates_premium_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.pdf_templates_premium_id_seq', 1, false);


--
-- Name: pdfs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.pdfs_id_seq', 1, false);


--
-- Name: personnages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.personnages_id_seq', 1, false);


--
-- Name: rgpd_consentements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.rgpd_consentements_id_seq', 1, false);


--
-- Name: temoignages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.temoignages_id_seq', 1, false);


--
-- Name: templates_pdf_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.templates_pdf_id_seq', 1, false);


--
-- Name: test_migration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.test_migration_id_seq', 1, true);


--
-- Name: utilisateur_email_historique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.utilisateur_email_historique_id_seq', 1, false);


--
-- Name: utilisateurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jdrspace_pg
--

SELECT pg_catalog.setval('public.utilisateurs_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

