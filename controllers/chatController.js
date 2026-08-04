const { GoogleGenerativeAI } = require("@google/generative-ai");
const Mensagem = require('../models/Mensagem');

// Configuração da IA
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * POST /api/chat
 * Recebe a pergunta do usuário, consulta o histórico, chama o Gemini
 * e salva a conversa no MongoDB.
 */
async function processarMensagem(req, res) {
    try {
        const { pergunta } = req.body;
        if (!pergunta) return res.status(400).json({ erro: "Envie uma pergunta." });

        // 1. Salva a pergunta do usuário no Banco de Dados
        await Mensagem.create({ role: "user", parts: [{ text: pergunta }] });

        // 2. Busca o histórico de conversas no Banco (últimas 20 mensagens)
        const historicoRaw = await Mensagem.find()
                                        .sort({ dataHora: 1 })
                                        .limit(20);

        // Reconstrói o histórico só com os campos que o Gemini aceita
        // (evita o erro "Unknown name _id" que o select() sozinho não resolve
        // porque os subdocumentos do array 'parts' também ganham _id automático)
        const historico = historicoRaw.map(msg => ({
            role: msg.role,
            parts: msg.parts.map(p => ({ text: p.text }))
        }));

        // 3. Inicia o chat do Gemini, enviando o histórico junto
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({ history: historico });

        // 4. Manda a nova pergunta para a IA
        const result = await chat.sendMessage(pergunta);
        const respostaDaIA = result.response.text();

        // 5. Salva a resposta da IA no Banco de Dados para uso futuro
        await Mensagem.create({ role: "model", parts: [{ text: respostaDaIA }] });

        // 6. Devolve a resposta para o Front-end
        return res.status(200).json({ sucesso: true, resposta: respostaDaIA });

    } catch (erro) {
        console.error("❌ Erro:", erro);
        return res.status(500).json({ erro: "Amnésia do servidor. Erro interno." });
    }
}

/**
 * DELETE /api/chat/limpar
 * Apaga todo o histórico de conversas do MongoDB.
 */
async function limparHistorico(req, res) {
    try {
        await Mensagem.deleteMany({});
        return res.status(200).json({ sucesso: true, mensagem: "Histórico apagado com sucesso." });
    } catch (erro) {
        console.error("❌ Erro ao limpar histórico:", erro);
        return res.status(500).json({ erro: "Erro ao limpar o histórico." });
    }
}

module.exports = { processarMensagem, limparHistorico };