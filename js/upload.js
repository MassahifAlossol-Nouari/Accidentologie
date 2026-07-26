// ============================================================
// 📦 UPLOAD.JS - Chargement des fichiers Excel (CORRIGÉ)
// ============================================================

// ============================================================
// 📦 UPLOAD.JS - Chargement des fichiers Excel (CORRIGÉ)
// ============================================================

function enrichirDonnees(donnees) {
    console.log('===== DÉBUT ENRICHISSEMENT =====');
    console.log('Nombre de lignes:', donnees.length);
    
    if (donnees.length > 0) {
        console.log('🔍 Première ligne (originale):', donnees[0]);
        console.log('🔍 Colonnes disponibles:', Object.keys(donnees[0]));
    }
    
    const resultats = donnees.map((ligne, index) => {
        const nouvelle = { ...ligne };
        
        // ============================================================
        // 1. EXTRACTION PK ET DÉTERMINATION TRONÇON
        // ============================================================
        const pk = extrairePK(ligne['PK']);
        nouvelle['_pk_num'] = pk;
        nouvelle['_troncon'] = determinerTroncon(pk);
        nouvelle['_societe'] = determinerSociete(pk);
        
        // ============================================================
        // 2. CALCUL DES VICTIMES (CORRIGÉ)
        // ============================================================
        
        // ---- Lecture des valeurs avec sécurité ----
        const getVal = (nom) => {
            const val = ligne[nom];
            if (val === undefined || val === null || val === '') return 0;
            return parseInt(val) || 0;
        };
        
        // ---- Nbr Tués (Somme de tous les tués) ----
        const tuesUsager = getVal('Nbr Tués Usagers');
        const tuesPietonUsager = getVal('Nbr Tués Piéton Usager');
        const tuesPietonVagabond = getVal('Nbr Tués Piéton Vagabond');
        const tuesPietonRiverain = getVal('Nbr Tués Piéton Riverain');
        const tuesPietonIntervention = getVal("Nbr Tués Piéton Pers. D'intervention");
        
        const totalTues = tuesUsager + tuesPietonUsager + tuesPietonVagabond + tuesPietonRiverain + tuesPietonIntervention;
        nouvelle['_total_tues'] = totalTues;
        
        // ---- Nbr BG (Somme de tous les blessés graves) ----
        const bgUsager = getVal('Nbr BG Usagers');
        const bgPietonUsager = getVal('Nbr BG Piéton Usager');
        const bgPietonVagabond = getVal('Nbr BG Piéton Vagabond');
        const bgPietonRiverain = getVal('Nbr BG Piéton Riverain');
        const bgPietonIntervention = getVal("Nbr BG Piéton Pers. D'intervention");
        
        const totalBG = bgUsager + bgPietonUsager + bgPietonVagabond + bgPietonRiverain + bgPietonIntervention;
        nouvelle['_total_bg'] = totalBG;
        
        // ---- Nbr BL (Somme de tous les blessés légers) ----
        const blUsager = getVal('Nbr BL Usagers');
        const blPietonUsager = getVal('Nbr BL Piéton Usager');
        const blPietonVagabond = getVal('Nbr BL Piéton Vagabond');
        const blPietonRiverain = getVal('Nbr BL Piéton Riverain');
        const blPietonIntervention = getVal("Nbr BL Piéton Pers. D'intervention");
        
        const totalBL = blUsager + blPietonUsager + blPietonVagabond + blPietonRiverain + blPietonIntervention;
        nouvelle['_total_bl'] = totalBL;
        
        // ---- Total Blessés (BG + BL) ----
        nouvelle['_total_blesses'] = totalBG + totalBL;
        
        // ---- Affichage des calculs pour les 5 premières lignes ----
        if (index < 5) {
            console.log(`📊 Ligne ${index}:`);
            console.log(`  Tués: ${tuesUsager} + ${tuesPietonUsager} + ${tuesPietonVagabond} + ${tuesPietonRiverain} + ${tuesPietonIntervention} = ${totalTues}`);
            console.log(`  BG: ${bgUsager} + ${bgPietonUsager} + ${bgPietonVagabond} + ${bgPietonRiverain} + ${bgPietonIntervention} = ${totalBG}`);
            console.log(`  BL: ${blUsager} + ${blPietonUsager} + ${blPietonVagabond} + ${blPietonRiverain} + ${blPietonIntervention} = ${totalBL}`);
        }
        
        // ============================================================
        // 3. MOIS (Date prise en charge)
        // ============================================================
        const datePriseEnCharge = ligne['Date prise en charge'] || ligne['Date et heure accident'];
        nouvelle['_mois'] = obtenirMois(datePriseEnCharge);
        nouvelle['_nom_mois'] = obtenirNomMois(datePriseEnCharge);
        
        // ============================================================
        // 4. HEURE ET DÉLAIS D'INTERVENTION
        // ============================================================
        nouvelle['_heure_accident'] = extraireHeure(ligne['Heure accident']);
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
        
        // ============================================================
        // 5. TYPE DE VÉHICULE
        // ============================================================
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
    
    // ====== إحصائيات المجاميع ======
    console.log('===== STATISTIQUES APRÈS ENRICHISSEMENT =====');
    let totalTues = 0, totalBG = 0, totalBL = 0;
    resultats.forEach(d => {
        totalTues += d['_total_tues'] || 0;
        totalBG += d['_total_bg'] || 0;
        totalBL += d['_total_bl'] || 0;
    });
    console.log(`📊 Total Tués: ${totalTues}`);
    console.log(`📊 Total BG: ${totalBG}`);
    console.log(`📊 Total BL: ${totalBL}`);
    
    return resultats;
}
// ============================================================
// SAUVEGARDE / CHARGEMENT / RESTAURATION
// ============================================================

function sauvegarderDonnees(donnees) {
    if (!donnees || donnees.length === 0) {
        console.warn('⚠️ Tentative de sauvegarde de données vides');
        return;
    }
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
        console.warn('❌ Erreur chargement:', e);
        localStorage.removeItem('accidentsData');
    }
    return null;
}

// ============================================================
// RESTAURER LES DONNÉES - UNE SEULE FOIS
// ============================================================

function restaurerDonnees() {
    console.log('🔄 Restauration des données...');
    
    const donnees = chargerDonnees();
    if (!donnees || donnees.length === 0) {
        console.log('📭 Aucune donnée sauvegardée');
        return false;
    }
    
    console.log('📂 Données trouvées:', donnees.length, 'lignes');
    
    // Assigner aux variables globales
    toutesLesDonnees = donnees;
    
    // Vérifier si les données sont enrichies
    if (!toutesLesDonnees[0]['_troncon']) {
        console.log('🔄 Enrichissement des données...');
        toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
        sauvegarderDonnees(toutesLesDonnees);
    }
    
    // Mettre à jour l'interface
    const fileStatus = document.getElementById('fileStatus');
    if (fileStatus) {
        fileStatus.textContent = '✅ ' + toutesLesDonnees.length + ' accidents chargés (mémoire)';
        fileStatus.style.color = '#27ae60';
    }
    
    const fileList = document.getElementById('fileList');
    if (fileList) {
        fileList.innerHTML = '<span class="file-tag">📄 Données restaurées</span>';
    }
    
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = '💾 ' + toutesLesDonnees.length + ' lignes en mémoire';
        memoryStatus.style.color = '#27ae60';
        memoryStatus.style.background = '#e8f8f0';
    }
    
    // Mettre à jour les filtres et afficher
    if (typeof mettreAJourFiltres === 'function') mettreAJourFiltres();
    if (typeof appliquerFiltres === 'function') appliquerFiltres();
    
    console.log('✅ Données restaurées avec succès!');
    return true;
}

