# Accidentologie

# 📊 DRRS - Analyse des Accidents de l'Autoroute A3 et A301

## 🎯 Présentation du Projet

**DRRS (Direction Régionale des Routes et de la Sécurité)** est une application web interactive dédiée à l'**analyse approfondie des accidents de la route** sur les axes autoroutiers **A3** et **A301**. 

Cette plateforme permet aux gestionnaires routiers, aux agents de sécurité et aux analystes de données de :
- **Visualiser** les données d'accidents de manière claire et intuitive
- **Analyser** les tendances et les zones à risque
- **Identifier** les tronçons dangereux
- **Évaluer** les délais d'intervention des secours
- **Exporter** les rapports d'analyse pour des études approfondies

---

## 🚀 Fonctionnalités Principales

### 1. 📂 Chargement des Données
- Import de fichiers Excel (`.xlsx`, `.xls`)
- Chargement automatique depuis **GitHub**
- Sélection par année (2024, 2025, 2026, 2027, 2028)
- Sauvegarde automatique des données dans le navigateur

### 2. 📊 Tableau d'Analyse des Accidents
- Analyse détaillée par **tronçon** (T1, T2, T3, T4, T2_2)
- Filtrage par **mois**
- Répartition des accidents par **gravité** (Corporelle, Matérielle, Mortelle)
- Statistiques sur les **victimes** (Tués, BG, BL)
- Visualisation graphique des accidents par **PK**

### 3. ⏱️ Délais d'Intervention des Intervenants
- Analyse des délais d'intervention pour :
  - **Patrouilleurs** (Seuil : 25 min)
  - **Gendarmerie Royale (GR)**
  - **Protection Civile (PC)**
- Filtrage par **tronçon**, **mois** et **PMA**
- Graphique d'évolution des délais

### 4. 🚛 Délais d'Intervention des Dépanneurs
- Analyse des délais par **type de véhicule** (PL / VL)
- Filtrage par **société de dépannage**
- Seuils de référence : **45 min pour PL**, **30 min pour VL**
- Graphique d'évolution des délais

### 5. 📈 Tableau de Bord (Dashboard)
- **Indicateurs clés** : Total accidents, Moyenne par jour, Jour le plus dangereux, Mois le plus dangereux, Cause principale, Tronçon le plus dangereux
- Graphiques interactifs :
  - Évolution hebdomadaire
  - Évolution journalière
  - Évolution par période (24h)
  - Répartition par cause
  - Répartition par gravité
  - Répartition des victimes

### 6. 🔄 Rapprochement des Données
- Comparaison entre deux fichiers Excel
- Identification des **différences** entre les données
- Affichage détaillé des accidents différents

### 7. 📊 ZACC - Zones d'Accumulation des Accidents Corporels
- **Nouvelle méthode de calcul** :
  - **Total Acc.** : Tous les accidents (Corporelle + Matérielle + Mortelle)
  - **Acc. Corporels** : Corporelle + Mortelle
  - **Acc. Graves** : Nombre d'accidents contenant ≥ 1 Tués ou ≥ 1 BG
- **Niveaux ZACC** :
  - **Niveau 1 (🔴)** : ≥ 6 accidents corporels dont ≥ 3 accidents graves
  - **Niveau 2 (🟠)** : ≥ 6 accidents corporels dont ≥ 2 accidents graves
  - **Niveau 3 (🟡)** : ≥ 6 accidents corporels dont ≥ 1 accident grave
- Filtrage par **période**, **parité** (Paire / Impaire) et **direction** (Croissant / Decroissant)

### 8. ⚙️ Paramètres
- Configuration des **Directions** (DRRS, DRRC, DRRN, DRRO)
- Gestion des **Tronçons** (PK min / max)
- Gestion des **Sociétés de Dépannage**
- Gestion des **PMA** (Gendarmerie Royale)

### 9. 📤 Export des Données
- **Exporter le tableau** : Export complet en **Excel (.xls)** avec conservation des couleurs et du format
- **Exporter avec graphiques** : Export complet en **HTML** avec tableaux + images des graphiques
- Formats disponibles : Excel, CSV, HTML, JSON

---

## 🛠️ Technologies Utilisées

| Technologie | Utilisation |
|-------------|-------------|
| **HTML5 / CSS3** | Structure et style de l'application |
| **JavaScript (ES6)** | Logique métier et interactivité |
| **Chart.js** | Création des graphiques interactifs |
| **SheetJS (xlsx)** | Lecture et export des fichiers Excel |
| **LocalStorage** | Sauvegarde des données et configurations |
| **GitHub** | Hébergement et chargement des fichiers Excel |

---

## 📁 Structure des Fichiers
DRRS-Accident-Analysis/
├── index.html # Page principale de l'application
├── style.css # Styles et mise en page
├── script.js # Logique métier complète
├── README.md # Documentation du projet
└── data/ # Dossier des fichiers Excel
├── DRRS2024.xlsx
├── DRRS2025.xlsx
├── DRRS2026.xlsx
├── DRRS2027.xlsx
├── DRRS2028.xlsx
├── ZACC.xlsx
├── Rapprochement2025.xlsx
└── Rapprochement2026.xlsx

text

---

## 🚀 Installation et Utilisation

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Connexion Internet (pour charger les bibliothèques et les fichiers)

### Étapes d'installation
1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/Nouari-Abdelkabir/Accidentologie.git
