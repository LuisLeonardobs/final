const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'chave-secreta',
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,  // Aumenta a segurança, não permite acesso ao cookie via JavaScript
            secure: false,   // Se usar HTTPS, deve ser 'true'. Para teste em HTTP, 'false'.
            maxAge: 1000 * 60 * 60 * 24 // Define o tempo de vida do cookie como 1 dia
        }
    })
);

const porta = 3001;
const host = '0.0.0.0';

// Função para verificar autenticação
function verificarAutenticacao(req, resp, next) {
    console.log('Verificando autenticação:', req.session.autenticado);  // Log para verificar a sessão
    if (req.session.autenticado) {
        next();
    } else {
        resp.redirect('/login');
    }
}

// Rota de login
app.get('/login', (req, resp) => {
    resp.send(`
        <html>
        <head>
            <title>Login</title>
        </head>
        <body>
            <h1>Login</h1>
            <form action='/login' method='POST'>
                <label for="usuario">Usuário:</label>
                <input type="text" id="usuario" name="usuario" required><br>
                <label for="senha">Senha:</label>
                <input type="password" id="senha" name="senha" required><br>
                <button type="submit">Login</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/login', (req, resp) => {
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === '123') {
        req.session.autenticado = true;
        console.log("Usuário autenticado:", req.session.autenticado);  // Log para verificar se a autenticação foi bem-sucedida
        resp.redirect('/');
    } else {
        resp.send('Usuário ou senha inválidos. <a href="/login">Tente novamente</a>');
    }
});

app.get('/logout', (req, resp) => {
    req.session.destroy(() => {
        console.log('Sessão destruída');
        resp.redirect('/login');
    });
});

// Página inicial com menu
app.get('/', verificarAutenticacao, (req, resp) => {
    resp.send(`
        <html>
        <head>
            <title>Menu</title>
        </head>
        <body>
            <h1>Bem-vindo!</h1>
            <a href="/formulario">Preencher Informações Pessoais</a><br>
            <a href="/logout">Logout</a>
        </body>
        </html>
    `);
});

// Formulário de informações pessoais
app.get('/formulario', verificarAutenticacao, (req, resp) => {
    resp.send(`
        <html>
        <head>
            <title>Informações Pessoais</title>
        </head>
        <body>
            <h1>Preencha suas informações</h1>
            <form action="/formulario" method="POST">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" required><br>

                <label for="dataNascimento">Data de Nascimento:</label>
                <input type="date" id="dataNascimento" name="dataNascimento" required><br>

                <label for="nickname">Nickname:</label>
                <input type="text" id="nickname" name="nickname" required><br>

                <button type="submit">Enviar</button>
            </form>
        </body>
        </html>
    `);
});

// Receber e exibir informações enviadas
app.post('/formulario', verificarAutenticacao, (req, resp) => {
    const { nome, dataNascimento, nickname } = req.body;
    resp.send(`
        <html>
        <head>
            <title>Informações Recebidas</title>
        </head>
        <body>
            <h1>Informações Enviadas</h1>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Data de Nascimento:</strong> ${dataNascimento}</p>
            <p><strong>Nickname:</strong> ${nickname}</p>
            <a href="/">Voltar ao Menu</a>
        </body>
        </html>
    `);
});

// Iniciar o servidor
app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
