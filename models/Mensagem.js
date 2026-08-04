const mongoose = require('mongoose');

// Definindo como a mensagem será salva no banco
const MensagemSchema = new mongoose.Schema({
    role: String, // 'user' (usuário) ou 'model' (IA)
    parts: [{ text: String }], // O conteúdo da mensagem
    dataHora: { type: Date, default: Date.now } // Hora exata
});

// Criando a "Tabela" (Collection) baseada no Schema
const Mensagem = mongoose.model('Mensagem', MensagemSchema);

module.exports = Mensagem;