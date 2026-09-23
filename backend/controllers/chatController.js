const { GoogleGenerativeAI } = require('@google/generative-ai');
const Mensagem = require('../models/Mensagem');

// Configuração da IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const LIMITE_HISTORICO = 20;

/**
 * Busca as últimas mensagens no banco e monta no formato que o Gemini aceita.
 */
async function buscarHistorico() {
    // Pega as MAIS RECENTES (desc) e depois inverte para ficar em ordem cronológica
    const mensagens = await Mensagem.find()
        .sort({ dataHora: -1 })
        .limit(LIMITE_HISTORICO);
    mensagens.reverse();

    const historico = mensagens.map((msg) => ({
        role: msg.role,
        parts: msg.parts.map((p) => ({ text: p.text }))
    }));

    // O Gemini exige que o histórico comece com 'user'
    while (historico.length > 0 && historico[0].role !== 'user') {
        historico.shift();
    }

    return historico;
}

/**
 * POST /api/chat
 * Recebe a pergunta do usuário, consulta o histórico, chama o Gemini
 * e salva a conversa no MongoDB.
 */
async function processarMensagem(req, res) {
    try {
        const { pergunta } = req.body;
        if (!pergunta) return res.status(400).json({ erro: 'Envie uma pergunta.' });

        // 1. Busca o histórico ANTES de salvar a nova pergunta (evita duplicar)
        const historico = await buscarHistorico();

        // 2. Inicia o chat com o histórico e envia a pergunta
        const chat = model.startChat({ history: historico });
        const result = await chat.sendMessage(pergunta);
        const respostaDaIA = result.response.text();

        // 3. Só salva quando deu tudo certo (pergunta + resposta juntas)
        await Mensagem.create([
            { role: 'user', parts: [{ text: pergunta }] },
            { role: 'model', parts: [{ text: respostaDaIA }], dataHora: new Date(Date.now() + 1) }
        ]);

        // 4. Devolve a resposta para o Front-end
        return res.status(200).json({ sucesso: true, resposta: respostaDaIA });

    } catch (erro) {
        console.error('❌ Erro:', erro);
        return res.status(500).json({ erro: 'Amnésia do servidor. Erro interno.' });
    }
}

/**
 * DELETE /api/chat/limpar
 * Apaga todo o histórico de conversas do MongoDB.
 */
async function limparHistorico(req, res) {
    try {
        await Mensagem.deleteMany({});
        return res.status(200).json({ sucesso: true, mensagem: 'Histórico apagado com sucesso.' });
    } catch (erro) {
        console.error('❌ Erro ao limpar histórico:', erro);
        return res.status(500).json({ erro: 'Erro ao limpar o histórico.' });
    }
}

module.exports = { processarMensagem, limparHistorico };