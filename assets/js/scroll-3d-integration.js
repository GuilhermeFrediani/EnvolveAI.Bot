/**
 * ============================================
 * 🚀 SCROLL 3D INTEGRATION MODULE
 * ============================================
 * 
 * Este módulo conecta:
 * - GSAP ScrollTrigger → Three.js Camera
 * - Scroll natural → Navegação entre seções
 * - Interação mouse → Movimento de câmera
 * 
 * SEGURANÇA: Não modifica código existente, apenas adiciona funcionalidades
 * 
 * @author Assistant
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🚀 Scroll 3D Integration Module - Iniciando...');
    
    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    const CONFIG = {
        // Posições da câmera para cada seção
        cameraPositions: [
            { x: 0, y: 50, z: 500 },      // Seção 0 (Hero)
            { x: -100, y: 30, z: 300 },   // Seção 1 (Sobre)
            { x: 100, y: 40, z: 100 },    // Seção 2 (Recursos)
            { x: 0, y: 20, z: -50 },      // Seção 3 (Demo)
            { x: -80, y: 60, z: -200 },   // Seção 4 (Planos)
            { x: 80, y: 30, z: -350 }     // Seção 5 (FAQ)
        ],
        
        // Configuração de transição
        transition: {
            duration: 1.5,          // Duração da transição (segundos)
            ease: 'power2.inOut',   // Easing da transição
            stagger: 0.1            // Delay entre elementos
        },
        
        // Configuração de mouse
        mouse: {
            enabled: true,          // Ativar interação com mouse
            intensity: 30,          // Intensidade do movimento (pixels)
            smoothing: 0.08         // Suavização do movimento (0-1)
        },
        
        // Configuração de scroll
        scroll: {
            wheelSensitivity: 1,    // Sensibilidade do scroll do mouse
            touchSensitivity: 2,    // Sensibilidade do touch
            debounceMs: 50          // Debounce para performance
        }
    };
    
    // ============================================
    // CLASSE PRINCIPAL
    // ============================================
    class Scroll3DIntegration {
        constructor() {
            // Estado interno
            this.isInitialized = false;
            this.isEnabled = true;
            this.isTransitioning = false;
            this.currentSection = 0;
            this.totalSections = 6;
            
            // Referências externas (serão conectadas)
            this.threeScene = null;
            this.gsap = null;
            this.ScrollTrigger = null;
            this.container = null;
            this.sections = [];
            
            // Estado do mouse
            this.mouse = {
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0
            };
            
            // Bind de métodos
            this.handleWheel = this.debounce(this.handleWheel.bind(this), CONFIG.scroll.debounceMs);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleResize = this.handleResize.bind(this);
            this.animate = this.animate.bind(this);
            
            // Inicializar
            this.init();
        }
        
        // ============================================
        // INICIALIZAÇÃO
        // ============================================
        init() {
            // Aguardar DOM e bibliotecas estarem prontos
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }
        
        setup() {
            console.log('🔧 Setup do Scroll 3D Integration...');
            
            // Verificar se GSAP está disponível
            if (!window.gsap) {
                console.warn('⚠️ GSAP não encontrado, tentando novamente em 1s...');
                setTimeout(() => this.setup(), 1000);
                return;
            }
            
            this.gsap = window.gsap;
            this.ScrollTrigger = window.ScrollTrigger;
            
            if (this.ScrollTrigger) {
                this.gsap.registerPlugin(this.ScrollTrigger);
            }
            
            // Conectar com ThreeScene existente
            this.connectThreeScene();
            
            // Obter referências do DOM
            this.container = document.getElementById('container') || document.querySelector('.content-container');
            this.sections = document.querySelectorAll('.section');
            this.totalSections = this.sections.length;
            
            if (!this.container || this.sections.length === 0) {
                console.warn('⚠️ Container ou seções não encontrados, tentando novamente em 500ms...');
                setTimeout(() => this.setup(), 500);
                return;
            }
            
            // Configurar scroll 3D
            this.setupScroll3D();
            
            // Configurar interação com mouse
            this.setupMouseInteraction();
            
            // Configurar navegação por teclado
            this.setupKeyboardNavigation();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            console.log('✅ Scroll 3D Integration inicializado com sucesso!');
            console.log(`   📊 ${this.totalSections} seções detectadas`);
            console.log(`   🎮 ThreeScene: ${this.threeScene ? 'Conectado' : 'Não disponível'}`);
            console.log(`   🖱️ Mouse interaction: ${CONFIG.mouse.enabled ? 'Ativo' : 'Desativado'}`);
        }
        
        // ============================================
        // CONEXÃO COM THREE.JS
        // ============================================
        connectThreeScene() {
            // Tentar conectar com a instância global do ThreeScene
            if (window.threeSceneInstance) {
                this.threeScene = window.threeSceneInstance;
                console.log('🎮 ThreeScene conectado via variável global');
                return;
            }
            
            // Tentar conectar via EnvolveAIExperience
            if (window.globalAppInitializer && window.globalAppInitializer.app) {
                this.threeScene = window.globalAppInitializer.app.threeScene;
                console.log('🎮 ThreeScene conectado via AppInitializer');
                return;
            }
            
            // Agendar nova tentativa
            console.log('🎮 ThreeScene não encontrado, tentando conectar após init...');
            setTimeout(() => {
                if (window.threeSceneInstance) {
                    this.threeScene = window.threeSceneInstance;
                    console.log('🎮 ThreeScene conectado (tentativa 2)');
                }
            }, 2000);
        }
        
        // ============================================
        // CONFIGURAR SCROLL 3D
        // ============================================
        setupScroll3D() {
            console.log('📜 Configurando scroll 3D...');
            
            // MÉTODO 1: ScrollTrigger com GSAP (se disponível)
            if (this.ScrollTrigger) {
                this.setupScrollTrigger();
            }
            
            // MÉTODO 2: Scroll nativo como fallback
            this.setupNativeScroll();
            
            // Iniciar loop de animação
            this.startAnimationLoop();
        }
        
        setupScrollTrigger() {
            console.log('📜 Configurando ScrollTrigger...');
            
            // Limpar ScrollTriggers anteriores
            this.ScrollTrigger.getAll().forEach(st => st.kill());
            
            // Criar ScrollTrigger principal para atualizar câmera
            this.ScrollTrigger.create({
                trigger: this.container,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1, // Suavização de 1 segundo
                onUpdate: (self) => {
                    if (!this.isTransitioning && this.isEnabled) {
                        this.updateCameraFromProgress(self.progress);
                    }
                }
            });
            
            // Criar ScrollTrigger para cada seção
            this.sections.forEach((section, index) => {
                this.ScrollTrigger.create({
                    trigger: section,
                    start: 'top center',
                    end: 'bottom center',
                    onEnter: () => this.onSectionEnter(index),
                    onEnterBack: () => this.onSectionEnter(index)
                });
            });
            
            console.log('✅ ScrollTrigger configurado');
        }
        
        setupNativeScroll() {
            console.log('📜 Configurando scroll nativo...');
            
            // Evento de wheel (scroll do mouse)
            window.addEventListener('wheel', this.handleWheel, { passive: false });
            
            // Evento de touch (mobile)
            let touchStartY = 0;
            let touchStartTime = 0;
            
            window.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }, { passive: true });
            
            window.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                const deltaY = touchStartY - touchEndY;
                const deltaTime = Date.now() - touchStartTime;
                
                // Detectar swipe
                if (Math.abs(deltaY) > 50 && deltaTime < 300) {
                    if (deltaY > 0) {
                        // Swipe up - próxima seção
                        this.navigateToSection(this.currentSection + 1);
                    } else {
                        // Swipe down - seção anterior
                        this.navigateToSection(this.currentSection - 1);
                    }
                }
            }, { passive: true });
        }
        
        // ============================================
        // HANDLERS DE EVENTOS
        // ============================================
        handleWheel(e) {
            if (!this.isEnabled || this.isTransitioning) return;
            
            // Detectar direção do scroll
            const delta = e.deltaY;
            
            if (Math.abs(delta) > 30) { // Threshold para evitar scroll acidental
                if (delta > 0) {
                    // Scroll para baixo - próxima seção
                    this.navigateToSection(this.currentSection + 1);
                } else {
                    // Scroll para cima - seção anterior
                    this.navigateToSection(this.currentSection - 1);
                }
            }
        }
        
        handleMouseMove(e) {
            if (!CONFIG.mouse.enabled) return;
            
            // Calcular posição do mouse normalizada (-1 a 1)
            this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;
        }
        
        handleResize() {
            // Atualizar ScrollTrigger se disponível
            if (this.ScrollTrigger) {
                this.ScrollTrigger.refresh();
            }
        }
        
        // ============================================
        // NAVEGAÇÃO ENTRE SEÇÕES
        // ============================================
        navigateToSection(sectionIndex) {
            // Validação
            sectionIndex = Math.max(0, Math.min(sectionIndex, this.totalSections - 1));
            
            // Ignorar se já está na seção
            if (sectionIndex === this.currentSection) return;
            
            // Ignorar se está em transição
            if (this.isTransitioning) return;
            
            console.log(`🧭 Navegando para seção ${sectionIndex}...`);
            
            this.isTransitioning = true;
            const previousSection = this.currentSection;
            this.currentSection = sectionIndex;
            
            // Animar câmera com GSAP
            this.animateCameraToSection(sectionIndex, () => {
                this.isTransitioning = false;
                this.updateActiveSection(sectionIndex);
            });
        }
        
        animateCameraToSection(sectionIndex, onComplete) {
            const targetPosition = CONFIG.cameraPositions[sectionIndex];
            
            if (!targetPosition) {
                console.warn('Posição não encontrada para seção:', sectionIndex);
                if (onComplete) onComplete();
                return;
            }
            
            // Animar com GSAP se disponível
            if (this.gsap && this.threeScene && this.threeScene.camera) {
                // Animar posição da câmera
                this.gsap.to(this.threeScene.camera.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration: CONFIG.transition.duration,
                    ease: CONFIG.transition.ease,
                    onComplete: onComplete
                });
            } else if (this.threeScene && this.threeScene.camera) {
                // Fallback sem GSAP
                this.threeScene.camera.position.x = targetPosition.x;
                this.threeScene.camera.position.y = targetPosition.y;
                this.threeScene.camera.position.z = targetPosition.z;
                if (onComplete) onComplete();
            } else {
                // Fallback sem ThreeScene
                if (onComplete) onComplete();
            }
        }
        
        updateCameraFromProgress(progress) {
            // Calcular seção atual baseada no progresso
            const totalProgress = progress * (this.totalSections - 1);
            const currentSectionFloat = totalProgress;
            const sectionIndex = Math.round(currentSectionFloat);
            
            // Atualizar posição da câmera interpolando entre seções
            const fromIndex = Math.floor(currentSectionFloat);
            const toIndex = Math.min(fromIndex + 1, this.totalSections - 1);
            const sectionProgress = currentProgress - fromIndex;
            
            const fromPos = CONFIG.cameraPositions[fromIndex];
            const toPos = CONFIG.cameraPositions[toIndex];
            
            if (fromPos && toPos && this.threeScene && this.threeScene.camera) {
                // Interpolar posição
                this.threeScene.camera.position.x = fromPos.x + (toPos.x - fromPos.x) * sectionProgress;
                this.threeScene.camera.position.y = fromPos.y + (toPos.y - fromPos.y) * sectionProgress;
                this.threeScene.camera.position.z = fromPos.z + (toPos.z - fromPos.z) * sectionProgress;
            }
            
            // Atualizar seção atual
            if (sectionIndex !== this.currentSection) {
                this.currentSection = sectionIndex;
                this.updateActiveSection(sectionIndex);
            }
        }
        
        updateActiveSection(sectionIndex) {
            // Remover classe 'active' de todas as seções
            this.sections.forEach(section => {
                section.classList.remove('active', 'fully-visible');
            });
            
            // Adicionar classe 'active' à seção atual
            if (this.sections[sectionIndex]) {
                this.sections[sectionIndex].classList.add('active');
                
                // Adicionar 'fully-visible' após animação
                setTimeout(() => {
                    this.sections[sectionIndex].classList.add('fully-visible');
                }, 500);
            }
            
            // Atualizar navegação
            this.updateNavigation(sectionIndex);
            
            // Atualizar URL hash (opcional)
            const sectionId = this.sections[sectionIndex]?.id;
            if (sectionId) {
                history.replaceState(null, null, `#${sectionId}`);
            }
        }
        
        updateNavigation(sectionIndex) {
            // Atualizar links do menu
            document.querySelectorAll('.nav-menu a').forEach(link => {
                const linkSection = parseInt(link.dataset.section);
                if (linkSection === sectionIndex) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        onSectionEnter(sectionIndex) {
            if (this.currentSection !== sectionIndex && !this.isTransitioning) {
                this.currentSection = sectionIndex;
                this.updateActiveSection(sectionIndex);
            }
        }
        
        // ============================================
        // INTERAÇÃO COM MOUSE
        // ============================================
        setupMouseInteraction() {
            if (!CONFIG.mouse.enabled) return;
            
            console.log('🖱️ Configurando interação com mouse...');
            
            window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
            window.addEventListener('resize', this.handleResize, { passive: true });
        }
        
        // ============================================
        // NAVEGAÇÃO POR TECLADO
        // ============================================
        setupKeyboardNavigation() {
            document.addEventListener('keydown', (e) => {
                if (!this.isEnabled) return;
                
                switch(e.key) {
                    case 'ArrowDown':
                    case 'PageDown':
                        e.preventDefault();
                        this.navigateToSection(this.currentSection + 1);
                        break;
                    case 'ArrowUp':
                    case 'PageUp':
                        e.preventDefault();
                        this.navigateToSection(this.currentSection - 1);
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.navigateToSection(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.navigateToSection(this.totalSections - 1);
                        break;
                }
            });
        }
        
        // ============================================
        // LOOP DE ANIMAÇÃO
        // ============================================
        startAnimationLoop() {
            this.animationFrame = requestAnimationFrame(this.animate);
        }
        
        animate() {
            // Aplicar movimento do mouse à câmera (se ThreeScene disponível)
            if (this.threeScene && this.threeScene.camera && CONFIG.mouse.enabled) {
                // Suavizar movimento do mouse
                this.mouse.x += (this.mouse.targetX - this.mouse.x) * CONFIG.mouse.smoothing;
                this.mouse.y += (this.mouse.targetY - this.mouse.y) * CONFIG.mouse.smoothing;
                
                // Aplicar offset à câmera
                const basePosition = CONFIG.cameraPositions[this.currentSection] || CONFIG.cameraPositions[0];
                const mouseOffsetX = this.mouse.x * CONFIG.mouse.intensity;
                const mouseOffsetY = -this.mouse.y * CONFIG.mouse.intensity * 0.5;
                
                // Só aplicar se não estiver em transição
                if (!this.isTransitioning) {
                    this.threeScene.camera.position.x = basePosition.x + mouseOffsetX;
                    this.threeScene.camera.position.y = basePosition.y + mouseOffsetY;
                }
            }
            
            // Continuar loop
            this.animationFrame = requestAnimationFrame(this.animate);
        }
        
        // ============================================
        // UTILITÁRIOS
        // ============================================
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // ============================================
        // API PÚBLICA
        // ============================================
        enable() {
            this.isEnabled = true;
            console.log('✅ Scroll 3D habilitado');
        }
        
        disable() {
            this.isEnabled = false;
            console.log('⏸️ Scroll 3D desabilitado');
        }
        
        destroy() {
            // Cancelar animation frame
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            
            // Remover event listeners
            window.removeEventListener('wheel', this.handleWheel);
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('resize', this.handleResize);
            
            // Limpar ScrollTriggers
            if (this.ScrollTrigger) {
                this.ScrollTrigger.getAll().forEach(st => st.kill());
            }
            
            console.log('🧹 Scroll 3D Integration destruído');
        }
    }
    
    // ============================================
    // INICIALIZAÇÃO GLOBAL
    // ============================================
    let scroll3DIntegration = null;
    
    // Função para inicializar
    function initScroll3DIntegration() {
        if (!scroll3DIntegration) {
            scroll3DIntegration = new Scroll3DIntegration();
            window.scroll3DIntegration = scroll3DIntegration;
        }
        return scroll3DIntegration;
    }
    
    // Inicializar após um pequeno delay para garantir que tudo carregou
    setTimeout(initScroll3DIntegration, 1500);
    
    // Também expor globalmente para uso manual
    window.initScroll3DIntegration = initScroll3DIntegration;
    
    console.log('📦 Scroll 3D Integration Module carregado');
    
})();
