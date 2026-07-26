// ============================================================
// 📦 FILTERS.JS - Gestion des filtres (CORRIGÉ PMA)
// ============================================================

// ============================================================
// 1. LIRE LES PMA DEPUIS LES PARAMÈTRES
// ============================================================

function getPMA() {
    try {
        // المفتاح الصحيح المستخدم في paramètres.js
        const data = localStorage.getItem('config_gendarmerie');
        console.log('🔍 localStorage config_gendarmerie:', data);
        
        if (data) {
            const pmaData = JSON.parse(data);
            if (pmaData && pmaData.length > 0) {
                console.log('📂 PMA chargées depuis les paramètres:', pmaData.length);
                return pmaData;
            }
        }
    } catch(e) {
        console.warn('Erreur chargement PMA:', e);
    }
    
    // محاولة قراءة من مفتاح آخر إن وجد
    try {
        const data = localStorage.getItem('config_gendarmerie');
        if (data) {
            const pmaData = JSON.parse(data);
            if (pmaData && pmaData.length > 0) {
                return pmaData;
            }
        }
    } catch(e) {}
    
    console.warn('⚠️ Aucune PMA trouvée dans les paramètres');
    return [];
}

// ============================================================
// 2. METTRE À JOUR LE FILTRE PMA
// ============================================================

function mettreAJourFiltrePMA() {
    const selectPMA = document.getElementById('pmaFilter');
    if (!selectPMA) {
        console.warn('⚠️ select#pmaFilter non trouvé');
        return;
    }
    
    console.log('🔄 Mise à jour du filtre PMA...');
    
    const pmaData = getPMA();
    const val = selectPMA.value;
    
    selectPMA.innerHTML = '<option value="all">Toutes les PMA</option>';
    
    if (pmaData.length === 0) {
        const opt = document.createElement('option');
        opt.value = 'empty';
        opt.textContent = '⚠️ Aucune PMA configurée';
        opt.disabled = true;
        selectPMA.appendChild(opt);
        console.warn('⚠️ Aucune PMA trouvée');
    } else {
        pmaData.forEach(pma => {
            const opt = document.createElement('option');
            opt.value = pma.nom;
            opt.textContent = pma.nom + ' (' + pma.axe + ')';
            selectPMA.appendChild(opt);
        });
        console.log('✅ PMA chargées:', pmaData.length);
    }
    
    // Restaurer la valeur si elle existe
    const existe = pmaData.some(p => p.nom === val);
    if (existe) selectPMA.value = val;
    else selectPMA.value = 'all';
}

// ============================================================
// 3. METTRE À JOUR TOUS LES FILTRES
// ============================================================

function mettreAJourFiltres() {
    console.log('🔄 Mise à jour des listes de filtres...');
    
    if (!toutesLesDonnees || toutesLesDonnees.length === 0) {
        console.log('📭 Aucune donnée');
        return;
    }
    
    // ---- Tronçons ----
    const troncons = new Set();
    toutesLesDonnees.forEach(d => {
        if (d['_troncon'] && d['_troncon'] !== 'Inconnu') {
            troncons.add(d['_troncon']);
        }
    });
    
    const tronconSelects = [
        'tronconFilter', 'tronconFilter2', 'tronconFilter3', 
        'tronconFilter4', 'graphTronconFilter'
    ];
    tronconSelects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const val = select.value;
        select.innerHTML = '<option value="all">Tous les tronçons</option>';
        ['T1', 'T2', 'T3', 'T4'].filter(t => troncons.has(t)).forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRange(t) + ')';
            select.appendChild(opt);
        });
        if (troncons.has(val)) select.value = val;
        else select.value = 'all';
    });
    
    // ---- Mois ----
    const moisExistants = new Set();
    toutesLesDonnees.forEach(d => {
        if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
            moisExistants.add(d['_mois']);
        }
    });
    const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                      'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const moisTries = Array.from(moisExistants).sort((a,b) => a-b);
    
    const moisSelects = [
        'monthFilter', 'monthFilter2', 'monthFilter3', 
        'monthFilter4', 'graphMoisFilter'
    ];
    moisSelects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const val = select.value;
        select.innerHTML = '<option value="all">Tous les mois</option>';
        moisTries.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            select.appendChild(opt);
        });
        if (moisTries.includes(parseInt(val))) select.value = val;
        else select.value = 'all';
    });
    
    // ---- Sociétés ----
    const selectSociete = document.getElementById('depanneurFilter');
    if (selectSociete) {
        const societes = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_societe'] && d['_societe'] !== 'Inconnue') {
                societes.add(d['_societe']);
            }
        });
        const val = selectSociete.value;
        selectSociete.innerHTML = '<option value="all">Toutes les sociétés</option>';
        Object.keys(SOCIETES_DEPANNAGE).filter(s => societes.has(s)).forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            selectSociete.appendChild(opt);
        });
        if (societes.has(val)) selectSociete.value = val;
        else selectSociete.value = 'all';
    }
    
    // ---- PMA (appel spécifique) ----
    mettreAJourFiltrePMA();
    
    console.log('✅ Filtres mis à jour');
}

