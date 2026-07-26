// ============================================================
// 📦 PARAMETRES.JS - Gestion des paramètres
// ============================================================

// ============================================================
// 1. CHARGEMENT ET SAUVEGARDE DES CONFIGURATIONS
// ============================================================

const CONFIG_KEYS = {
    TRONCONS: 'config_troncons',
    SOCIETES: 'config_societes',
    GENDARMERIE: 'config_gendarmerie',
    AXES: 'config_axes'
};

// Données par défaut
const CONFIG_DEFAUT = {
    troncons: [
        { id: 'T1', axe: 'A3', pk_min: 27000, pk_max: 106000 },
        { id: 'T2', axe: 'A3', pk_min: 106000, pk_max: 198000 },
        { id: 'T2_2', axe: 'A301', pk_min: 0, pk_max: 13000 },
        { id: 'T3', axe: 'A3', pk_min: 198000, pk_max: 282000 },
        { id: 'T4', axe: 'A3', pk_min: 282000, pk_max: 430000 }
    ],
    societes: [
        { nom: 'TransAlmahata 1', axe: 'A3', pk_min: 27000, pk_max: 65000 },
        { nom: 'TransAlmahata 2', axe: 'A3', pk_min: 65000, pk_max: 127000 },
        { nom: 'Ezziraoui', axe: 'A3', pk_min: 127000, pk_max: 160000 },
        { nom: 'INT Assistance', axe: 'A3', pk_min: 160000, pk_max: 249000 },
        { nom: 'INT Assistance', axe: 'A301', pk_min: 0, pk_max: 13000 },
        { nom: 'Routier Multi Service et INT Assistance', axe: 'A3', pk_min: 249000, pk_max: 310000 },
        { nom: 'Grand Sud', axe: 'A3', pk_min: 310000, pk_max: 430000 }
    ],
    gendarmerie: [
        { nom: 'PMA Settat', axe: 'A3', pk_min: 27000, pk_max: 106000 },
        { nom: 'PMA Skhour', axe: 'A3', pk_min: 106000, pk_max: 140000 },
        { nom: 'PMA Bengurir', axe: 'A3', pk_min: 140000, pk_max: 187000 },
        { nom: 'PMA Palmeraie', axe: 'A3', pk_min: 187000, pk_max: 198000 },
        { nom: 'PMA Palmeraie', axe: 'A301', pk_min: 0, pk_max: 13000 },
        { nom: 'PMA Targa', axe: 'A3', pk_min: 198000, pk_max: 246500 },
        { nom: 'PMA Chihcaoua', axe: 'A3', pk_min: 246500, pk_max: 290000 },
        { nom: 'PMA Imintanout', axe: 'A3', pk_min: 290000, pk_max: 380000 },
        { nom: 'PMA Amskroud', axe: 'A3', pk_min: 380000, pk_max: 430000 }
    ],
    axes: ['A3', 'A301']
};

// Charger la configuration depuis localStorage
function chargerConfig(type) {
    try {
        const data = localStorage.getItem(CONFIG_KEYS[type]);
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed && parsed.length > 0) {
                return parsed;
            }
        }
    } catch(e) {}
    return CONFIG_DEFAUT[type] || [];
}

// Sauvegarder la configuration dans localStorage
function sauvegarderConfig(type, data) {
    try {
        localStorage.setItem(CONFIG_KEYS[type], JSON.stringify(data));
        console.log('💾 Config sauvegardée:', type, data.length, 'éléments');
        return true;
    } catch(e) {
        console.warn('❌ Erreur sauvegarde config:', e);
        return false;
    }
}

// ============================================================
// 2. AFFICHAGE DES TABLEAUX DE CONFIGURATION
// ============================================================

function afficherTroncons() {
    const data = chargerConfig('TRONCONS');
    const tbody = document.getElementById('tronconsBody');
    if (!tbody) return;
    
    tbody.innerHTML = data.map((item, index) => `
        <tr>
            <td><input type="text" value="${item.id}" data-index="${index}" data-field="id" class="editable"></td>
            <td><input type="text" value="${item.axe}" data-index="${index}" data-field="axe" class="editable"></td>
            <td><input type="number" value="${item.pk_min}" data-index="${index}" data-field="pk_min" class="editable"></td>
            <td><input type="number" value="${item.pk_max}" data-index="${index}" data-field="pk_max" class="editable"></td>
            <td><button class="btn-delete" onclick="supprimerLigne('TRONCONS', ${index})">🗑️</button></td>
        </tr>
    `).join('');
}

