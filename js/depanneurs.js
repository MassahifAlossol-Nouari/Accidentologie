// ============================================================
// 📦 DEPANNEURS.JS - Délais d'Intervention des Dépanneurs
// ============================================================

function mettreAJourDepanneurs() {
    const container = document.getElementById('depanneursTable');
    if (!container) return;
    
    if (donneesFiltrees.length === 0) {
        container.innerHTML = `<div class="status-empty">
            <h3>📭 Aucune donnée</h3>
            <p>Chargez des fichiers pour afficher les délais</p>
        </div>`;
        return;
    }
    
    // Regrouper par mois et société
    const parMoisSociete = {};
    donneesFiltrees.forEach(d => {
        const mois = d['_nom_mois'] || 'Inconnu';
        const societe = d['_societe'] || 'Inconnue';
        const type = d['_type_vehicule'] || 'VL';
        const delai = d['_delai_depannage'];
        if (!delai) return;
        if (!parMoisSociete[mois]) parMoisSociete[mois] = {};
        if (!parMoisSociete[mois][societe]) parMoisSociete[mois][societe] = { PL: [], VL: [] };
        if (type === 'PL') parMoisSociete[mois][societe].PL.push(delai);
        else parMoisSociete[mois][societe].VL.push(delai);
    });
    
    const ordreSocietes = Object.keys(SOCIETES_DEPANNAGE);
    const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                       'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const moisExistants = Object.keys(parMoisSociete).filter(m => m !== 'Inconnu')
        .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
    
    if (moisExistants.length === 0) {
        container.innerHTML = `<div class="status-empty">
            <h3>📭 Aucune donnée</h3>
            <p>Pour les délais des dépanneurs</p>
        </div>`;
        return;
    }
    
    let html = '<table><thead><tr><th>Mois / Catégorie</th>';
    ordreSocietes.forEach(s => html += `<th colspan="2">${s}</th>`);
    html += '</tr><tr><th></th>';
    ordreSocietes.forEach(() => html += '<th>PL</th><th>VL</th>');
    html += '</tr></thead><tbody>';
    
    moisExistants.forEach(mois => {
        html += `<tr><td><strong>${mois}</strong></td>`;
        ordreSocietes.forEach(s => {
            const d = parMoisSociete[mois]?.[s];
            html += `<td>${d?.PL.length ? moyenneTemps(d.PL) : '-'}</td>`;
            html += `<td>${d?.VL.length ? moyenneTemps(d.VL) : '-'}</td>`;
        });
        html += '</tr>';
    });
    
    html += `<tr class="total-row"><td><strong>Moyenne Générale</strong></td>`;
    ordreSocietes.forEach(s => {
        const tousPL = [], tousVL = [];
        moisExistants.forEach(mois => {
            const d = parMoisSociete[mois]?.[s];
            if (d?.PL.length) tousPL.push(...d.PL);
            if (d?.VL.length) tousVL.push(...d.VL);
        });
        html += `<td>${moyenneTemps(tousPL) || '-'}</td>`;
        html += `<td>${moyenneTemps(tousVL) || '-'}</td>`;
    });
    html += '</tr></tbody></table>';
    
    container.innerHTML = html;
}