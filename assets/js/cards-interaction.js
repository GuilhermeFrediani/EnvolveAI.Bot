// ===== CARDS INTERACTION SYSTEM =====
// Sistema de interação para cards de capacidades

class CardsInteractionManager {
    constructor() {
        this.activeCard = null;
        this.cardDetails = {
            '1': {
                title: '⚡ 1. Implementação Inteligente',
                content: `<p>Ative o EnvolveAI.Bot em minutos sem precisar programar.</p>
                
                <p>Nossa plataforma foi criada para eliminar barreiras técnicas: basta conectar seu WhatsApp Business e escolher a IA que melhor atende seu negócio (Gemini, Qwen ou Phi).</p>
                
                <p>Tudo está configurado com automações inteligentes que funcionam 24 horas por dia no servidor Oracle Cloud gratuito, garantindo estabilidade e custo zero de hospedagem.</p>
                
                <p><strong>💰 Custo módulo:</strong> livre na instalação inicial.</p>
                <p><strong>⭐ IA recomendada:</strong> Phi 3.5 Mini (leve, rápido e perfeito para quem está começando).</p>`
            },
            '2': {
                title: '💬 2. IA conversacional (Personalizável)',
                content: `<p>Conversas naturais que entendem contexto, intenção, e emoção.</p>
                
                <p>Você escolhe a IA que melhor representa o tom da sua marca:</p>
                
                <p><strong>Gemini 2.5 Flash-Lite:</strong> ideal para empresas que desejam precisão e velocidade (US$ 0,10 – 0,40 por milhão de tokens).</p>
                
                <p><strong>Qwen 3:</strong> ideal para quem busca respostas sob medida e domínio total dos dados.</p>
                
                <p><strong>Phi 3.5 Mini:</strong> localmente roda, excelente para uso econômico.</p>
                
                <p>O InvolveAI.Bot adapta a linguagem da IA ao seu público — atendimento humanizado, rápido e sem jargão.</p>
                
                <p><strong>⭐ IA recomendada:</strong> Gemini 2.5 Flash-Lite para o equilíbrio entre custo e qualidade.</p>`
            },
            '3': {
                title: '🧠 3. Memória e Aprendizagem Contínua',
                content: `<p>O sistema aprende com cada conversa, reconhecendo antigos clientes, intenções, e preferências.</p>
                
                <p>A IA ajusta automaticamente o atendimento — quanto mais interações, mais inteligente e empática ela fica.</p>
                
                <p>Este módulo trabalha com banco de dados externo (como MongoDB), sem custo adicional, e permite consultas em tempo real para decisões inteligentes.</p>
                
                <p><strong>⭐ IA recomendada:</strong> Qwen 3, pela alta capacidade de aprendizado e customização.</p>`
            },
            '4': {
                title: '🎯 4. Funis de vendas inteligentes',
                content: `<p>Transforme conversas em resultados.</p>
                
                <p>O InvolveAI.Bot lidera o cliente desde o primeiro "hello" até o fechamento da venda, sem intervenção humana.</p>
                
                <p>Utilizamos fluxos de automação com IA que reconhece o estágio do cliente e envia mensagens personalizadas.</p>
                
                <p>A integração com o WhatsApp é 100% legal e seguro, sem necessidade de usar a API oficial paga (que hoje custa cerca de R$ 0,20 – R$ 0,60 por conversa comercial, dependendo do país).</p>
                
                <p><strong>⭐ IA recomendada:</strong> Gemini ou Qwen, dependendo do volume de clientes.</p>`
            },
            '5': {
                title: '💳 5. Pagamentos Integrados e Checkout Automático',
                content: `<p>Venda direta no WhatsApp, sem redirecionar o cliente.</p>
                
                <p>EnvolveAI.Bot aceita Pix instantâneo e atualiza o status do pedido automaticamente.</p>
                
                <p>Depois que o pagamento é confirmado, a IA envia mensagens personalizadas, recibos e relatórios em tempo real no painel.</p>
                
                <p><strong>⭐ IA recomendada:</strong> Phi 3.5 Mini (otimiza o custo e garante resposta imediata).</p>`
            },
            '6': {
                title: '🔗 6. Integrações e Ecossistema',
                content: `<p>Nosso sistema conecta-se com as ferramentas que sua empresa já usa — planilhas, CRMs, e-mails e sistemas de estoque.</p>
                
                <p>Os dados são centralizados em um Dashboard de Insights, que transforma números em decisões práticas: desempenho de vendas, satisfação, picos de atendimento e muito mais.</p>
                
                <p><strong>⭐ IA recomendada:</strong> Qwen 3 (para análises e geração de relatórios mais detalhados).</p>`
            }
        };
        
        this.init();
    }
    
    init() {
        // Aguarda DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachListeners());
        } else {
            this.attachListeners();
        }
    }
    
    attachListeners() {
        const cards = document.querySelectorAll('.capability-card');
        
        cards.forEach(card => {
            card.addEventListener('click', (e) => this.handleCardClick(e, card));
        });
        
        // Seleciona automaticamente o primeiro card após toda a seção aparecer
        setTimeout(() => {
            const firstCard = document.querySelector('.capability-card[data-card-id="1"]');
            if (firstCard) {
                this.selectCard(firstCard, '1');
            }
        }, 2000); // Aguarda TODA a seção aparecer completamente (título, subtítulo, todos os cards)
    }
    
    handleCardClick(event, card) {
        const cardId = card.getAttribute('data-card-id');
        
        // Se clicar no mesmo card, fecha
        if (this.activeCard === cardId) {
            this.closeDetails();
            return;
        }
        
        // Seleciona o card clicado
        this.selectCard(card, cardId);
    }
    
    selectCard(card, cardId) {
        // Remove ativo de outros cards
        document.querySelectorAll('.capability-card').forEach(c => {
            c.classList.remove('active');
        });
        
        // Ativa o card selecionado
        card.classList.add('active');
        this.activeCard = cardId;
        
        // Exibe detalhes
        this.showDetails(cardId);
    }
    
    showDetails(cardId) {
        const panel = document.getElementById('cardDetailsPanel');
        const content = document.getElementById('cardDetailsContent');
        
        if (!panel || !content) return;
        
        const details = this.cardDetails[cardId];
        
        if (details) {
            // Se já está visível, faz fade out primeiro
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
                
                // Aguarda fade out completar (400ms) antes de trocar conteúdo
                setTimeout(() => {
                    content.innerHTML = `
                        <h3>${details.title}</h3>
                        ${details.content}
                    `;
                    
                    // Fade in do novo conteúdo
                    requestAnimationFrame(() => {
                        panel.classList.add('active');
                        panel.setAttribute('aria-hidden', 'false');
                    });
                }, 400);
            } else {
                // Primeira vez mostrando
                content.innerHTML = `
                    <h3>${details.title}</h3>
                    ${details.content}
                `;
                
                panel.style.display = 'block';
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        panel.classList.add('active');
                        panel.setAttribute('aria-hidden', 'false');
                    });
                });
            }
        }
    }
    
    closeDetails() {
        const panel = document.getElementById('cardDetailsPanel');
        
        if (panel) {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                panel.style.display = 'none';
            }, 400);
        }
        
        // Remove ativo de todos os cards
        document.querySelectorAll('.capability-card').forEach(c => {
            c.classList.remove('active');
        });
        
        this.activeCard = null;
    }
}

// Inicializa o manager
const cardsManager = new CardsInteractionManager();
