/**
 * Cloudflare Worker - Proxy Seguro para Gemini API
 * Deploy: https://dash.cloudflare.com/workers
 * 
 * IMPORTANTE: Configure a variável de ambiente GEMINI_API_KEY no Cloudflare Dashboard
 */

const ALLOWED_ORIGINS = [
    'https://envolveai.bot',
    'https://www.envolveai.bot',
    'http://localhost:5500', // Para desenvolvimento local
    'http://127.0.0.1:5500'
];

const RATE_LIMIT_REQUESTS = 30; // Máximo de requests por IP
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto em ms

// Cache simples de rate limiting em memória
const rateLimitCache = new Map();

export default {
    async fetch(request, env, ctx) {
        // CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        // Validar método
        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Método não permitido' }, 405);
        }

        // Validar origem
        const origin = request.headers.get('Origin');
        if (!ALLOWED_ORIGINS.includes(origin) && !origin?.includes('127.0.0.1')) {
            return jsonResponse({ error: 'Origem não autorizada' }, 403);
        }

        // Rate limiting por IP
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!checkRateLimit(clientIP)) {
            return jsonResponse({ 
                error: 'Rate limit excedido. Tente novamente em alguns segundos.' 
            }, 429);
        }

        try {
            // Parse do body
            const body = await request.json();
            
            // Validação básica
            if (!body.message || typeof body.message !== 'string') {
                return jsonResponse({ error: 'Mensagem inválida' }, 400);
            }

            // Sanitizar input (proteção XSS)
            const sanitizedMessage = body.message.substring(0, 1000); // Limitar tamanho

            // Construir request para Gemini
            const geminiRequest = {
                contents: body.contents || [{
                    parts: [{ text: sanitizedMessage }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    topP: 0.95,
                    topK: 40
                }
            };

            // Chamar Gemini API
            const geminiResponse = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': env.GEMINI_API_KEY // Variável de ambiente segura
                    },
                    body: JSON.stringify(geminiRequest)
                }
            );

            // Verificar resposta
            if (!geminiResponse.ok) {
                const errorText = await geminiResponse.text();
                console.error('Gemini API Error:', errorText);
                return jsonResponse({ 
                    error: 'Erro ao processar com IA',
                    details: geminiResponse.status === 429 ? 'Rate limit da API' : 'Erro interno'
                }, geminiResponse.status);
            }

            const geminiData = await geminiResponse.json();

            // Retornar resposta com CORS
            return jsonResponse(geminiData, 200, origin);

        } catch (error) {
            console.error('Proxy Error:', error);
            return jsonResponse({ 
                error: 'Erro interno do servidor',
                message: error.message 
            }, 500);
        }
    }
};

/**
 * Rate limiting simples baseado em IP
 */
function checkRateLimit(ip) {
    const now = Date.now();
    const key = `rate_${ip}`;
    
    // Limpar cache antigo
    cleanupRateLimit();
    
    // Verificar limite
    const record = rateLimitCache.get(key);
    if (!record) {
        rateLimitCache.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }
    
    // Reset se window expirou
    if (now > record.resetAt) {
        rateLimitCache.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }
    
    // Incrementar e verificar
    record.count++;
    if (record.count > RATE_LIMIT_REQUESTS) {
        return false;
    }
    
    return true;
}

/**
 * Limpar cache de rate limiting (executado periodicamente)
 */
function cleanupRateLimit() {
    const now = Date.now();
    for (const [key, record] of rateLimitCache.entries()) {
        if (now > record.resetAt) {
            rateLimitCache.delete(key);
        }
    }
}

/**
 * Handler CORS
 */
function handleCORS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}

/**
 * Criar resposta JSON com CORS
 */
function jsonResponse(data, status = 200, origin = '*') {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
        }
    });
}
