require('dotenv').config(); // Carrega a GEMINI_API_KEY do arquivo .env
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require('pdfkit');

const app = express();

// Middleware para entender JSON e servir arquivos estáticos
app.use(express.json());
app.use(express.static('public')); 

app.use(cors()); 

// Configuração da IA (Certifique-se de ter a chave no seu arquivo .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * ROTA 1: PROCESSAR MENSAGEM DO CHAT
 * Recebe o texto do usuário e retorna a resposta da IA
 */
app.post('/chat', async (req, res) => {
    try {
        const { mensagem } = req.body;

        if (!mensagem) {
            return res.status(400).json({ erro: "A mensagem está vazia." });
        }

        // Envia a mensagem para o Google Gemini
        const result = await model.generateContent(mensagem);
        const response = await result.response;
        const respostaTexto = response.text();

        // Retorna a resposta para o frontend
        res.json({ resposta: respostaTexto });

    } catch (erro) {
        console.error("Erro na API Gemini:", erro);
        res.status(500).json({ erro: "Erro ao processar sua solicitação na IA." });
    }
});

/**
 * ROTA 2: GERAR PDF DO RESUMO
 */
app.post('/gerar-pdf', async (req, res) => {
    try {
        const { historico } = req.body;

        // IA cria um resumo do histórico para o PDF
        const promptResumo = `Resuma os pontos principais desta conversa para um relatório:\n\n${historico}`;
        const result = await model.generateContent(promptResumo);
        const resumoIA = result.response.text();

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resumo-conversa.pdf');

        doc.pipe(res);
        doc.fontSize(22).fillColor('#007bff').text('Relatório da Conversa', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).fillColor('black').text(resumoIA);
        doc.end();

    } catch (erro) {
        console.error("Erro ao gerar PDF:", erro);
        res.status(500).send("Erro ao gerar PDF");
    }
});

// ... suas rotas app.post ...

const PORT = 3000; // Force 3000 para teste local
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});