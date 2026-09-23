const mongoose = require('mongoose');

// Definindo como a mensagem será salva no banco
const MensagemSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'model'], required: true }, // 'user' (usuário) ou 'model' (IA)
    parts: [{ text: String, _id: false }], // O conteúdo da mensagem (sem _id nos subdocumentos)
    dataHora: { type: Date, default: Date.now } // Hora exata
});

// Criando a "Tabela" (Collection) baseada no Schema
const Mensagem = mongoose.model('Mensagem', MensagemSchema);

module.exports = Mensagem;