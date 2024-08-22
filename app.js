const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const path = require('path');

// Importa as rotas
const lawyerRoutes = require('./routes/lawyerRoutes');

dotenv.config();

const app = express();

// Configurações do Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir arquivos estáticos e body parser
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Conexão com o banco de dados
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado ao banco de dados');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados', err);
    process.exit(1); // Encerra o processo com falha
  }
}

connectDB();

// Usar as rotas
app.use('/lawyers', lawyerRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.render('index', { title: 'Cadastro de Advogados' });
});

// Iniciando o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