// ============================================================
// 4. APPLIQUER LES FILTRES (AVEC PMA)
// ============================================================

function appliquerFiltres() {
    console.log('===== APPLIQUER FILTRES =====');
    
    if (!toutesLesDonnees || toutesLesDonnees.length === 0) {
        console.log('📭 Aucune donnée');
        return;
    }
    
    const pageActive = document.querySelector('.page.active');
    const pageId = pageActive ? pageActive.id : '';
    console.log('📄 Page:', pageId);
    
    // ====== PAGE ANALYSE ======
    if (pageId === 'page-analyse') {
        const troncon = document.getElementById('tronconFilter').value;
        const mois = document.getElementById('monthFilter').value;
        
        donneesFiltrees = toutesLesDonnees.filter(d => {
            if (troncon !== 'all' && d['_troncon'] !== troncon) return false;
            if (mois !== 'all' && d['_mois'] !== parseInt(mois)) return false;
            return true;
        });
        if (typeof mettreAJourAnalyse === 'function') mettreAJourAnalyse();
    }
    
    // ====== PAGE INTERVENANTS (avec PMA) ======
    else if (pageId === 'page-intervenants') {
        const troncon = document.getElementById('tronconFilter2').value;
        const mois = document.getElementById('monthFilter2').value;
        const pma = document.getElementById('pmaFilter').value;
        
        console.log('🔍 Filtres:', { troncon, mois, pma });
        
        // 1. Filtrer par tronçon et mois
        donneesFiltrees = toutesLesDonnees.filter(d => {
            if (troncon !== 'all' && d['_troncon'] !== troncon) return false;
            if (mois !== 'all' && d['_mois'] !== parseInt(mois)) return false;
            return true;
        });
        
        console.log('📊 Après tronçon/mois:', donneesFiltrees.length);
        
        // 2. Filtrer par PMA
        if (pma !== 'all' && pma !== 'empty') {
            const pmaData = getPMA();
            const pmaInfo = pmaData.find(p => p.nom === pma);
            
            if (pmaInfo) {
                const pkMin = parseInt(pmaInfo.pk_min);
                const pkMax = parseInt(pmaInfo.pk_max);
                console.log('🔍 PMA:', pma, 'PK:', pkMin, '-', pkMax);
                
                donneesFiltrees = donneesFiltrees.filter(d => {
                    const pk = parseInt(d['_pk_num'] || 0);
                    return pk >= pkMin && pk <= pkMax;
                });
                console.log('📊 Après PMA:', donneesFiltrees.length);
            } else {
                console.warn('⚠️ PMA non trouvée:', pma);
            }
        }
        
        if (typeof mettreAJourIntervenants === 'function') mettreAJourIntervenants();
    }
    
    // ====== PAGE DEPANNEURS ======
    else if (pageId === 'page-depanneurs') {
        const troncon = document.getElementById('tronconFilter3').value;
        const mois = document.getElementById('monthFilter3').value;
        const societe = document.getElementById('depanneurFilter').value;
        
        donneesFiltrees = toutesLesDonnees.filter(d => {
            if (troncon !== 'all' && d['_troncon'] !== troncon) return false;
            if (mois !== 'all' && d['_mois'] !== parseInt(mois)) return false;
            if (societe !== 'all' && d['_societe'] !== societe) return false;
            return true;
        });
        if (typeof mettreAJourDepanneurs === 'function') mettreAJourDepanneurs();
    }
    
    // ====== PAGE GRAPHIQUES ======
    else if (pageId === 'page-graphiques') {
        const troncon = document.getElementById('graphTronconFilter').value;
        const mois = document.getElementById('graphMoisFilter').value;
        
        donneesFiltrees = toutesLesDonnees.filter(d => {
            if (troncon !== 'all' && d['_troncon'] !== troncon) return false;
            if (mois !== 'all' && d['_mois'] !== parseInt(mois)) return false;
            return true;
        });
        if (typeof mettreAJourDashboard === 'function') mettreAJourDashboard();
    }
    
    // ====== PAGE CHARGEMENT ======
    else {
        donneesFiltrees = toutesLesDonnees;
    }
}

