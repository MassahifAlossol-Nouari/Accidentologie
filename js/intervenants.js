// ============================================================
// 📦 INTERVENANTS.JS - Délais d'Intervention (COMPLET)
// ============================================================

let chartIntervenants = null;

// ============================================================
// 1. METTRE À JOUR LE TABLEAU + STATISTIQUES + GRAPHIQUE
// ============================================================

function mettreAJourIntervenants() {
    const container = document.getElementById('intervenantsTable');
    if (!container) return;
    
    // Récupérer les filtres
    const troncon = document.getElementById('tronconFilter2').value;
    const mois = document.getElementById('monthFilter2').value;
    const typeIntervention = document.getElementById('interventionFilter').value;
    const pma = document.getElementById('pmaFilter').value;
    
    // ====== 1. Déterminer la colonne de délai ======
    let cleDelai = '_delai_depannage';
    let nomColonne = 'Dépannage';
    let emoji = '🚛';
    
    switch(typeIntervention) {
        case 'depannage': cleDelai = '_delai_depannage'; nomColonne = 'Dépannage'; emoji = '🚛'; break;
        case 'patrouilleur': cleDelai = '_delai_patrouilleur'; nomColonne = 'Patrouilleur'; emoji = '👮'; break;
        case 'gr': cleDelai = '_delai_gr'; nomColonne = 'GR'; emoji = '🚔'; break;
        case 'pc': cleDelai = '_delai_pc'; nomColonne = 'PC'; emoji = '🚑'; break;
        default: cleDelai = '_delai_depannage'; nomColonne = 'Dépannage'; emoji = '🚛';
    }
    
    // ====== 2. Filtrer les données ======
    let donnees = toutesLesDonnees || [];
    
    if (troncon !== 'all') {
        donnees = donnees.filter(d => d['_troncon'] === troncon);
    }
    if (mois !== 'all') {
        donnees = donnees.filter(d => d['_mois'] === parseInt(mois));
    }
    
    // ====== 3. Filtre PMA (basé sur les PK) ======
    if (pma !== 'all') {
        // Récupérer les données des PMA depuis localStorage (paramètres)
        const gendarmerieData = JSON.parse(localStorage.getItem('config_gendarmerie')) || [];
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
    
    if (donnees.length === 0) {
        container.innerHTML = `<div class="status-empty">
            <h3>📭 Aucune donnée</h3>
            <p>Ajustez les filtres ou chargez des fichiers</p>
        </div>`;
        document.getElementById('delaiMin').textContent = '-';
        document.getElementById('delaiMax').textContent = '-';
        document.getElementById('delaiMoyen').textContent = '-';
        document.getElementById('delaiCount').textContent = '0';
        return;
    }
    
    // ====== 4. Calculer les statistiques ======
    const delais = donnees.map(d => d[cleDelai]).filter(d => d);
    mettreAJourStatistiques(delais);
    
    // ====== 5. Regrouper par mois et tronçon ======
    const parMoisTroncon = {};
    donnees.forEach(d => {
        const moisNom = d['_nom_mois'] || 'Inconnu';
        const tronconNom = d['_troncon'] || 'Inconnu';
        const delai = d[cleDelai];
        if (moisNom === 'Inconnu' || tronconNom === 'Inconnu' || !delai) return;
        
        if (!parMoisTroncon[moisNom]) parMoisTroncon[moisNom] = {};
        if (!parMoisTroncon[moisNom][tronconNom]) {
            parMoisTroncon[moisNom][tronconNom] = [];
        }
        parMoisTroncon[moisNom][tronconNom].push(delai);
    });
    
    // ====== 6. Calculer les moyennes ======
    const resultats = {};
    for (const [mois, troncons] of Object.entries(parMoisTroncon)) {
        resultats[mois] = {};
        for (const [troncon, delaisList] of Object.entries(troncons)) {
            resultats[mois][troncon] = moyenneTemps(delaisList);
        }
    }
    
    // ====== 7. Construire le tableau ======
    const ordreTroncons = ['T1', 'T2', 'T3', 'T4'];
    const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                       'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    
    const moisExistants = Object.keys(resultats)
        .filter(m => m !== 'Inconnu')
        .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
    
    if (moisExistants.length === 0) {
        container.innerHTML = `<div class="status-empty">
            <h3>📭 Aucune donnée de délais</h3>
            <p>Pour "${nomColonne}"</p>
        </div>`;
        return;
    }
    
    let html = `<div style="padding:10px 16px;background:#e8f4fd;border-radius:10px;margin-bottom:15px;">
        <span><strong>🛠️ Type d'intervention :</strong> ${emoji} ${nomColonne}</span>
        <span style="margin-left:20px;"><strong>📊 Total :</strong> ${donnees.length} interventions</span>
    </div>`;
    
    html += '<table><thead><tr>';
    html += '<th>Mois / Catégorie</th>';
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
    
    // ====== 8. Mettre à jour le graphique ======
    mettreAJourGraphiqueIntervenants(donnees, cleDelai, nomColonne);
}

// ============================================================
// 2. STATISTIQUES
// ============================================================

function mettreAJourStatistiques(delais) {
    if (!delais || delais.length === 0) {
        document.getElementById('delaiMin').textContent = '-';
        document.getElementById('delaiMax').textContent = '-';
        document.getElementById('delaiMoyen').textContent = '-';
        document.getElementById('delaiCount').textContent = '0';
        return;
    }
    
    // تحويل الأوقات إلى ثواني
    const enSecondes = delais.map(t => {
        const parts = t.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
        } else if (parts.length === 3) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        return 0;
    }).filter(s => s > 0);
    
    if (enSecondes.length === 0) {
        document.getElementById('delaiMin').textContent = '-';
        document.getElementById('delaiMax').textContent = '-';
        document.getElementById('delaiMoyen').textContent = '-';
        document.getElementById('delaiCount').textContent = '0';
        return;
    }
    
    const min = Math.min(...enSecondes);
    const max = Math.max(...enSecondes);
    const moyenne = enSecondes.reduce((a,b) => a+b, 0) / enSecondes.length;
    
    document.getElementById('delaiMin').textContent = formatTemps(min);
    document.getElementById('delaiMax').textContent = formatTemps(max);
    document.getElementById('delaiMoyen').textContent = formatTemps(moyenne);
    document.getElementById('delaiCount').textContent = enSecondes.length;
}

