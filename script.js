// ============================================================
// 📦 SCRIPT.JS - Version compatible avec index.html actuel
// ============================================================

// ============================================================
// 1. VARIABLES GLOBALES
// ============================================================

let toutesLesDonnees = [];
let donneesFiltrees = [];

// ============================================================
// 2. FONCTIONS UTILITAIRES
// ============================================================

const TRONCONS = {
    'T1': { min: 27000, max: 106000, label: 'PK 27000 - PK 106000' },
    'T2': { min: 106000, max: 198000, label: 'PK 106000 - PK 198000' },
    'T2_2': { min: 0, max: 13000, label: 'PK 0 - PK 13000' },
    'T3': { min: 198000, max: 282000, label: 'PK 198000 - PK 282000' },
    'T4': { min: 282000, max: 430000, label: 'PK 282000 - PK 430000' }
};

const SOCIETES_DEPANNAGE = {
    'TransAlmahata 1': { min: 27000, max: 65000 },
    'TransAlmahata 2': { min: 65000, max: 127000 },
    'Ezziraoui': { min: 127000, max: 160000 },
    'INT Assistance': { min: 160000, max: 249000 },
    'Routier Multi Service et INT Assistance': { min: 249000, max: 310000 },
    'Grand Sud': { min: 310000, max: 430000 }
};

function extrairePK(pkStr) {
    if (pkStr === undefined || pkStr === null || pkStr === '') return null;
    try {
        if (typeof pkStr === 'number') return Math.round(pkStr);
        let texte = String(pkStr).trim();
        texte = texte.replace(/PK\s*/gi, '');
        texte = texte.replace(/croissant|décroissant/gi, '');
        texte = texte.replace(/\+.*$/, '');
        texte = texte.replace(/[^0-9]/g, '');
        if (texte === '') return null;
        return parseInt(texte, 10);
    } catch(e) { return null; }
}

function determinerTroncon(pk) {
    if (pk === null || pk === undefined || isNaN(pk)) return 'Inconnu';
    const pkNum = Number(pk);
    if (pkNum >= 0 && pkNum <= 13000) return 'T2_2';
    if (pkNum >= 27000 && pkNum <= 106000) return 'T1';
    if (pkNum >= 106000 && pkNum <= 198000) return 'T2';
    if (pkNum >= 198000 && pkNum <= 282000) return 'T3';
    if (pkNum >= 282000 && pkNum <= 430000) return 'T4';
    return 'Inconnu';
}

function getPkRange(troncon) {
    const ranges = {
        'T1': '27 000 - 106 000',
        'T2': '106 000 - 198 000',
        'T2_2': '0 - 13 000',
        'T3': '198 000 - 282 000',
        'T4': '282 000 - 430 000'
    };
    return ranges[troncon] || 'Inconnu';
}

function determinerSociete(pk) {
    if (pk === null || pk === undefined || isNaN(pk)) return 'Inconnue';
    const pkNum = Number(pk);
    for (const [nom, s] of Object.entries(SOCIETES_DEPANNAGE)) {
        if (pkNum >= s.min && pkNum <= s.max) return nom;
    }
    return 'Inconnue';
}

