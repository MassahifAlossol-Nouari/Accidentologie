// ============================================================
// 📄 SCRIPT.JS - Point d'entrée principal (CORRIGÉ)
// ============================================================

console.log('📄 Script principal chargé!');

// تنفيذ الكود فوراً بعد تحميل script.js
(function() {
    console.log('🚗📊 Application DRRS - Tentative de restauration...');
    
    // التأكد من أن جميع العناصر موجودة
    if (document.getElementById('fileStatus')) {
        console.log('✅ Éléments de la page trouvés');
    } else {
        console.warn('⚠️ Éléments de la page non trouvés, attente...');
        // Si les éléments ne sont pas encore chargés, attendre
        document.addEventListener('DOMContentLoaded', function() {
            restaurerDonnees();
        });
        return;
    }
    
    // Restaurer les données immédiatement
    if (typeof restaurerDonnees === 'function') {
        restaurerDonnees();
    } else {
        console.error('❌ Fonction restaurerDonnees non trouvée!');
        // Vérifier si la fonction existe dans window
        if (window.restaurerDonnees) {
            window.restaurerDonnees();
        }
    }
})();

// Sauvegarder avant de quitter
window.addEventListener('beforeunload', function() {
    if (toutesLesDonnees && toutesLesDonnees.length > 0) {
        sauvegarderDonnees(toutesLesDonnees);
        console.log('💾 Données sauvegardées avant de quitter');
    }
});

// Sauvegarder périodiquement (toutes les 30 secondes)
setInterval(function() {
    if (toutesLesDonnees && toutesLesDonnees.length > 0) {
        sauvegarderDonnees(toutesLesDonnees);
        console.log('💾 Sauvegarde automatique effectuée');
    }
}, 30000);