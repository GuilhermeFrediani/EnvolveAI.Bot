// ===== SCRIPT DE LIMPEZA FORÇADA - CARREGA PRIMEIRO =====
// Este script garante que overlays órfãos sejam removidos

(function() {
    'use strict';
    
    console.log('🧹 LIMPEZA FORÇADA INICIADA');
    
    // Função para remover todos os overlays
    function forceRemoveOverlays() {
        const overlays = document.querySelectorAll('.connecting-overlay');
        console.log('🔍 Overlays encontrados:', overlays.length);
        
        overlays.forEach((overlay, index) => {
            console.log(`❌ Removendo overlay ${index + 1}`);
            overlay.remove();
        });
    }
    
    // Executar imediatamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceRemoveOverlays);
    } else {
        forceRemoveOverlays();
    }
    
    // Monitorar e remover qualquer novo overlay que aparecer após 2 segundos
    setInterval(() => {
        const orphanOverlays = document.querySelectorAll('.connecting-overlay');
        if (orphanOverlays.length > 1) {
            console.warn('⚠️ DETECTADOS OVERLAYS ÓRFÃOS:', orphanOverlays.length);
            orphanOverlays.forEach((overlay, index) => {
                if (index > 0) { // Mantém apenas o primeiro
                    console.log(`🗑️ Removendo overlay órfão ${index + 1}`);
                    overlay.remove();
                }
            });
        }
    }, 2000);
    
    console.log('✅ SISTEMA DE LIMPEZA ATIVO');
})();