function extraireHeure(valeur) {
    if (!valeur && valeur !== 0) return null;
    if (valeur === '--' || valeur === '-') return null;
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

function calculerDifferenceTemps(dateHeureDebut, dateHeureFin) {
    if (!dateHeureDebut || !dateHeureFin) return null;
    if (dateHeureDebut === '--' || dateHeureFin === '--' || 
        dateHeureDebut === '-' || dateHeureFin === '-') return null;
    
    try {
        function extraireHeureSeule(texte) {
            if (!texte) return null;
            let str = String(texte).trim();
            let match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            if (match) {
                const heures = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const secondes = match[3] ? parseInt(match[3]) : 0;
                return { heures, minutes, secondes };
            }
            return null;
        }
        
        const debut = extraireHeureSeule(dateHeureDebut);
        const fin = extraireHeureSeule(dateHeureFin);
        if (!debut || !fin) return null;
        
        let secDebut = debut.heures * 3600 + debut.minutes * 60 + debut.secondes;
        let secFin = fin.heures * 3600 + fin.minutes * 60 + fin.secondes;
        let diff = secFin - secDebut;
        if (diff < 0) diff += 86400;
        
        const heures = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const secondes = diff % 60;
        return String(heures).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(secondes).padStart(2, '0');
    } catch(e) { return null; }
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
    
    // تصفية القيم الفارغة وغير الصالحة
    const tempsValides = temps.filter(t => {
        if (!t) return false;
        if (t === '--' || t === '-') return false;
        if (t === '00:00:00' || t === '00:00') return false;
        return true;
    });
    
    if (tempsValides.length === 0) return null;
    
    let secondes = [];
    tempsValides.forEach(t => {
        const parts = t.toString().split(':');
        let sec = 0;
        if (parts.length === 2) {
            sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
        } else if (parts.length === 3) {
            sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        if (sec > 0) {
            secondes.push(sec);
        }
    });
    
    if (secondes.length === 0) return null;
    
    // ✅ استبعاد القيم الخيالية (أكبر من 1:50:00 = 6600 ثانية)
    const seuilMax = 6600; // 1:50:00
    const secondesFiltrees = secondes.filter(s => s <= seuilMax);
    
    // إذا لم يتبقى أي قيم بعد التصفية
    if (secondesFiltrees.length === 0) {
        // إذا كانت كل القيم كبيرة، نأخذ أصغرها
        return formatTemps(Math.min(...secondes));
    }
    
    // حساب المتوسط
    const total = secondesFiltrees.reduce((a, b) => a + b, 0);
    const moyenne = total / secondesFiltrees.length;
    
    return formatTemps(moyenne);
}

// ✅ أضف moyenneTempsDep هنا (بعد moyenneTemps)
function moyenneTempsDep(temps) {
    if (!temps || temps.length === 0) return null;
    
    const tempsValides = temps.filter(t => {
        if (!t) return false;
        if (t === '--' || t === '-') return false;
        if (t === '00:00:00' || t === '00:00') return false;
        return true;
    });
    
    if (tempsValides.length === 0) return null;
    
    let secondes = [];
    tempsValides.forEach(t => {
        const parts = t.toString().split(':');
        let sec = 0;
        if (parts.length === 2) {
            sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
        } else if (parts.length === 3) {
            sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        if (sec > 0) {
            secondes.push(sec);
        }
    });
    
    if (secondes.length === 0) return null;
    
    // ✅ استبعاد القيم الخيالية (أكبر من 4 ساعات = 14400 ثانية)
    const seuilMax = 14400;
    const secondesFiltrees = secondes.filter(s => s <= seuilMax);
    
    if (secondesFiltrees.length === 0) {
        return formatTemps(Math.min(...secondes));
    }
    
    const total = secondesFiltrees.reduce((a, b) => a + b, 0);
    const moyenne = total / secondesFiltrees.length;
    
    return formatTemps(moyenne);
}
function formatTemps(secondes) {
    if (secondes === undefined || secondes === null || isNaN(secondes)) return '-';
    const h = Math.floor(secondes / 3600);
    const m = Math.floor((secondes % 3600) / 60);
    const s = Math.round(secondes % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
function chargerFichierPourDirection(fichier, direction) {
    console.log(`📄 Fichier sélectionné pour ${direction}:`, fichier.name);
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
            
            jsonData.forEach(ligne => {
                ligne['_source_fichier'] = fichier.name;
                ligne['_direction_assignee'] = direction;
            });
            
            toutesLesDonnees = enrichirDonnees(jsonData);
            sauvegarderDonnees(toutesLesDonnees);
            
            document.getElementById('fileStatus').textContent = `✅ ${toutesLesDonnees.length} accidents chargés (${direction})`;
            document.getElementById('fileStatus').style.color = '#27ae60';
            
            const memoryStatus = document.getElementById('memoryStatus');
            if (memoryStatus) {
                memoryStatus.textContent = `💾 ${toutesLesDonnees.length} lignes en mémoire (${direction})`;
                memoryStatus.style.color = '#27ae60';
                memoryStatus.style.background = '#e8f8f0';
            }
            
            const fileList = document.getElementById('fileList');
            if (fileList) {
                fileList.innerHTML = `<span class="file-tag">📄 ${fichier.name} (${direction})</span>`;
            }
            
            reinitialiserTout();
            changerPage('analyse');
            
            alert(`✅ Données chargées avec succès pour la Direction "${direction}"!`);
            
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur lors du chargement du fichier: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(fichier);
}

// ============================================================
// 3. ENRICHIR LES DONNÉES
// ============================================================

function enrichirDonnees(donnees) {
    console.log('🔄 enrichirDonnees - Début');
    if (donnees.length === 0) return donnees;
    const resultats = donnees.map((ligne) => {
        const nouvelle = { ...ligne };
        const pk = extrairePK(ligne['PK']);
        nouvelle['_pk_num'] = pk;
        nouvelle['_troncon'] = determinerTroncon(pk);
        nouvelle['_societe'] = determinerSociete(pk);
        
        let axe = 'A3';
        if (pk !== null && !isNaN(pk)) {
            if (pk >= 0 && pk <= 13000) axe = 'A301';
            else if (pk >= 27000 && pk <= 430000) axe = 'A3';
        }
        nouvelle['_axe'] = axe;
        
        // حساب المصابين
        const tuesUsager = parseInt(ligne['Nbr Tués Usagers'] || 0);
        const tuesPietonUsager = parseInt(ligne['Nbr Tués Piéton Usager'] || 0);
        const tuesPietonVagabond = parseInt(ligne['Nbr Tués Piéton Vagabond'] || 0);
        const tuesPietonRiverain = parseInt(ligne['Nbr Tués Piéton Riverain'] || 0);
        const tuesPietonIntervention = parseInt(ligne['Nbr Tués Piéton Pers. D\'intervention'] || 0);
        nouvelle['_total_tues'] = tuesUsager + tuesPietonUsager + tuesPietonVagabond + tuesPietonRiverain + tuesPietonIntervention;
        
        const bgUsager = parseInt(ligne['Nbr BG Usagers'] || 0);
        const bgPietonUsager = parseInt(ligne['Nbr BG Piéton Usager'] || 0);
        const bgPietonVagabond = parseInt(ligne['Nbr BG Piéton Vagabond'] || 0);
        const bgPietonRiverain = parseInt(ligne['Nbr BG Piéton Riverain'] || 0);
        const bgPietonIntervention = parseInt(ligne['Nbr BG Piéton Pers. D\'intervention'] || 0);
        nouvelle['_total_bg'] = bgUsager + bgPietonUsager + bgPietonVagabond + bgPietonRiverain + bgPietonIntervention;
        
        const blUsager = parseInt(ligne['Nbr BL Usagers'] || 0);
        const blPietonUsager = parseInt(ligne['Nbr BL Piéton Usager'] || 0);
        const blPietonVagabond = parseInt(ligne['Nbr BL Piéton Vagabond'] || 0);
        const blPietonRiverain = parseInt(ligne['Nbr BL Piéton Riverain'] || 0);
        const blPietonIntervention = parseInt(ligne['Nbr BL Piéton Pers. D\'intervention'] || 0);
        nouvelle['_total_bl'] = blUsager + blPietonUsager + blPietonVagabond + blPietonRiverain + blPietonIntervention;
        nouvelle['_total_blesses'] = nouvelle['_total_bg'] + nouvelle['_total_bl'];
        
        const datePriseEnCharge = ligne['Date prise en charge'] || ligne['Date et heure accident'];
        nouvelle['_mois'] = obtenirMois(datePriseEnCharge);
        nouvelle['_nom_mois'] = obtenirNomMois(datePriseEnCharge);
        
        const dateHeureAccident = ligne['Date et heure accident'];
        if (dateHeureAccident) {
            const heureAccident = extraireHeure(dateHeureAccident);
            if (heureAccident) {
                nouvelle['_heure_accident'] = heureAccident;
                const parts = heureAccident.split(':');
                const h = parseInt(parts[0]);
                if (!isNaN(h)) {
                    if (h >= 6 && h < 12) nouvelle['_periode'] = 'Matin';
                    else if (h >= 12 && h < 18) nouvelle['_periode'] = 'Midi';
                    else if (h >= 18 && h < 24) nouvelle['_periode'] = 'Soir';
                    else nouvelle['_periode'] = 'Nuit';
                }
            }
        }
        // ====== ✅ أضف هذا القسم هنا ======
                // استخراج يوم الأسبوع (محسّن)
                try {
                    let dateObj = null;
                    let dateStr = String(dateHeureAccident).trim();
                    
                    // تنسيق "03-01-2026 02:10"
                    let match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
                    if (match) {
                        const jour = parseInt(match[1]);
                        const mois = parseInt(match[2]) - 1;
                        const annee = parseInt(match[3]);
                        dateObj = new Date(annee, mois, jour);
                    }
                    
                    // تنسيق "03/01/2026 02:10"
                    if (!dateObj || isNaN(dateObj)) {
                        match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                        if (match) {
                            const jour = parseInt(match[1]);
                            const mois = parseInt(match[2]) - 1;
                            const annee = parseInt(match[3]);
                            dateObj = new Date(annee, mois, jour);
                        }
                    }
                    
                    // محاولة مباشرة
                    if (!dateObj || isNaN(dateObj)) {
                        dateObj = new Date(dateStr);
                    }
                    
                    if (dateObj && !isNaN(dateObj)) {
                        const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                        nouvelle['_jour_semaine'] = jours[dateObj.getDay()];
                    }
                } catch(e) {
            }
        // ====== ✅ أضف هذا القسم هنا ======
        // استخراج يوم الأسبوع
        try {
            const dateObj = new Date(dateHeureAccident);
            if (!isNaN(dateObj)) {
                const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                nouvelle['_jour_semaine'] = jours[dateObj.getDay()];
            }
        } catch(e) {}
        // ====== نهاية الإضافة ======
        
        // فروقات التوقيت
        const dateHeureAccidentComplet = ligne['Date et heure accident'];
        if (dateHeureAccidentComplet) {
            const dateHeurePatrouilleur = ligne["Arrivée de l'agent de l'assistance"];
            if (dateHeurePatrouilleur && dateHeurePatrouilleur !== '--' && dateHeurePatrouilleur !== '-') {
                nouvelle['_delai_patrouilleur'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeurePatrouilleur);
            }
            const dateHeureGR = ligne['Arrivée Gendarmerie Royale'];
            if (dateHeureGR && dateHeureGR !== '--' && dateHeureGR !== '-') {
                nouvelle['_delai_gr'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeureGR);
            }
            const dateHeurePC = ligne['Arrivée Ambulance'];
            if (dateHeurePC && dateHeurePC !== '--' && dateHeurePC !== '-') {
                nouvelle['_delai_pc'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeurePC);
            }
            const dateHeureDepannage = ligne['Arrivée Dépannage'];
            if (dateHeureDepannage && dateHeureDepannage !== '--' && dateHeureDepannage !== '-') {
                nouvelle['_delai_depannage'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeureDepannage);
            }
        }
        
       if (ligne['Catégorie']) {
            const cat = ligne['Catégorie'].toLowerCase();
            // PL إذا كان يحتوي على pl أو autocar
            if (cat.includes('pl') || cat.includes('autocar')) {
                nouvelle['_type_vehicule'] = 'PL';
            } else {
                nouvelle['_type_vehicule'] = 'VL';
            }
        }
        return nouvelle;
    });
    return resultats;
}

// ============================================================
// 4. SAUVEGARDE / CHARGEMENT
// ============================================================

function sauvegarderDonnees(donnees) {
    if (!donnees || donnees.length === 0) return;
    try {
        localStorage.setItem('accidentsData', JSON.stringify(donnees));
        console.log('💾 Données sauvegardées (', donnees.length, 'lignes)');
    } catch(e) { console.warn('❌ Erreur sauvegarde:', e); }
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
    } catch(e) { localStorage.removeItem('accidentsData'); }
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
    // التأكد من أن البيانات مُثراة
    if (!toutesLesDonnees[0]['_troncon']) {
        toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
        sauvegarderDonnees(toutesLesDonnees);
    }
    return true;
}

// ============================================================
// 5. CHARGEMENT DES FICHIERS
// ============================================================

function ouvrirSelectionFichiers() {
    const choix = confirm('🔽 Choisissez une option :\n\n✅ "OK" pour sélectionner un dossier complet\n❌ "Annuler" pour sélectionner des fichiers individuels');
    if (choix) {
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
        document.getElementById('fileInput').click();
    }
}

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
    let fichiersExcel = 0, fichiersLus = 0, erreurs = 0;
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
    
    // ✅ حفظ البيانات في localStorage
    sauvegarderDonnees(toutesLesDonnees);
    
    document.getElementById('fileStatus').textContent = '✅ ' + toutesLesDonnees.length + ' accidents chargés (' + nombreFichiers + ' fichiers)';
    document.getElementById('fileStatus').style.color = '#27ae60';
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = '💾 ' + toutesLesDonnees.length + ' lignes en mémoire';
        memoryStatus.style.color = '#27ae60';
        memoryStatus.style.background = '#e8f8f0';
    }
    
    // ✅ تحديث جميع الأقسام
    reinitialiserTout();
}

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
    reinitialiserTout();
       // ✅ إعادة تعيين Rapprochement
    if (typeof Rapprochement !== 'undefined' && Rapprochement.reinitialiser) {
        Rapprochement.reinitialiser();
    }
}

// ============================================================
// 6. SECTION ANALYSE (مستقلة)
// ============================================================

const Analyse = {
    chartGravite: null,
    chartVictimes: null,
    chartTroncons: null,
    pkTooltipTimer: null,
    
    // تهيئة القسم
    init: function() {
        this.mettreAJourFiltres();
        this.appliquerFiltres();
    },
    
    // ====== تحديث قوائم الفلاتر ======
    mettreAJourFiltres: function() {
        const selectTroncon = document.getElementById('analyseTronconFilter');
        const selectMois = document.getElementById('analyseMoisFilter');
        if (!selectTroncon || !selectMois) return;
        
        // حفظ التحديدات الحالية
        const selectedTroncon = Array.from(selectTroncon.selectedOptions).map(opt => opt.value);
        const selectedMois = Array.from(selectMois.selectedOptions).map(opt => opt.value);
        
        // ---- بناء قائمة المقاطع ----
        const troncons = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_troncon'] && d['_troncon'] !== 'Inconnu') {
                troncons.add(d['_troncon']);
            }
        });
        
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        ['T1', 'T2', 'T2_2', 'T3', 'T4'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRange(t) + ')';
            selectTroncon.appendChild(opt);
        });
        
        // استعادة التحديدات
        Array.from(selectTroncon.options).forEach(opt => {
            if (selectedTroncon.includes(opt.value)) opt.selected = true;
        });
        if (selectTroncon.selectedOptions.length === 0) {
            selectTroncon.querySelector('option[value="all"]').selected = true;
        }

        // ---- بناء قائمة الأشهر ----
        const moisExistants = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        
        // استعادة التحديدات
        Array.from(selectMois.options).forEach(opt => {
            if (selectedMois.includes(opt.value)) opt.selected = true;
        });
        if (selectMois.selectedOptions.length === 0) {
            selectMois.querySelector('option[value="all"]').selected = true;
        }
    },
    // ====== تطبيق الفلاتر (مع دعم التحديدات المتعددة) ======
    appliquerFiltres: function() {
        const tronconSelect = document.getElementById('analyseTronconFilter');
        const moisSelect = document.getElementById('analyseMoisFilter');
        
        // ✅ قراءة جميع القيم المحددة (وليس قيمة واحدة)
        const tronconValues = Array.from(tronconSelect.selectedOptions).map(opt => opt.value);
        const moisValues = Array.from(moisSelect.selectedOptions).map(opt => opt.value);
        
        // التحقق من وجود "all"
        const tronconAll = tronconValues.includes('all');
        const moisAll = moisValues.includes('all');
        
        console.log('🔍 Analyse - Tronçons sélectionnés:', tronconValues);
        console.log('🔍 Analyse - Mois sélectionnés:', moisValues);
        
        // تصفية البيانات
        donneesFiltrees = toutesLesDonnees.filter(d => {
            // فلتر المقاطع
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) {
                return false;
            }
            // فلتر الأشهر
            if (!moisAll && !moisValues.includes(String(d['_mois']))) {
                return false;
            }
            return true;
        });
        
        console.log('📊 Analyse - Données après filtrage:', donneesFiltrees.length);
        
        // تحديث الجدول والرسومات
        this.mettreAJourTableau();
        this.mettreAJourGraphiques();
    },
        // ====== إعادة تعيين فلاتر Analyse فقط ======
    reinitialiserFiltres: function() {
        console.log('🔄 Analyse - Réinitialisation des filtres...');
        
        const tronconSelect = document.getElementById('analyseTronconFilter');
        const moisSelect = document.getElementById('analyseMoisFilter');
        
        // ✅ إعادة تعيين فلاتر Analyse فقط
        if (tronconSelect) {
            // تحديد "all" فقط
            Array.from(tronconSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (moisSelect) {
            Array.from(moisSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        
        // تطبيق الفلاتر
        this.appliquerFiltres();
    },
    // ====== ✅ أضف هذه الدالة هنا ======
    reinitialiserFiltresPK: function() {
        console.log('🔄 Analyse - Réinitialisation des filtres PK...');
        
        const elTues = document.getElementById('filterTues');
        const elBG = document.getElementById('filterBG');
        const elBL = document.getElementById('filterBL');
        
        if (elTues) elTues.checked = true;
        if (elBG) elBG.checked = true;
        if (elBL) elBL.checked = true;
        
        // إعادة رسم PK
        const donnees = donneesFiltrees.length > 0 ? donneesFiltrees : toutesLesDonnees;
        this.dessinerPK(donnees);
    },
    
    mettreAJourTableau: function() {
        const container = document.getElementById('analyseTable');
        if (!container) return;
        
        const tronconSelect = document.getElementById('analyseTronconFilter');
        const moisSelect = document.getElementById('analyseMoisFilter');
        const tronconFiltre = tronconSelect ? tronconSelect.value : 'all';
        const moisFiltre = moisSelect ? moisSelect.value : 'all';
        
        const tousLesTroncons = ['T1', 'T2', 'T2_2', 'T3', 'T4'];
        const resultats = {};
        tousLesTroncons.forEach(t => {
            resultats[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        donneesFiltrees.forEach(d => {
            const t = d['_troncon'];
            if (t && t in resultats) {
                resultats[t].total++;
                const gravite = d['Gravité accident'];
                if (gravite === 'Corporelle') resultats[t].corporelle++;
                else if (gravite === 'Matérielle') resultats[t].materielle++;
                else if (gravite === 'Mortelle') resultats[t].mortelle++;
                resultats[t].tues += parseInt(d['_total_tues'] || 0);
                resultats[t].bg += parseInt(d['_total_bg'] || 0);
                resultats[t].bl += parseInt(d['_total_bl'] || 0);
            }
        });
        
        let totalCorp = 0, totalMat = 0, totalMort = 0, totalAcc = 0, totalTues = 0, totalBG = 0, totalBL = 0;
        let html = '<table><thead><tr><th>Tronçon</th><th>Entre PK et PK</th><th>Corporelle</th><th>Matérielle</th><th>Mortelle</th><th>Total ACC</th><th>Nbr Tués</th><th>Nbr BG</th><th>Nbr BL</th></tr></thead><tbody>';
        tousLesTroncons.forEach(t => {
            const d = resultats[t];
            totalCorp += d.corporelle; totalMat += d.materielle; totalMort += d.mortelle;
            totalAcc += d.total; totalTues += d.tues; totalBG += d.bg; totalBL += d.bl;
            const range = getPkRange(t);
            const isFiltered = (tronconFiltre === t);
            const rowClass = isFiltered ? 'filtered-row' : '';
            html += `<tr class="${rowClass}"><td><strong>${t}</strong></td><td>${range}</td><td>${d.corporelle}</td><td>${d.materielle}</td><td>${d.mortelle}</td><td><strong>${d.total}</strong></td><td>${d.tues}</td><td>${d.bg}</td><td>${d.bl}</td></tr>`;
        });
        html += `<tr class="total-row"><td colspan="2"><strong>Total</strong></td><td><strong>${totalCorp}</strong></td><td><strong>${totalMat}</strong></td><td><strong>${totalMort}</strong></td><td><strong>${totalAcc}</strong></td><td><strong>${totalTues}</strong></td><td><strong>${totalBG}</strong></td><td><strong>${totalBL}</strong></td></tr></tbody></table>`;
        
        const moisNom = moisFiltre !== 'all' ? obtenirNomMois(new Date(2026, parseInt(moisFiltre)-1, 1)) : 'Tous les mois';
        const tronconNom = tronconFiltre !== 'all' ? tronconFiltre : 'Tous les tronçons';
        html = `<div style="padding:12px 16px;background:#f0f8ff;border-radius:10px;margin-bottom:15px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <span><strong>📅 Mois :</strong> ${moisNom}</span>
            <span><strong>📍 Tronçon :</strong> ${tronconNom}</span>
            <span><strong>📊 Total accidents :</strong> ${donneesFiltrees.length}</span>
        </div>` + html;
        container.innerHTML = html;
    },
    
    mettreAJourGraphiques: function() {
        const donnees = donneesFiltrees.length > 0 ? donneesFiltrees : toutesLesDonnees;
        if (donnees.length === 0) return;
        const resultats = this.calculerResultats(donnees);
        this.dessinerGravite(resultats);
        this.dessinerVictimes(resultats);
        this.dessinerTroncons(resultats);
        this.dessinerPK(donnees);  // ← تأكد من وجود هذا السطر
    },
    
    calculerResultats: function(donnees) {
        const tousLesTroncons = ['T1', 'T2', 'T2_2', 'T3', 'T4'];
        const resultats = {};
        tousLesTroncons.forEach(t => {
            resultats[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        donnees.forEach(d => {
            const t = d['_troncon'];
            if (t && t in resultats) {
                resultats[t].total++;
                const gravite = d['Gravité accident'];
                if (gravite === 'Corporelle') resultats[t].corporelle++;
                else if (gravite === 'Matérielle') resultats[t].materielle++;
                else if (gravite === 'Mortelle') resultats[t].mortelle++;
                resultats[t].tues += parseInt(d['_total_tues'] || 0);
                resultats[t].bg += parseInt(d['_total_bg'] || 0);
                resultats[t].bl += parseInt(d['_total_bl'] || 0);
            }
        });
        return resultats;
    },
    
    dessinerGravite: function(resultats) {
        const canvas = document.getElementById('chartAnalyseGravite');
        if (!canvas) return;
        if (this.chartGravite) { this.chartGravite.destroy(); this.chartGravite = null; }
        const data = [
            resultats.T1.corporelle + resultats.T2.corporelle + resultats.T2_2.corporelle + resultats.T3.corporelle + resultats.T4.corporelle,
            resultats.T1.materielle + resultats.T2.materielle + resultats.T2_2.materielle + resultats.T3.materielle + resultats.T4.materielle,
            resultats.T1.mortelle + resultats.T2.mortelle + resultats.T2_2.mortelle + resultats.T3.mortelle + resultats.T4.mortelle
        ];
        if (data.every(d => d === 0)) return;
        this.chartGravite = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Corporelle', 'Matérielle', 'Mortelle'],
                datasets: [{ data: data, backgroundColor: ['#e67e22', '#3498db', '#e74c3c'], borderWidth: 2, borderColor: '#fff' }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    },
    
    dessinerVictimes: function(resultats) {
        const canvas = document.getElementById('chartAnalyseVictimes');
        if (!canvas) return;
        if (this.chartVictimes) { this.chartVictimes.destroy(); this.chartVictimes = null; }
        const data = [
            resultats.T1.tues + resultats.T2.tues + resultats.T2_2.tues + resultats.T3.tues + resultats.T4.tues,
            resultats.T1.bg + resultats.T2.bg + resultats.T2_2.bg + resultats.T3.bg + resultats.T4.bg,
            resultats.T1.bl + resultats.T2.bl + resultats.T2_2.bl + resultats.T3.bl + resultats.T4.bl
        ];
        if (data.every(d => d === 0)) return;
        this.chartVictimes = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Tués', 'BG', 'BL'],
                datasets: [{ data: data, backgroundColor: ['#c0392b', '#e67e22', '#2ecc71'], borderWidth: 2, borderColor: '#fff' }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    },
    
    dessinerTroncons: function(resultats) {
        const canvas = document.getElementById('chartAnalyseTroncons');
        if (!canvas) return;
        if (this.chartTroncons) { this.chartTroncons.destroy(); this.chartTroncons = null; }
        const labels = ['T1', 'T2', 'T2_2', 'T3', 'T4'];
        const dataCorp = labels.map(t => resultats[t].corporelle);
        const dataMat = labels.map(t => resultats[t].materielle);
        const dataMort = labels.map(t => resultats[t].mortelle);
        if (dataCorp.every(d => d === 0) && dataMat.every(d => d === 0) && dataMort.every(d => d === 0)) return;
        this.chartTroncons = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Corporelle', data: dataCorp, backgroundColor: '#e67e22', borderRadius: 4 },
                    { label: 'Matérielle', data: dataMat, backgroundColor: '#3498db', borderRadius: 4 },
                    { label: 'Mortelle', data: dataMort, backgroundColor: '#e74c3c', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    },
    
    dessinerPK: function(donnees) {
        console.log('📈 ===== رسم PK (4 أشرطة) =====');
        const containers = {
            croissant: document.getElementById('pkPointsCroissant'),
            decroissant: document.getElementById('pkPointsDecroissant'),
            a301_1: document.getElementById('pkPointsA301_1'),
            a301_2: document.getElementById('pkPointsA301_2')
        };
        if (!containers.croissant || !containers.decroissant || !containers.a301_1 || !containers.a301_2) {
            console.warn('⚠️ حاويات PK غير موجودة');
            return;
        }
        if (!donnees || donnees.length === 0) {
            Object.values(containers).forEach(c => {
                c.innerHTML = '<div style="text-align:center;color:#999;padding:10px;">📭 لا توجد بيانات</div>';
            });
            return;
        }
        
        const showTues = document.getElementById('filterTues')?.checked ?? true;
        const showBG = document.getElementById('filterBG')?.checked ?? true;
        const showBL = document.getElementById('filterBL')?.checked ?? true;
        
        const dataSource = donneesFiltrees.length > 0 ? donneesFiltrees : toutesLesDonnees;
        
        // ====== تصفية A3 Croissant ======
        const donneesA3Croissant = dataSource.filter(d => {
            const pk = parseInt(d['_pk_num'] || 0);
            const sens = d['Sens'] || '';
            return pk >= 27000 && pk <= 430000 && sens === 'PK croissant';
        });
        
        // ====== تصفية A3 Décroissant ======
        const donneesA3Decroissant = dataSource.filter(d => {
            const pk = parseInt(d['_pk_num'] || 0);
            const sens = d['Sens'] || '';
            return pk >= 27000 && pk <= 430000 && sens === 'PK décroissant';
        });
        
        // ====== تصفية A301 Croissant ======
        const donneesA301Croissant = dataSource.filter(d => {
            const pk = parseInt(d['_pk_num'] || 0);
            const sens = d['Sens'] || '';
            return pk >= 0 && pk <= 13000 && sens === 'PK croissant';
        });
        
        // ====== تصفية A301 Décroissant ======
        const donneesA301Decroissant = dataSource.filter(d => {
            const pk = parseInt(d['_pk_num'] || 0);
            const sens = d['Sens'] || '';
            return pk >= 0 && pk <= 13000 && sens === 'PK décroissant';
        });
        
        console.log('📊 A3 Croissant:', donneesA3Croissant.length);
        console.log('📊 A3 Décroissant:', donneesA3Decroissant.length);
        console.log('📊 A301 Croissant:', donneesA301Croissant.length);
        console.log('📊 A301 Décroissant:', donneesA301Decroissant.length);
        
        // ====== إنشاء النقاط ======
        this.genererPointsPK(containers.croissant, donneesA3Croissant, showTues, showBG, showBL, 27000, 430000);
        this.genererPointsPK(containers.decroissant, donneesA3Decroissant, showTues, showBG, showBL, 27000, 430000);
        this.genererPointsPK(containers.a301_1, donneesA301Croissant, showTues, showBG, showBL, 0, 13000);
        this.genererPointsPK(containers.a301_2, donneesA301Decroissant, showTues, showBG, showBL, 0, 13000);
        
        // ====== ✅ تحديث العدادات (الاتجاهات) ======
        document.getElementById('totalCroissant').textContent = donneesA3Croissant.length;
        document.getElementById('totalDecroissant').textContent = donneesA3Decroissant.length;
        document.getElementById('totalA301Croissant').textContent = donneesA301Croissant.length;
        document.getElementById('totalA301Decroissant').textContent = donneesA301Decroissant.length;
        
        // ✅ المجموع الكلي
        const totalAccidents = donneesA3Croissant.length + donneesA3Decroissant.length + 
                            donneesA301Croissant.length + donneesA301Decroissant.length;
        document.getElementById('totalAccidentsPK').textContent = totalAccidents;
        
        // ====== ✅ حساب Tués, BG, BL ======
        let totalTues = 0, totalBG = 0, totalBL = 0;
        dataSource.forEach(d => {
            totalTues += parseInt(d['_total_tues'] || 0);
            totalBG += parseInt(d['_total_bg'] || 0);
            totalBL += parseInt(d['_total_bl'] || 0);
        });
        document.getElementById('totalTuesPK').textContent = totalTues;
        document.getElementById('totalBGPK').textContent = totalBG;
        document.getElementById('totalBLPK').textContent = totalBL;
        
        console.log('✅ المجموع الكلي:', totalAccidents);
        console.log('✅ Tués:', totalTues, 'BG:', totalBG, 'BL:', totalBL);
    },
        
    genererPointsPK: function(container, donnees, showTues, showBG, showBL, pkMin, pkMax) {
        if (!container) return 0;
        
        const donneesFiltreesPK = donnees.filter(d => {
            const pk = parseInt(d['_pk_num'] || 0);
            if (!pk || isNaN(pk) || pk < pkMin || pk > pkMax) return false;
            
            const tues = parseInt(d['_total_tues'] || 0);
            const bg = parseInt(d['_total_bg'] || 0);
            const bl = parseInt(d['_total_bl'] || 0);
            
            if (!showTues && !showBG && !showBL) return false;
            let correspond = false;
            if (showTues && tues > 0) correspond = true;
            if (showBG && bg > 0) correspond = true;
            if (showBL && bl > 0) correspond = true;
            return correspond;
        });
        
        if (donneesFiltreesPK.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#999;padding:5px;font-size:11px;">Pas de PK ici</div>';
            return 0;
        }
        
        const range = pkMax - pkMin;
        const baseTop = 50;
        let html = '';
        
        const pointsParPK = {};
        donneesFiltreesPK.forEach(d => {
            const pk = parseInt(d['_pk_num'] || 0);
            if (!pointsParPK[pk]) pointsParPK[pk] = [];
            pointsParPK[pk].push(d);
        });
        
        Object.keys(pointsParPK).forEach(pkStr => {
            const pk = parseInt(pkStr);
            const accidents = pointsParPK[pkStr];
            const position = ((pk - pkMin) / range) * 100;
            
            accidents.forEach((d, index) => {
                const niveau = index % 3;
                const decalage = (niveau - 1) * 15;
                const topPosition = baseTop + decalage;
                
                const tues = parseInt(d['_total_tues'] || 0);
                const bg = parseInt(d['_total_bg'] || 0);
                const bl = parseInt(d['_total_bl'] || 0);
                
                let couleur = '#3498db';
                let type = 'Matérielle';
                if (tues > 0) { couleur = '#c0392b'; type = 'Mortelle'; }
                else if (bg > 0) { couleur = '#e67e22'; type = 'Corporelle (BG)'; }
                else if (bl > 0) { couleur = '#2ecc71'; type = 'Corporelle (BL)'; }
                
                const totalVictimes = tues + bg + bl;
                // لتكبير حجم الدوائر 6 + Math.min(totalVictimes * 2, 14)	الحجم الحالي (صغير)+8 + Math.min(totalVictimes * 2, 18)	حجم متوسط+10 + Math.min(totalVictimes * 2, 22)	حجم كبير+12 + Math.min(totalVictimes * 2, 26)	حجم كبير جداً
                let taille = 8 + Math.min(totalVictimes * 2, 18);
                
                const date = String(d['Date et heure accident'] || 'N/A').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const sensTexte = String(d['Sens'] || 'N/A').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const gravite = String(d['Gravité accident'] || 'N/A').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const ticket = String(d['Ticket'] || 'N/A').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                
                html += `<div class="pk-point" style="position:absolute; left:${position}%; top:${topPosition}%; transform:translate(-50%, -50%); width:${taille}px; height:${taille}px; background:${couleur}; border-radius:50%; cursor:pointer; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.2); z-index:5; transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translate(-50%, -50%) scale(1.4)'; this.style.boxShadow='0 0 0 4px rgba(45,125,184,0.3), 0 4px 15px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'; this.style.boxShadow='0 2px 6px rgba(0,0,0,0.2)';" onclick="Analyse.afficherInfoPK(${pk}, '${date}', '${sensTexte}', '${type}', ${tues}, ${bg}, ${bl}, '${gravite}', '${ticket}', event)"></div>`;
            });
        });
        
        container.innerHTML = html;
        return donneesFiltreesPK.length;
    },
    
    afficherInfoPK: function(pk, date, sens, type, tues, bg, bl, gravite, ticket, event) {
        const tooltip = document.getElementById('pkTooltip');
        const content = document.getElementById('pkTooltipContent');
        if (!tooltip || !content) return;
        if (event) event.stopPropagation();
         // ✅ إضافة + قبل آخر ثلاثة أرقام
        function formaterPK(pk) {
            const str = String(pk);
            if (str.length <= 3) return str;
            const debut = str.slice(0, -3);
            const fin = str.slice(-3);
            return debut + '+' + fin;
        }
        const pkFormate = formaterPK(pk);

        content.innerHTML = `
                <div style="font-weight:bold;color:#1a3a5c;border-bottom:1px solid #eef2f7;padding-bottom:6px;margin-bottom:6px;">📍 PK ${pkFormate}</div>
                <div style="display:grid;grid-template-columns:auto 1fr;gap:3px 12px;font-size:12px;">
                    <span style="color:#6b7a8f;">📅 Date:</span><span>${date}</span>
                    <span style="color:#6b7a8f;">📌 Sens:</span><span>${sens}</span>
                    <span style="color:#6b7a8f;">⚠️ Gravité:</span><span>${gravite}</span>
                    <span style="color:#6b7a8f;">🔴 Tués:</span><span>${tues}</span>
                    <span style="color:#6b7a8f;">🟠 BG:</span><span>${bg}</span>
                    <span style="color:#6b7a8f;">🟢 BL:</span><span>${bl}</span>
                    <span style="color:#6b7a8f;">🎫 Ticket:</span><span>${ticket}</span>
                </div>
            `;
            const container = document.getElementById('pkChartContainer');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let left = Math.min(x + 15, rect.width - 210);
        let top = Math.min(y - 10, rect.height - 130);
        if (top < 10) top = 10;
        tooltip.style.left = Math.max(10, left) + 'px';
        tooltip.style.top = Math.max(10, top) + 'px';
        tooltip.style.display = 'block';
        if (this.pkTooltipTimer) { clearTimeout(this.pkTooltipTimer); this.pkTooltipTimer = null; }
        document.removeEventListener('click', this.cacherTooltip);
        document.addEventListener('click', this.cacherTooltip.bind(this));
    },
    
    cacherTooltip: function(event) {
        const tooltip = document.getElementById('pkTooltip');
        const points = document.querySelectorAll('.pk-point');
        let estPoint = false;
        points.forEach(p => {
            if (p.contains(event.target)) estPoint = true;
        });
        if (!estPoint && tooltip) {
            tooltip.style.display = 'none';
            document.removeEventListener('click', this.cacherTooltip);
            if (this.pkTooltipTimer) { clearTimeout(this.pkTooltipTimer); this.pkTooltipTimer = null; }
        }
    }
};

// ============================================================
// SECTION INTERVENANTS (مستقلة تماماً)
// ============================================================

const Intervenants = {
    chart: null,
    donneesFiltrees: [],
    
    // ====== تهيئة القسم ======
    init: function() {
        this.mettreAJourFiltres();
        this.gererAffichagePMA();  // ← إضافة هذا السطر
        this.appliquerFiltres();
    },
    
    // ====== تحديث قوائم الفلاتر ======
    mettreAJourFiltres: function() {
        const selectTroncon = document.getElementById('intervTronconFilter');
        const selectMois = document.getElementById('intervMoisFilter');
        if (!selectTroncon || !selectMois) return;
        
        // حفظ التحديدات الحالية
        const selectedTroncon = Array.from(selectTroncon.selectedOptions).map(opt => opt.value);
        const selectedMois = Array.from(selectMois.selectedOptions).map(opt => opt.value);
        
        // ---- بناء قائمة المقاطع (مع T2_2) ----
        const troncons = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_troncon'] && d['_troncon'] !== 'Inconnu') {
                troncons.add(d['_troncon']);
            }
        });
        
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        ['T1', 'T2', 'T2_2', 'T3', 'T4'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRange(t) + ')';
            selectTroncon.appendChild(opt);
        });
        
        // استعادة التحديدات
        Array.from(selectTroncon.options).forEach(opt => {
            if (selectedTroncon.includes(opt.value)) opt.selected = true;
        });
        if (selectTroncon.selectedOptions.length === 0) {
            selectTroncon.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- بناء قائمة الأشهر ----
        const moisExistants = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        
        // استعادة التحديدات
        Array.from(selectMois.options).forEach(opt => {
            if (selectedMois.includes(opt.value)) opt.selected = true;
        });
        if (selectMois.selectedOptions.length === 0) {
            selectMois.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- PMA (من الإعدادات) ----
        const selectPMA = document.getElementById('intervPmaFilter');
        if (selectPMA) {
            let pmaData = [];
            try {
                const data = localStorage.getItem('config_gendarmerie');
                if (data) pmaData = JSON.parse(data);
            } catch(e) {}
            
            const val = selectPMA.value;
            selectPMA.innerHTML = '<option value="all">Toutes les PMA</option>';
            pmaData.forEach(pma => {
                const opt = document.createElement('option');
                opt.value = pma.nom;
                opt.textContent = pma.nom + ' (' + pma.axe + ')';
                selectPMA.appendChild(opt);
            });
            const existe = pmaData.some(p => p.nom === val);
            if (existe) selectPMA.value = val;
            else selectPMA.value = 'all';
        }
    },
    
    // ====== إظهار/إخفاء فلتر PMA حسب Type ======
    gererAffichagePMA: function() {
        const type = document.getElementById('intervTypeFilter').value;
        const pmaGroup = document.getElementById('pmaFilterGroup');
        
        if (!pmaGroup) return;
        
        // ✅ إظهار فلتر PMA فقط عند اختيار "gr"
        if (type === 'gr') {
            pmaGroup.style.display = 'flex';
        } else {
            pmaGroup.style.display = 'none';
            // إعادة تعيين فلتر PMA إلى "all"
            const pmaSelect = document.getElementById('intervPmaFilter');
            if (pmaSelect) pmaSelect.value = 'all';
        }
        
        // تطبيق الفلاتر
        this.appliquerFiltres();
    },

    // ====== تطبيق الفلاتر ======
    appliquerFiltres: function() {
        const tronconSelect = document.getElementById('intervTronconFilter');
        const moisSelect = document.getElementById('intervMoisFilter');
        const type = document.getElementById('intervTypeFilter').value;
        const pma = document.getElementById('intervPmaFilter').value;
        
        // قراءة التحديدات المتعددة
        const tronconValues = Array.from(tronconSelect.selectedOptions).map(opt => opt.value);
        const moisValues = Array.from(moisSelect.selectedOptions).map(opt => opt.value);
        
        const tronconAll = tronconValues.includes('all');
        const moisAll = moisValues.includes('all');
        
        // تحديد عمود التأخير
        let cleDelai = '_delai_depannage';
        let nomColonne = 'Dépannage';
        let emoji = '🚛';
        switch(type) {
            case 'depannage': cleDelai = '_delai_depannage'; nomColonne = 'Dépannage'; emoji = '🚛'; break;
            case 'patrouilleur': cleDelai = '_delai_patrouilleur'; nomColonne = 'Patrouilleur'; emoji = '👮'; break;
            case 'gr': cleDelai = '_delai_gr'; nomColonne = 'GR'; emoji = '🚔'; break;
            case 'pc': cleDelai = '_delai_pc'; nomColonne = 'PC'; emoji = '🚑'; break;
        }
        
        // تصفية البيانات
        let donnees = toutesLesDonnees || [];
        donnees = donnees.filter(d => {
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) return false;
            if (!moisAll && !moisValues.includes(String(d['_mois']))) return false;
            return true;
        });
        
        // فلتر PMA
        if (pma !== 'all') {
            let gendarmerieData = [];
            try {
                const data = localStorage.getItem('config_gendarmerie');
                if (data) gendarmerieData = JSON.parse(data);
            } catch(e) {}
            const pmaInfo = gendarmerieData.find(p => p.nom === pma);
            if (pmaInfo) {
                const pkMin = parseInt(pmaInfo.pk_min);
                const pkMax = parseInt(pmaInfo.pk_max);
                donnees = donnees.filter(d => {
                    const pk = parseInt(d['_pk_num'] || 0);
                    return pk >= pkMin && pk <= pkMax;
                });
            }
        }
        
        this.donneesFiltrees = donnees;
        
        // تحديث العرض
        this.mettreAJourStatistiques();
        this.mettreAJourTableau();
        this.mettreAJourGraphique();
    },
    
    // ====== إعادة تعيين الفلاتر ======
    reinitialiserFiltres: function() {
        const tronconSelect = document.getElementById('intervTronconFilter');
        const moisSelect = document.getElementById('intervMoisFilter');
        const pmaSelect = document.getElementById('intervPmaFilter');
        const typeSelect = document.getElementById('intervTypeFilter');
        
        if (tronconSelect) {
            Array.from(tronconSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (moisSelect) {
            Array.from(moisSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (pmaSelect) pmaSelect.value = 'all';
        if (typeSelect) typeSelect.value = 'depannage';
        
        this.appliquerFiltres();
    },
    
    // ====== عرض الإحصائيات ======
    mettreAJourStatistiques: function() {
        const donnees = this.donneesFiltrees;
        const type = document.getElementById('intervTypeFilter').value;
        
        let cleDelai = '_delai_depannage';
        switch(type) {
            case 'depannage': cleDelai = '_delai_depannage'; break;
            case 'patrouilleur': cleDelai = '_delai_patrouilleur'; break;
            case 'gr': cleDelai = '_delai_gr'; break;
            case 'pc': cleDelai = '_delai_pc'; break;
        }
        
        const delais = donnees.map(d => d[cleDelai]).filter(d => d && d !== '--' && d !== '-');
        
        if (delais.length === 0) {
            document.getElementById('intervDelaiMin').textContent = '-';
            document.getElementById('intervDelaiMax').textContent = '-';
            document.getElementById('intervDelaiMoyen').textContent = '-';
            document.getElementById('intervDelaiCount').textContent = '0';
            return;
        }
        
        // ✅ تحويل إلى ثواني واستبعاد القيم الخيالية
        const seuilMax = 6600; // 1:50:00
        const enSecondes = delais.map(t => {
            const parts = t.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            return 0;
        }).filter(s => s > 0 && s <= seuilMax);
        
        if (enSecondes.length === 0) {
            document.getElementById('intervDelaiMin').textContent = '-';
            document.getElementById('intervDelaiMax').textContent = '-';
            document.getElementById('intervDelaiMoyen').textContent = '-';
            document.getElementById('intervDelaiCount').textContent = '0';
            return;
        }
        
        const min = Math.min(...enSecondes);
        const max = Math.max(...enSecondes);
        const moyenne = enSecondes.reduce((a,b) => a+b, 0) / enSecondes.length;
        
        document.getElementById('intervDelaiMin').textContent = formatTemps(min);
        document.getElementById('intervDelaiMax').textContent = formatTemps(max);
        document.getElementById('intervDelaiMoyen').textContent = formatTemps(moyenne);
        document.getElementById('intervDelaiCount').textContent = enSecondes.length;
    },
    
    // ====== عرض الجدول ======
    mettreAJourTableau: function() {
        const container = document.getElementById('intervenantsTable');
        if (!container) return;
        
        const donnees = this.donneesFiltrees;
        const type = document.getElementById('intervTypeFilter').value;
        
        let cleDelai = '_delai_depannage';
        let nomColonne = 'Dépannage';
        let emoji = '🚛';
        switch(type) {
            case 'depannage': cleDelai = '_delai_depannage'; nomColonne = 'Dépannage'; emoji = '🚛'; break;
            case 'patrouilleur': cleDelai = '_delai_patrouilleur'; nomColonne = 'Patrouilleur'; emoji = '👮'; break;
            case 'gr': cleDelai = '_delai_gr'; nomColonne = 'GR'; emoji = '🚔'; break;
            case 'pc': cleDelai = '_delai_pc'; nomColonne = 'PC'; emoji = '🚑'; break;
        }
        
        if (donnees.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée</h3><p>Ajustez les filtres ou chargez des fichiers</p></div>`;
            return;
        }
        
        // تجميع البيانات
        const parMoisTroncon = {};
        donnees.forEach(d => {
            const mois = d['_nom_mois'] || 'Inconnu';
            const troncon = d['_troncon'] || 'Inconnu';
            const delai = d[cleDelai];
            if (mois === 'Inconnu' || troncon === 'Inconnu' || !delai) return;
            if (!parMoisTroncon[mois]) parMoisTroncon[mois] = {};
            if (!parMoisTroncon[mois][troncon]) parMoisTroncon[mois][troncon] = [];
            parMoisTroncon[mois][troncon].push(delai);
        });
        
        // حساب المتوسطات
        const resultats = {};
        for (const [mois, troncons] of Object.entries(parMoisTroncon)) {
            resultats[mois] = {};
            for (const [troncon, delais] of Object.entries(troncons)) {
                resultats[mois][troncon] = moyenneTemps(delais);
            }
        }
        
        const ordreTroncons = ['T1', 'T2', 'T2_2', 'T3', 'T4'];
        const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                           'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        
        const moisExistants = Object.keys(resultats).filter(m => m !== 'Inconnu')
            .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
        
        if (moisExistants.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée de délais</h3><p>Pour "${nomColonne}"</p></div>`;
            return;
        }
        
        let html = `<div style="padding:10px 16px;background:#e8f4fd;border-radius:10px;margin-bottom:15px;">
            <span><strong>🛠️ Type :</strong> ${emoji} ${nomColonne}</span>
            <span style="margin-left:20px;"><strong>📊 Total :</strong> ${donnees.length} interventions</span>
        </div>`;
        html += '<table><thead><tr><th>Mois / Catégorie</th>';
        ordreTroncons.forEach(t => html += `<th>${t}</th>`);
        html += '</tr></thead><tbody>';
        
        const totalParTroncon = {};
        ordreTroncons.forEach(t => totalParTroncon[t] = []);
        
        moisExistants.forEach(mois => {
            html += `<tr><td><strong>${mois}</strong></td>`;
            ordreTroncons.forEach(t => {
                const val = resultats[mois]?.[t] || '-';
                if (val !== '-') totalParTroncon[t].push(val);
                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        
        html += `<tr class="total-row"><td><strong>Moyenne Générale</strong></td>`;
        ordreTroncons.forEach(t => {
            const moyenne = moyenneTemps(totalParTroncon[t]);
            html += `<td><strong>${moyenne || '-'}</strong></td>`;
        });
        html += '</tr></tbody></table>';
        container.innerHTML = html;
    },
    
    // ====== عرض المنحنى ======
    mettreAJourGraphique: function() {
        const ctx = document.getElementById('intervChart');
        if (!ctx) return;
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        
        const donnees = this.donneesFiltrees;
        const type = document.getElementById('intervTypeFilter').value;
        
        if (donnees.length === 0) return;
        
        // ====== 1. جمع البيانات لكل نوع ======
        const parMois = {
            patrouilleur: {},
            gr: {},
            pc: {}
        };
        
        donnees.forEach(d => {
            const mois = d['_nom_mois'] || 'Inconnu';
            if (mois === 'Inconnu') return;
            
            // Patrouilleur
            const delaiPat = d['_delai_patrouilleur'];
            if (delaiPat) {
                if (!parMois.patrouilleur[mois]) parMois.patrouilleur[mois] = [];
                parMois.patrouilleur[mois].push(delaiPat);
            }
            
            // GR
            const delaiGR = d['_delai_gr'];
            if (delaiGR) {
                if (!parMois.gr[mois]) parMois.gr[mois] = [];
                parMois.gr[mois].push(delaiGR);
            }
            
            // PC
            const delaiPC = d['_delai_pc'];
            if (delaiPC) {
                if (!parMois.pc[mois]) parMois.pc[mois] = [];
                parMois.pc[mois].push(delaiPC);
            }
        });
        
        // ====== 2. ترتيب الأشهر ======
        const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                        'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        
        // جمع جميع الأشهر الموجودة
        const moisSet = new Set();
        Object.keys(parMois.patrouilleur).forEach(m => moisSet.add(m));
        Object.keys(parMois.gr).forEach(m => moisSet.add(m));
        Object.keys(parMois.pc).forEach(m => moisSet.add(m));
        
        const moisExistants = Array.from(moisSet).filter(m => m !== 'Inconnu')
            .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
        
        if (moisExistants.length === 0) return;
        
        const labels = moisExistants;
        
        // ====== 3. حساب المتوسطات ======
        function calculerDonnees(parMoisType) {
            return moisExistants.map(m => {
                const moyenne = moyenneTemps(parMoisType[m]);
                if (!moyenne) return null;
                const parts = moyenne.split(':');
                if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
                else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                return 0;
            });
        }
        
        const dataPatrouilleur = calculerDonnees(parMois.patrouilleur);
        const dataGR = calculerDonnees(parMois.gr);
        const dataPC = calculerDonnees(parMois.pc);
        
        // ====== 4. بناء مجموعة البيانات ======
        const datasets = [];
        
        // Patrouilleur (أزرق)
        if (type === 'patrouilleur' || type === 'all') {
            datasets.push({
                label: '👮 Patrouilleur',
                data: dataPatrouilleur,
                borderColor: '#2d7db8',
                backgroundColor: 'rgba(45,125,184,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#1a5f8a',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // GR (برتقالي)
        if (type === 'gr' || type === 'all') {
            datasets.push({
                label: '🚔 GR',
                data: dataGR,
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230,126,34,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#d35400',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // PC (أخضر)
        if (type === 'pc' || type === 'all') {
            datasets.push({
                label: '🚑 PC',
                data: dataPC,
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39,174,96,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#1e8449',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // ====== 5. خط 25 دقيقة لـ Patrouilleur ======
        if (type === 'patrouilleur' || type === 'all') {
            const seuilPatrouilleur = 25 * 60;
            datasets.push({
                label: 'Seuil 25 min',
                data: Array(labels.length).fill(seuilPatrouilleur),
                borderColor: 'rgba(231, 76, 60, 0.4)',
                borderDash: [8, 8],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0
            });
        }
        
        if (datasets.length === 0) return;
        
        // ====== 6. إنشاء الرسم ======
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            filter: function(item) {
                                return !item.text.includes('Seuil');
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.label.includes('Seuil')) {
                                    return context.dataset.label + ': ' + formatTemps(context.parsed.y);
                                }
                                return context.dataset.label + ': ' + formatTemps(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatTemps(value);
                            }
                        }
                    }
                }
            }
        });
    },
};

// ============================================================
// 8. SECTION DEPANNEURS (مستقلة - متوافقة مع index.html)
// ============================================================

const Depanneurs = {
    chart: null,
    donneesFiltrees: [],
    
    // ====== تهيئة القسم ======
    init: function() {
        this.mettreAJourFiltres();
        this.appliquerFiltres();
    },
    
    // ====== تحديث قوائم الفلاتر ======
    mettreAJourFiltres: function() {
        const selectTroncon = document.getElementById('depTronconFilter');
        const selectMois = document.getElementById('depMoisFilter');
        const selectSociete = document.getElementById('depSocieteFilter');
        
        if (!selectTroncon || !selectMois || !selectSociete) return;
        
        // ---- حفظ التحديدات الحالية ----
        const selectedTroncon = Array.from(selectTroncon.selectedOptions).map(opt => opt.value);
        const selectedMois = Array.from(selectMois.selectedOptions).map(opt => opt.value);
        const selectedSociete = Array.from(selectSociete.selectedOptions).map(opt => opt.value);
        
        // ---- بناء قائمة المقاطع (مع T2_2) ----
        const troncons = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_troncon'] && d['_troncon'] !== 'Inconnu') {
                troncons.add(d['_troncon']);
            }
        });
        
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        ['T1', 'T2', 'T2_2', 'T3', 'T4'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRange(t) + ')';
            selectTroncon.appendChild(opt);
        });
        
        Array.from(selectTroncon.options).forEach(opt => {
            if (selectedTroncon.includes(opt.value)) opt.selected = true;
        });
        if (selectTroncon.selectedOptions.length === 0) {
            selectTroncon.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- بناء قائمة الأشهر ----
        const moisExistants = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        
        Array.from(selectMois.options).forEach(opt => {
            if (selectedMois.includes(opt.value)) opt.selected = true;
        });
        if (selectMois.selectedOptions.length === 0) {
            selectMois.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- بناء قائمة الشركات ----
        const societes = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_societe'] && d['_societe'] !== 'Inconnue') {
                societes.add(d['_societe']);
            }
        });
        
        selectSociete.innerHTML = '<option value="all">Toutes les sociétés</option>';
        Object.keys(SOCIETES_DEPANNAGE).filter(s => societes.has(s)).forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            selectSociete.appendChild(opt);
        });
        
        Array.from(selectSociete.options).forEach(opt => {
            if (selectedSociete.includes(opt.value)) opt.selected = true;
        });
        if (selectSociete.selectedOptions.length === 0) {
            selectSociete.querySelector('option[value="all"]').selected = true;
        }
    },
    
    // ====== تطبيق الفلاتر ======
    appliquerFiltres: function() {
        const tronconSelect = document.getElementById('depTronconFilter');
        const moisSelect = document.getElementById('depMoisFilter');
        const societeSelect = document.getElementById('depSocieteFilter');
        const typeSelect = document.getElementById('depTypeFilter');
        
        const tronconValues = Array.from(tronconSelect.selectedOptions).map(opt => opt.value);
        const moisValues = Array.from(moisSelect.selectedOptions).map(opt => opt.value);
        const societeValues = Array.from(societeSelect.selectedOptions).map(opt => opt.value);
        const typeValue = typeSelect ? typeSelect.value : 'all';
        
        const tronconAll = tronconValues.includes('all');
        const moisAll = moisValues.includes('all');
        const societeAll = societeValues.includes('all');
        
        let donnees = toutesLesDonnees || [];
        donnees = donnees.filter(d => {
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) return false;
            if (!moisAll && !moisValues.includes(String(d['_mois']))) return false;
            if (!societeAll && !societeValues.includes(d['_societe'])) return false;
            if (typeValue !== 'all' && d['_type_vehicule'] !== typeValue) return false;
            return true;
        });
        
        this.donneesFiltrees = donnees;
        
        this.mettreAJourStatistiques();
        this.mettreAJourTableau();
        this.mettreAJourGraphique();
    },
    
    // ====== إعادة تعيين الفلاتر ======
    reinitialiserFiltres: function() {
        const tronconSelect = document.getElementById('depTronconFilter');
        const moisSelect = document.getElementById('depMoisFilter');
        const societeSelect = document.getElementById('depSocieteFilter');
        const typeSelect = document.getElementById('depTypeFilter');
        
        if (tronconSelect) {
            Array.from(tronconSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (moisSelect) {
            Array.from(moisSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (societeSelect) {
            Array.from(societeSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        
        // ✅ إعادة تعيين فلتر Type Véhicule إلى "Tous"
        if (typeSelect) {
            typeSelect.value = 'all';
        }
        
        this.appliquerFiltres();
    },
        
    // ====== عرض الإحصائيات ======
    mettreAJourStatistiques: function() {
        const donnees = this.donneesFiltrees;
        const delais = donnees.map(d => d['_delai_depannage']).filter(d => d && d !== '--' && d !== '-');
        
        if (delais.length === 0) {
            document.getElementById('depDelaiMin').textContent = '-';
            document.getElementById('depDelaiMax').textContent = '-';
            document.getElementById('depDelaiMoyen').textContent = '-';
            document.getElementById('depDelaiCount').textContent = '0';
            return;
        }
        
        // ✅ استبعاد القيم الخيالية (أكبر من 4 ساعات = 14400 ثانية)
        const seuilMax = 14400; // 4 ساعات
        const enSecondes = delais.map(t => {
            const parts = t.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            return 0;
        }).filter(s => s > 0 && s <= seuilMax);
        
        if (enSecondes.length === 0) {
            document.getElementById('depDelaiMin').textContent = '-';
            document.getElementById('depDelaiMax').textContent = '-';
            document.getElementById('depDelaiMoyen').textContent = '-';
            document.getElementById('depDelaiCount').textContent = '0';
            return;
        }
        
        const min = Math.min(...enSecondes);
        const max = Math.max(...enSecondes);
        const moyenne = enSecondes.reduce((a,b) => a+b, 0) / enSecondes.length;
        
        document.getElementById('depDelaiMin').textContent = formatTemps(min);
        document.getElementById('depDelaiMax').textContent = formatTemps(max);
        document.getElementById('depDelaiMoyen').textContent = formatTemps(moyenne);
        document.getElementById('depDelaiCount').textContent = enSecondes.length;
    },
    
    // ====== عرض الجدول ======
    mettreAJourTableau: function() {
        const container = document.getElementById('depanneursTable');
        if (!container) return;
        
        const donnees = this.donneesFiltrees;
        if (donnees.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée</h3><p>Ajustez les filtres ou chargez des fichiers</p></div>`;
            return;
        }
        
        // ✅ الحصول على قيمة فلتر Type
        const typeFilter = document.getElementById('depTypeFilter')?.value || 'all';
        
        // تجميع البيانات حسب الشهر والشركة ونوع المركبة
        const parMoisSociete = {};
        donnees.forEach(d => {
            const mois = d['_nom_mois'] || 'Inconnu';
            const societe = d['_societe'] || 'Inconnue';
            const type = d['_type_vehicule'] || 'VL';
            const delai = d['_delai_depannage'];
            if (!delai || mois === 'Inconnu' || societe === 'Inconnue') return;
            
            // ✅ إذا كان هناك فلتر Type، نتجاهل البيانات التي لا تطابق
            if (typeFilter !== 'all' && type !== typeFilter) return;
            
            if (!parMoisSociete[mois]) parMoisSociete[mois] = {};
            if (!parMoisSociete[mois][societe]) parMoisSociete[mois][societe] = { PL: [], VL: [] };
            if (type === 'PL') parMoisSociete[mois][societe].PL.push(delai);
            else parMoisSociete[mois][societe].VL.push(delai);
        });
        
        // حساب المتوسطات
        const resultats = {};
        for (const [mois, societes] of Object.entries(parMoisSociete)) {
            resultats[mois] = {};
            for (const [societe, types] of Object.entries(societes)) {
                resultats[mois][societe] = {
                    PL: moyenneTempsDep(types.PL),
                    VL: moyenneTempsDep(types.VL)
                };
            }
        }
        
        // ترتيب الأشهر
        const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                        'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        const moisExistants = Object.keys(resultats).filter(m => m !== 'Inconnu')
            .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
        
        if (moisExistants.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée de délais</h3></div>`;
            return;
        }
        
        // الشركات
        const societesListe = Object.keys(SOCIETES_DEPANNAGE).filter(s => {
            return Object.values(resultats).some(m => m[s]);
        });
        
        // ✅ تحديد الأعمدة التي ستظهر بناءً على فلتر Type
        const showPL = (typeFilter === 'all' || typeFilter === 'PL');
        const showVL = (typeFilter === 'all' || typeFilter === 'VL');
        
        let html = '<table><thead><tr><th>Mois / Catégorie</th>';
        societesListe.forEach(s => {
            html += `<th colspan="${(showPL ? 1 : 0) + (showVL ? 1 : 0)}">${s}</th>`;
        });
        html += '</tr><tr><th></th>';
        societesListe.forEach(() => {
            if (showPL) html += '<th>PL</th>';
            if (showVL) html += '<th>VL</th>';
        });
        html += '</tr></thead><tbody>';
        
        const totalParSociete = {};
        societesListe.forEach(s => totalParSociete[s] = { PL: [], VL: [] });
        
        moisExistants.forEach(mois => {
            html += `<tr><td><strong>${mois}</strong></td>`;
            societesListe.forEach(s => {
                const d = resultats[mois]?.[s];
                if (showPL) {
                    const pl = d?.PL || '-';
                    if (pl !== '-') totalParSociete[s].PL.push(pl);
                    html += `<td>${pl}</td>`;
                }
                if (showVL) {
                    const vl = d?.VL || '-';
                    if (vl !== '-') totalParSociete[s].VL.push(vl);
                    html += `<td>${vl}</td>`;
                }
            });
            html += '</tr>';
        });
        
        html += `<tr class="total-row"><td><strong>Moyenne Générale</strong></td>`;
        societesListe.forEach(s => {
            if (showPL) {
                const pl = moyenneTempsDep(totalParSociete[s].PL);
                html += `<td><strong>${pl || '-'}</strong></td>`;
            }
            if (showVL) {
                const vl = moyenneTempsDep(totalParSociete[s].VL);
                html += `<td><strong>${vl || '-'}</strong></td>`;
            }
        });
        html += '</tr></tbody></table>';
        
        container.innerHTML = html;
    },
    
    // ====== عرض المنحنى ======
    mettreAJourGraphique: function() {
        const ctx = document.getElementById('depChart');
        if (!ctx) return;
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        
        const donnees = this.donneesFiltrees;
        if (donnees.length === 0) return;
        
        const typeFilter = document.getElementById('depTypeFilter')?.value || 'all';
        
        // تجميع البيانات حسب الشهر لكل نوع
        const parMoisPL = {};
        const parMoisVL = {};
        
        donnees.forEach(d => {
            const mois = d['_nom_mois'] || 'Inconnu';
            const type = d['_type_vehicule'] || 'VL';
            const delai = d['_delai_depannage'];
            if (!delai || mois === 'Inconnu') return;
            
            if (type === 'PL') {
                if (!parMoisPL[mois]) parMoisPL[mois] = [];
                parMoisPL[mois].push(delai);
            } else {
                if (!parMoisVL[mois]) parMoisVL[mois] = [];
                parMoisVL[mois].push(delai);
            }
        });
        
        const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                        'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        
        const moisSet = new Set();
        Object.keys(parMoisPL).forEach(m => moisSet.add(m));
        Object.keys(parMoisVL).forEach(m => moisSet.add(m));
        
        const moisExistants = Array.from(moisSet).filter(m => m !== 'Inconnu')
            .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
        
        if (moisExistants.length === 0) return;
        
        const labels = moisExistants;
        
        const dataPL = moisExistants.map(m => {
            const moyenne = moyenneTempsDep(parMoisPL[m]);
            if (!moyenne) return null;
            const parts = moyenne.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            return 0;
        });
        
        const dataVL = moisExistants.map(m => {
            const moyenne = moyenneTempsDep(parMoisVL[m]);
            if (!moyenne) return null;
            const parts = moyenne.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            return 0;
        });
        
        // ✅ تحويل 30 دقيقة و 45 دقيقة إلى ثواني
        const seuilVL = 30 * 60;   // 1800 ثانية
        const seuilPL = 45 * 60;   // 2700 ثانية
        
        // بناء مجموعة البيانات
        const datasets = [];
        
        if (typeFilter === 'all' || typeFilter === 'PL') {
            datasets.push({
                label: 'PL',
                data: dataPL,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#e74c3c',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        if (typeFilter === 'all' || typeFilter === 'VL') {
            datasets.push({
                label: 'VL',
                data: dataVL,
                borderColor: '#2d7db8',
                backgroundColor: 'rgba(45, 125, 184, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#2d7db8',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // ✅ إضافة الخطوط الأفقية (كـ dataset منفصلة)
        // خط 45 دقيقة لـ PL (أحمر فاتح، متقطع)
        if (typeFilter === 'all' || typeFilter === 'PL') {
            datasets.push({
                label: 'Seuil PL (45 min)',
                data: Array(labels.length).fill(seuilPL),
                borderColor: 'rgba(231, 76, 60, 0.4)',
                borderDash: [8, 8],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0
            });
        }
        
        // خط 30 دقيقة لـ VL (أزرق فاتح، متقطع)
        if (typeFilter === 'all' || typeFilter === 'VL') {
            datasets.push({
                label: 'Seuil VL (30 min)',
                data: Array(labels.length).fill(seuilVL),
                borderColor: 'rgba(45, 125, 184, 0.4)',
                borderDash: [8, 8],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0
            });
        }
        
        if (datasets.length === 0) return;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            // ✅ إخفاء تسميات الخطوط الأفقية من الأسطورة
                            filter: function(item) {
                                return !item.text.includes('Seuil');
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.label.includes('Seuil')) {
                                    return context.dataset.label + ': ' + formatTemps(context.parsed.y);
                                }
                                return context.dataset.label + ': ' + formatTemps(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatTemps(value);
                            }
                        }
                    }
                }
            }
        });
    },
};

// ============================================================
// SECTION GRAPHIQUES (DASHBOARD)
// ============================================================

const Graphiques = {
    chartMensuel: null,
    chartJournalier: null,
    chartPeriode: null,
    chartCause: null,
    chartGravite: null,
    chartVictimes: null,
    
    // ====== تهيئة الفلاتر ======
    mettreAJourFiltres: function() {
        const selectTroncon = document.getElementById('graphTronconFilter');
        const selectMois = document.getElementById('graphMoisFilter');
        
        if (!selectTroncon || !selectMois) return;
        
        // ---- Tronçons (avec T2_2) ----
        const troncons = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_troncon'] && d['_troncon'] !== 'Inconnu') {
                troncons.add(d['_troncon']);
            }
        });
        
        const valTroncon = selectTroncon.value;
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        ['T1', 'T2', 'T2_2', 'T3', 'T4'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRange(t) + ')';
            selectTroncon.appendChild(opt);
        });
        if (troncons.has(valTroncon)) selectTroncon.value = valTroncon;
        else selectTroncon.value = 'all';
        
        // ---- Mois ----
        const moisExistants = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        const valMois = selectMois.value;
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        if (moisExistants.has(parseInt(valMois))) selectMois.value = valMois;
        else selectMois.value = 'all';
    },
    
    // ====== تطبيق الفلاتر ======
    appliquerFiltres: function() {
        const troncon = document.getElementById('graphTronconFilter').value;
        const mois = document.getElementById('graphMoisFilter').value;
        
        // تصفية البيانات
        let donnees = toutesLesDonnees.filter(d => {
            if (troncon !== 'all' && d['_troncon'] !== troncon) return false;
            if (mois !== 'all' && d['_mois'] !== parseInt(mois)) return false;
            return true;
        });
        
        // Mettre à jour KPI
        this.mettreAJourKPI(donnees);
        
        // Mettre à jour les graphiques
        this.mettreAJourGraphiqueMensuel(donnees);
        this.mettreAJourGraphiqueJournalier(donnees);
        this.mettreAJourGraphiquePeriode(donnees);
        this.mettreAJourGraphiqueCause(donnees);
        this.mettreAJourGraphiqueGravite(donnees);
        this.mettreAJourGraphiqueVictimes(donnees);
    },
    
    // ====== Réinitialiser ======
    reinitialiserFiltres: function() {
        document.getElementById('graphTronconFilter').value = 'all';
        document.getElementById('graphMoisFilter').value = 'all';
        document.getElementById('graphSemaineFilter').innerHTML = '<option value="all">Toutes les semaines</option>';
        document.getElementById('graphJourFiltre').value = 'all';
        document.getElementById('graphHeureFiltre').value = 'all';
        document.getElementById('graphCauseType').value = 'principale';
        this.appliquerFiltres();
    },
    
    // ====== KPI ======
    mettreAJourKPI: function(donnees) {
        // Total Accidents
        document.getElementById('kpiTotal').textContent = donnees.length;
        
        // Moyenne par jour
        const jours = new Set();
        donnees.forEach(d => {
            const date = d['Date et heure accident'];
            if (date) {
                try {
                    const jour = new Date(date).toLocaleDateString();
                    jours.add(jour);
                } catch(e) {}
            }
        });
        // ✅ حساب متوسط على أساس عدد الأيام الفعلية
        const nbJoursReels = getDaysInRange(donnees);
        document.getElementById('kpiMoyenne').textContent = (donnees.length / nbJoursReels).toFixed(1) + '/jour';
        // Jour le plus dangereux
        // Jour le plus dangereux (avec conversion correcte)
        const parJour = {};
        donnees.forEach(d => {
            const date = d['Date prise en charge'];
            if (!date) return;
            
            try {
                let dateObj;
                if (typeof date === 'number') {
                    // Convertir le nombre Excel en Date
                    dateObj = new Date((date - 25569) * 86400 * 1000);
                } else {
                    dateObj = new Date(date);
                }
                
                if (!isNaN(dateObj)) {
                    const jour = dateObj.toLocaleDateString('fr-FR');
                    parJour[jour] = (parJour[jour] || 0) + 1;
                }
            } catch(e) {}
        });

        let maxJour = '-', maxCount = 0;
        for (const [j, c] of Object.entries(parJour)) {
            if (c > maxCount) { maxCount = c; maxJour = j; }
        }
        document.getElementById('kpiJourDangereux').textContent = maxJour + ' (' + maxCount + ')';
        // Mois le plus dangereux (seulement par mois, pas par tronçon)
        const parMois = {};
        donnees.forEach(d => {
            const date = d['Date prise en charge'];
            if (!date) return;
            
            try {
                let dateObj;
                if (typeof date === 'number') {
                    dateObj = new Date((date - 25569) * 86400 * 1000);
                } else {
                    dateObj = new Date(date);
                }
                
                if (!isNaN(dateObj)) {
                    const mois = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                    parMois[mois] = (parMois[mois] || 0) + 1;
                }
            } catch(e) {}
        });

        let maxMois = '-', maxMoisCount = 0;
        for (const [m, c] of Object.entries(parMois)) {
            if (c > maxMoisCount) { maxMoisCount = c; maxMois = m; }
        }
        document.getElementById('kpiMoisDangereux').textContent = maxMois + ' (' + maxMoisCount + ')';
        // Cause principale
        const causes = {};
        donnees.forEach(d => {
            const c = d['Cause principale'] || 'Non spécifiée';
            causes[c] = (causes[c] || 0) + 1;
        });
        let maxCause = '-', maxCauseCount = 0;
        for (const [c, cnt] of Object.entries(causes)) {
            if (cnt > maxCauseCount) { maxCauseCount = cnt; maxCause = c; }
        }
        document.getElementById('kpiCause').textContent = maxCause + ' (' + maxCauseCount + ')';
        
        // Tronçon le plus dangereux (seulement par mois, pas par tronçon)
        const troncons = {};
        donnees.forEach(d => {
            const t = d['_troncon'] || 'Inconnu';
            troncons[t] = (troncons[t] || 0) + 1;
        });
        let maxTroncon = '-', maxTronconCount = 0;
        for (const [t, c] of Object.entries(troncons)) {
            if (c > maxTronconCount) { maxTronconCount = c; maxTroncon = t; }
        }
        document.getElementById('kpiTroncon').textContent = maxTroncon + ' (' + maxTronconCount + ')';
    },
    
    // ====== 1. Graphique: Évolution mensuelle (colonnes) ======
    mettreAJourGraphiqueMensuel: function(donnees) {
        const ctx = document.getElementById('graphChartMensuel');
        if (!ctx) return;
        if (this.chartMensuel) { this.chartMensuel.destroy(); this.chartMensuel = null; }
        
        const semaineFiltre = document.getElementById('graphSemaineFilter').value;
        const moisFiltre = document.getElementById('graphMoisFilter').value;
        
        console.log('📊 Données pour le graphique:', donnees.length);
        
        // ====== Fonction pour extraire la semaine (modifiée) ======
        function getWeekNumber(valeur) {
            if (!valeur && valeur !== 0) return null;
            
            let dateObj = null;
            
            // 1. Si c'est un nombre (Excel serial number)
            if (typeof valeur === 'number') {
                dateObj = new Date((valeur - 25569) * 86400 * 1000);
                if (!isNaN(dateObj)) {
                    const annee = dateObj.getFullYear();
                    const debutAnnee = new Date(annee, 0, 1);
                    const diff = (dateObj - debutAnnee) / 86400000;
                    const semaine = Math.ceil((diff + debutAnnee.getDay() + 1) / 7);
                    return semaine;
                }
            }
            
            // 2. Si c'est une chaîne de caractères
            if (typeof valeur === 'string') {
                let texte = valeur.trim();
                let match = texte.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                if (match) {
                    const jour = parseInt(match[1]);
                    const mois = parseInt(match[2]) - 1;
                    const annee = parseInt(match[3]);
                    dateObj = new Date(annee, mois, jour);
                    if (!isNaN(dateObj)) {
                        const debutAnnee = new Date(annee, 0, 1);
                        const diff = (dateObj - debutAnnee) / 86400000;
                        const semaine = Math.ceil((diff + debutAnnee.getDay() + 1) / 7);
                        return semaine;
                    }
                }
            }
            
            return null;
        }
        
        // ====== Compter les accidents par semaine ======
        const parSemaine = {};
        let compteurDates = 0;
        
        donnees.forEach(d => {
            const dateVal = d['Date prise en charge'] || d['Date et heure accident'];
            if (!dateVal && dateVal !== 0) return;
            
            const semaine = getWeekNumber(dateVal);
            if (semaine === null) return;
            
            compteurDates++;
            
            // الحصول على الشهر من التاريخ
            let mois = 0;
            if (typeof dateVal === 'number') {
                const dateObj = new Date((dateVal - 25569) * 86400 * 1000);
                if (!isNaN(dateObj)) mois = dateObj.getMonth() + 1;
            } else if (typeof dateVal === 'string') {
                const parts = dateVal.split('/');
                if (parts.length === 3) mois = parseInt(parts[1]);
            }
            
            const key = 'S' + semaine;
            if (!parSemaine[key]) {
                parSemaine[key] = { total: 0, mois: mois };
            }
            parSemaine[key].total++;
        });
        
        console.log('📊 Dates valides:', compteurDates);
        console.log('📊 Semaines trouvées:', Object.keys(parSemaine));
        
        // ====== Filtrer par mois ======
        let labels = Object.keys(parSemaine).sort((a, b) => {
            return parseInt(a.replace('S', '')) - parseInt(b.replace('S', ''));
        });
        
        if (moisFiltre !== 'all') {
            const moisNum = parseInt(moisFiltre);
            labels = labels.filter(label => parSemaine[label].mois === moisNum);
        }
        
        let data = labels.map(label => parSemaine[label].total);
        
        console.log('📊 Labels après filtrage:', labels);
        console.log('📊 Data:', data);
        
        // ====== Mettre à jour le select des semaines ======
        const selectSemaine = document.getElementById('graphSemaineFilter');
        if (selectSemaine) {
            const valActuelle = selectSemaine.value;
            selectSemaine.innerHTML = '<option value="all">Toutes les semaines</option>';
            labels.forEach((label, index) => {
                const opt = document.createElement('option');
                opt.value = label.replace('S', '');
                opt.textContent = label + ' (' + data[index] + ' accidents)';
                selectSemaine.appendChild(opt);
            });
            if (labels.some(l => l.replace('S', '') === valActuelle)) {
                selectSemaine.value = valActuelle;
            }
        }
        
        // ====== Filtrer par semaine ======
        if (semaineFiltre !== 'all' && labels.length > 0) {
            const idx = parseInt(semaineFiltre) - 1;
            if (idx >= 0 && idx < labels.length) {
                labels = [labels[idx]];
                data = [data[idx]];
            }
        }
        
        // ====== Créer le graphique ======
        if (labels.length === 0 || data.every(d => d === 0)) {
            this.chartMensuel = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Aucune donnée'],
                    datasets: [{ label: "Accidents", data: [0], backgroundColor: '#e8ecf2' }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
            return;
        }
        
        this.chartMensuel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Nombre d'accidents",
                    data: data,
                    backgroundColor: '#2d7db8',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    },
        
    // ====== 2. Graphique: Évolution journalière (colonnes) ======
    mettreAJourGraphiqueJournalier: function(donnees) {
        const ctx = document.getElementById('graphChartJournalier');
        if (!ctx) return;
        if (this.chartJournalier) { this.chartJournalier.destroy(); this.chartJournalier = null; }
        
        const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const data = jours.map(j => {
            return donnees.filter(d => d['_jour_semaine'] === j).length;
        });
        
        const jourFiltre = document.getElementById('graphJourFiltre').value;
        let labels = jours;
        let dataAff = data;
        if (jourFiltre !== 'all') {
            const idx = jours.indexOf(jourFiltre);
            if (idx !== -1) {
                labels = [jours[idx]];
                dataAff = [data[idx]];
            }
        }
        
        this.chartJournalier = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Nombre d'accidents",
                    data: dataAff,
                    backgroundColor: '#27ae60',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    },
    
    // ====== 3. Graphique: Évolution par période (colonnes) ======
    mettreAJourGraphiquePeriode: function(donnees) {
        const ctx = document.getElementById('graphChartPeriode');
        if (!ctx) return;
        if (this.chartPeriode) { this.chartPeriode.destroy(); this.chartPeriode = null; }
        
        const heures = Array.from({length: 24}, (_, i) => i);
        const data = heures.map(h => {
            return donnees.filter(d => {
                const heure = d['_heure_accident'];
                if (!heure) return false;
                const hh = parseInt(heure.split(':')[0]);
                return hh === h;
            }).length;
        });
        
        const heureFiltre = document.getElementById('graphHeureFiltre').value;
        let labels = heures.map(h => String(h).padStart(2, '0') + ':00');
        let dataAff = data;
        if (heureFiltre !== 'all') {
            const idx = parseInt(heureFiltre);
            labels = [String(idx).padStart(2, '0') + ':00'];
            dataAff = [data[idx]];
        }
        
        this.chartPeriode = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Nombre d'accidents",
                    data: dataAff,
                    backgroundColor: '#e67e22',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    },
    
    // ====== 4. Graphique: Répartition par Cause (doughnut) ======
    mettreAJourGraphiqueCause: function(donnees) {
        const ctx = document.getElementById('graphChartCause');
        if (!ctx) return;
        if (this.chartCause) { this.chartCause.destroy(); this.chartCause = null; }
        
        const type = document.getElementById('graphCauseType').value;
        const col = type === 'principale' ? 'Cause principale' : 'Cause secondaire';
        
        const causes = {};
        donnees.forEach(d => {
            const c = d[col] || 'Non spécifiée';
            causes[c] = (causes[c] || 0) + 1;
        });
        
        const trie = Object.entries(causes).sort((a,b) => b[1]-a[1]).slice(0, 8);
        const labels = trie.map(t => t[0]);
        const data = trie.map(t => t[1]);
        const couleurs = ['#2d7db8', '#4a90c4', '#6ba3d4', '#8bb6e0', '#abc9ec', '#c4dbf5', '#dce9f9', '#eef4fc'];
        
        this.chartCause = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: couleurs.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a,b) => a+b, 0);
                                const p = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.parsed + ' (' + p + '%)';
                            }
                        }
                    }
                }
            }
        });
    },
    
    // ====== 5. Graphique: Répartition par Gravité (doughnut) ======
    mettreAJourGraphiqueGravite: function(donnees) {
        const ctx = document.getElementById('graphChartGravite');
        if (!ctx) return;
        if (this.chartGravite) { this.chartGravite.destroy(); this.chartGravite = null; }
        
        const gravites = ['Corporelle', 'Matérielle', 'Mortelle'];
        const data = gravites.map(g => donnees.filter(d => d['Gravité accident'] === g).length);
        const couleurs = ['#e67e22', '#3498db', '#e74c3c'];
        
        this.chartGravite = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: gravites,
                datasets: [{
                    data: data,
                    backgroundColor: couleurs,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a,b) => a+b, 0);
                                const p = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.parsed + ' (' + p + '%)';
                            }
                        }
                    }
                }
            }
        });
    },
    
    // ====== 6. Graphique: Répartition des Victimes (doughnut) ======
    mettreAJourGraphiqueVictimes: function(donnees) {
        const ctx = document.getElementById('graphChartVictimes');
        if (!ctx) return;
        if (this.chartVictimes) { this.chartVictimes.destroy(); this.chartVictimes = null; }
        
        let totalTues = 0, totalBG = 0, totalBL = 0;
        donnees.forEach(d => {
            totalTues += parseInt(d['_total_tues'] || 0);
            totalBG += parseInt(d['_total_bg'] || 0);
            totalBL += parseInt(d['_total_bl'] || 0);
        });
        
        const labels = ['Tués', 'BG', 'BL'];
        const data = [totalTues, totalBG, totalBL];
        const couleurs = ['#c0392b', '#e67e22', '#2ecc71'];
        
        this.chartVictimes = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: couleurs,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a,b) => a+b, 0);
                                const p = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.parsed + ' (' + p + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
};
// ============================================================
// 10. SECTION PARAMÈTRES
// ============================================================

