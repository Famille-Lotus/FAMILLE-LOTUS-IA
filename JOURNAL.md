# Correctif vocal expérimental — 16 novembre 2026

Base relue : lotus-ia-voix-correctif.js, fichier persistant du 15 novembre (libfile_934f534144ec8191b309dcaee3075213). Recherche effectuée parmi les diagnostics vocaux ; ce module ne remplace pas l’archive intégrée V66 et n’est pas déclaré la dernière source globale.

Corrections : conserve une référence à l’énoncé pendant la lecture ; ignore les événements d’une ancienne lecture après une nouvelle lecture ou un arrêt ; réinitialise l’état speaking à l’arrêt ; utilise la langue effective de la voix sélectionnée ; détache les callbacks du micro annulé. Nom global LotusVoiceExperimental pour ne pas écraser LotusVoice de l’application existante.

Tests réellement exécutés : node --check, puis node test.cjs, réussis. Simulateur Node : module existant préservé, langue fr-FR de la voix respectée, événements tardifs ignorés et arrêt micro annulé. Aucun essai audio réel, Safari, iPad, iPhone ou navigateur pendant cette exécution.

Limites : aucune voix féminine fr-BE garantie ; le choix du sexe n’est pas résolu par ce correctif. Commande LOTUS seule et mains libres restent à développer et tester ; ne pas les déclarer opérationnels. Pas d’intégration ni déploiement, aucun changement de maquette, source d’origine préservée. Prochaine étape : intégrer ces protections dans une copie de la source globale retenue, avec sélection explicite de voix et tests de chargement différé. Service IA toujours à configurer pour les réponses intelligentes.
