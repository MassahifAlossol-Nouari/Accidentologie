// ============================================================
// 📦 INTERVENANTS.JS - Délais d'Intervention des Intervenants
// ============================================================

function mettreAJourIntervenants() {
    const container = document.getElementById('intervenantsTable');
    if (!container) return;
    
    // Récupérer le type d'intervention sélectionné
    const interventionFilter = document.getElementById('interventionFilter');
    const typeIntervention = interventionFilter ? interventionFilter.value : 'depannage';
    
    // Déterminer la colonne à afficher
    let cleDelai = '_delai_depannage';
    let nomColonne = 'Dépannage';
    let emoji = '🚛';
    
    switch(typeIntervention) {
        case 'depannage':
            cleDelai = '_delai_depannage';
            nomColonne = 'Dépannage';
            emoji = '🚛';
            break;
        case 'patrouilleur':
            cleDelai = '_delai_patrouilleur';
            nomColonne = 'Patrouilleur';
            emoji = '👮';
            break;
        case 'gr':
            cleDelai = '_delai_gr';
            nomColonne = 'GR';
            emoji = '🚔';
            break;
        case 'pc':
            cleDelai = '_delai_pc';
            nomColonne = 'PC';
            emoji = '🚑';
            break;
        default:
            cleDelai = '_delai_depannage';
            nomColonne = 'Dépannage';
            emoji = '🚛';
    }
    
    if (donneesFiltrees.length === 0) {
        container.innerHTML = `<div class="status-empty">
            <h3>📭 Aucune donnée</h3>
            <p>Chargez des fichiers pour afficher les délais</p>
        </div>`;
        return;
    }
    
    // Regrouper par mois et tronçon
    const parMoisTroncon = {};
    donneesFiltrees.forEach(d => {
        const mois = d['_nom_mois'] || 'Inconnu';
        const troncon = d['_troncon'] || 'Inconnu';
        const delai = d[cleDelai];
        if (mois === 'Inconnu' || troncon === 'Inconnu' || !delai) return;
        if (!parMoisTroncon[mois]) parMoisTroncon[mois] = {};
        if (!parMoisTroncon[mois][troncon]) parMoisTroncon[mois][troncon] = [];
        parMoisTroncon[mois][troncon].push(delai);
    });
    
    // Calculer les moyennes
    const resultats = {};
    for (const [mois, troncons] of Object.entries(parMoisTroncon)) {
        resultats[mois] = {};
        for (const [troncon, delais] of Object.entries(troncons)) {
            resultats[mois][troncon] = moyenneTemps(delais);
        }
    }
    
    const ordreTroncons = ['T1', 'T2', 'T3', 'T4'];
    const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                       'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const moisExistants = Object.keys(resultats).filter(m => m !== 'Inconnu')
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
    
    let totalEchantillons = 0;
    ordreTroncons.forEach(t => totalEchantillons += totalParTroncon[t].length);
    html += `<div style="padding:8px 16px;color:#666;font-size:12px;margin-top:10px;">
        📊 Basé sur ${totalEchantillons} intervention(s) pour "${nomColonne}"
    </div>`;
    
    container.innerHTML = html;
}