// ============================================================
// 5. RÉINITIALISER
// ============================================================

function reinitialiserFiltres() {
    console.log('🔄 Réinitialisation...');
    ['tronconFilter', 'tronconFilter2', 'tronconFilter3', 'tronconFilter4', 'graphTronconFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 'all';
    });
    ['monthFilter', 'monthFilter2', 'monthFilter3', 'monthFilter4', 'graphMoisFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 'all';
    });
    const dep = document.getElementById('depanneurFilter');
    if (dep) dep.value = 'all';
    const inter = document.getElementById('interventionFilter');
    if (inter) inter.value = 'depannage';
    const pma = document.getElementById('pmaFilter');
    if (pma) pma.value = 'all';
    appliquerFiltres();
}

// ============================================================
// 6. CHANGER PAGE
// ============================================================

function changerPage(page) {
    console.log('📄 Page:', page);
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.nav-btn[data-page="' + page + '"]');
    if (btn) btn.classList.add('active');
    
    const interventionGroup = document.getElementById('interventionFilterGroup');
    const depGroup = document.getElementById('depanneurFilterGroup');
    const pmaGroup = document.getElementById('pmaFilterGroup');
    
    if (interventionGroup) interventionGroup.style.display = 'none';
    if (depGroup) depGroup.style.display = 'none';
    if (pmaGroup) pmaGroup.style.display = 'none';
    
    if (page === 'intervenants') {
        if (interventionGroup) interventionGroup.style.display = 'flex';
        if (pmaGroup) pmaGroup.style.display = 'flex';
        // Rafraîchir le filtre PMA
        setTimeout(mettreAJourFiltrePMA, 50);
    } else if (page === 'depanneurs') {
        if (depGroup) depGroup.style.display = 'flex';
    }
    
    setTimeout(() => appliquerFiltres(), 100);
}

// ============================================================
// 7. ÉVÉNEMENTS
// ============================================================

function initialiserEvenementsFiltres() {
    console.log('🔧 Événements...');
    
    const allSelects = [
        'tronconFilter', 'tronconFilter2', 'tronconFilter3', 'tronconFilter4', 'graphTronconFilter',
        'monthFilter', 'monthFilter2', 'monthFilter3', 'monthFilter4', 'graphMoisFilter',
        'depanneurFilter', 'interventionFilter', 'pmaFilter'
    ];
    
    allSelects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', function() {
                console.log('🔄', this.id, '=', this.value);
                appliquerFiltres();
            });
        }
    });
    console.log('✅ Événements initialisés');
}

// ============================================================
// 8. INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM chargé');
    initialiserEvenementsFiltres();
    setTimeout(() => {
        mettreAJourFiltres();
        appliquerFiltres();
    }, 200);
});

console.log('📦 FILTERS.JS chargé!');