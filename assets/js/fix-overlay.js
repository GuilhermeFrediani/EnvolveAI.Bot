(function() {
    'use strict';
    
    function forceRemoveOverlays() {
        const overlays = document.querySelectorAll('.connecting-overlay');
        if (overlays.length <= 1) return;
        overlays.forEach((overlay, index) => {
            if (index > 0) {
                overlay.remove();
            }
        });
    }
    
    function init() {
        forceRemoveOverlays();
        const observer = new MutationObserver(() => forceRemoveOverlays());
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
