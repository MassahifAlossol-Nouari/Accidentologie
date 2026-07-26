// ============================================================
// 📦 GRAPHIQUES.JS - Dashboard avec filtres spécifiques
// ============================================================

let dashChartEvolution = null;
let dashChartCauses = null;
let dashChartPeriode = null;
let dashChartJour = null;

// ============================================================
// 1. DONNÉES DE BASE
// ============================================================

function getDonneesFiltrees() {
    const troncon = document.getElementById('graphTronconFilter');
    const mois = document.getElementById('graphMoisFilter');
    
    const tronconVal = troncon ? troncon.value : 'all';
    const moisVal = mois ? mois.value : 'all';
    
    let donnees = toutesLesDonnees || [];
    
    if (tronconVal !== 'all') {
        donnees = donnees.filter(d => d['_troncon'] === tronconVal);
    }
    if (moisVal !== 'all') {
        donnees = donnees.filter(d => d['_mois'] === parseInt(moisVal));
    }
    
    return donnees;
}

// ============================================================
// 2. METTRE À JOUR LE DASHBOARD
// ============================================================

function mettreAJourDashboard() {
    console.log('📈 Mise à jour du Dashboard...');
    const donnees = getDonneesFiltrees();
    if (donnees.length === 0) {
        console.log('📭 Aucune donnée');
        return;
    }
    mettreAJourKPI(donnees);
    mettreAJourGraphiqueEvolution();
    mettreAJourGraphiqueCauses();
    mettreAJourGraphiquePeriode();
    mettreAJourGraphiqueJour();
}

// ============================================================
// 3. KPI - CORRIGÉ
// ============================================================

function mettreAJourKPI(donnees) {
    // ---- Total Accidents ----
    document.getElementById('kpiTotal').textContent = donnees.length;
    
    // ---- Moyenne par jour ----
    const joursSet = new Set();
    donnees.forEach(d => {
        const date = convertirDate(d['Date et heure accident'] || d['Date prise en charge']);
        if (date) {
            const key = formaterDate(date);
            joursSet.add(key);
        }
    });
    const nbJours = joursSet.size || 1;
    document.getElementById('kpiMoyenne').textContent = (donnees.length / nbJours).toFixed(1) + '/jour';
    
    // ---- Jour le plus dangereux ----
    const parJour = {};
    donnees.forEach(d => {
        const date = convertirDate(d['Date et heure accident'] || d['Date prise en charge']);
        if (date) {
            const key = formaterDate(date);
            parJour[key] = (parJour[key] || 0) + 1;
        }
    });
    let maxJour = '-', maxCount = 0;
    for (const [jour, count] of Object.entries(parJour)) {
        if (count > maxCount) {
            maxCount = count;
            maxJour = jour;
        }
    }
    document.getElementById('kpiJourDangereux').textContent = maxJour + ' (' + maxCount + ' accidents)';
    
    // ---- Mois le plus dangereux ----
    const parMois = {};
    donnees.forEach(d => {
        const date = convertirDate(d['Date et heure accident'] || d['Date prise en charge']);
        if (date) {
            const key = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            parMois[key] = (parMois[key] || 0) + 1;
        }
    });
    let maxMois = '-', maxMoisCount = 0;
    for (const [mois, count] of Object.entries(parMois)) {
        if (count > maxMoisCount) {
            maxMoisCount = count;
            maxMois = mois;
        }
    }
    document.getElementById('kpiMoisDangereux').textContent = maxMois + ' (' + maxMoisCount + ')';
    
    // ---- Cause principale ----
    const causes = {};
    donnees.forEach(d => {
        const c = d['Cause principale'] || 'Non spécifiée';
        causes[c] = (causes[c] || 0) + 1;
    });
    let maxCause = '-', maxCauseCount = 0;
    for (const [cause, count] of Object.entries(causes)) {
        if (count > maxCauseCount) {
            maxCauseCount = count;
            maxCause = cause;
        }
    }
    document.getElementById('kpiCause').textContent = maxCause + ' (' + maxCauseCount + ')';
    
    // ---- Tronçon le plus dangereux ----
    const troncons = {};
    donnees.forEach(d => {
        const t = d['_troncon'] || 'Inconnu';
        troncons[t] = (troncons[t] || 0) + 1;
    });
    let maxTroncon = '-', maxTronconCount = 0;
    for (const [t, count] of Object.entries(troncons)) {
        if (count > maxTronconCount) {
            maxTronconCount = count;
            maxTroncon = t;
        }
    }
    document.getElementById('kpiTroncon').textContent = maxTroncon + ' (' + maxTronconCount + ')';
}


