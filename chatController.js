const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuração da IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Usando flash 1.5 que é estável e rápido para produção. 
// Nota: O gemini-2.5 ainda pode não estar disponível publicamente em todas as regiões, 
// o padrão atual é 'gemini-1.5-flash'.
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Lógica para processar a mensagem do usuário
 */
async function processarMensagem(req, res) {
    try {
        const { mensagem } = req.body;

        if (!mensagem || mensagem.trim() === "") {
            return res.status(400).json({ erro: "A mensagem está vazia." });
        }

        // Envia a mensagem para o Google Gemini
        const result = await model.generateContent(mensagem);
        const response = await result.response;
        const respostaTexto = response.text();

        return res.json({ resposta: respostaTexto });

    } catch (erro) {
        console.error("Erro na API Gemini:", erro);
        return res.status(500).json({ 
            erro: "Erro ao processar sua solicitação na IA.",
            detalhes: process.env.NODE_ENV === 'development' ? erro.message : undefined 
        });
    }
}

/**
 * Lógica para gerar o resumo e o PDF
 */
async function gerarResumoPDF(req, res, PDFDocument) {
    try {
        const { historico } = req.body;

        if (!historico) {
            return res.status(400).send("Histórico vazio.");
        }

        const promptResumo = `Resuma os pontos principais desta conversa para um relatório executivo:\n\n${historico}`;
        const result = await model.generateContent(promptResumo);
        const resumoIA = result.response.text();

        const doc = new PDFDocument();
        
        // Cabeçalhos para download de PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resumo-conversa.pdf');

        doc.pipe(res);
        
        // Estilização básica do PDF
        doc.fontSize(22).fillColor('#007bff').text('Relatório da Conversa', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).fillColor('#666666').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });
        doc.moveDown();
        doc.fontSize(12).fillColor('black').text(resumoIA, { align: 'justify' });
        
        doc.end();

    } catch (erro) {
        console.error("Erro ao gerar PDF:", erro);
        if (!res.headersSent) {
            res.status(500).send("Erro ao gerar PDF");
        }
    }
}

module.exports = { processarMensagem, gerarResumoPDF };