const Parametres = {
    directions: ['DRRS', 'DRRC', 'DRRN', 'DRRO'],
    
    // ====== 1. CHARGER LES DONNÉES PAR DÉFAUT ======
    getDefaultData: function() {
        return {
            troncons: [
                { id: 'T1', direction: 'DRRS', axe: 'A3', pk_min: 27000, pk_max: 106000 },
                { id: 'T2', direction: 'DRRS', axe: 'A3', pk_min: 106000, pk_max: 198000 },
                { id: 'T2_2', direction: 'DRRS', axe: 'A301', pk_min: 0, pk_max: 13000 },
                { id: 'T3', direction: 'DRRS', axe: 'A3', pk_min: 198000, pk_max: 282000 },
                { id: 'T4', direction: 'DRRS', axe: 'A3', pk_min: 282000, pk_max: 430000 }
            ],
            societes: [
                { nom: 'TransAlmahata 1', direction: 'DRRS', axe: 'A3', pk_min: 27000, pk_max: 65000 },
                { nom: 'TransAlmahata 2', direction: 'DRRS', axe: 'A3', pk_min: 65000, pk_max: 127000 },
                { nom: 'Ezziraoui', direction: 'DRRS', axe: 'A3', pk_min: 127000, pk_max: 160000 },
                { nom: 'INT Assistance', direction: 'DRRS', axe: 'A3', pk_min: 160000, pk_max: 249000 },
                { nom: 'INT Assistance', direction: 'DRRS', axe: 'A301', pk_min: 0, pk_max: 13000 },
                { nom: 'Routier Multi Service et INT Assistance', direction: 'DRRS', axe: 'A3', pk_min: 249000, pk_max: 310000 },
                { nom: 'Grand Sud', direction: 'DRRS', axe: 'A3', pk_min: 310000, pk_max: 430000 }
            ],
            gendarmerie: [
                { nom: 'PMA Settat', direction: 'DRRS', axe: 'A3', pk_min: 27000, pk_max: 106000 },
                { nom: 'PMA Skhour', direction: 'DRRS', axe: 'A3', pk_min: 106000, pk_max: 140000 },
                { nom: 'PMA Bengurir', direction: 'DRRS', axe: 'A3', pk_min: 140000, pk_max: 187000 },
                { nom: 'PMA Palmeraie', direction: 'DRRS', axe: 'A3', pk_min: 187000, pk_max: 198000 },
                { nom: 'PMA Palmeraie', direction: 'DRRS', axe: 'A301', pk_min: 0, pk_max: 13000 },
                { nom: 'PMA Targa', direction: 'DRRS', axe: 'A3', pk_min: 198000, pk_max: 246500 },
                { nom: 'PMA Chihcaoua', direction: 'DRRS', axe: 'A3', pk_min: 246500, pk_max: 290000 },
                { nom: 'PMA Imintanout', direction: 'DRRS', axe: 'A3', pk_min: 290000, pk_max: 380000 },
                { nom: 'PMA Amskroud', direction: 'DRRS', axe: 'A3', pk_min: 380000, pk_max: 430000 }
            ]
        };
    },
    
    // ====== 2. LIRE LES DONNÉES DEPUIS localStorage ======
    chargerDonnees: function(type) {
        const key = 'config_' + type;
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch(e) {}
        return this.getDefaultData()[type] || [];
    },
    
    // ====== 3. SAUVEGARDER DANS localStorage ======
    sauvegarderDonnees: function(type, data) {
        const key = 'config_' + type;
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log('💾 Config sauvegardée:', type, data.length, 'éléments');
            return true;
        } catch(e) {
            console.warn('❌ Erreur sauvegarde config:', e);
            return false;
        }
    },
    
    // ====== 4. AFFICHER LES DIRECTIONS ======
    afficherDirections: function() {
        const container = document.getElementById('directionsList');
        if (!container) return;
        
        const directions = this.chargerDonnees('directions') || ['DRRS'];
        const troncons = this.chargerDonnees('troncons');
        
        const currentDirection = toutesLesDonnees[0]?.['_direction'] || 'DRRS';
        
        container.innerHTML = directions.map(d => {
            const hasData = troncons.some(t => t.direction === d);
            const isActive = (d === currentDirection);
            const isEmpty = !hasData;
            
            let style = 'padding:8px 16px; border-radius:20px; font-size:14px; font-weight:600; display:inline-flex; align-items:center; gap:10px; cursor:pointer;';
            
            if (isActive && !isEmpty) {
                style += 'background:#27ae60; color:white;'; // أخضر (الحالية)
            } else if (isActive && isEmpty) {
                style += 'background:#f39c12; color:white;'; // برتقالي (حالية لكن بدون بيانات)
            } else if (!isEmpty) {
                style += 'background:#2d7db8; color:white;'; // أزرق (متاحة)
            } else {
                style += 'background:#95a5a6; color:white; opacity:0.6;'; // رمادي (فارغة)
            }
            
            return `<span class="axe-tag" style="${style}" onclick="Parametres.gererClicDirection('${d}')">
                    ${d}
                    ${isActive ? ' 🔵' : ''}
                    ${isEmpty ? ' ⚠️' : ''}
                    <button onclick="event.stopPropagation(); Parametres.supprimerDirection('${d}')" 
                            style="background:transparent; border:none; color:white; cursor:pointer; font-size:16px; margin-left:5px;">✕</button>
                </span>`;
        }).join('');
    },
    // ====== 5. AJOUTER UNE DIRECTION ======
    ajouterDirection: function() {
        const nom = prompt('Entrez le nom de la nouvelle Direction (ex: DRRS, DRRC, DRRN, DRRO):');
        if (!nom || nom.trim() === '') return;
        const nomTrim = nom.trim().toUpperCase();
        
        let directions = this.chargerDonnees('directions') || ['DRRS'];
        if (directions.includes(nomTrim)) {
            alert('Cette Direction existe déjà!');
            return;
        }
        directions.push(nomTrim);
        this.sauvegarderDonnees('directions', directions);
        this.afficherDirections();
    },
    
    // ====== 6. SUPPRIMER UNE DIRECTION ======
    supprimerDirection: function(nom) {
        if (!confirm(`Voulez-vous vraiment supprimer la Direction "${nom}" ?`)) return;
        let directions = this.chargerDonnees('directions') || ['DRRS'];
        directions = directions.filter(d => d !== nom);
        if (directions.length === 0) directions = ['DRRS'];
        this.sauvegarderDonnees('directions', directions);
        this.afficherDirections();
    },
    
    // ====== 7. AFFICHER LES TRONÇONS ======
    afficherTroncons: function() {
        const data = this.chargerDonnees('troncons');
        const directions = this.chargerDonnees('directions') || ['DRRS'];
        const tbody = document.getElementById('tronconsBody');
        if (!tbody) return;
        
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.id}" data-index="${index}" data-field="id" class="editable" style="width:70px;"></td>
                <td>
                    <select data-index="${index}" data-field="direction" class="editable" style="width:100px;">
                        ${directions.map(d => `<option value="${d}" ${d === item.direction ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </td>
                <td><input type="text" value="${item.axe}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('troncons', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },
    
    // ====== 8. AFFICHER LES SOCIÉTÉS ======
    afficherSocietes: function() {
        const data = this.chargerDonnees('societes');
        const directions = this.chargerDonnees('directions') || ['DRRS'];
        const tbody = document.getElementById('societesBody');
        if (!tbody) return;
        
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.nom}" data-index="${index}" data-field="nom" class="editable" style="width:150px;"></td>
                <td>
                    <select data-index="${index}" data-field="direction" class="editable" style="width:100px;">
                        ${directions.map(d => `<option value="${d}" ${d === item.direction ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </td>
                <td><input type="text" value="${item.axe}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('societes', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },
    
    // ====== 9. AFFICHER LA GENDARMERIE ======
    afficherGendarmerie: function() {
        const data = this.chargerDonnees('gendarmerie');
        const directions = this.chargerDonnees('directions') || ['DRRS'];
        const tbody = document.getElementById('gendarmerieBody');
        if (!tbody) return;
        
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.nom}" data-index="${index}" data-field="nom" class="editable" style="width:130px;"></td>
                <td>
                    <select data-index="${index}" data-field="direction" class="editable" style="width:100px;">
                        ${directions.map(d => `<option value="${d}" ${d === item.direction ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </td>
                <td><input type="text" value="${item.axe}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('gendarmerie', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },
    
    // ====== 10. AJOUTER DES LIGNES ======
    ajouterTroncon: function() {
        const data = this.chargerDonnees('troncons');
        const directions = this.chargerDonnees('directions') || ['DRRS'];
        const newId = 'T' + (data.length + 1);
        data.push({ id: newId, direction: directions[0] || 'DRRS', axe: 'A3', pk_min: 0, pk_max: 0 });
        this.sauvegarderDonnees('troncons', data);
        this.afficherTroncons();
    },
    
    ajouterSociete: function() {
        const data = this.chargerDonnees('societes');
        const directions = this.chargerDonnees('directions') || ['DRRS'];
        data.push({ nom: 'Nouvelle Société', direction: directions[0] || 'DRRS', axe: 'A3', pk_min: 0, pk_max: 0 });
        this.sauvegarderDonnees('societes', data);
        this.afficherSocietes();
    },
    
    ajouterGendarmerie: function() {
        const data = this.chargerDonnees('gendarmerie');
        const directions = this.chargerDonnees('directions') || ['DRRS'];
        data.push({ nom: 'Nouvelle PMA', direction: directions[0] || 'DRRS', axe: 'A3', pk_min: 0, pk_max: 0 });
        this.sauvegarderDonnees('gendarmerie', data);
        this.afficherGendarmerie();
    },
    
    // ====== 11. SUPPRIMER UNE LIGNE ======
    supprimerLigne: function(type, index) {
        if (!confirm('Voulez-vous vraiment supprimer cette ligne ?')) return;
        const data = this.chargerDonnees(type);
        data.splice(index, 1);
        this.sauvegarderDonnees(type, data);
        switch(type) {
            case 'troncons': this.afficherTroncons(); break;
            case 'societes': this.afficherSocietes(); break;
            case 'gendarmerie': this.afficherGendarmerie(); break;
        }
    },
    
    // ====== 12. SAUVEGARDER LES MODIFICATIONS ======
    sauvegarderTroncons: function() {
        const inputs = document.querySelectorAll('#tronconsBody .editable');
        const data = this.chargerDonnees('troncons');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) {
                data[index][field] = input.value;
            }
        });
        this.sauvegarderDonnees('troncons', data);
        alert('✅ Tronçons sauvegardés!');
        this.mettreAJourConstantes();
    },
    
    sauvegarderSocietes: function() {
        const inputs = document.querySelectorAll('#societesBody .editable');
        const data = this.chargerDonnees('societes');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) {
                data[index][field] = input.value;
            }
        });
        this.sauvegarderDonnees('societes', data);
        alert('✅ Sociétés sauvegardées!');
        this.mettreAJourConstantes();
    },
    
    sauvegarderGendarmerie: function() {
        const inputs = document.querySelectorAll('#gendarmerieBody .editable');
        const data = this.chargerDonnees('gendarmerie');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) {
                data[index][field] = input.value;
            }
        });
        this.sauvegarderDonnees('gendarmerie', data);
        alert('✅ Gendarmerie sauvegardée!');
        this.mettreAJourConstantes();
    },
    
    // ====== 13. METTRE À JOUR LES CONSTANTES ======
    mettreAJourConstantes: function() {
        console.log('🔄 Mise à jour des constantes...');
        
        // Recharger les configurations
        const troncons = this.chargerDonnees('troncons');
        const societes = this.chargerDonnees('societes');
        const gendarmerie = this.chargerDonnees('gendarmerie');
        const directions = this.chargerDonnees('directions') || ['DRRS'];
        
        // Mettre à jour TRONCONS global
        window.TRONCONS = {};
        troncons.forEach(t => {
            window.TRONCONS[t.id] = {
                min: parseInt(t.pk_min),
                max: parseInt(t.pk_max),
                label: `PK ${t.pk_min} - PK ${t.pk_max}`,
                axe: t.axe,
                direction: t.direction
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
                direction: s.direction,
                nom: s.nom
            };
        });
        
        // Mettre à jour GENDARMERIE global
        window.GENDARMERIE = gendarmerie.map(g => ({
            nom: g.nom,
            direction: g.direction,
            axe: g.axe,
            min: parseInt(g.pk_min),
            max: parseInt(g.pk_max)
        }));
        
        // Mettre à jour DIRECTIONS global
        window.DIRECTIONS = directions;
        
        console.log('✅ Constantes mises à jour!');
        console.log('📊 Directions:', directions);
        console.log('📊 Tronçons:', Object.keys(window.TRONCONS));
        
        // Rafraîchir les données si elles existent
        if (toutesLesDonnees && toutesLesDonnees.length > 0) {
            toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
            sauvegarderDonnees(toutesLesDonnees);
            
            // Mettre à jour tous les affichages
            if (typeof Analyse !== 'undefined' && Analyse.appliquerFiltres) Analyse.appliquerFiltres();
            if (typeof Intervenants !== 'undefined' && Intervenants.appliquerFiltres) Intervenants.appliquerFiltres();
            if (typeof Depanneurs !== 'undefined' && Depanneurs.appliquerFiltres) Depanneurs.appliquerFiltres();
            if (typeof Graphiques !== 'undefined' && Graphiques.appliquerFiltres) Graphiques.appliquerFiltres();
        }
    },
    
    // ====== 14. INITIALISATION ======
    init: function() {
        console.log('⚙️ Initialisation des paramètres...');
        
        // Créer les données par défaut si elles n'existent pas
        const types = ['troncons', 'societes', 'gendarmerie', 'directions'];
        types.forEach(type => {
            const key = 'config_' + type;
            if (!localStorage.getItem(key)) {
                const defaultData = this.getDefaultData()[type] || [];
                this.sauvegarderDonnees(type, defaultData);
            }
        });
        
        // Afficher les données
        this.afficherDirections();
        this.afficherTroncons();
        this.afficherSocietes();
        this.afficherGendarmerie();
        
        // Mettre à jour les constantes
        this.mettreAJourConstantes();
    },
        // ====== ✅ أضف هذه الدالة هنا ======
    gererClicDirection: function(direction) {
        console.log('📍 Clic sur Direction:', direction);
        
        // 1. التحقق من وجود إعدادات للجهة
        const troncons = this.chargerDonnees('troncons');
        const hasData = troncons.some(t => t.direction === direction);
        
        // 2. إذا كانت الجهة الحالية (DRRS)
        if (direction === 'DRRS') {
            alert(`✅ Vous êtes déjà sur la Direction "${direction}".\n📊 ${toutesLesDonnees.length} accidents chargés.\n\n⚙️ Pour modifier les paramètres, allez dans l'onglet "Paramètres".`);
            changerPage('analyse');
            return;
        }
        
        // 3. إذا كانت الجهة جديدة (DRRC, DRRN, DRRO)
        if (!hasData) {
            const reponse = confirm(`⚠️ La Direction "${direction}" n'a pas encore de configuration.\n\nVoulez-vous créer une nouvelle configuration pour "${direction}" ?`);
            if (!reponse) return;
            
            // ✅ Créer une configuration vierge pour cette direction
            this.creerConfigurationVierge(direction);
            
            // ✅ Aller à la page Paramètres avec la nouvelle direction sélectionnée
            sessionStorage.setItem('edit_direction', direction);
            changerPage('parametres');
            
            alert(`✅ Configuration vierge créée pour "${direction}".\n\nVous pouvez maintenant ajouter des Tronçons, Sociétés et PMA.`);
            return;
        }
        
        // 4. Si la direction existe mais n'est pas chargée
        if (!toutesLesDonnees || toutesLesDonnees.length === 0) {
            alert('📭 Veuillez d\'abord charger un fichier Excel.');
            return;
        }
        
        // 5. Demander de charger un fichier pour cette direction
        const currentDirection = toutesLesDonnees[0]?.['_direction'] || 'DRRS';
        const message = `📁 Direction actuelle: ${currentDirection}\n\n🔀 Vous voulez passer à la Direction "${direction}".\n\nVeuillez sélectionner le fichier Excel correspondant.`;
        
        if (!confirm(message)) return;
        
        // Ouvrir le sélecteur de fichiers
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.multiple = false;
        
        input.onchange = function(e) {
            const fichier = e.target.files[0];
            if (!fichier) return;
            chargerFichierPourDirection(fichier, direction);
        };
        
        input.click();
    },


    // ====== ✅ أضف هذه الدالة هنا ======
    creerConfigurationVierge: function(direction) {
        console.log(`🆕 Création d'une configuration vierge pour ${direction}`);
        
        // 1. Créer des tronçons vides pour cette direction
        const troncons = this.chargerDonnees('troncons');
        const nouveauxTroncons = [
            { id: 'T1', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 },
            { id: 'T2', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 },
            { id: 'T3', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 },
            { id: 'T4', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 }
        ];
        
        // Ajouter seulement si la direction n'existe pas déjà
        nouveauxTroncons.forEach(t => {
            const existe = troncons.some(item => item.id === t.id && item.direction === direction);
            if (!existe) {
                troncons.push(t);
            }
        });
        this.sauvegarderDonnees('troncons', troncons);
        
        // 2. Créer des sociétés vides pour cette direction
        const societes = this.chargerDonnees('societes');
        const nouvellesSocietes = [
            { nom: 'Société 1', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 },
            { nom: 'Société 2', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 },
            { nom: 'Société 3', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 }
        ];
        
        nouvellesSocietes.forEach(s => {
            const existe = societes.some(item => item.nom === s.nom && item.direction === direction);
            if (!existe) {
                societes.push(s);
            }
        });
        this.sauvegarderDonnees('societes', societes);
        
        // 3. Créer des PMA vides pour cette direction
        const gendarmerie = this.chargerDonnees('gendarmerie');
        const nouvellesPMA = [
            { nom: 'PMA 1', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 },
            { nom: 'PMA 2', direction: direction, axe: 'A3', pk_min: 0, pk_max: 0 }
        ];
        
        nouvellesPMA.forEach(p => {
            const existe = gendarmerie.some(item => item.nom === p.nom && item.direction === direction);
            if (!existe) {
                gendarmerie.push(p);
            }
        });
        this.sauvegarderDonnees('gendarmerie', gendarmerie);
        
        console.log(`✅ Configuration vierge créée pour ${direction}`);
    },
    
};


// ============================================================
// 11. REINITIALISATION GLOBALE
// ============================================================

function reinitialiserTout() {
    console.log('🔄 Réinitialisation de tous les affichages...');
    
    // قسم التحليل
    if (typeof Analyse !== 'undefined' && Analyse.init) {
        Analyse.init();
    }
    
    // قسم المتدخلين
    if (typeof Intervenants !== 'undefined' && Intervenants.appliquerFiltres) {
        Intervenants.appliquerFiltres();
    }
    
    // قسم المزودين
    if (typeof Depanneurs !== 'undefined' && Depanneurs.mettreAJourTableau) {
        Depanneurs.mettreAJourTableau();
    }
    
    // لوحة القيادة
    if (typeof Graphiques !== 'undefined' && Graphiques.mettreAJour) {
        Graphiques.mettreAJour();
    }
}

// ============================================================
// 12. NAVIGATION
// ============================================================

function changerPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.nav-btn[data-page="' + page + '"]');
    if (btn) btn.classList.add('active');
    
    // إظهار/إخفاء الفلاتر الخاصة
    const interventionGroup = document.getElementById('interventionFilterGroup');
    const depGroup = document.getElementById('depanneurFilterGroup');
    const pmaGroup = document.getElementById('pmaFilterGroup');
    
    if (interventionGroup) interventionGroup.style.display = 'none';
    if (depGroup) depGroup.style.display = 'none';
    if (pmaGroup) pmaGroup.style.display = 'none';
    
    if (page === 'intervenants') {
        if (interventionGroup) interventionGroup.style.display = 'flex';
        if (pmaGroup) pmaGroup.style.display = 'flex';
    } else if (page === 'depanneurs') {
        if (depGroup) depGroup.style.display = 'flex';
    }
    
    setTimeout(() => {
        if (page === 'analyse') {
            Analyse.init();
        } else if (page === 'intervenants') {
            Intervenants.appliquerFiltres();
        } else if (page === 'depanneurs') {
            Depanneurs.appliquerFiltres();
        } else if (page === 'graphiques') {
            // ✅ استخدم appliquerFiltres بدلاً من mettreAJour
            if (typeof Graphiques !== 'undefined' && Graphiques.appliquerFiltres) {
                Graphiques.appliquerFiltres();
            }
        }
    }, 100);
}

// ============================================================
// 13. ÉVÉNEMENTS
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM chargé');
    
    // ====== ربط فلاتر Analyse ======
    const analyseTroncon = document.getElementById('analyseTronconFilter');
    const analyseMois = document.getElementById('analyseMoisFilter');
    if (analyseTroncon) analyseTroncon.addEventListener('change', function() { Analyse.appliquerFiltres(); });
    if (analyseMois) analyseMois.addEventListener('change', function() { Analyse.appliquerFiltres(); });
    
    // ====== ربط فلاتر Intervenants ======
    const intervTroncon = document.getElementById('intervTronconFilter');
    const intervMois = document.getElementById('intervMoisFilter');
    const intervType = document.getElementById('intervTypeFilter');
    const intervPma = document.getElementById('intervPmaFilter');
    
    if (intervTroncon) intervTroncon.addEventListener('change', function() { Intervenants.appliquerFiltres(); });
    if (intervMois) intervMois.addEventListener('change', function() { Intervenants.appliquerFiltres(); });
    if (intervType) intervType.addEventListener('change', function() { Intervenants.appliquerFiltres(); });
    if (intervPma) intervPma.addEventListener('change', function() { Intervenants.appliquerFiltres(); });
    
    // ====== ربط فلاتر Dépanneurs ======
    const depTroncon = document.getElementById('depTronconFilter');
    const depMois = document.getElementById('depMoisFilter');
    const depSociete = document.getElementById('depSocieteFilter');
    const depType = document.getElementById('depTypeFilter');
    
    if (depTroncon) depTroncon.addEventListener('change', function() { Depanneurs.appliquerFiltres(); });
    if (depMois) depMois.addEventListener('change', function() { Depanneurs.appliquerFiltres(); });
    if (depSociete) depSociete.addEventListener('change', function() { Depanneurs.appliquerFiltres(); });
    if (depType) depType.addEventListener('change', function() { Depanneurs.appliquerFiltres(); });
    
    // ====== ربط فلاتر Graphiques ======
    const graphTroncon = document.getElementById('graphTronconFilter');
    const graphMois = document.getElementById('graphMoisFilter');
    const graphSemaine = document.getElementById('graphSemaineFilter');
    const graphJour = document.getElementById('graphJourFiltre');
    const graphHeure = document.getElementById('graphHeureFiltre');
    const graphCause = document.getElementById('graphCauseType');

    if (graphTroncon) graphTroncon.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphMois) graphMois.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphSemaine) graphSemaine.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphJour) graphJour.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphHeure) graphHeure.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphCause) graphCause.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    
    // ====== ✅ ربط فلاتر Rapprochement ======
    const rappTroncon = document.getElementById('rappTronconFilter');
    const rappMois = document.getElementById('rappMoisFilter');

    if (rappTroncon) rappTroncon.addEventListener('change', function() { Rapprochement.appliquerFiltres(); });
    if (rappMois) rappMois.addEventListener('change', function() { Rapprochement.appliquerFiltres(); });
    
    // ====== استعادة البيانات ======
    const donneesRestorees = restaurerDonnees();
    
    if (donneesRestorees) {
        console.log('✅ Données restaurées avec succès');
        document.getElementById('fileStatus').textContent = '✅ ' + toutesLesDonnees.length + ' accidents chargés (mémoire)';
        document.getElementById('fileStatus').style.color = '#27ae60';
        const memoryStatus = document.getElementById('memoryStatus');
        if (memoryStatus) {
            memoryStatus.textContent = '💾 ' + toutesLesDonnees.length + ' lignes en mémoire';
            memoryStatus.style.color = '#27ae60';
            memoryStatus.style.background = '#e8f8f0';
        }
        
        if (typeof Analyse !== 'undefined' && Analyse.init) Analyse.init();
        if (typeof Intervenants !== 'undefined' && Intervenants.init) Intervenants.init();
        if (typeof Depanneurs !== 'undefined' && Depanneurs.init) Depanneurs.init();
        if (typeof Graphiques !== 'undefined' && Graphiques.mettreAJourFiltres) Graphiques.mettreAJourFiltres();
        if (typeof Graphiques !== 'undefined' && Graphiques.appliquerFiltres) Graphiques.appliquerFiltres();
        if (typeof Parametres !== 'undefined' && Parametres.init) Parametres.init();
        
    } else {
        console.log('📭 Aucune donnée sauvegardée');
        document.getElementById('fileStatus').textContent = '📁 Cliquez sur "Charger les fichiers" pour commencer';
        document.getElementById('fileStatus').style.color = '#f39c12';
        
        // Chargement automatique depuis GitHub
        const urlDRRS = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/DRRS.xlsx';
        chargerFichierDepuisURL(urlDRRS, 'DRRS');
    }
});