// ============================================================
// 4. GRAPHIQUE: ÉVOLUTION QUOTIDIENNE
// ============================================================
// ============================================================
// 4. GRAPHIQUE: ÉVOLUTION QUOTIDIENNE (CORRIGÉ)
// ============================================================

function mettreAJourGraphiqueEvolution() {
    const ctx = document.getElementById('dashChartEvolution');
    if (!ctx) return;
    if (dashChartEvolution) { dashChartEvolution.destroy(); dashChartEvolution = null; }
    
    const donnees = getDonneesFiltrees();
    if (donnees.length === 0) {
        console.log('📭 Aucune donnée pour Évolution');
        return;
    }
    
    const periode = parseInt(document.getElementById('evoPeriodeFilter').value) || 30;
    const unite = document.getElementById('evoUniteFilter').value;
    
    console.log('📊 Données pour Évolution:', donnees.length);
    
    // ====== Regrouper par date ======
    const parDate = {};
    let datesValides = 0;
    
    donnees.forEach(d => {
        const date = convertirDate(d['Date et heure accident'] || d['Date prise en charge']);
        if (!date) return;
        
        datesValides++;
        
        let key;
        if (unite === 'day') {
            key = formaterDate(date);
        } else if (unite === 'week') {
            const weekNum = getWeekNumber(date);
            key = 'S' + weekNum + ' ' + date.getFullYear();
        } else {
            key = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        }
        parDate[key] = (parDate[key] || 0) + 1;
    });
    
    console.log('📊 Dates valides:', datesValides, '/', donnees.length);
    console.log('📊 Groupes uniques:', Object.keys(parDate).length);
    
    // ====== Trier les dates ======
    let sorted = Object.keys(parDate).sort((a, b) => {
        try {
            const dateA = new Date(a);
            const dateB = new Date(b);
            if (!isNaN(dateA) && !isNaN(dateB)) {
                return dateA - dateB;
            }
            return a.localeCompare(b);
        } catch(e) {
            return a.localeCompare(b);
        }
    });
    
    if (periode !== 'all' && !isNaN(periode) && periode > 0) {
        sorted = sorted.slice(-periode);
    }
    
    const labels = sorted;
    const data = labels.map(k => parDate[k] || 0);
    
    if (labels.length === 0) {
        console.log('📭 Aucune date valide');
        dashChartEvolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Aucune donnée'],
                datasets: [{
                    label: "Accidents",
                    data: [0],
                    borderColor: '#ccc'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });
        return;
    }
    
    dashChartEvolution = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Nombre d'accidents",
                data: data,
                borderColor: '#2d7db8',
                backgroundColor: 'rgba(45,125,184,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#1a5f8a',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' accident(s)';
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                x: { ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 15 } }
            }
        }
    });
    
    console.log('✅ Graphique Évolution créé avec', labels.length, 'points');
}
// ============================================================
// Fonction getWeekNumber (pour les semaines)
// ============================================================