// ============================================================
// EFFACER LES DONNÉES
// ============================================================

function effacerDonneesEtReinitialiser() {
    if (!confirm('Voulez-vous vraiment effacer toutes les données ?')) return;
    
    localStorage.removeItem('accidentsData');
    toutesLesDonnees = [];
    donneesFiltrees = [];
    
    document.getElementById('fileStatus').textContent = '🗑️ Données effacées';
    document.getElementById('fileList').innerHTML = '';
    
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = '💾 Mémoire: Aucune donnée';
        memoryStatus.style.color = '#999';
        memoryStatus.style.background = '#f5f8fa';
    }
    
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
// ÉVÉNEMENT DE CHARGEMENT DES FICHIERS
// ============================================================

document.getElementById('fileInput').addEventListener('change', function(e) {
    const fichiers = e.target.files;
    if (fichiers.length === 0) return;
    
    const container = document.getElementById('fileList');
    container.innerHTML = '';
    Array.from(fichiers).forEach(f => {
        const tag = document.createElement('span');
        tag.className = 'file-tag';
        tag.textContent = '📄 ' + f.name;
        container.appendChild(tag);
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
                    document.getElementById('fileStatus').textContent = '✅ ' + toutesLesDonnees.length + ' accidents chargés!';
                    toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
                    sauvegarderDonnees(toutesLesDonnees);
                    
                    const memoryStatus = document.getElementById('memoryStatus');
                    if (memoryStatus) {
                        memoryStatus.textContent = '💾 ' + toutesLesDonnees.length + ' lignes en mémoire';
                        memoryStatus.style.color = '#27ae60';
                        memoryStatus.style.background = '#e8f8f0';
                    }
                    
                    mettreAJourFiltres();
                    appliquerFiltres();
                }
            } catch (error) {
                console.error('Erreur:', error);
                document.getElementById('fileStatus').textContent = '❌ Erreur: ' + error.message;
            }
        };
        reader.readAsArrayBuffer(fichier);
    });
});

