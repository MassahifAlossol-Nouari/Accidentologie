// ============================================================
// 📦 ANALYSE.JS - Tableau d'Analyse (VERSION CORRIGÉE)
// ============================================================

// ---------- Variables pour les graphiques ----------
let chartAnalyseGravite = null;
let chartAnalyseVictimes = null;
let chartAnalyseTroncons = null;

// ============================================================
// 1. TABLEAU D'ANALYSE
// ============================================================

function mettreAJourAnalyse() {
    const container = document.getElementById('analyseTable');
    if (!container) return;
    
    console.log('📊 Mise à jour du tableau d\'analyse...');
    
    const tronconFiltre = document.getElementById('tronconFilter').value;
    const moisFiltre = document.getElementById('monthFilter').value;
    
    // ====== Initialisation des résultats ======
    const resultats = {};
    ['T1', 'T2', 'T3', 'T4'].forEach(t => {
        resultats[t] = { 
            corporelle: 0, 
            materielle: 0, 
            mortelle: 0, 
            total: 0, 
            tues: 0, 
            bg: 0, 
            bl: 0 
        };
    });
    
    // ====== Remplir les données ======
    if (!donneesFiltrees || donneesFiltrees.length === 0) {
        container.innerHTML = '<div class="status-empty"><h3>📭 Aucune donnée</h3><p>Chargez des fichiers Excel</p></div>';
        return;
    }
    
    console.log('📊 Nombre de données filtrées:', donneesFiltrees.length);
    
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
    
    // ====== Construction du tableau ======
    let totalCorp = 0, totalMat = 0, totalMort = 0, totalAcc = 0, totalTues = 0, totalBG = 0, totalBL = 0;
    
    let html = '<table><thead><tr>';
    html += '<th>Tronçon</th><th>Entre PK et PK</th><th>Corporelle</th><th>Matérielle</th><th>Mortelle</th><th>Total ACC</th><th>Nbr Tués</th><th>Nbr BG</th><th>Nbr BL</th>';
    html += '</tr></thead><tbody>';
    
    ['T1', 'T2', 'T3', 'T4'].forEach(t => {
        const d = resultats[t];
        totalCorp += d.corporelle;
        totalMat += d.materielle;
        totalMort += d.mortelle;
        totalAcc += d.total;
        totalTues += d.tues;
        totalBG += d.bg;
        totalBL += d.bl;
        
        const range = getPkRange(t);
        const isFiltered = (tronconFiltre === t);
        const rowClass = isFiltered ? 'filtered-row' : '';
        
        html += `<tr class="${rowClass}">
            <td><strong>${t}</strong></td>
            <td>${range}</td>
            <td>${d.corporelle}</td>
            <td>${d.materielle}</td>
            <td>${d.mortelle}</td>
            <td><strong>${d.total}</strong></td>
            <td>${d.tues}</td>
            <td>${d.bg}</td>
            <td>${d.bl}</td>
        </tr>`;
    });
    
    html += `<tr class="total-row">
        <td colspan="2"><strong>Total</strong></td>
        <td><strong>${totalCorp}</strong></td>
        <td><strong>${totalMat}</strong></td>
        <td><strong>${totalMort}</strong></td>
        <td><strong>${totalAcc}</strong></td>
        <td><strong>${totalTues}</strong></td>
        <td><strong>${totalBG}</strong></td>
        <td><strong>${totalBL}</strong></td>
    </tr>`;
    
    html += '</tbody></table>';
    
    // ====== Résumé ======
    const moisNom = moisFiltre !== 'all' ? obtenirNomMois(new Date(2026, parseInt(moisFiltre)-1, 1)) : 'Tous les mois';
    const tronconNom = tronconFiltre !== 'all' ? tronconFiltre : 'Tous les tronçons';
    
    html = `<div style="padding:12px 16px;background:#f0f8ff;border-radius:10px;margin-bottom:15px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <span><strong>📅 Mois :</strong> ${moisNom}</span>
        <span><strong>📍 Tronçon :</strong> ${tronconNom}</span>
        <span><strong>📊 Total accidents :</strong> ${donneesFiltrees.length}</span>
    </div>` + html;
    
    container.innerHTML = html;
    
    // ====== Mettre à jour les graphiques ======
    setTimeout(function() {
        mettreAJourGraphiquesAnalyse(resultats);
    }, 200);
}