function getWeekNumber(d) {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function getWeekNumber(d) {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// ============================================================
// 5. GRAPHIQUE: RÉPARTITION PAR PÉRIODE (24h)
// ============================================================

function mettreAJourGraphiquePeriode() {
    const ctx = document.getElementById('dashChartPeriode');
    if (!ctx) return;
    if (dashChartPeriode) { dashChartPeriode.destroy(); dashChartPeriode = null; }
    
    let donnees = getDonneesFiltrees();
    if (donnees.length === 0) return;
    
    // Filtrer par tronçon spécifique pour ce graphique
    const tronconFilter = document.getElementById('periodeTronconFilter').value;
    if (tronconFilter !== 'all') {
        donnees = donnees.filter(d => d['_troncon'] === tronconFilter);
    }
    if (donnees.length === 0) return;
    
    const tranche = parseInt(document.getElementById('periodeTrancheFilter').value) || 4;
    const nbTranches = 24 / tranche;
    
    // Initialiser les tranches
    const tranches = {};
    for (let i = 0; i < nbTranches; i++) {
        const debut = i * tranche;
        const fin = debut + tranche - 1;
        tranches[debut + 'h-' + fin + 'h'] = 0;
    }
    
    donnees.forEach(d => {
        const heure = d['_heure_accident'];
        if (!heure) return;
        const h = parseInt(heure.split(':')[0]);
        if (isNaN(h) || h < 0 || h > 23) return;
        const index = Math.floor(h / tranche);
        const debut = index * tranche;
        const fin = debut + tranche - 1;
        const key = debut + 'h-' + fin + 'h';
        if (key in tranches) tranches[key]++;
    });
    
    const labels = Object.keys(tranches);
    const data = Object.values(tranches);
    const couleurs = ['#2d7db8', '#4a90c4', '#6ba3d4', '#8bb6e0', '#abc9ec', '#c4dbf5'];
    
    if (data.every(d => d === 0)) return;
    
    dashChartPeriode = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Accidents",
                data: data,
                backgroundColor: couleurs.slice(0, labels.length),
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
}

// ============================================================
// 6. GRAPHIQUE: RÉPARTITION PAR CAUSE
// ============================================================

function mettreAJourGraphiqueCauses() {
    const ctx = document.getElementById('dashChartCauses');
    if (!ctx) return;
    if (dashChartCauses) { dashChartCauses.destroy(); dashChartCauses = null; }
    
    const donnees = getDonneesFiltrees();
    if (donnees.length === 0) return;
    
    const type = document.getElementById('causeTypeFilter').value;
    const limit = parseInt(document.getElementById('causeLimitFilter').value) || 8;
    
    const causeKey = (type === 'principale') ? 'Cause principale' : 'Cause secondaire';
    
    const causes = {};
    donnees.forEach(d => {
        const cause = d[causeKey] || 'Non spécifiée';
        causes[cause] = (causes[cause] || 0) + 1;
    });
    
    let trie = Object.entries(causes).sort((a,b) => b[1]-a[1]);
    if (limit !== 'all' && !isNaN(limit)) {
        trie = trie.slice(0, limit);
    }
    const labels = trie.map(t => t[0]);
    const data = trie.map(t => t[1]);
    
    if (labels.length === 0) return;
    
    dashChartCauses = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Accidents",
                data: data,
                backgroundColor: '#2d7db8',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// ============================================================
// 7. GRAPHIQUE: RÉPARTITION PAR JOUR (CORRIGÉ)
// ============================================================

function mettreAJourGraphiqueJour() {
    const ctx = document.getElementById('dashChartJour');
    if (!ctx) return;
    if (dashChartJour) { dashChartJour.destroy(); dashChartJour = null; }
    
    let donnees = getDonneesFiltrees();
    if (donnees.length === 0) return;
    
    const semaines = parseInt(document.getElementById('jourSemainesFilter').value) || 12;
    const type = document.getElementById('jourTypeFilter').value;
    
    // Filtrer par date
    if (semaines !== 'all' && !isNaN(semaines)) {
        const now = new Date();
        const limitDate = new Date(now);
        limitDate.setDate(limitDate.getDate() - (semaines * 7));
        donnees = donnees.filter(d => {
            const date = convertirDate(d['Date et heure accident'] || d['Date prise en charge']);
            if (!date) return false;
            return date >= limitDate;
        });
    }
    
    if (donnees.length === 0) return;
    
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const accidentsParJour = {};
    jours.forEach(j => accidentsParJour[j] = 0);
    
    donnees.forEach(d => {
        const date = convertirDate(d['Date et heure accident'] || d['Date prise en charge']);
        if (!date) return;
        const jour = date.toLocaleDateString('fr-FR', { weekday: 'long' });
        const jourFormate = jour.charAt(0).toUpperCase() + jour.slice(1);
        if (jourFormate in accidentsParJour) {
            accidentsParJour[jourFormate]++;
        }
    });
    
    const labels = jours;
    const data = jours.map(j => accidentsParJour[j] || 0);
    const couleurs = ['#2d7db8', '#4a90c4', '#6ba3d4', '#8bb6e0', '#abc9ec', '#c4dbf5', '#dce9f9'];
    
    if (data.every(d => d === 0)) return;
    
    const chartType = (type === 'doughnut') ? 'doughnut' : 'bar';
    
    dashChartJour = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: "Accidents",
                data: data,
                backgroundColor: couleurs,
                borderWidth: 2,
                borderColor: '#fff',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: chartType === 'doughnut' ? 'bottom' : 'none' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (chartType === 'doughnut') {
                                const total = context.dataset.data.reduce((a,b) => a+b, 0);
                                const p = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.parsed + ' (' + p + '%)';
                            }
                            return context.parsed.y + ' accident(s)';
                        }
                    }
                }
            },
            scales: chartType === 'bar' ? {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            } : undefined
        }
    });
}