// Sauvegarde automatique
setInterval(function() {
    if (toutesLesDonnees && toutesLesDonnees.length > 0) {
        sauvegarderDonnees(toutesLesDonnees);
    }
}, 30000);

console.log('🚗📊 Application DRRS chargée!');

// ============================================================
// TRAITER LES DONNÉES CHARGÉES (أضف هذه الدالة أولاً)
// ============================================================

function traiterDonneesChargees(jsonData, nomFichier) {
    console.log('🔄 Traitement des données chargées...');
    console.log('📊 Nombre de lignes:', jsonData.length);
    
    toutesLesDonnees = enrichirDonnees(jsonData);
    sauvegarderDonnees(toutesLesDonnees);
    
    document.getElementById('fileStatus').textContent = `✅ ${toutesLesDonnees.length} accidents chargés (${nomFichier})`;
    document.getElementById('fileStatus').style.color = '#27ae60';
    
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = `💾 ${toutesLesDonnees.length} lignes en mémoire`;
        memoryStatus.style.color = '#27ae60';
        memoryStatus.style.background = '#e8f8f0';
    }
    
    const fileList = document.getElementById('fileList');
    if (fileList) {
        fileList.innerHTML = `<span class="file-tag">📄 ${nomFichier}</span>`;
    }
    // ✅ تحديث جميع الأقسام
    reinitialiserTout();
    // ✅ تحديث معطيات Rapprochement إذا كانت موجودة
        if (typeof Rapprochement !== 'undefined' && Rapprochement.donneesSource) {
            // محاولة تحديث بيانات المصدر إذا كان الملف المحمّل هو DRRS
            if (nomFichier.includes('DRRS') || nomFichier.includes('source')) {
                Rapprochement.donneesSource = toutesLesDonnees;
                document.getElementById('rappSourceStatus').textContent = `✅ ${toutesLesDonnees.length} lignes`;
                document.getElementById('rappSourceStatus').style.color = '#27ae60';
            }
            // تحديث بيانات المقارنة إذا كان الملف المحمّل هو Rapprochement
            else if (nomFichier.includes('Rapprochement')) {
                Rapprochement.donneesCompare = toutesLesDonnees;
                document.getElementById('rappCompareStatus').textContent = `✅ ${toutesLesDonnees.length} lignes`;
                document.getElementById('rappCompareStatus').style.color = '#27ae60';
            }
            
            // إعادة تطبيق الفلاتر وتحديث الجداول
            Rapprochement.mettreAJourFiltres();
            Rapprochement.appliquerFiltres();
            
            // إعادة تعيين حالة الزر التفصيلي
            const detailsContainer = document.getElementById('rappDetailsContainer');
            if (detailsContainer) {
                detailsContainer.style.display = 'none';
                const btn = document.querySelector('[onclick="Rapprochement.basculerDetails()"]');
                if (btn) btn.textContent = '📋 Afficher les accidents différents';
            }
        }
    changerPage('analyse');
    
    console.log(`✅ Fichier ${nomFichier} chargé avec succès`);
}

