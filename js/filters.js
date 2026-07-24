// ============================================================
// 📦 FILTERS.JS - Gestion des filtres
// ============================================================

function mettreAJourFiltres() {
    const selectTroncon = document.getElementById('tronconFilter');
    const selectMois = document.getElementById('monthFilter');
    const selectSociete = document.getElementById('depanneurFilter');
    
    if (!selectTroncon || !selectMois) return;
    
    // ---- Tronçons ----
    const troncons = new Set();
    toutesLesDonnees.forEach(d => {
        if (d['_troncon'] && d['_troncon'] !== 'Inconnu') troncons.add(d['_troncon']);
    });
    const valTroncon = selectTroncon.value;
    selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
    ['T1', 'T2', 'T3', 'T4'].filter(t => troncons.has(t)).forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t + ' (' + getPkRange(t) + ')';
        selectTroncon.appendChild(opt);
    });
    if (troncons.has(valTroncon)) selectTroncon.value = valTroncon;
    else selectTroncon.value = 'all';
    
    // ---- Sociétés ----
    if (selectSociete) {
        const societes = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_societe'] && d['_societe'] !== 'Inconnue') societes.add(d['_societe']);
        });
        const valSociete = selectSociete.value;
        selectSociete.innerHTML = '<option value="all">Toutes les sociétés</option>';
        Object.keys(SOCIETES_DEPANNAGE).filter(s => societes.has(s)).forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            selectSociete.appendChild(opt);
        });
        if (societes.has(valSociete)) selectSociete.value = valSociete;
        else selectSociete.value = 'all';
    }
    
    // ---- Mois ----
    const moisExistants = new Set();
    toutesLesDonnees.forEach(d => {
        if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) moisExistants.add(d['_mois']);
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
}

// ============================================================
// APPLIQUER FILTRES - VERSION CORRIGÉE
// ============================================================
function appliquerFiltres() {
    console.log('===== APPLIQUER FILTRES =====');
    console.log('Nombre total de données:', toutesLesDonnees.length);
    
    // Si aucune donnée, ne rien faire
    if (!toutesLesDonnees || toutesLesDonnees.length === 0) {
        console.log('📭 Aucune donnée à filtrer');
        
        // Afficher un message dans les tableaux
        const tables = ['analyseTable', 'intervenantsTable', 'depanneursTable'];
        tables.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = `<div class="status-empty">
                    <h3>📭 Aucune donnée</h3>
                    <p>Chargez des fichiers Excel pour commencer</p>
                </div>`;
            }
        });
        return;
    }
    
    // Récupérer les valeurs des filtres
    const troncon = document.getElementById('tronconFilter').value;
    const mois = document.getElementById('monthFilter').value;
    const societe = document.getElementById('depanneurFilter').value;
    
    console.log('Filtres appliqués:', { troncon, mois, societe });
    
    // Filtrer les données
    donneesFiltrees = toutesLesDonnees.filter(d => {
        if (troncon !== 'all' && d['_troncon'] !== troncon) return false;
        if (mois !== 'all' && d['_mois'] !== parseInt(mois)) return false;
        if (societe !== 'all' && d['_societe'] !== societe) return false;
        return true;
    });
    
    console.log('Données après filtrage:', donneesFiltrees.length);
    
    // Mettre à jour chaque section
    if (typeof mettreAJourAnalyse === 'function') {
        mettreAJourAnalyse();
    }
    if (typeof mettreAJourIntervenants === 'function') {
        mettreAJourIntervenants();
    }
    if (typeof mettreAJourDepanneurs === 'function') {
        mettreAJourDepanneurs();
    }
    if (typeof mettreAJourGraphiques === 'function') {
        mettreAJourGraphiques();
    }
}

function reinitialiserFiltres() {
    document.getElementById('tronconFilter').value = 'all';
    document.getElementById('monthFilter').value = 'all';
    document.getElementById('depanneurFilter').value = 'all';
    document.getElementById('interventionFilter').value = 'depannage';
    appliquerFiltres();
}

function changerPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.nav-btn[data-page="' + page + '"]');
    if (btn) btn.classList.add('active');
    
    // إظهار/إخفاء الفلاتر حسب الصفحة
    const interventionGroup = document.getElementById('interventionFilterGroup');
    const depGroup = document.getElementById('depanneurFilterGroup');
    
    if (page === 'intervenants') {
        if (interventionGroup) interventionGroup.style.display = 'flex';
        if (depGroup) depGroup.style.display = 'none';
    } else if (page === 'depanneurs') {
        if (interventionGroup) interventionGroup.style.display = 'none';
        if (depGroup) depGroup.style.display = 'flex';
    } else {
        if (interventionGroup) interventionGroup.style.display = 'none';
        if (depGroup) depGroup.style.display = 'none';
    }
}

// ---------- Événements des filtres ----------
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('tronconFilter').addEventListener('change', appliquerFiltres);
    document.getElementById('monthFilter').addEventListener('change', appliquerFiltres);
    document.getElementById('depanneurFilter').addEventListener('change', appliquerFiltres);
    document.getElementById('interventionFilter').addEventListener('change', appliquerFiltres);
});