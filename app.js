const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const port = 3040;

// Configurar a conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'phpmyadmin',
    database: 'blog'
});

// Verificar se a conexão com o banco de dados foi bem-sucedida
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
    console.log('Conexão com o banco de dados MySQL estabelecida.');
});

// Configurar a sessão
app.use(
    session({
        secret: 'sua_chave_secreta',
        resave: true,
        saveUninitialized: true,
    })
);

app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar EJS como o motor de visualização
app.set('view engine', 'ejs');

// Rotas para renderizar páginas
app.get('/', (req, res) => res.render('index'));
app.get('/cadastro', (req, res) => res.render('cadastro'));
app.get('/login', (req, res) => res.render('login'));
app.get('/sobre', (req, res) => res.render('sobre'));
app.get('/postagens', (req, res) => res.render('postagens'));
app.get('/contato', (req, res) => res.render('contato'));
app.get('/home', (req, res) => res.render('home'));
app.get('/log-out', (req, res) => res.render('log-out'));
app.get('/texto', (req, res) => res.render('texto'));
app.get('/contato2', (req, res) => res.render('contato2'));
app.get('/sobre2', (req, res) => res.render('sobre2'));

// Rota para processar o formulário de login
app.post('/views/login', (req, res) => {
    const { name, email, password } = req.body;

    const query = 'SELECT * FROM users WHERE name = ? AND email = ? AND password = ?';

    db.query(query, [name, email, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.name = name;
            res.redirect('/dashboard');
        } else {
            res.send('Credenciais incorretas. <a href="/">Tente novamente</a>');
        }
    });
});

// Rota para processar o formulário de cadastro
app.post('/cadastro', (req, res) => {
    const { name, email, senha } = req.body;

    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

    db.query(query, [name, email, senha], (err, results) => {
        if (err) {
            console.error(err);
            res.send('Erro ao cadastrar. <a href="/cadastro">Tente novamente</a>');
        } else {
            // Ação após o cadastro bem-sucedido, se necessário
            // Pode adicionar redirecionamento ou resposta aqui
        }
    });
});

// Rota para processar o formulário de login
app.post('/login', (req, res) => {
    const { name, senha } = req.body;

    const query = 'SELECT * FROM users WHERE name = ? AND password = ?';

    db.query(query, [name, senha], (err, results) => {
        if (err) {
            console.error(err);
            res.send('Erro ao fazer login. <a href="/login">Tente novamente</a>');
        } else {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = name;
                res.redirect('/dashboard');
            } else {
                res.send('Credenciais incorretas. <a href="/login">Tente novamente</a>');
            }
        }
    });
});

// Rota para a página do painel
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        res.render('home');
    } else {
        res.send('Faça login para acessar esta página. <a href="/">Login</a>');
    }
});

// Rota para fazer logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Rota para criar postagem
app.post('/texto', (req, res) => {
    const { name } = req.body;
    const sql = 'INSERT INTO postg (name) VALUES (?)';
    db.query(sql, [name], (err, result) => {
        if (err) throw err;
        res.redirect('/home');  // Redireciona para /home após a criação da postagem
    });
});

// Rota para exibir postagens
app.get('/texto', (req, res) => {
    db.query('SELECT * FROM postg', (err, result) => {
        if (err) {
            console.error('Erro ao obter postagens:', err);
            res.render('texto', { postagens: [] });  // Renderiza a página com uma lista vazia em caso de erro
        } else {
            res.render('texto', { postagens: result });
        }
    });
});

// Rota para obter postagens via API
app.get('/api/postagens', (req, res) => {
    db.query('SELECT * FROM postg', (err, result) => {
        if (err) {
            console.error('Erro ao obter postagens:', err);
            res.status(500).json({ error: 'Erro ao obter postagens.' });
        } else {
            res.json(result);
        }
    });
});

// Rota para criar postagem
app.post('/texto', (req, res) => {
    const { name } = req.body;
    const sql = 'INSERT INTO postg (name) VALUES (?)';
    db.query(sql, [name], (err, result) => {
        if (err) {
            console.error('Erro ao criar postagem:', err);
            res.redirect('/home');  // Redireciona para /home em caso de erro
        } else {
            res.redirect('/home');  // Redireciona para /home após a criação da postagem
        }
    });
});

// Adicione esta parte para iniciar o servidor
const PORT = 3040;  // Você pode escolher outra porta, se necessário
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});