// ============================================================
// CHARGEMENT LOCAL
// ============================================================

function chargerFichierLocal() {
    const annee = document.getElementById('chargementAnneeFilter').value;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    if (annee === 'all') {
        input.multiple = true;
    } else {
        input.multiple = false;
    }
    
    input.onchange = function(e) {
        const fichiers = e.target.files;
        if (fichiers.length === 0) return;
        
        if (annee !== 'all') {
            const fichier = fichiers[0];
            const nomAttendu = 'DRRS' + annee + '.xlsx';
            if (fichier.name !== nomAttendu) {
                alert(`❌ Veuillez sélectionner le fichier ${nomAttendu}\n\nFichier sélectionné: ${fichier.name}`);
                return;
            }
            lireEtTraiterFichier(fichier, annee);
        } else {
            let fichiersTraites = 0;
            let toutesLesDonneesTemp = [];
            
            Array.from(fichiers).forEach(fichier => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const data = new Uint8Array(event.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                        
                        jsonData.forEach(ligne => {
                            ligne['_source_fichier'] = fichier.name;
                            ligne['_direction_assignee'] = 'DRRS';
                            ligne['_annee'] = 0;
                        });
                        
                        toutesLesDonneesTemp = toutesLesDonneesTemp.concat(jsonData);
                        fichiersTraites++;
                        
                        if (fichiersTraites === fichiers.length) {
                            traiterDonneesChargees(toutesLesDonneesTemp, fichiers.length + ' fichiers');
                        }
                    } catch (error) {
                        console.error('Erreur:', error);
                        document.getElementById('fileStatus').textContent = '❌ Erreur: ' + error.message;
                        document.getElementById('fileStatus').style.color = '#e74c3c';
                    }
                };
                reader.readAsArrayBuffer(fichier);
            });
        }
    };
    
    input.click();
}