// ============================================================
// تنسيق الوقت (HH:MM:SS)
// ============================================================

function formatTemps(secondes) {
    if (secondes === undefined || secondes === null || isNaN(secondes)) return '-';
    const h = Math.floor(secondes / 3600);
    const m = Math.floor((secondes % 3600) / 60);
    const s = Math.round(secondes % 60);
    return String(h).padStart(2, '0') + ':' + 
           String(m).padStart(2, '0') + ':' + 
           String(s).padStart(2, '0');
}

// ============================================================
// 3. GRAPHIQUE ÉVOLUTION DES DÉLAIS
// ============================================================

function mettreAJourGraphiqueIntervenants(donnees, cleDelai, nomColonne) {
    const ctx = document.getElementById('chartIntervenants');
    if (!ctx) return;
    if (chartIntervenants) { chartIntervenants.destroy(); chartIntervenants = null; }
    
    if (!donnees || donnees.length === 0) return;
    
    // Regrouper par mois
    const parMois = {};
    donnees.forEach(d => {
        const mois = d['_nom_mois'] || 'Inconnu';
        const delai = d[cleDelai];
        if (!delai || mois === 'Inconnu') return;
        if (!parMois[mois]) parMois[mois] = [];
        parMois[mois].push(delai);
    });
    
    const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                       'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const moisExistants = Object.keys(parMois)
        .filter(m => m !== 'Inconnu')
        .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
    
    if (moisExistants.length === 0) return;
    
    // حساب المتوسط لكل شهر (بالثواني)
    const labels = moisExistants;
    const data = moisExistants.map(m => {
        const moyenne = moyenneTemps(parMois[m]);
        if (!moyenne) return 0;
        const parts = moyenne.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
        } else if (parts.length === 3) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        return 0;
    });
    
    chartIntervenants = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Délai moyen (HH:MM:SS)',
                data: data,
                borderColor: '#2d7db8',
                backgroundColor: 'rgba(45,125,184,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#1a5f8a',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const secondes = context.parsed.y;
                            const h = Math.floor(secondes / 3600);
                            const m = Math.floor((secondes % 3600) / 60);
                            const s = Math.round(secondes % 60);
                            return 'Délai moyen: ' + 
                                   String(h).padStart(2,'0') + ':' + 
                                   String(m).padStart(2,'0') + ':' + 
                                   String(s).padStart(2,'0');
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            const h = Math.floor(value / 3600);
                            const m = Math.floor((value % 3600) / 60);
                            const s = Math.round(value % 60);
                            return String(h).padStart(2,'0') + ':' + 
                                   String(m).padStart(2,'0') + ':' + 
                                   String(s).padStart(2,'0');
                        }
                    }
                }
            }
        }
    });
}

// ============================================================
// 4. REMPLIR LE FILTRE PMA (depuis les paramètres)
// ============================================================

function remplirFiltrePMA() {
    const select = document.getElementById('pmaFilter');
    if (!select) return;
    
    // Lire les données des PMA depuis localStorage
    let gendarmerieData = [];
    try {
        const data = localStorage.getItem('config_gendarmerie');
        if (data) {
            gendarmerieData = JSON.parse(data);
        }
    } catch(e) {}
    
    select.innerHTML = '<option value="all">Toutes les PMA</option>';
    gendarmerieData.forEach(pma => {
        const opt = document.createElement('option');
        opt.value = pma.nom;
        opt.textContent = pma.nom + ' (' + pma.axe + ')';
        select.appendChild(opt);
    });
}

// ============================================================
// 5. APPELER remplirFiltrePMA AU CHARGEMENT DE LA PAGE
// ============================================================

// Sauvegarder la fonction originale changerPage
const originalChangerPageInterv = window.changerPage || function(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.nav-btn[data-page="' + page + '"]');
    if (btn) btn.classList.add('active');
};

// Redéfinir changerPage pour inclure l'initialisation du filtre PMA
window.changerPage = function(page) {
    originalChangerPageInterv(page);
    if (page === 'intervenants') {
        setTimeout(function() {
            remplirFiltrePMA();
            appliquerFiltres();
        }, 200);
    }
};

console.log('📦 INTERVENANTS.JS chargé!');