// ============================================================
// 2. GRAPHIQUES (LES 3 PREMIERS)
// ============================================================

function mettreAJourGraphiquesAnalyse(resultats) {
    console.log('📈 Mise à jour des graphiques...');
    
    const totalAccidents = resultats.T1.total + resultats.T2.total + resultats.T3.total + resultats.T4.total;
    
    if (totalAccidents === 0) {
        console.log('📭 Aucune donnée pour les graphiques');
        return;
    }
    
    // ---- Graphique 1: Gravité ----
    const canvasGravite = document.getElementById('chartAnalyseGravite');
    if (canvasGravite) {
        if (chartAnalyseGravite) chartAnalyseGravite.destroy();
        
        const data = [
            resultats.T1.corporelle + resultats.T2.corporelle + resultats.T3.corporelle + resultats.T4.corporelle,
            resultats.T1.materielle + resultats.T2.materielle + resultats.T3.materielle + resultats.T4.materielle,
            resultats.T1.mortelle + resultats.T2.mortelle + resultats.T3.mortelle + resultats.T4.mortelle
        ];
        
        chartAnalyseGravite = new Chart(canvasGravite, {
            type: 'doughnut',
            data: {
                labels: ['Corporelle', 'Matérielle', 'Mortelle'],
                datasets: [{
                    data: data,
                    backgroundColor: ['#e67e22', '#3498db', '#e74c3c'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // ---- Graphique 2: Victimes ----
    const canvasVictimes = document.getElementById('chartAnalyseVictimes');
    if (canvasVictimes) {
        if (chartAnalyseVictimes) chartAnalyseVictimes.destroy();
        
        const data = [
            resultats.T1.tues + resultats.T2.tues + resultats.T3.tues + resultats.T4.tues,
            resultats.T1.bg + resultats.T2.bg + resultats.T3.bg + resultats.T4.bg,
            resultats.T1.bl + resultats.T2.bl + resultats.T3.bl + resultats.T4.bl
        ];
        
        chartAnalyseVictimes = new Chart(canvasVictimes, {
            type: 'doughnut',
            data: {
                labels: ['Tués', 'BG', 'BL'],
                datasets: [{
                    data: data,
                    backgroundColor: ['#c0392b', '#e67e22', '#2ecc71'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // ---- Graphique 3: Tronçons ----
    const canvasTroncons = document.getElementById('chartAnalyseTroncons');
    if (canvasTroncons) {
        if (chartAnalyseTroncons) chartAnalyseTroncons.destroy();
        
        const labels = ['T1', 'T2', 'T3', 'T4'];
        
        chartAnalyseTroncons = new Chart(canvasTroncons, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Corporelle',
                        data: labels.map(t => resultats[t].corporelle),
                        backgroundColor: '#e67e22',
                        borderRadius: 4
                    },
                    {
                        label: 'Matérielle',
                        data: labels.map(t => resultats[t].materielle),
                        backgroundColor: '#3498db',
                        borderRadius: 4
                    },
                    {
                        label: 'Mortelle',
                        data: labels.map(t => resultats[t].mortelle),
                        backgroundColor: '#e74c3c',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }
    
    // ---- Graphique 4: PK ----
    setTimeout(function() {
        mettreAJourGraphiquePK();
    }, 300);
}

// ============================================================
// 3. GRAPHIQUE PK - DEUX BARRES (CROISSANT / DÉCROISSANT)
// ============================================================

let pkTooltipTimer = null;

function mettreAJourGraphiquePK() {
    console.log('📈 ===== GRAPHIQUE PK =====');
    
    const containerCroissant = document.getElementById('pkPointsCroissant');
    const containerDecroissant = document.getElementById('pkPointsDecroissant');
    
    if (!containerCroissant || !containerDecroissant) {
        console.warn('⚠️ Containers PK non trouvés');
        return;
    }
    
    if (!donneesFiltrees || donneesFiltrees.length === 0) {
        containerCroissant.innerHTML = '<div style="text-align:center;color:#999;padding:10px;">📭 Aucune donnée</div>';
        containerDecroissant.innerHTML = '<div style="text-align:center;color:#999;padding:10px;">📭 Aucune donnée</div>';
        return;
    }
    
    console.log('📊 Données disponibles:', donneesFiltrees.length);
    
    // ====== VÉRIFIER _pk_num ======
    let countPkValide = 0;
    donneesFiltrees.forEach(d => {
        const pk = d['_pk_num'];
        if (pk && pk > 0) countPkValide++;
    });
    console.log('📊 PK valides:', countPkValide, '/', donneesFiltrees.length);
    
    if (countPkValide === 0) {
        containerCroissant.innerHTML = '<div style="text-align:center;color:#e74c3c;padding:10px;font-size:13px;">⚠️ Aucun PK valide</div>';
        containerDecroissant.innerHTML = '<div style="text-align:center;color:#e74c3c;padding:10px;font-size:13px;">⚠️ Aucun PK valide</div>';
        return;
    }
    
    // Récupérer les filtres
    const filterTues = document.getElementById('filterTues');
    const filterBG = document.getElementById('filterBG');
    const filterBL = document.getElementById('filterBL');
    
    const showTues = filterTues ? filterTues.checked : true;
    const showBG = filterBG ? filterBG.checked : true;
    const showBL = filterBL ? filterBL.checked : true;
    
    console.log('🔍 Filtres:', { showTues, showBG, showBL });
    
    // ====== Séparer les données par sens ======
    const donneesCroissant = donneesFiltrees.filter(d => {
        const sens = d['Sens'] || '';
        return String(sens).toLowerCase().includes('croissant');
    });
    
    const donneesDecroissant = donneesFiltrees.filter(d => {
        const sens = d['Sens'] || '';
        const sensStr = String(sens).toLowerCase();
        return sensStr.includes('décroissant') || sensStr.includes('decroissant');
    });
    
    console.log('📊 Croissant:', donneesCroissant.length, '| Décroissant:', donneesDecroissant.length);
    
    // ====== Mettre à jour les compteurs ======
    const totalCroissant = document.getElementById('totalCroissant');
    const totalDecroissant = document.getElementById('totalDecroissant');
    if (totalCroissant) totalCroissant.textContent = donneesCroissant.length;
    if (totalDecroissant) totalDecroissant.textContent = donneesDecroissant.length;
    
    // ====== Générer les points ======
    const pointsCroissant = genererPointsPK(containerCroissant, donneesCroissant, showTues, showBG, showBL, 'croissant');
    const pointsDecroissant = genererPointsPK(containerDecroissant, donneesDecroissant, showTues, showBG, showBL, 'decroissant');
    
    console.log('✅ Points croissant:', pointsCroissant, '| Décroissant:', pointsDecroissant);
    
    // ====== Mettre à jour les statistiques globales ======
    let totalTues = 0, totalBG = 0, totalBL = 0;
    donneesFiltrees.forEach(d => {
        totalTues += parseInt(d['_total_tues'] || 0);
        totalBG += parseInt(d['_total_bg'] || 0);
        totalBL += parseInt(d['_total_bl'] || 0);
    });
    
    const elTues = document.getElementById('totalTuesPK');
    const elBG = document.getElementById('totalBGPK');
    const elBL = document.getElementById('totalBLPK');
    const elTotal = document.getElementById('totalAccidentsPK');
    
    if (elTues) elTues.textContent = totalTues;
    if (elBG) elBG.textContent = totalBG;
    if (elBL) elBL.textContent = totalBL;
    if (elTotal) elTotal.textContent = donneesFiltrees.length;
}


// ============================================================
// 4. GÉNÉRER LES POINTS PK (CORRIGÉ)
// ============================================================

function genererPointsPK(container, donnees, showTues, showBG, showBL, sens) {
    if (!container) return 0;
    
    // Filtrer selon les critères (PK valide + victimes)
    const donneesFiltreesPK = donnees.filter(d => {
        const pk = d['_pk_num'];
        // Vérifier que PK est valide
        if (!pk || isNaN(pk) || pk < 27000 || pk > 430000) {
            return false;
        }
        
        const tues = parseInt(d['_total_tues'] || 0);
        const bg = parseInt(d['_total_bg'] || 0);
        const bl = parseInt(d['_total_bl'] || 0);
        
        // Si tous les filtres sont désactivés, ne rien afficher
        if (!showTues && !showBG && !showBL) return false;
        
        // Vérifier si l'accident correspond aux filtres
        let correspond = false;
        if (showTues && tues > 0) correspond = true;
        if (showBG && bg > 0) correspond = true;
        if (showBL && bl > 0) correspond = true;
        
        return correspond;
    });
    
    if (donneesFiltreesPK.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#999;padding:10px;font-size:12px;">🔍 Aucun point</div>';
        return 0;
    }
    
    // Générer les points
    const pkMin = 27000, pkMax = 430000, range = pkMax - pkMin;
    let html = '';
    
    donneesFiltreesPK.forEach(d => {
        const pk = parseInt(d['_pk_num'] || 0);
        const position = ((pk - pkMin) / range) * 100;
        
        const tues = parseInt(d['_total_tues'] || 0);
        const bg = parseInt(d['_total_bg'] || 0);
        const bl = parseInt(d['_total_bl'] || 0);
        
        let couleur = '#3498db';
        let type = 'Matérielle';
        if (tues > 0) { couleur = '#c0392b'; type = 'Mortelle'; }
        else if (bg > 0) { couleur = '#e67e22'; type = 'Corporelle (BG)'; }
        else if (bl > 0) { couleur = '#2ecc71'; type = 'Corporelle (BL)'; }
        
        const totalVictimes = tues + bg + bl;
        let taille = 8 + Math.min(totalVictimes * 2, 18);
        
        // ====== CORRECTION: Convertir en String et échapper ======
        const dateVal = d['Date et heure accident'] || 'N/A';
        const date = String(dateVal).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        const sensVal = d['Sens'] || 'N/A';
        const sensTexte = String(sensVal).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        const graviteVal = d['Gravité accident'] || 'N/A';
        const gravite = String(graviteVal).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        const ticketVal = d['Ticket'] || 'N/A';
        const ticket = String(ticketVal).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        html += `<div class="pk-point" 
            style="position:absolute; 
                   left:${position}%; 
                   top:50%; 
                   transform:translate(-50%, -50%);
                   width:${taille}px; 
                   height:${taille}px; 
                   background:${couleur}; 
                   border-radius:50%; 
                   cursor:pointer;
                   border:2px solid white;
                   box-shadow:0 2px 6px rgba(0,0,0,0.2);
                   z-index:5;
                   transition:transform 0.2s, box-shadow 0.2s;"
            onmouseover="this.style.transform='translate(-50%, -50%) scale(1.4)'; this.style.boxShadow='0 0 0 4px rgba(45,125,184,0.3), 0 4px 15px rgba(0,0,0,0.3)';"
            onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'; this.style.boxShadow='0 2px 6px rgba(0,0,0,0.2)';"
            onclick="afficherInfoPK(${pk}, '${date}', '${sensTexte}', '${type}', ${tues}, ${bg}, ${bl}, '${gravite}', '${ticket}', event)">
        </div>`;
    });
    
    container.innerHTML = html;
    return donneesFiltreesPK.length;
}

// ============================================================
// 5. AFFICHER INFO PK
// ============================================================

function afficherInfoPK(pk, date, sens, type, tues, bg, bl, gravite, ticket, event) {
    const tooltip = document.getElementById('pkTooltip');
    const content = document.getElementById('pkTooltipContent');
    if (!tooltip || !content) return;
    
    content.innerHTML = `
        <div style="font-weight:bold;color:#1a3a5c;border-bottom:1px solid #eef2f7;padding-bottom:6px;margin-bottom:6px;">📍 PK ${pk}</div>
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
    
    if (pkTooltipTimer) clearTimeout(pkTooltipTimer);
    pkTooltipTimer = setTimeout(() => {
        tooltip.style.display = 'none';
    }, 4000);
}

// ============================================================
// 6. RÉINITIALISER FILTRES PK
// ============================================================

function reinitialiserFiltresPK() {
    const el = document.getElementById('filterTues');
    if (el) el.checked = true;
    const el2 = document.getElementById('filterBG');
    if (el2) el2.checked = true;
    const el3 = document.getElementById('filterBL');
    if (el3) el3.checked = true;
    mettreAJourGraphiquePK();
}