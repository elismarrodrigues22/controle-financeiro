const auth = firebase.auth();
const db = firebase.firestore();

// 🎯 Elementos da tela
const telaLogin = document.getElementById("login");
const telaSistema = document.getElementById("sistema");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");
const btnLogout = document.getElementById("btnLogout");

// 👤 Usuário atual
let usuarioAtual = null;

// =============================
// 🔐 AUTENTICAÇÃO
// =============================

// Observa login / logout
auth.onAuthStateChanged(user => {
    if (user) {
        usuarioAtual = user;
        mostrarSistema();
    } else {
        usuarioAtual = null;
        mostrarLogin();
    }
});

// Login
btnLogin.addEventListener("click", () => {
    const email = emailInput.value;
    const senha = senhaInput.value;

    auth.signInWithEmailAndPassword(email, senha)
        .catch(err => alert(err.message));
});

// Cadastro
btnCadastro.addEventListener("click", () => {
    const email = emailInput.value;
    const senha = senhaInput.value;

    auth.createUserWithEmailAndPassword(email, senha)
        .then(cred => {
            // cria documento do usuário
            return db.collection("usuarios").doc(cred.user.uid).set({
                email: cred.user.email,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .catch(err => alert(err.message));
});

// Logout
btnLogout.addEventListener("click", () => {
    auth.signOut();
});

// =============================
// 🖥️ CONTROLE DE TELAS
// =============================

function mostrarLogin() {
    telaLogin.classList.remove("hidden");
    telaSistema.classList.add("hidden");
}

function mostrarSistema() {
    telaLogin.classList.add("hidden");
    telaSistema.classList.remove("hidden");
}