// ============================================================
// LIRE ET TRAITER UN SEUL FICHIER
// ============================================================

function lireEtTraiterFichier(fichier, annee) {
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
            
            jsonData.forEach(ligne => {
                ligne['_source_fichier'] = fichier.name;
                ligne['_direction_assignee'] = 'DRRS';
                ligne['_annee'] = parseInt(annee);
            });
            
            traiterDonneesChargees(jsonData, fichier.name);
            
        } catch (error) {
            console.error('Erreur:', error);
            document.getElementById('fileStatus').textContent = '❌ Erreur: ' + error.message;
            document.getElementById('fileStatus').style.color = '#e74c3c';
        }
    };
    reader.readAsArrayBuffer(fichier);
}

// ============================================================
// CHARGEMENT EXTERNE (GitHub)
// ============================================================

function chargerFichierExterne() {
    const annee = document.getElementById('chargementAnneeFilter').value;
    
    let nomFichier, url;
    
    if (annee !== 'all') {
        nomFichier = 'DRRS' + annee + '.xlsx';
        url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
    } else {
        nomFichier = 'DRRS.xlsx';
        url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
    }
    
    console.log(`📂 Chargement externe: ${nomFichier}`);
    document.getElementById('fileStatus').textContent = `📥 Chargement de ${nomFichier}...`;
    document.getElementById('fileStatus').style.color = '#f39c12';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fichier ${nomFichier} non trouvé (${response.status})`);
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
            
            jsonData.forEach(ligne => {
                ligne['_source_fichier'] = nomFichier;
                ligne['_direction_assignee'] = 'DRRS';
                ligne['_annee'] = annee !== 'all' ? parseInt(annee) : 0;
            });
            
            traiterDonneesChargees(jsonData, nomFichier);
        })
        .catch(error => {
            console.error('❌ Erreur:', error);
            document.getElementById('fileStatus').textContent = `❌ Erreur: ${error.message}`;
            document.getElementById('fileStatus').style.color = '#e74c3c';
            alert(`❌ Le fichier ${nomFichier} n'existe pas sur GitHub.\n\nVeuillez utiliser le chargement local.`);
        });
}

