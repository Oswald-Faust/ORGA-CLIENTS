# 🧪 Plan de Test & Guide d'Utilisation - Portail Client Orga

Ce document détaille comment tester l'application déployée localement.

## 🚀 1. Lancement de l'Application

Le serveur a été lancé en mode production pour simuler l'environnement réel (stabilité maximale).

- **URL Locale** : `http://localhost:3000`

> **Note**: Si le serveur n'est pas lancé, ouvrez un terminal et exécutez `npm start` dans le dossier du projet.

## 🛠 2. Initialisation des Données (Fait)

La base de données a été peuplée avec des utilisateurs de test via la commande :
`curl -X POST http://localhost:3000/api/seed`

---

## 👨‍💻 3. Scénarios de Test

### A. Test de l'Interface "Master" (Admin)

Scénario pour Mathias (l'admin) qui veut voir tout le monde d'un coup.

**1. Connexion**

- Allez sur `http://localhost:3000` (redirige vers `/login`)
- **Email** : `admin@orgaclients.com`
- **Mot de passe** : `admin123`
- Cliquez sur "Se connecter".

**2. Dashboard Master**

- Vous arrivez sur `/admin`.
- **Colonne de Gauche** : Vous voyez la liste des clients (Alice, Bob, Chloé) avec un aperçu visuel de leur progression (barres colorées).
- **Recherche** : Tapez "Alice" dans la barre de recherche pour filtrer.
- **Sélection** : Cliquez sur "Alice Dupont".

**3. Gestion des Paiements**

- Le profil d'Alice s'ouvre à droite avec une animation fluide.
- Vous voyez "Acompte 30%" marqué comme **Réglé** (Vert).
- Vous voyez "Tranche 1 (15%)" marqué comme **En attente** (Orange).
- **Action** : Cliquez sur le bouton "Valider paiement" de la Tranche 1.
- **Résultat** : Le statut passe instantanément à "Réglé", la date de paiement se met à jour, et la barre de progression dans la liste de gauche se met à jour.

**4. Déconnexion**

- (Fonctionnalité à tester via clear cookies pour l'instant ou ajout bouton logout futur, pour l'instant retournez à `/login` manuellement ou fermez l'onglet).

---

### B. Test de l'Espace Personnel (Client)

Scénario pour un client (ex: Alice) qui veut voir où elle en est.

**1. Connexion**

- Allez sur `http://localhost:3000/login`
- **Email** : `alice@example.com`
- **Mot de passe** : `password123`

**2. Dashboard Client**

- Vous arrivez sur `/dashboard`.
- **Message d'accueil** : "Bienvenue, Alice".
- **Montant Total** : Affiché en haut à droite (ex: 15 000 €).
- **Progression** :
  - Vous voyez les 3 étapes (30%, 15%, 15%).
  - Les étapes payées (validées par l'admin précédemment) sont en vert "RÉGLÉ".
  - Les étapes restantes sont grisées ou indiquées "EN ATTENTE".
- **Esthétique** : Vérifiez le "Dark Mode" et les effets de transparence (Glassmorphism).

---

## 🔐 4. Comptes de Test Disponibles

| Rôle       | Email                   | Mot de passe  | Particularité            |
| ---------- | ----------------------- | ------------- | ------------------------ |
| **Admin**  | `admin@orgaclients.com` | `admin123`    | Accès total              |
| **Client** | `alice@example.com`     | `password123` | Projet en cours          |
| **Client** | `bob@example.com`       | `password123` | Petit projet             |
| **Client** | `chloe@example.com`     | `password123` | Nouveau projet (0% payé) |

## 🏗 5. Structure Technique (Pour Info)

- **Base de Données** : MongoDB (Stockage des commandes et statuts).
- **Sécurité** : Mots de passe hashés (bcrypt), Routes protégées API & Frontend (NextAuth).
- **Design** : Tailwind CSS v4, Framer Motion.

---

_Généré par Antigravity_
