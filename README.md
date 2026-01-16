# 🏗️ Equilibrium (Work In Progress)

**Equilibrium** est une plateforme interactive d'analyse structurelle et de Résistance Des Matériaux (RDM). Conçue pour les ingénieurs et les étudiants, elle permet de modéliser, visualiser et simuler des structures mécaniques avec une précision millimétrique en 2D et 3D.

## 🎯 Objectifs du Projet

L'objectif est de transformer la théorie de la mécanique des structures en une expérience visuelle et interactive :
* **Modularité totale** : Une architecture découplée permettant l'ajout rapide de nouveaux types de charges, d'appuis ou de matériaux.
* **Transition 2D/3D fluide** : Dessinez en 2D technique et visualisez instantanément le rendu spatial en 3D.
* **Expérience Utilisateur (UX) optimisée** : Utilisation de raccourcis intuitifs et d'un système d'aimantation (snapping) intelligent pour une modélisation sans friction.

---

## ✨ Fonctionnalités

### 📐 Modélisation 2D (Moteur Konva)
* **Système de Snapping intelligent** : Maintenez `Shift` pour aligner vos points sur la grille de calcul (pas de 1m / 50px).
* **Outil Force Perpendiculaire** : Les forces s'aimantent automatiquement aux poutres et conservent une orthogonalité parfaite.
* **Édition Dynamique** : Un menu contextuel permet de modifier en temps réel les propriétés des poutres :
    * **Matériaux** : Acier, Bois, PVC, Aluminium.
    * **Sections** : Rectangulaire, Circulaire (pleine ou vide), Profilés en I et en T.
    * **Dimensions** : Longueur et épaisseur ajustables.

### 🧊 Visualisation 3D (Moteur Three.js)
* Rendu volumétrique des structures dessinées.
* Caméra orbitale pour une inspection détaillée sous tous les angles.

---

## 🛠️ Stack Technique

* **Framework** : [React](https://reactjs.org/) (Hooks, Context API).
* **Graphismes 2D** : [Konva.js](https://konvajs.org/) (Canvas haute performance).
* **Graphismes 3D** : [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & Three.js.
* **Gestion d'état** : Architecture modulaire via Contexts pour synchroniser les outils et les données.

---

## 👥 L'Équipe

Ce projet est né de la collaboration entre deux expertises :
* **Architecture Logicielle & UI/UX** : Conception du moteur de dessin, du système de sélection modulaire et de l'interface utilisateur.
* **Logique Mécanique & Calculs** : **Alix Paquier** est en charge du moteur de calcul structurel, de la résolution statique et de l'analyse des contraintes.

---

## 🚀 Installation

```bash
# Cloner le dépôt
git clone [https://github.com/votre-username/equilibrium.git](https://github.com/votre-username/equilibrium.git)

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev