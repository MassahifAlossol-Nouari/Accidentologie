// ============================================================
// 📦 MAIN.JS - Application DRRS (Version Finale)
// ============================================================

// ============================================================
// 1. VARIABLES GLOBALES
// ============================================================

let toutesLesDonnees = [];
let donneesFiltrees = [];
let graphiques = {};
// Ces variables seront remplacées par les configurations chargées
let CONFIG_TRONCONS = {};
let CONFIG_SOCIETES = {};
let CONFIG_GENDARMERIE = [];
let CONFIG_AXES = [];
// ============================================================
// 2. CONFIGURATION
// ============================================================

// Définition des tronçons
const TRONCONS = {
    'T1': { min: 27000, max: 106000, label: 'PK 27000 - PK 106000' },
    'T2': { min: 106000, max: 198000, label: 'PK 106000 - PK 198000 + PK 0 - PK 13000' },
    'T3': { min: 198000, max: 282000, label: 'PK 198000 - PK 282000' },
    'T4': { min: 282000, max: 430000, label: 'PK 282000 - PK 430000' }
};

// Définition des sociétés de dépannage
const SOCIETES_DEPANNAGE = {
    'TransAlmahata 1': { min: 27000, max: 65000 },
    'TransAlmahata 2': { min: 65000, max: 127000 },
    'Ezziraoui': { min: 127000, max: 160000 },
    'INT Assistance': { min: 160000, max: 249000 },
    'Routier Multi Service et INT Assistance': { min: 249000, max: 310000 },
    'Grand Sud': { min: 310000, max: 430000 }
};

// ============================================================
// 3. FONCTIONS UTILITAIRES
// ============================================================

function extrairePK(pkStr) {
    if (!pkStr && pkStr !== 0) return null;
    try {
        if (typeof pkStr === 'number') return pkStr;
        let texte = String(pkStr).trim();
        texte = texte.replace(/PK\s*/i, '');
        texte = texte.replace(/croissant|décroissant/i, '');
        texte = texte.replace(/\+.*$/, '');
        texte = texte.replace(/[^0-9]/g, '');
        if (texte && !isNaN(texte)) return parseInt(texte);
        return null;
    } catch(e) { return null; }
}

function determinerTroncon(pk) {
    if (pk === null || pk === undefined) return 'Inconnu';
    if (pk >= 27000 && pk <= 106000) return 'T1';
    if ((pk >= 106000 && pk <= 198000) || (pk >= 0 && pk <= 13000)) return 'T2';
    if (pk >= 198000 && pk <= 282000) return 'T3';
    if (pk >= 282000 && pk <= 430000) return 'T4';
    return 'Inconnu';
}

function getPkRange(troncon) {
    const ranges = {
        'T1': '27 000 - 106 000',
        'T2': '106 000 - 198 000 + 0 - 13 000',
        'T3': '198 000 - 282 000',
        'T4': '282 000 - 430 000'
    };
    return ranges[troncon] || 'Inconnu';
}

function determinerSociete(pk) {
    if (pk === null || pk === undefined) return 'Inconnue';
    for (const [nom, s] of Object.entries(SOCIETES_DEPANNAGE)) {
        if (pk >= s.min && pk <= s.max) return nom;
    }
    return 'Inconnue';
}

function extraireHeure(valeur) {
    if (!valeur && valeur !== 0) return null;
    if (typeof valeur === 'string') {
        let temps = valeur.trim();
        if (/^\d{1,2}:\d{2}$/.test(temps)) return temps;
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(temps)) return temps.substring(0, 5);
        const match = temps.match(/(\d{1,2}:\d{2})/);
        if (match) return match[1];
        return null;
    }
    if (typeof valeur === 'number') {
        const totalMinutes = Math.round(valeur * 24 * 60);
        const heures = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (heures >= 0 && heures < 24) {
            return String(heures).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
        }
        return null;
    }
    if (valeur instanceof Date) {
        return String(valeur.getHours()).padStart(2, '0') + ':' + String(valeur.getMinutes()).padStart(2, '0');
    }
    return null;
}

function calculerDifferenceTemps(debut, fin) {
    if (!debut || !fin) return null;
    const partsDebut = debut.toString().split(':');
    const partsFin = fin.toString().split(':');
    if (partsDebut.length >= 2 && partsFin.length >= 2) {
        let minDebut = parseInt(partsDebut[0]) * 60 + parseInt(partsDebut[1]);
        let minFin = parseInt(partsFin[0]) * 60 + parseInt(partsFin[1]);
        let diff = minFin - minDebut;
        if (diff < 0) diff += 1440;
        const heures = Math.floor(diff / 60);
        const minutes = diff % 60;
        return String(heures).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
    }
    return null;
}

function obtenirMois(dateStr) {
    if (!dateStr) return null;
    try {
        if (typeof dateStr === 'number') {
            const date = new Date((dateStr - 25569) * 86400 * 1000);
            if (!isNaN(date)) return date.getMonth() + 1;
        }
        let texte = String(dateStr).trim();
        let match = texte.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (match) {
            const jour = parseInt(match[1]), mois = parseInt(match[2]), annee = parseInt(match[3]);
            const date = new Date(annee, mois - 1, jour);
            if (!isNaN(date)) return mois;
        }
        match = texte.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
            const jour = parseInt(match[1]), mois = parseInt(match[2]), annee = parseInt(match[3]);
            const date = new Date(annee, mois - 1, jour);
            if (!isNaN(date)) return mois;
        }
        const date = new Date(texte);
        if (!isNaN(date)) return date.getMonth() + 1;
        return null;
    } catch(e) { return null; }
}

function obtenirNomMois(dateStr) {
    const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                      'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const mois = obtenirMois(dateStr);
    if (mois && mois >= 1 && mois <= 12) return moisNoms[mois - 1];
    return null;
}

function moyenneTemps(temps) {
    if (!temps || temps.length === 0) return null;
    let totalMinutes = 0, count = 0;
    temps.forEach(t => {
        if (!t) return;
        const parts = t.toString().split(':');
        if (parts.length >= 2) {
            totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
            count++;
        }
    });
    if (count === 0) return null;
    const avgMinutes = totalMinutes / count;
    const heures = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);
    return String(heures).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
}

// ============================================================
// 4. GESTION DES DONNÉES
// ============================================================

function enrichirDonnees(donnees) {
    return donnees.map((ligne) => {
        const nouvelle = { ...ligne };
        const pk = extrairePK(ligne['PK']);
        nouvelle['_pk_num'] = pk;
        nouvelle['_troncon'] = determinerTroncon(pk);
        nouvelle['_societe'] = determinerSociete(pk);
        
        const bg = parseInt(ligne['Nbr BG Usagers'] || 0);
        const bl = parseInt(ligne['Nbr BL Usagers'] || 0);
        nouvelle['_total_blesses'] = bg + bl;
        nouvelle['_total_tues'] = parseInt(ligne['Nbr Tués Usagers'] || 0);
        
        const datePriseEnCharge = ligne['Date prise en charge'] || ligne['Date et heure accident'];
        nouvelle['_mois'] = obtenirMois(datePriseEnCharge);
        nouvelle['_nom_mois'] = obtenirNomMois(datePriseEnCharge);
        
        // ====== استخراج الوقت وتحديد الفترة (معدل) ======
        const heureAccident = ligne['Heure accident'];
        if (heureAccident) {
            let heureStr = String(heureAccident).trim();
            let heure = null;
            
            // محاولة استخراج الساعة من "HH:MM"
            let match = heureStr.match(/^(\d{1,2}):/);
            if (match) {
                heure = parseInt(match[1]);
            }
            // محاولة استخراج الساعة من رقم Excel
            else if (typeof heureAccident === 'number') {
                const totalMinutes = Math.round(heureAccident * 24 * 60);
                heure = Math.floor(totalMinutes / 60);
            }
            // محاولة استخراج الساعة من "HH:MM:SS"
            else {
                match = heureStr.match(/(\d{1,2}):/);
                if (match) heure = parseInt(match[1]);
            }
            
            if (heure !== null && !isNaN(heure) && heure >= 0 && heure < 24) {
                if (heure >= 6 && heure < 12) nouvelle['_periode'] = 'Matin';
                else if (heure >= 12 && heure < 18) nouvelle['_periode'] = 'Midi';
                else if (heure >= 18 && heure < 24) nouvelle['_periode'] = 'Soir';
                else nouvelle['_periode'] = 'Nuit';
                
                // أيضًا حفظ الوقت للاستخدام الآخر
                nouvelle['_heure_accident'] = String(heure).padStart(2, '0') + ':00';
            }
        }
        // ====== نهاية التعديل ======
        
        // ---- Délais (باستخدام _heure_accident) ----
        if (nouvelle['_heure_accident']) {
            nouvelle['_delai_patrouilleur'] = calculerDifferenceTemps(
                nouvelle['_heure_accident'],
                extraireHeure(ligne["Arrivée de l'agent de l'assistance"])
            );
            nouvelle['_delai_gr'] = calculerDifferenceTemps(
                nouvelle['_heure_accident'],
                extraireHeure(ligne['Arrivée Gendarmerie Royale'])
            );
            nouvelle['_delai_pc'] = calculerDifferenceTemps(
                nouvelle['_heure_accident'],
                extraireHeure(ligne['Arrivée Ambulance'])
            );
            nouvelle['_delai_depannage'] = calculerDifferenceTemps(
                nouvelle['_heure_accident'],
                extraireHeure(ligne['Arrivée Dépannage'])
            );
        }
        
        if (ligne['Catégorie']) {
            const cat = ligne['Catégorie'].toLowerCase();
            if (cat.includes('pl') || cat.includes('poids lourd')) nouvelle['_type_vehicule'] = 'PL';
            else if (cat.includes('vl') || cat.includes('véhicule léger')) nouvelle['_type_vehicule'] = 'VL';
            else if (cat.includes('autocar')) nouvelle['_type_vehicule'] = 'Autocar';
            else if (cat.includes('moto')) nouvelle['_type_vehicule'] = 'Moto';
            else nouvelle['_type_vehicule'] = ligne['Catégorie'].trim();
        }
        return nouvelle;
    });
}

function sauvegarderDonnees(donnees) {
    if (!donnees || donnees.length === 0) return;
    try {
        localStorage.setItem('accidentsData', JSON.stringify(donnees));
        console.log('💾 Données sauvegardées (', donnees.length, 'lignes)');
    } catch(e) {
        console.warn('❌ Erreur sauvegarde:', e);
    }
}

function chargerDonnees() {
    try {
        const data = localStorage.getItem('accidentsData');
        if (data) {
            const donnees = JSON.parse(data);
            if (donnees && donnees.length > 0) {
                console.log('📂 Données chargées (', donnees.length, 'lignes)');
                return donnees;
            }
        }
    } catch(e) {
        localStorage.removeItem('accidentsData');
    }
    return null;
}

function restaurerDonnees() {
    console.log('🔄 Restauration des données...');
    const donnees = chargerDonnees();
    if (!donnees || donnees.length === 0) {
        console.log('📭 Aucune donnée sauvegardée');
        return false;
    }
    
    toutesLesDonnees = donnees;
    if (!toutesLesDonnees[0]['_troncon']) {
        toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
        sauvegarderDonnees(toutesLesDonnees);
    }
    
    mettreAJourInterface('✅ ' + toutesLesDonnees.length + ' accidents chargés (mémoire)', '💾 ' + toutesLesDonnees.length + ' lignes en mémoire');
    mettreAJourFiltres();
    appliquerFiltres();
    return true;
}

// ============================================================
// 5. INTERFACE UTILISATEUR
// ============================================================

function mettreAJourInterface(status, memory) {
    const fileStatus = document.getElementById('fileStatus');
    if (fileStatus) {
        fileStatus.textContent = status;
        fileStatus.style.color = '#27ae60';
    }
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = memory;
        memoryStatus.style.color = '#27ae60';
        memoryStatus.style.background = '#e8f8f0';
    }
}

function reinitialiserInterface() {
    document.getElementById('fileStatus').textContent = 'Aucun fichier chargé';
    document.getElementById('fileStatus').style.color = '#999';
    document.getElementById('fileList').innerHTML = '';
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = '💾 Mémoire: Aucune donnée';
        memoryStatus.style.color = '#999';
        memoryStatus.style.background = '#f5f8fa';
    }
}

// ============================================================
// 6. CHARGEMENT DES FICHIERS (UNIFIÉ)
// ============================================================

function ouvrirSelectionFichiers() {
    const choix = confirm(
        '🔽 Choisissez une option :\n\n' +
        '✅ "OK" pour sélectionner un dossier complet\n' +
        '❌ "Annuler" pour sélectionner des fichiers individuels'
    );
    
    if (choix) {
        // Sélectionner un dossier
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        input.accept = '.xlsx,.xls';
        input.onchange = function(e) {
            if (e.target.files.length > 0) {
                traiterDossier(e.target.files);
            }
        };
        input.click();
    } else {
        // Sélectionner des fichiers individuels
        document.getElementById('fileInput').click();
    }
}

// Événement pour les fichiers individuels
document.getElementById('fileInput').addEventListener('change', function(e) {
    const fichiers = e.target.files;
    if (fichiers.length === 0) return;
    
    document.getElementById('fileList').innerHTML = '';
    Array.from(fichiers).forEach(f => {
        const tag = document.createElement('span');
        tag.className = 'file-tag';
        tag.textContent = '📄 ' + f.name;
        document.getElementById('fileList').appendChild(tag);
    });
    document.getElementById('fileStatus').textContent = '📥 ' + fichiers.length + ' fichier(s) chargé(s)...';
    
    let traites = 0;
    toutesLesDonnees = [];
    
    Array.from(fichiers).forEach(fichier => {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                jsonData.forEach(ligne => ligne['_source_fichier'] = fichier.name);
                toutesLesDonnees = toutesLesDonnees.concat(jsonData);
                traites++;
                
                if (traites === fichiers.length) {
                    finaliserChargement(toutesLesDonnees, fichiers.length);
                }
            } catch (error) {
                console.error('Erreur:', error);
                document.getElementById('fileStatus').textContent = '❌ Erreur: ' + error.message;
            }
        };
        reader.readAsArrayBuffer(fichier);
    });
});

function traiterDossier(fichiers) {
    document.getElementById('fileList').innerHTML = '';
    let toutesLesDonneesTemp = [];
    let fichiersExcel = 0;
    let fichiersLus = 0;
    let erreurs = 0;
    
    Array.from(fichiers).forEach(fichier => {
        const extension = fichier.name.split('.').pop().toLowerCase();
        if (extension !== 'xlsx' && extension !== 'xls') return;
        
        fichiersExcel++;
        const tag = document.createElement('span');
        tag.className = 'file-tag';
        tag.textContent = '📄 ' + fichier.name;
        document.getElementById('fileList').appendChild(tag);
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                jsonData.forEach(ligne => ligne['_source_fichier'] = fichier.name);
                toutesLesDonneesTemp = toutesLesDonneesTemp.concat(jsonData);
                fichiersLus++;
                console.log('✅ Fichier lu:', fichier.name, '(', jsonData.length, 'lignes)');
                
                if (fichiersLus + erreurs === fichiersExcel && toutesLesDonneesTemp.length > 0) {
                    finaliserChargement(toutesLesDonneesTemp, fichiersExcel);
                }
            } catch (error) {
                console.error('❌ Erreur:', fichier.name, error);
                erreurs++;
                fichiersLus++;
                if (fichiersLus + erreurs === fichiersExcel && toutesLesDonneesTemp.length === 0) {
                    document.getElementById('fileStatus').textContent = '❌ Erreur lors du chargement';
                    document.getElementById('fileStatus').style.color = '#e74c3c';
                }
            }
        };
        reader.readAsArrayBuffer(fichier);
    });
    
    if (fichiersExcel === 0) {
        document.getElementById('fileStatus').textContent = '⚠️ Aucun fichier Excel trouvé';
        document.getElementById('fileStatus').style.color = '#e74c3c';
    } else {
        document.getElementById('fileStatus').textContent = '📥 ' + fichiersExcel + ' fichier(s) trouvé(s)...';
        document.getElementById('fileStatus').style.color = '#f39c12';
    }
}

function finaliserChargement(donnees, nombreFichiers) {
    if (donnees.length === 0) {
        document.getElementById('fileStatus').textContent = '⚠️ Aucune donnée valide';
        document.getElementById('fileStatus').style.color = '#e74c3c';
        return;
    }
    
    toutesLesDonnees = donnees;
    toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
    sauvegarderDonnees(toutesLesDonnees);
    
    mettreAJourInterface(
        '✅ ' + toutesLesDonnees.length + ' accidents chargés (' + nombreFichiers + ' fichiers)',
        '💾 ' + toutesLesDonnees.length + ' lignes en mémoire'
    );
    
    mettreAJourFiltres();
    appliquerFiltres();
}

// ============================================================
// 7. EFFACER LES DONNÉES
// ============================================================

function effacerDonneesEtReinitialiser() {
    if (!confirm('Voulez-vous vraiment effacer toutes les données ?')) return;
    
    localStorage.removeItem('accidentsData');
    toutesLesDonnees = [];
    donneesFiltrees = [];
    reinitialiserInterface();
    
    ['analyseTable', 'intervenantsTable', 'depanneursTable'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée</h3><p>Chargez des fichiers Excel pour commencer</p></div>`;
        }
    });
    
    Object.keys(graphiques).forEach(key => {
        if (graphiques[key]) { graphiques[key].destroy(); delete graphiques[key]; }
    });
}

// ============================================================
// 8. INITIALISATION AU DÉMARRAGE
// ============================================================

(function autoLoad() {
    console.log('🚀 Application DRRS - Chargement automatique...');
    
    if (!restaurerDonnees()) {
        console.log('📭 Aucune donnée en mémoire');
        document.getElementById('fileStatus').textContent = '📁 Cliquez sur "Charger les fichiers" pour commencer';
        document.getElementById('fileStatus').style.color = '#f39c12';
    }
})();

// Sauvegarde avant de quitter
window.addEventListener('beforeunload', function() {
    if (toutesLesDonnees && toutesLesDonnees.length > 0) {
        sauvegarderDonnees(toutesLesDonnees);
    }
});

console.log('📄 Application DRRS prête!');
// ============================================================
// دالة موحدة لتحويل التاريخ من أي تنسيق
// ============================================================

function convertirDate(dateStr) {
    if (!dateStr) return null;
    
    try {
        let texte = String(dateStr).trim();
        let dateObj = null;
        
        // تنسيق "03-01-2026 02:10" أو "03-01-2026"
        let match = texte.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (match) {
            const jour = parseInt(match[1]);
            const mois = parseInt(match[2]) - 1;
            const annee = parseInt(match[3]);
            dateObj = new Date(annee, mois, jour);
            if (!isNaN(dateObj.getTime())) return dateObj;
        }
        
        // تنسيق "03/01/2026"
        match = texte.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
            const jour = parseInt(match[1]);
            const mois = parseInt(match[2]) - 1;
            const annee = parseInt(match[3]);
            dateObj = new Date(annee, mois, jour);
            if (!isNaN(dateObj.getTime())) return dateObj;
        }
        
        // تنسيق "2026-01-03"
        match = texte.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const annee = parseInt(match[1]);
            const mois = parseInt(match[2]) - 1;
            const jour = parseInt(match[3]);
            dateObj = new Date(annee, mois, jour);
            if (!isNaN(dateObj.getTime())) return dateObj;
        }
        
        // محاولة مباشرة
        dateObj = new Date(texte);
        if (!isNaN(dateObj.getTime())) return dateObj;
        
        return null;
    } catch(e) {
        return null;
    }
}

function formaterDate(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return 'Date invalide';
    const jour = String(dateObj.getDate()).padStart(2, '0');
    const mois = String(dateObj.getMonth() + 1).padStart(2, '0');
    const annee = dateObj.getFullYear();
    return jour + '-' + mois + '-' + annee;
}

function formaterDateLong(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return 'Date invalide';
    return dateObj.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}