function afficherSocietes() {
    const data = chargerConfig('SOCIETES');
    const tbody = document.getElementById('societesBody');
    if (!tbody) return;
    
    tbody.innerHTML = data.map((item, index) => `
        <tr>
            <td><input type="text" value="${item.nom}" data-index="${index}" data-field="nom" class="editable"></td>
            <td><input type="text" value="${item.axe}" data-index="${index}" data-field="axe" class="editable"></td>
            <td><input type="number" value="${item.pk_min}" data-index="${index}" data-field="pk_min" class="editable"></td>
            <td><input type="number" value="${item.pk_max}" data-index="${index}" data-field="pk_max" class="editable"></td>
            <td><button class="btn-delete" onclick="supprimerLigne('SOCIETES', ${index})">🗑️</button></td>
        </tr>
    `).join('');
}

function afficherGendarmerie() {
    const data = chargerConfig('GENDARMERIE');
    const tbody = document.getElementById('gendarmerieBody');
    if (!tbody) return;
    
    tbody.innerHTML = data.map((item, index) => `
        <tr>
            <td><input type="text" value="${item.nom}" data-index="${index}" data-field="nom" class="editable"></td>
            <td><input type="text" value="${item.axe}" data-index="${index}" data-field="axe" class="editable"></td>
            <td><input type="number" value="${item.pk_min}" data-index="${index}" data-field="pk_min" class="editable"></td>
            <td><input type="number" value="${item.pk_max}" data-index="${index}" data-field="pk_max" class="editable"></td>
            <td><button class="btn-delete" onclick="supprimerLigne('GENDARMERIE', ${index})">🗑️</button></td>
        </tr>
    `).join('');
}

function afficherAxes() {
    const container = document.getElementById('axesList');
    if (!container) return;
    
    const axes = chargerConfig('AXES');
    container.innerHTML = axes.map(axe => 
        `<span class="axe-tag">${axe}</span>`
    ).join('');
}

// ============================================================
// 3. AJOUT / SUPPRESSION / MODIFICATION
// ============================================================

function ajouterTroncon() {
    const data = chargerConfig('TRONCONS');
    data.push({ id: 'Nouveau', axe: 'A3', pk_min: 0, pk_max: 0 });
    sauvegarderConfig('TRONCONS', data);
    afficherTroncons();
}

function ajouterSociete() {
    const data = chargerConfig('SOCIETES');
    data.push({ nom: 'Nouvelle Société', axe: 'A3', pk_min: 0, pk_max: 0 });
    sauvegarderConfig('SOCIETES', data);
    afficherSocietes();
}

function ajouterGendarmerie() {
    const data = chargerConfig('GENDARMERIE');
    data.push({ nom: 'Nouvelle PMA', axe: 'A3', pk_min: 0, pk_max: 0 });
    sauvegarderConfig('GENDARMERIE', data);
    afficherGendarmerie();
}

function ajouterAxe() {
    const axe = prompt('Entrez le nom du nouvel Axe (ex: A4):');
    if (!axe || axe.trim() === '') return;
    
    const axes = chargerConfig('AXES');
    if (axes.includes(axe.trim())) {
        alert('Cet Axe existe déjà!');
        return;
    }
    axes.push(axe.trim());
    sauvegarderConfig('AXES', axes);
    afficherAxes();
}

function supprimerLigne(type, index) {
    if (!confirm('Voulez-vous vraiment supprimer cette ligne ?')) return;
    
    const data = chargerConfig(type);
    data.splice(index, 1);
    sauvegarderConfig(type, data);
    
    // Rafraîchir l'affichage
    switch(type) {
        case 'TRONCONS': afficherTroncons(); break;
        case 'SOCIETES': afficherSocietes(); break;
        case 'GENDARMERIE': afficherGendarmerie(); break;
    }
}

// ============================================================
// 4. SAUVEGARDE DES MODIFICATIONS
// ============================================================

function sauvegarderTroncons() {
    const inputs = document.querySelectorAll('#tronconsBody .editable');
    const data = chargerConfig('TRONCONS');
    
    inputs.forEach(input => {
        const index = parseInt(input.dataset.index);
        const field = input.dataset.field;
        if (data[index]) {
            data[index][field] = input.value;
        }
    });
    
    sauvegarderConfig('TRONCONS', data);
    alert('✅ Tronçons sauvegardés!');
    // Mettre à jour les constantes globales
    mettreAJourConstantes();
}