// ============================================================
// 📁 CHARGER LES FICHIERS DEPUIS LE DOSSIER data/
// ============================================================

async function chargerFichiersData() {
    console.log('📁 Chargement depuis le dossier data/...');
    
    const fileStatus = document.getElementById('fileStatus');
    const fileList = document.getElementById('fileList');
    
    if (fileStatus) {
        fileStatus.textContent = '📥 Recherche des fichiers dans data/...';
        fileStatus.style.color = '#f39c12';
    }
    
    // Liste des fichiers Excel dans le dossier data/
    // Vous pouvez ajouter tous vos fichiers ici
    const fichiers = [
        'Accident_DRRS_2026.xlsx'
        // Ajoutez d'autres fichiers si nécessaire:
        // 'accidents_fevrier.xlsx',
        // 'accidents_mars.xlsx',
    ];
    
    let toutesLesDonneesTemp = [];
    let fichiersCharges = 0;
    let fichiersTrouves = 0;
    
    // Effacer la liste précédente
    if (fileList) fileList.innerHTML = '';
    
    for (const nomFichier of fichiers) {
        try {
            console.log('📄 Tentative de chargement:', nomFichier);
            
            const response = await fetch('data/' + nomFichier);
            
            if (!response.ok) {
                console.warn('⚠️ Fichier non trouvé:', nomFichier);
                continue;
            }
            
            fichiersTrouves++;
            
            // Ajouter le nom du fichier dans la liste
            if (fileList) {
                const tag = document.createElement('span');
                tag.className = 'file-tag';
                tag.textContent = '📄 ' + nomFichier;
                fileList.appendChild(tag);
            }
            
            // Lire le fichier
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
            
            // Ajouter le nom du fichier source
            jsonData.forEach(ligne => {
                ligne['_source_fichier'] = nomFichier;
            });
            
            toutesLesDonneesTemp = toutesLesDonneesTemp.concat(jsonData);
            fichiersCharges++;
            console.log('✅ Fichier chargé:', nomFichier, '(', jsonData.length, 'lignes)');
            
        } catch(error) {
            console.warn('❌ Erreur lors du chargement de', nomFichier, ':', error);
        }
    }
    
    // Vérifier si des fichiers ont été chargés
    if (fichiersCharges > 0) {
        toutesLesDonnees = toutesLesDonneesTemp;
        
        if (fileStatus) {
            fileStatus.textContent = '✅ ' + toutesLesDonnees.length + ' accidents chargés (' + fichiersCharges + ' fichiers)';
            fileStatus.style.color = '#27ae60';
        }
        
        // Enrichir les données
        console.log('🔄 Enrichissement des données...');
        toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
        
        // Sauvegarder dans localStorage
        sauvegarderDonnees(toutesLesDonnees);
        
        // Mettre à jour l'affichage
        const memoryStatus = document.getElementById('memoryStatus');
        if (memoryStatus) {
            memoryStatus.textContent = '💾 ' + toutesLesDonnees.length + ' lignes en mémoire (data/)';
            memoryStatus.style.color = '#27ae60';
            memoryStatus.style.background = '#e8f8f0';
        }
        
        // Mettre à jour les filtres et les tableaux
        if (typeof mettreAJourFiltres === 'function') mettreAJourFiltres();
        if (typeof appliquerFiltres === 'function') appliquerFiltres();
        
        console.log('✅ Chargement terminé avec succès!');
        return true;
        
    } else {
        if (fileStatus) {
            fileStatus.textContent = '⚠️ Aucun fichier trouvé dans data/';
            fileStatus.style.color = '#e74c3c';
        }
        console.warn('⚠️ Aucun fichier chargé');
        return false;
    }
}
// ============================================================
// 📁 CHARGER UN DOSSIER COMPLET (SANS SERVEUR)
// ============================================================

function chargerDossierData() {
    console.log('📁 Ouverture du sélecteur de dossier...');
    
    // Créer un input caché pour sélectionner un dossier
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;  // Permet de sélectionner un dossier
    input.multiple = true;
    input.accept = '.xlsx,.xls';
    
    input.onchange = function(e) {
        const fichiers = e.target.files;
        if (fichiers.length === 0) {
            console.log('📭 Aucun dossier sélectionné');
            return;
        }
        
        console.log('📁 Dossier sélectionné:', fichiers.length, 'fichiers');
        traiterDossier(fichiers);
    };
    
    input.click();
}

// ============================================================
// TRAITER LE DOSSIER SÉLECTIONNÉ
// ============================================================