// ============================================================
// 8. RÉINITIALISATION
// ============================================================

function reinitialiserGraphiques() {
    document.getElementById('graphTronconFilter').value = 'all';
    document.getElementById('graphMoisFilter').value = 'all';
    document.getElementById('evoPeriodeFilter').value = '30';
    document.getElementById('evoUniteFilter').value = 'day';
    document.getElementById('periodeTrancheFilter').value = '4';
    document.getElementById('periodeTronconFilter').value = 'all';
    document.getElementById('causeTypeFilter').value = 'principale';
    document.getElementById('causeLimitFilter').value = '8';
    document.getElementById('jourSemainesFilter').value = '12';
    document.getElementById('jourTypeFilter').value = 'bar';
    mettreAJourDashboard();
}

// ============================================================
// 9. INITIALISATION
// ============================================================

function initialiserFiltresGraphiques() {
    const selectTroncon = document.getElementById('graphTronconFilter');
    const selectMois = document.getElementById('graphMoisFilter');
    if (!selectTroncon || !selectMois) return;
    
    // Tronçons
    const troncons = new Set();
    toutesLesDonnees.forEach(d => {
        if (d['_troncon'] && d['_troncon'] !== 'Inconnu') {
            troncons.add(d['_troncon']);
        }
    });
    selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
    ['T1', 'T2', 'T3', 'T4'].filter(t => troncons.has(t)).forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        selectTroncon.appendChild(opt);
    });
    
    // Mois
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
    
    // Remplir les filtres spécifiques
    const periodeTroncon = document.getElementById('periodeTronconFilter');
    if (periodeTroncon) {
        periodeTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        ['T1', 'T2', 'T3', 'T4'].filter(t => troncons.has(t)).forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            periodeTroncon.appendChild(opt);
        });
    }
}

// ============================================================
// 10. MODIFICATION DE changerPage
// ============================================================

const originalChangerPageGraph = window.changerPage || function(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.nav-btn[data-page="' + page + '"]');
    if (btn) btn.classList.add('active');
};

window.changerPage = function(page) {
    originalChangerPageGraph(page);
    if (page === 'graphiques') {
        setTimeout(function() {
            initialiserFiltresGraphiques();
            mettreAJourDashboard();
        }, 300);
    }
};

console.log('📦 GRAPHIQUES.JS chargé!');