function sauvegarderSocietes() {
    const inputs = document.querySelectorAll('#societesBody .editable');
    const data = chargerConfig('SOCIETES');
    
    inputs.forEach(input => {
        const index = parseInt(input.dataset.index);
        const field = input.dataset.field;
        if (data[index]) {
            data[index][field] = input.value;
        }
    });
    
    sauvegarderConfig('SOCIETES', data);
    alert('✅ Sociétés sauvegardées!');
    mettreAJourConstantes();
}

function sauvegarderGendarmerie() {
    const inputs = document.querySelectorAll('#gendarmerieBody .editable');
    const data = chargerConfig('GENDARMERIE');
    
    inputs.forEach(input => {
        const index = parseInt(input.dataset.index);
        const field = input.dataset.field;
        if (data[index]) {
            data[index][field] = input.value;
        }
    });
    
    sauvegarderConfig('GENDARMERIE', data);
    alert('✅ Gendarmerie sauvegardée!');
    mettreAJourConstantes();
}

// ============================================================
// 5. METTRE À JOUR LES CONSTANTES GLOBALES
// ============================================================

function mettreAJourConstantes() {
    // Recharger les configurations
    const troncons = chargerConfig('TRONCONS');
    const societes = chargerConfig('SOCIETES');
    const gendarmerie = chargerConfig('GENDARMERIE');
    const axes = chargerConfig('AXES');
    
    // Mettre à jour TRONCONS global
    window.TRONCONS = {};
    troncons.forEach(t => {
        window.TRONCONS[t.id] = {
            min: parseInt(t.pk_min),
            max: parseInt(t.pk_max),
            label: `PK ${t.pk_min} - PK ${t.pk_max}`,
            axe: t.axe
        };
    });
    
    // Mettre à jour SOCIETES_DEPANNAGE global
    window.SOCIETES_DEPANNAGE = {};
    societes.forEach(s => {
        const key = s.nom + (s.axe ? '_' + s.axe : '');
        window.SOCIETES_DEPANNAGE[key] = {
            min: parseInt(s.pk_min),
            max: parseInt(s.pk_max),
            axe: s.axe,
            nom: s.nom
        };
    });
    
    // Mettre à jour GENDARMERIE global
    window.GENDARMERIE = gendarmerie.map(g => ({
        nom: g.nom,
        axe: g.axe,
        min: parseInt(g.pk_min),
        max: parseInt(g.pk_max)
    }));
    
    console.log('✅ Constantes mises à jour!');
    console.log('TRONCONS:', window.TRONCONS);
    console.log('SOCIETES:', window.SOCIETES_DEPANNAGE);
    console.log('GENDARMERIE:', window.GENDARMERIE);
    
    // Rafraîchir les données existantes avec les nouvelles constantes
    if (toutesLesDonnees && toutesLesDonnees.length > 0) {
        toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
        sauvegarderDonnees(toutesLesDonnees);
        mettreAJourFiltres();
        appliquerFiltres();
    }
}

// ============================================================
// 6. INITIALISATION DE LA PAGE PARAMÈTRES
// ============================================================

function initialiserParametres() {
    console.log('⚙️ Initialisation des paramètres...');
    
    // Créer les données par défaut si elles n'existent pas
    const types = ['TRONCONS', 'SOCIETES', 'GENDARMERIE', 'AXES'];
    types.forEach(type => {
        const existant = localStorage.getItem(CONFIG_KEYS[type]);
        if (!existant) {
            sauvegarderConfig(type, CONFIG_DEFAUT[type.toLowerCase()]);
        }
    });
    
    // Afficher les tableaux
    afficherTroncons();
    afficherSocietes();
    afficherGendarmerie();
    afficherAxes();
    
    // Mettre à jour les constantes
    mettreAJourConstantes();
}

// ============================================================
// 7. ÉCOUTEUR D'ÉVÉNEMENT POUR LA PAGE PARAMÈTRES
// ============================================================

// Quand la page change, initialiser les paramètres si nécessaire
const observerChangerPage = changerPage;
changerPage = function(page) {
    observerChangerPage(page);
    if (page === 'parametres') {
        setTimeout(initialiserParametres, 100);
    }
};

console.log('📦 PARAMETRES.JS chargé!');