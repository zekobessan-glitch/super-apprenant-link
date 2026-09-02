## Notifications e-mail des correspondances trouvées

- Déclencher automatiquement l’alerte lorsqu’une compatibilité est affichée, sans attendre le clic sur le bouton de paiement.
- Enregistrer chaque alerte de correspondance afin de n’envoyer qu’une seule fois les e-mails au parent et à l’encadreur.
- Réutiliser les modèles Resend existants avec un message incitant les deux parties à se connecter et à finaliser le paiement.
- Conserver le clic actuel pour la redirection vers le paiement, sans doublonner les e-mails.
- Vérifier le déclenchement, la compilation et la journalisation des envois/erreurs dans l’historique administrateur.

### Détails techniques

- Ajouter une table sécurisée de suivi des alertes, accessible uniquement au serveur et aux administrateurs.
- Étendre la fonction serveur de notification pour traiter aussi les correspondances déjà créées mais jamais notifiées.
- Appeler cette fonction en arrière-plan pour les nouvelles compatibilités visibles du catalogue parent.
