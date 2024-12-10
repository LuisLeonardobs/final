import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();
const porta = 3000;
const host = '0.0.0.0';

// Armazenamento em memória (substitua com um banco de dados na prática)
let listaUsuarios = []; // [{ username, password }]
let mensagens = []; // [{ sender, receiver, message, timestamp }]

app.use(session({
    secret: 'M1nh4Chav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 30 }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Middleware de autenticação
function verificarAutenticacao(req, resp, next) {
    if (req.session.usuarioLogado) next();
    else resp.redirect('/login.html');
}

// Cadastro de usuário
app.post('/register', (req, resp) => {
    const { username, password } = req.body;
    if (listaUsuarios.find(user => user.username === username)) {
        return resp.status(400).send('Usuário já cadastrado.');
    }
    listaUsuarios.push({ username, password });
    resp.redirect('/login.html');
});

// Autenticação de login
app.post('/login', (req, resp) => {
    const { username, password } = req.body;
    const usuario = listaUsuarios.find(user => user.username === username && user.password === password);
    if (!usuario) {
        return resp.status(401).send(`
            <div>
                <p>Usuário ou senha inválidos!</p>
                <a href="/login.html">Voltar ao login</a>
            </div>
        `);
    }
    req.session.usuarioLogado = username;
    resp.redirect('/chat');
});

// Logout
app.get('/logout', (req, resp) => {
    req.session.destroy();
    resp.redirect('/login.html');
});

// Página do bate-papo
app.get('/chat', verificarAutenticacao, (req, resp) => {
    const usuarioLogado = req.session.usuarioLogado;
    resp.send(`
        <html>
            <head>
                <title>Bate-papo</title>
            </head>
            <body>
                <h1>Bem-vindo, ${usuarioLogado}!</h1>
                <div id="chat">
                    ${mensagens.map(msg => `<p><strong>${msg.sender}:</strong> ${msg.message}</p>`).join('')}
                </div>
                <form id="form-mensagem" method="POST" action="/sendMessage">
                    <input type="text" name="message" placeholder="Digite sua mensagem" required />
                    <button type="submit">Enviar</button>
                </form>
                <a href="/logout">Sair</a>
            </body>
        </html>
    `);
});

// Enviar mensagem
app.post('/sendMessage', verificarAutenticacao, (req, resp) => {
    const sender = req.session.usuarioLogado;
    const { message } = req.body;

    if (!message.trim()) return resp.status(400).send('Mensagem não pode estar vazia.');

    mensagens.push({ sender, message, timestamp: new Date() });
    resp.redirect('/chat');
});

// Inicializar servidor
app.listen(porta, host, () => {
    console.log(`Servidor iniciado e em execução no endereço http://${host}:${porta}`);
});