function traiterDossier(fichiers) {
    const fileStatus = document.getElementById('fileStatus');
    const fileList = document.getElementById('fileList');
    const memoryStatus = document.getElementById('memoryStatus');
    
    // Vider la liste précédente
    if (fileList) fileList.innerHTML = '';
    
    let toutesLesDonneesTemp = [];
    let fichiersExcel = 0;
    let fichiersLus = 0;
    let erreurs = 0;
    
    // Parcourir tous les fichiers du dossier
    Array.from(fichiers).forEach(fichier => {
        // Vérifier si c'est un fichier Excel
        const extension = fichier.name.split('.').pop().toLowerCase();
        if (extension !== 'xlsx' && extension !== 'xls') return;
        
        fichiersExcel++;
        
        // Ajouter le nom du fichier à la liste
        if (fileList) {
            const tag = document.createElement('span');
            tag.className = 'file-tag';
            tag.textContent = '📄 ' + fichier.name;
            fileList.appendChild(tag);
        }
        
        // Lire le fichier
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                
                // Ajouter le nom du fichier source
                jsonData.forEach(ligne => {
                    ligne['_source_fichier'] = fichier.name;
                });
                
                toutesLesDonneesTemp = toutesLesDonneesTemp.concat(jsonData);
                fichiersLus++;
                console.log('✅ Fichier lu:', fichier.name, '(', jsonData.length, 'lignes)');
                
                // Vérifier si tous les fichiers sont lus
                if (fichiersLus + erreurs === fichiersExcel) {
                    if (toutesLesDonneesTemp.length > 0) {
                        // Traiter les données
                        traiterDonneesDossier(toutesLesDonneesTemp, fichiersExcel);
                    } else {
                        if (fileStatus) {
                            fileStatus.textContent = '⚠️ Aucune donnée valide trouvée';
                            fileStatus.style.color = '#e74c3c';
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Erreur lors du chargement de', fichier.name, ':', error);
                erreurs++;
                fichiersLus++;
                if (fichiersLus + erreurs === fichiersExcel && toutesLesDonneesTemp.length === 0) {
                    if (fileStatus) {
                        fileStatus.textContent = '❌ Erreur lors du chargement des fichiers';
                        fileStatus.style.color = '#e74c3c';
                    }
                }
            }
        };
        reader.readAsArrayBuffer(fichier);
    });
    
    if (fichiersExcel === 0) {
        if (fileStatus) {
            fileStatus.textContent = '⚠️ Aucun fichier Excel trouvé dans le dossier';
            fileStatus.style.color = '#e74c3c';
        }
        if (memoryStatus) {
            memoryStatus.textContent = '💾 Mémoire: Aucune donnée';
            memoryStatus.style.color = '#999';
            memoryStatus.style.background = '#f5f8fa';
        }
    } else {
        if (fileStatus) {
            fileStatus.textContent = '📥 ' + fichiersExcel + ' fichier(s) Excel trouvé(s), lecture en cours...';
            fileStatus.style.color = '#f39c12';
        }
    }
}

// ============================================================
// TRAITER LES DONNÉES DU DOSSIER
// ============================================================

function traiterDonneesDossier(donnees, nombreFichiers) {
    console.log('🔄 Traitement des données:', donnees.length, 'lignes');
    
    if (donnees.length === 0) {
        document.getElementById('fileStatus').textContent = '⚠️ Aucune donnée valide trouvée';
        document.getElementById('fileStatus').style.color = '#e74c3c';
        return;
    }
    
    // Assigner aux variables globales
    toutesLesDonnees = donnees;
    
    // Mettre à jour l'interface
    const fileStatus = document.getElementById('fileStatus');
    const memoryStatus = document.getElementById('memoryStatus');
    
    if (fileStatus) {
        fileStatus.textContent = '✅ ' + toutesLesDonnees.length + ' accidents chargés (' + nombreFichiers + ' fichiers)';
        fileStatus.style.color = '#27ae60';
    }
    
    // Enrichir les données
    console.log('🔄 Enrichissement des données...');
    toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
    
    // Sauvegarder dans localStorage
    sauvegarderDonnees(toutesLesDonnees);
    
    if (memoryStatus) {
        memoryStatus.textContent = '💾 ' + toutesLesDonnees.length + ' lignes en mémoire (dossier)';
        memoryStatus.style.color = '#27ae60';
        memoryStatus.style.background = '#e8f8f0';
    }
    
    // Mettre à jour les filtres et les tableaux
    console.log('🔄 Mise à jour des filtres...');
    if (typeof mettreAJourFiltres === 'function') mettreAJourFiltres();
    
    console.log('🔄 Application des filtres...');
    if (typeof appliquerFiltres === 'function') appliquerFiltres();
    
    console.log('✅ Données chargées avec succès!');
}