// ============================================================
// SECTION RAPPROCHEMENT (مستقلة تماماً)
// ============================================================

const Rapprochement = {
    donneesSource: [],
    donneesCompare: [],
    donneesFiltreesSource: [],
    donneesFiltreesCompare: [],
    
    // ====== CHARGER LE FICHIER SOURCE ======
    // ============================================================
    // CHARGER SOURCE LOCAL (avec vérification de l'année)
    // ============================================================

    chargerFichierSource: function() {
        const annee = document.getElementById('rappAnneeFilter').value;
        const nomAttendu = 'DRRS' + annee + '.xlsx';
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        
        input.onchange = function(e) {
            const fichier = e.target.files[0];
            if (!fichier) return;
            
            if (fichier.name !== nomAttendu) {
                alert(`❌ Veuillez sélectionner le fichier ${nomAttendu}\n\nFichier sélectionné: ${fichier.name}`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                    
                    jsonData.forEach(ligne => {
                        ligne['_source_fichier'] = fichier.name;
                        ligne['_direction_assignee'] = 'DRRS';
                        ligne['_annee'] = parseInt(annee);
                    });
                    
                    Rapprochement.donneesSource = enrichirDonnees(jsonData);
                    document.getElementById('rappSourceStatus').textContent = `✅ ${Rapprochement.donneesSource.length} lignes (${annee})`;
                    document.getElementById('rappSourceStatus').style.color = '#27ae60';
                    
                    Rapprochement.mettreAJourFiltres();
                    Rapprochement.appliquerFiltres();
                } catch (error) {
                    console.error('Erreur:', error);
                    document.getElementById('rappSourceStatus').textContent = '❌ Erreur';
                    document.getElementById('rappSourceStatus').style.color = '#e74c3c';
                }
            };
            reader.readAsArrayBuffer(fichier);
        };
        input.click();
    },

    // ============================================================
    // CHARGER COMPARAISON LOCAL (avec vérification de l'année)
    // ============================================================

    chargerFichierComparaison: function() {
        const annee = document.getElementById('rappAnneeFilter').value;
        const nomAttendu = 'Rapprochement' + annee + '.xlsx';
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        
        input.onchange = function(e) {
            const fichier = e.target.files[0];
            if (!fichier) return;
            
            if (fichier.name !== nomAttendu) {
                alert(`❌ Veuillez sélectionner le fichier ${nomAttendu}\n\nFichier sélectionné: ${fichier.name}`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                    
                    jsonData.forEach(ligne => {
                        ligne['_source_fichier'] = fichier.name;
                        ligne['_direction_assignee'] = 'DRRS';
                        ligne['_annee'] = parseInt(annee);
                    });
                    
                    Rapprochement.donneesCompare = enrichirDonnees(jsonData);
                    document.getElementById('rappCompareStatus').textContent = `✅ ${Rapprochement.donneesCompare.length} lignes (${annee})`;
                    document.getElementById('rappCompareStatus').style.color = '#27ae60';
                    
                    Rapprochement.mettreAJourFiltres();
                    Rapprochement.appliquerFiltres();
                } catch (error) {
                    console.error('Erreur:', error);
                    document.getElementById('rappCompareStatus').textContent = '❌ Erreur';
                    document.getElementById('rappCompareStatus').style.color = '#e74c3c';
                }
            };
            reader.readAsArrayBuffer(fichier);
        };
        input.click();
    },
    
    // ====== METTRE À JOUR LES FILTRES ======
    mettreAJourFiltres: function() {
        const selectTroncon = document.getElementById('rappTronconFilter');
        const selectMois = document.getElementById('rappMoisFilter');
        if (!selectTroncon || !selectMois) return;
        
        // Utiliser les données source (ou les données de comparaison si source vide)
        const donnees = this.donneesSource.length > 0 ? this.donneesSource : this.donneesCompare;
        if (donnees.length === 0) return;
        
        // Tronçons
        const troncons = new Set();
        donnees.forEach(d => {
            if (d['_troncon'] && d['_troncon'] !== 'Inconnu') {
                troncons.add(d['_troncon']);
            }
        });
        const valTroncon = selectTroncon.value;
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        ['T1', 'T2', 'T2_2', 'T3', 'T4'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRange(t) + ')';
            selectTroncon.appendChild(opt);
        });
        if (troncons.has(valTroncon)) selectTroncon.value = valTroncon;
        else selectTroncon.value = 'all';
        
        // Mois
        const moisExistants = new Set();
        donnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        const valMois = selectMois.value;
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        if (moisExistants.has(parseInt(valMois))) selectMois.value = valMois;
        else selectMois.value = 'all';
    },
    
    // ====== APPLIQUER LES FILTRES ======
    appliquerFiltres: function() {
        const tronconSelect = document.getElementById('rappTronconFilter');
        const moisSelect = document.getElementById('rappMoisFilter');
        
        const tronconValues = Array.from(tronconSelect.selectedOptions).map(opt => opt.value);
        const moisValues = Array.from(moisSelect.selectedOptions).map(opt => opt.value);
        
        const tronconAll = tronconValues.includes('all');
        const moisAll = moisValues.includes('all');
        
        // Filtrer les données source
        this.donneesFiltreesSource = this.donneesSource.filter(d => {
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) return false;
            if (!moisAll && !moisValues.includes(String(d['_mois']))) return false;
            return true;
        });
        
        // Filtrer les données de comparaison
        this.donneesFiltreesCompare = this.donneesCompare.filter(d => {
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) return false;
            if (!moisAll && !moisValues.includes(String(d['_mois']))) return false;
            return true;
        });
        
        this.mettreAJourTableaux();
    },
    
    // ====== METTRE À JOUR LES TABLEAUX ======
    mettreAJourTableaux: function() {
        this.afficherTableau('rappSourceTable', this.donneesFiltreesSource, 'Source');
        this.afficherTableau('rappCompareTable', this.donneesFiltreesCompare, 'Comparaison');
        this.afficherDifferences();
    },
    
    // ====== AFFICHER UN TABLEAU ======
    afficherTableau: function(containerId, donnees, titre) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (donnees.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">Aucune donnée à afficher</p>`;
            return;
        }
        
        const tousLesTroncons = ['T1', 'T2', 'T2_2', 'T3', 'T4'];
        const resultats = {};
        tousLesTroncons.forEach(t => {
            resultats[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        donnees.forEach(d => {
            const t = d['_troncon'];
            if (t && t in resultats) {
                resultats[t].total++;
                const gravite = d['Gravité accident'];
                if (gravite === 'Corporelle') resultats[t].corporelle++;
                else if (gravite === 'Matérielle') resultats[t].materielle++;
                else if (gravite === 'Mortelle') resultats[t].mortelle++;
                resultats[t].tues += parseInt(d['_total_tues'] || 0);
                resultats[t].bg += parseInt(d['_total_bg'] || 0);
                resultats[t].bl += parseInt(d['_total_bl'] || 0);
            }
        });
        
        let totalCorp = 0, totalMat = 0, totalMort = 0, totalAcc = 0, totalTues = 0, totalBG = 0, totalBL = 0;
        let html = '<table><thead><tr><th>Tronçon</th><th>Entre PK et PK</th><th>Corporelle</th><th>Matérielle</th><th>Mortelle</th><th>Total ACC</th><th>Nbr Tués</th><th>Nbr BG</th><th>Nbr BL</th></tr></thead><tbody>';
        
        tousLesTroncons.forEach(t => {
            const d = resultats[t];
            totalCorp += d.corporelle; totalMat += d.materielle; totalMort += d.mortelle;
            totalAcc += d.total; totalTues += d.tues; totalBG += d.bg; totalBL += d.bl;
            const range = getPkRange(t);
            html += `<tr><td><strong>${t}</strong></td><td>${range}</td><td>${d.corporelle}</td><td>${d.materielle}</td><td>${d.mortelle}</td><td><strong>${d.total}</strong></td><td>${d.tues}</td><td>${d.bg}</td><td>${d.bl}</td></tr>`;
        });
        
        html += `<tr class="total-row"><td colspan="2"><strong>Total</strong></td><td><strong>${totalCorp}</strong></td><td><strong>${totalMat}</strong></td><td><strong>${totalMort}</strong></td><td><strong>${totalAcc}</strong></td><td><strong>${totalTues}</strong></td><td><strong>${totalBG}</strong></td><td><strong>${totalBL}</strong></td></tr></tbody></table>`;
        
        container.innerHTML = html;
    },
    
    // ====== AFFICHER LES DIFFÉRENCES ======
    afficherDifferences: function() {
        const container = document.getElementById('rappDiffTable');
        if (!container) return;
        
        if (this.donneesFiltreesSource.length === 0 || this.donneesFiltreesCompare.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">Chargez les deux fichiers pour voir les différences</p>`;
            return;
        }
        
        // Calculer les différences
        const tousLesTroncons = ['T1', 'T2', 'T2_2', 'T3', 'T4'];
        const diff = {};
        tousLesTroncons.forEach(t => {
            diff[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        // Calculer source
        const sourceResultats = this.calculerResultats(this.donneesFiltreesSource);
        const compareResultats = this.calculerResultats(this.donneesFiltreesCompare);
        
        let totalCorp = 0, totalMat = 0, totalMort = 0, totalAcc = 0, totalTues = 0, totalBG = 0, totalBL = 0;
        
        tousLesTroncons.forEach(t => {
            diff[t].corporelle = compareResultats[t].corporelle - sourceResultats[t].corporelle;
            diff[t].materielle = compareResultats[t].materielle - sourceResultats[t].materielle;
            diff[t].mortelle = compareResultats[t].mortelle - sourceResultats[t].mortelle;
            diff[t].total = compareResultats[t].total - sourceResultats[t].total;
            diff[t].tues = compareResultats[t].tues - sourceResultats[t].tues;
            diff[t].bg = compareResultats[t].bg - sourceResultats[t].bg;
            diff[t].bl = compareResultats[t].bl - sourceResultats[t].bl;
            
            totalCorp += diff[t].corporelle;
            totalMat += diff[t].materielle;
            totalMort += diff[t].mortelle;
            totalAcc += diff[t].total;
            totalTues += diff[t].tues;
            totalBG += diff[t].bg;
            totalBL += diff[t].bl;
        });
        
        let html = '<table><thead><tr><th>Tronçon</th><th>Entre PK et PK</th><th>Corporelle</th><th>Matérielle</th><th>Mortelle</th><th>Total ACC</th><th>Nbr Tués</th><th>Nbr BG</th><th>Nbr BL</th></tr></thead><tbody>';
        
        tousLesTroncons.forEach(t => {
            const d = diff[t];
            const range = getPkRange(t);
            const isDiff = d.corporelle !== 0 || d.materielle !== 0 || d.mortelle !== 0 || d.total !== 0 || d.tues !== 0 || d.bg !== 0 || d.bl !== 0;
            const style = isDiff ? 'background:#fff3cd;' : '';
            html += `<tr style="${style}"><td><strong>${t}</strong></td><td>${range}</td><td>${d.corporelle > 0 ? '+' : ''}${d.corporelle}</td><td>${d.materielle > 0 ? '+' : ''}${d.materielle}</td><td>${d.mortelle > 0 ? '+' : ''}${d.mortelle}</td><td><strong>${d.total > 0 ? '+' : ''}${d.total}</strong></td><td>${d.tues > 0 ? '+' : ''}${d.tues}</td><td>${d.bg > 0 ? '+' : ''}${d.bg}</td><td>${d.bl > 0 ? '+' : ''}${d.bl}</td></tr>`;
        });
        
        html += `<tr class="total-row"><td colspan="2"><strong>Total</strong></td><td><strong>${totalCorp > 0 ? '+' : ''}${totalCorp}</strong></td><td><strong>${totalMat > 0 ? '+' : ''}${totalMat}</strong></td><td><strong>${totalMort > 0 ? '+' : ''}${totalMort}</strong></td><td><strong>${totalAcc > 0 ? '+' : ''}${totalAcc}</strong></td><td><strong>${totalTues > 0 ? '+' : ''}${totalTues}</strong></td><td><strong>${totalBG > 0 ? '+' : ''}${totalBG}</strong></td><td><strong>${totalBL > 0 ? '+' : ''}${totalBL}</strong></td></tr></tbody></table>`;
        
        container.innerHTML = html;
    },
    
    // ====== CALCULER LES RÉSULTATS ======
    calculerResultats: function(donnees) {
        const tousLesTroncons = ['T1', 'T2', 'T2_2', 'T3', 'T4'];
        const resultats = {};
        tousLesTroncons.forEach(t => {
            resultats[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        donnees.forEach(d => {
            const t = d['_troncon'];
            if (t && t in resultats) {
                resultats[t].total++;
                const gravite = d['Gravité accident'];
                if (gravite === 'Corporelle') resultats[t].corporelle++;
                else if (gravite === 'Matérielle') resultats[t].materielle++;
                else if (gravite === 'Mortelle') resultats[t].mortelle++;
                resultats[t].tues += parseInt(d['_total_tues'] || 0);
                resultats[t].bg += parseInt(d['_total_bg'] || 0);
                resultats[t].bl += parseInt(d['_total_bl'] || 0);
            }
        });
        
        return resultats;
    },
    
    // ====== RÉINITIALISER ======
    reinitialiserFiltres: function() {
        const tronconSelect = document.getElementById('rappTronconFilter');
        const moisSelect = document.getElementById('rappMoisFilter');
        
        if (tronconSelect) {
            Array.from(tronconSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (moisSelect) {
            Array.from(moisSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        
        this.appliquerFiltres();
    },
// ====== BASCULER L'AFFICHAGE DES DÉTAILS ======
    basculerDetails: function() {
        const container = document.getElementById('rappDetailsContainer');
        const btn = document.querySelector('[onclick="Rapprochement.basculerDetails()"]');
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            btn.textContent = '📋 Masquer les accidents différents';
            this.afficherDetailsDifferences();
        } else {
            container.style.display = 'none';
            btn.textContent = '📋 Afficher les accidents différents';
        }
    },
    
    // ====== AFFICHER LES DÉTAILS DES DIFFÉRENCES ======
    // ====== AFFICHER LES DÉTAILS DES DIFFÉRENCES ======
    afficherDetailsDifferences: function() {
        const container = document.getElementById('rappDetailsTable');
        if (!container) return;
        
        if (this.donneesFiltreesSource.length === 0 || this.donneesFiltreesCompare.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#999;padding:20px;">Chargez les deux fichiers pour voir les détails</p>`;
            return;
        }
        
        // Identifier les accidents différents
        const differences = [];
        const sourceMap = {};
        
        this.donneesFiltreesSource.forEach(d => {
            const key = d['Ticket'] + '_' + d['Date prise en charge'];
            sourceMap[key] = d;
        });
        
        this.donneesFiltreesCompare.forEach(d => {
            const key = d['Ticket'] + '_' + d['Date prise en charge'];
            const source = sourceMap[key];
            if (source) {
                const diff = this.comparerLignes(source, d);
                if (diff.hasDiff) {
                    differences.push({
                        source: source,
                        compare: d,
                        differences: diff.details
                    });
                }
            }
        });
        
        if (differences.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#27ae60;padding:20px;">✅ Aucune différence trouvée entre les deux fichiers</p>`;
            return;
        }
        
        const colonnes = [
            'Date prise en charge',
            'Gravité accident',
            'Sens',
            'PK',
            'Nbr Tués Usagers',
            'Nbr BG Usagers',
            'Nbr BL Usagers',
            'is autocar',
            'Nbr Tués Piéton Usager',
            'Nbr BG Piéton Usager',
            'Nbr BL Piéton Usager',
            'Nbr Tués Piéton Vagabond',
            'Nbr BG Piéton Vagabond',
            'Nbr BL Piéton Vagabond',
            'Nbr Tués Piéton Riverain',
            'Nbr BG Piéton Riverain',
            'Nbr BL Piéton Riverain',
            'Nbr Tués Piéton Pers. D\'intervention',
            'Nbr BG Piéton Pers. D\'intervention',
            'Nbr BL Piéton Pers. D\'intervention'
        ];
        
        let html = '<table><thead><tr>';
        html += '<th>#</th>';
        colonnes.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '<th>Différence</th>';
        html += '</tr></thead><tbody>';
        
        differences.forEach((item, index) => {
            const source = item.source;
            const compare = item.compare;
            const diffDetails = item.differences;
            
            html += `<tr style="background:#fff3cd;">`;
            html += `<td><strong>${index + 1}</strong></td>`;
            
            colonnes.forEach(col => {
                let valSource = source[col] !== undefined ? source[col] : '';
                let valCompare = compare[col] !== undefined ? compare[col] : '';
                
                // ✅ تنسيق التاريخ
                if (col === 'Date prise en charge') {
                    valSource = formaterDate(valSource);
                    valCompare = formaterDate(valCompare);
                }
                
                // ✅ تنسيق PK
                if (col === 'PK') {
                    valSource = formaterPK(valSource);
                    valCompare = formaterPK(valCompare);
                }
                
                const isDiff = diffDetails.includes(col);
                const style = isDiff ? 'color:#e74c3c; font-weight:bold;' : '';
                html += `<td style="${style}">${valSource} → ${valCompare}</td>`;
            });
            
            html += `<td style="color:#e74c3c; font-weight:bold;">⚠️ ${diffDetails.length} différences</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        const summary = `<div style="padding:10px; background:#f8fafc; border-radius:8px; margin-bottom:15px;">
            <span style="font-weight:bold;">📊 Total des accidents différents : ${differences.length}</span>
        </div>`;
        
        container.innerHTML = summary + html;
    },
    
    // ====== COMPARER DEUX LIGNES ======
    comparerLignes: function(source, compare) {
        const colonnes = [
            'Date prise en charge',
            'Gravité accident',
            'Sens',
            'PK',
            'Nbr Tués Usagers',
            'Nbr BG Usagers',
            'Nbr BL Usagers',
            'is autocar',
            'Nbr Tués Piéton Usager',
            'Nbr BG Piéton Usager',
            'Nbr BL Piéton Usager',
            'Nbr Tués Piéton Vagabond',
            'Nbr BG Piéton Vagabond',
            'Nbr BL Piéton Vagabond',
            'Nbr Tués Piéton Riverain',
            'Nbr BG Piéton Riverain',
            'Nbr BL Piéton Riverain',
            'Nbr Tués Piéton Pers. D\'intervention',
            'Nbr BG Piéton Pers. D\'intervention',
            'Nbr BL Piéton Pers. D\'intervention'
        ];
        
        const details = [];
        let hasDiff = false;
        
        colonnes.forEach(col => {
            const valSource = source[col] !== undefined ? String(source[col]).trim() : '';
            const valCompare = compare[col] !== undefined ? String(compare[col]).trim() : '';
            
            if (valSource !== valCompare) {
                hasDiff = true;
                details.push(col);
            }
        });
        
        return { hasDiff, details };
    },
    // ============================================================
    // CHARGER SOURCE DEPUIS GITHUB
    // ============================================================
    // ============================================================
    // CHARGER SOURCE DEPUIS GITHUB (avec année)
    // ============================================================

    chargerSourceDepuisGitHub: function() {
        const annee = document.getElementById('rappAnneeFilter').value;
        const nomFichier = 'DRRS' + annee + '.xlsx';
        const url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
        
        document.getElementById('rappSourceStatus').textContent = '📥 Téléchargement...';
        document.getElementById('rappSourceStatus').style.color = '#f39c12';
        
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Fichier ${nomFichier} non trouvé (${response.status})`);
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                
                jsonData.forEach(ligne => {
                    ligne['_source_fichier'] = nomFichier;
                    ligne['_direction_assignee'] = 'DRRS';
                    ligne['_annee'] = parseInt(annee);
                });
                
                this.donneesSource = enrichirDonnees(jsonData);
                document.getElementById('rappSourceStatus').textContent = `✅ ${this.donneesSource.length} lignes (${annee})`;
                document.getElementById('rappSourceStatus').style.color = '#27ae60';
                
                this.mettreAJourFiltres();
                this.appliquerFiltres();
                
                console.log(`✅ Fichier ${nomFichier} chargé depuis GitHub`);
            })
            .catch(error => {
                console.error('❌ Erreur:', error);
                document.getElementById('rappSourceStatus').textContent = '❌ Erreur';
                document.getElementById('rappSourceStatus').style.color = '#e74c3c';
                alert(`❌ Le fichier ${nomFichier} n'existe pas sur GitHub.\n\nVeuillez vérifier l'année sélectionnée.`);
            });
    },

    // ============================================================
    // CHARGER COMPARAISON DEPUIS GITHUB (avec année)
    // ============================================================

    chargerComparaisonDepuisGitHub: function() {
        const annee = document.getElementById('rappAnneeFilter').value;
        const nomFichier = 'Rapprochement' + annee + '.xlsx';
        const url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
        
        document.getElementById('rappCompareStatus').textContent = '📥 Téléchargement...';
        document.getElementById('rappCompareStatus').style.color = '#f39c12';
        
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Fichier ${nomFichier} non trouvé (${response.status})`);
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                
                jsonData.forEach(ligne => {
                    ligne['_source_fichier'] = nomFichier;
                    ligne['_direction_assignee'] = 'DRRS';
                    ligne['_annee'] = parseInt(annee);
                });
                
                this.donneesCompare = enrichirDonnees(jsonData);
                document.getElementById('rappCompareStatus').textContent = `✅ ${this.donneesCompare.length} lignes (${annee})`;
                document.getElementById('rappCompareStatus').style.color = '#27ae60';
                
                this.mettreAJourFiltres();
                this.appliquerFiltres();
                
                console.log(`✅ Fichier ${nomFichier} chargé depuis GitHub`);
            })
            .catch(error => {
                console.error('❌ Erreur:', error);
                document.getElementById('rappCompareStatus').textContent = '❌ Erreur';
                document.getElementById('rappCompareStatus').style.color = '#e74c3c';
                alert(`❌ Le fichier ${nomFichier} n'existe pas sur GitHub.\n\nVeuillez vérifier l'année sélectionnée.`);
            });
    },
    // ====== إعادة تعيين بيانات Rapprochement ======
    reinitialiser: function() {
        this.donneesSource = [];
        this.donneesCompare = [];
        this.donneesFiltreesSource = [];
        this.donneesFiltreesCompare = [];
        
        document.getElementById('rappSourceStatus').textContent = 'Aucun fichier';
        document.getElementById('rappSourceStatus').style.color = '#999';
        document.getElementById('rappCompareStatus').textContent = 'Aucun fichier';
        document.getElementById('rappCompareStatus').style.color = '#999';
        
        document.getElementById('rappSourceTable').innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Chargez le fichier source</p>';
        document.getElementById('rappCompareTable').innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Chargez le fichier à comparer</p>';
        document.getElementById('rappDiffTable').innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Chargez les deux fichiers pour voir les différences</p>';
        
        const detailsContainer = document.getElementById('rappDetailsContainer');
        if (detailsContainer) {
            detailsContainer.style.display = 'none';
            const btn = document.querySelector('[onclick="Rapprochement.basculerDetails()"]');
            if (btn) btn.textContent = '📋 Afficher les accidents différents';
        }
        
        document.getElementById('rappDetailsTable').innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Aucune donnée</p>';
    }
    
};

// ====== حساب عدد الأيام الفعلية في النطاق الزمني ======
function getDaysInRange(donnees) {
    if (!donnees || donnees.length === 0) return 1;
    
    let minDate = null, maxDate = null;
    donnees.forEach(d => {
        const date = d['Date prise en charge'];
        if (date) {
            try {
                let dObj;
                if (typeof date === 'number') {
                    dObj = new Date((date - 25569) * 86400 * 1000);
                } else {
                    dObj = new Date(date);
                }
                if (!isNaN(dObj)) {
                    if (!minDate || dObj < minDate) minDate = dObj;
                    if (!maxDate || dObj > maxDate) maxDate = dObj;
                }
            } catch(e) {}
        }
    });
    
    if (!minDate || !maxDate) return 1;
    const diffTime = Math.abs(maxDate - minDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// ============================================================
// SECTION ZACC
// ============================================================
// ============================================================
// SECTION ZACC (Version Finale)
// ============================================================

// ============================================================
// SECTION ZACC (Zones d'Accidents Corporels)
// ============================================================

const ZACC = {
    donnees: [],
    donneesFiltrees: [],
    
    // ====== CHARGER FICHIER LOCAL ======
    chargerFichierLocal: function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = function(e) {
            const fichier = e.target.files[0];
            if (!fichier) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                    
                    jsonData.forEach(ligne => {
                        ligne['_source_fichier'] = fichier.name;
                    });
                    
                    ZACC.donnees = enrichirDonnees(jsonData);
                    document.getElementById('zaccFileStatus').textContent = `✅ ${ZACC.donnees.length} lignes`;
                    document.getElementById('zaccFileStatus').style.color = '#27ae60';
                    
                    ZACC.appliquerFiltres();
                } catch (error) {
                    console.error('Erreur:', error);
                    document.getElementById('zaccFileStatus').textContent = '❌ Erreur';
                    document.getElementById('zaccFileStatus').style.color = '#e74c3c';
                }
            };
            reader.readAsArrayBuffer(fichier);
        };
        input.click();
    },
    
    // ====== CHARGER DEPUIS GITHUB ======
    chargerFichierGitHub: function() {
        const nomFichier = 'DRRS.xlsx';
        const url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
        
        document.getElementById('zaccFileStatus').textContent = '📥 Téléchargement...';
        document.getElementById('zaccFileStatus').style.color = '#f39c12';
        
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Fichier ${nomFichier} non trouvé (${response.status})`);
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                
                jsonData.forEach(ligne => {
                    ligne['_source_fichier'] = nomFichier;
                });
                
                ZACC.donnees = enrichirDonnees(jsonData);
                document.getElementById('zaccFileStatus').textContent = `✅ ${ZACC.donnees.length} lignes`;
                document.getElementById('zaccFileStatus').style.color = '#27ae60';
                
                ZACC.appliquerFiltres();
            })
            .catch(error => {
                console.error('❌ Erreur:', error);
                document.getElementById('zaccFileStatus').textContent = '❌ Erreur';
                document.getElementById('zaccFileStatus').style.color = '#e74c3c';
                alert(`❌ Le fichier ${nomFichier} n'existe pas sur GitHub.`);
            });
    },
    
    // ====== APPLIQUER FILTRES ======
    appliquerFiltres: function() {
        if (this.donnees.length === 0) {
            document.getElementById('zaccTable').innerHTML = `<p style="text-align:center;color:#999;padding:40px;">Chargez le fichier DRRS pour afficher l'analyse ZACC</p>`;
            document.getElementById('zaccNiveau1').textContent = '0';
            document.getElementById('zaccNiveau2').textContent = '0';
            document.getElementById('zaccNiveau3').textContent = '0';
            return;
        }
        
        const periode = document.getElementById('zaccPeriodeFilter').value;
        
        // Déterminer les années à inclure
        let annees = [];
        if (periode.includes('-')) {
            const parts = periode.split('-');
            const debut = parseInt(parts[0]);
            const fin = parseInt(parts[1]);
            for (let a = debut; a <= fin; a++) {
                annees.push(a);
            }
        } else {
            annees = [parseInt(periode)];
        }
        
        // Filtrer par années
        this.donneesFiltrees = this.donnees.filter(d => {
            const date = d['Date prise en charge'] || d['Date et heure accident'];
            if (!date) return false;
            
            try {
                let dateObj;
                if (typeof date === 'number') {
                    dateObj = new Date((date - 25569) * 86400 * 1000);
                } else {
                    dateObj = new Date(date);
                }
                if (!isNaN(dateObj)) {
                    const annee = dateObj.getFullYear();
                    return annees.includes(annee);
                }
            } catch(e) {}
            return false;
        });
        
        this.calculerZACC(periode);
    },
    
    // ====== CALCULER ZACC ======
    calculerZACC: function(periode) {
        const container = document.getElementById('zaccTable');
        if (!container) return;
        
        if (this.donneesFiltrees.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">Aucune donnée pour la période ${periode}</p>`;
            document.getElementById('zaccNiveau1').textContent = '0';
            document.getElementById('zaccNiveau2').textContent = '0';
            document.getElementById('zaccNiveau3').textContent = '0';
            return;
        }
        
        const TRANCHE = 2000;
        const DECALAGE = 1000; // pour centrer les sections
        const PK_MIN = 0;
        const PK_MAX = 430000;
        
        const sections = {};
        
        this.donneesFiltrees.forEach(d => {
            const pk = parseInt(d['_pk_num'] || 0);
            if (pk < PK_MIN || pk > PK_MAX) return;
            
            // ✅ Section de 2 km centrée (53.0 – 55.0 au lieu de 52.0 – 54.0)
            const sectionStart = Math.floor((pk - DECALAGE) / TRANCHE) * TRANCHE + DECALAGE;
            const sectionEnd = sectionStart + TRANCHE;
            
            // Déterminer le sens
            const sens = d['Sens'] || '';
            let direction = 'Inconnu';
            if (sens.toLowerCase().includes('croissant')) {
                direction = 'Croissant';
            } else if (sens.toLowerCase().includes('décroissant') || sens.toLowerCase().includes('decroissant')) {
                direction = 'Décroissant';
            }
            
            // ✅ Déterminer la parité (Paire/Impaire)
            const pkInt = Math.floor(pk);
            const parite = (pkInt % 2 === 0) ? 'Paire' : 'Impaire';
            const categorie = `${parite} — ${direction}`;
            
            const key = `${sectionStart}-${sectionEnd}_${categorie}`;
            
            if (!sections[key]) {
                sections[key] = {
                    sectionStart: sectionStart,
                    sectionEnd: sectionEnd,
                    categorie: categorie,
                    direction: direction,
                    parite: parite,
                    total: 0,
                    corporelle: 0,
                    grave: 0
                };
            }
            
            sections[key].total++;
            
            // ✅ Accidents Corporels (Corporelle + Mortelle)
            const gravite = d['Gravité accident'];
            if (gravite === 'Corporelle' || gravite === 'Mortelle') {
                sections[key].corporelle++;
            }
            
            // ✅ Accidents Graves (tous les types BG)
            const bgUsager = parseInt(d['Nbr BG Usagers'] || 0);
            const bgPietonUsager = parseInt(d['Nbr BG Piéton Usager'] || 0);
            const bgPietonVagabond = parseInt(d['Nbr BG Piéton Vagabond'] || 0);
            const bgPietonRiverain = parseInt(d['Nbr BG Piéton Riverain'] || 0);
            const bgPietonIntervention = parseInt(d['Nbr BG Piéton Pers. D\'intervention'] || 0);
            
            const totalBG = bgUsager + bgPietonUsager + bgPietonVagabond + bgPietonRiverain + bgPietonIntervention;
            
            if (totalBG > 0) {
                sections[key].grave++;
            }
        });
        
        // Déterminer les niveaux
        const resultats = [];
        
        Object.values(sections).forEach(section => {
            const corporelle = section.corporelle;
            const grave = section.grave;
            
            let niveau = 0;
            let niveauLabel = '';
            
            if (corporelle >= 6 && grave >= 3) {
                niveau = 1;
                niveauLabel = 'Niveau 1';
            } else if (corporelle >= 6 && grave >= 2) {
                niveau = 2;
                niveauLabel = 'Niveau 2';
            } else if (corporelle >= 6 && grave >= 1) {
                niveau = 3;
                niveauLabel = 'Niveau 3';
            }
            
            if (niveau > 0) {
                resultats.push({
                    niveau: niveau,
                    niveauLabel: niveauLabel,
                    sectionStart: section.sectionStart,
                    sectionEnd: section.sectionEnd,
                    categorie: section.categorie,
                    direction: section.direction,
                    parite: section.parite,
                    total: section.total,
                    corporelle: section.corporelle,
                    grave: section.grave
                });
            }
        });
        
        // Trier par Section PK
        resultats.sort((a, b) => {
            if (a.sectionStart !== b.sectionStart) {
                return a.sectionStart - b.sectionStart;
            }
            return a.categorie.localeCompare(b.categorie);
        });
        
        // Statistiques
        const n1 = resultats.filter(r => r.niveau === 1).length;
        const n2 = resultats.filter(r => r.niveau === 2).length;
        const n3 = resultats.filter(r => r.niveau === 3).length;
        
        document.getElementById('zaccNiveau1').textContent = n1;
        document.getElementById('zaccNiveau2').textContent = n2;
        document.getElementById('zaccNiveau3').textContent = n3;
        
        // Affichage
        if (resultats.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#27ae60;padding:40px;">✅ Aucune zone ZACC détectée pour la période ${periode}</p>`;
            return;
        }
        
        let html = `<div style="padding:12px 16px;background:#f0f8ff;border-radius:10px;margin-bottom:15px;">
            <strong>📊 ZACC ${periode} ; par tranche de 2 Km et par sens de circulation.</strong>
            <div style="margin-top:8px;font-size:13px;color:#4a5a6a;">
                • ZACC 1 : ≥ 6 accidents corporels dont ≥ 3 accidents graves &nbsp;🔴<br>
                • ZACC 2 : ≥ 6 accidents corporels dont ≥ 2 accidents graves &nbsp;🟠<br>
                • ZACC 3 : ≥ 6 accidents corporels dont ≥ 1 accident grave &nbsp;🟡
            </div>
        </div>`;
        
        html += '<table><thead><tr>';
        html += '<th>Niveau</th><th>Section PK</th><th>Catégorie</th><th>Total Acc.</th><th>Acc. Corporels</th><th>Acc. Graves</th>';
        html += '</tr></thead><tbody>';
        
        resultats.forEach(r => {
            const niveauColor = r.niveau === 1 ? '#e74c3c' : (r.niveau === 2 ? '#e67e22' : '#f1c40f');
            const section = `${(r.sectionStart/1000).toFixed(1)} – ${(r.sectionEnd/1000).toFixed(1)}`;
            html += `<tr style="border-left:4px solid ${niveauColor};">
                <td><strong style="color:${niveauColor};">${r.niveauLabel}</strong></td>
                <td>PK ${section}</td>
                <td>${r.categorie}</td>
                <td><strong>${r.total}</strong></td>
                <td>${r.corporelle}</td>
                <td>${r.grave}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    },
    
    // ====== RÉINITIALISER ======
    reinitialiserFiltres: function() {
        document.getElementById('zaccPeriodeFilter').value = '2025-2026';
        this.appliquerFiltres();
    }
};



// ============================================================
// Convertir une date Excel (nombre) en objet Date
// ============================================================

function convertirDateExcel(valeur) {
    if (!valeur && valeur !== 0) return null;
    
    try {
        // Si c'est un nombre (format Excel)
        if (typeof valeur === 'number') {
            // Excel: 1 = 1 janvier 1900
            const date = new Date((valeur - 25569) * 86400 * 1000);
            if (!isNaN(date)) return date;
        }
        
        // Si c'est une chaîne de caractères
        if (typeof valeur === 'string') {
            let texte = valeur.trim();
            
            // Format "03/01/2026"
            let match = texte.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (match) {
                const jour = parseInt(match[1]);
                const mois = parseInt(match[2]) - 1;
                const annee = parseInt(match[3]);
                const date = new Date(annee, mois, jour);
                if (!isNaN(date)) return date;
            }
            
            // Format "03-01-2026"
            match = texte.match(/(\d{2})-(\d{2})-(\d{4})/);
            if (match) {
                const jour = parseInt(match[1]);
                const mois = parseInt(match[2]) - 1;
                const annee = parseInt(match[3]);
                const date = new Date(annee, mois, jour);
                if (!isNaN(date)) return date;
            }
            
            // Format "2026-01-03"
            match = texte.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                const annee = parseInt(match[1]);
                const mois = parseInt(match[2]) - 1;
                const jour = parseInt(match[3]);
                const date = new Date(annee, mois, jour);
                if (!isNaN(date)) return date;
            }
        }
        
        return null;
    } catch(e) {
        console.warn('Erreur conversion date:', e);
        return null;
    }
}
// ============================================================
// تنسيق التاريخ من رقم Excel إلى نص مقروء
// ============================================================

function formaterDate(valeur) {
    if (!valeur && valeur !== 0) return '';
    
    try {
        let dateObj;
        if (typeof valeur === 'number') {
            dateObj = new Date((valeur - 25569) * 86400 * 1000);
        } else {
            dateObj = new Date(valeur);
        }
        if (!isNaN(dateObj)) {
            const jour = String(dateObj.getDate()).padStart(2, '0');
            const mois = String(dateObj.getMonth() + 1).padStart(2, '0');
            const annee = dateObj.getFullYear();
            return jour + '/' + mois + '/' + annee;
        }
        return String(valeur);
    } catch(e) {
        return String(valeur);
    }
}

// ============================================================
// تنسيق PK (إضافة + قبل آخر 3 أرقام)
// ============================================================

function formaterPK(valeur) {
    if (!valeur && valeur !== 0) return '';
    const str = String(valeur).trim();
    if (str.length <= 3) return str;
    const debut = str.slice(0, -3);
    const fin = str.slice(-3);
    return debut + '+' + fin;
}