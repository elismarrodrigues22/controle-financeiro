const auth = firebase.auth();
const db = firebase.firestore();

const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const dataInput = document.getElementById("data");
const categoriaInput = document.getElementById("categoria");

const btnEntrada = document.getElementById("btnEntrada");
const btnSaida = document.getElementById("btnSaida");


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
        carregarTransacoes(); // 👈 ISSO resolve o problema
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

document.getElementById("filtroMes").addEventListener("change", (e) => {
    carregarTransacoes(e.target.value);
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

function carregarTransacoes(mesSelecionado = null) {
    const lista = document.getElementById("lista");

    db.collection("usuarios")
        .doc(usuarioAtual.uid)
        .collection("transacoes")
        .orderBy("criadoEm", "desc")
        .onSnapshot(snapshot => {

            lista.innerHTML = "";

            let saldo = 0;
            let entradas = 0;
            let saidas = 0;

            snapshot.forEach(doc => {
                const t = doc.data();

                // filtro por mês
                if (mesSelecionado && !t.data.startsWith(mesSelecionado)) {
                    return;
                }

                const li = document.createElement("li");
                li.classList.add(t.tipo);

                const dataFormatada = formatarData(t.data);

                li.innerHTML = `
                <div>
                  <strong>${t.descricao}</strong><br>
                  <small>${t.categoria} • ${dataFormatada}</small>

                </div>

                <div>
                  R$ ${t.valor.toFixed(2)}
                  <button onclick="removerTransacao('${doc.id}')">❌</button>
                </div>
              `;

                lista.appendChild(li);

                if (t.tipo === "entrada") {
                    entradas += t.valor;
                    saldo += t.valor;
                } else {
                    saidas += t.valor;
                    saldo -= t.valor;
                }
            });

            document.getElementById("saldo").innerText = `R$ ${saldo.toFixed(2)}`;
            document.getElementById("entradas").innerText = `R$ ${entradas.toFixed(2)}`;
            document.getElementById("saidas").innerText = `R$ ${saidas.toFixed(2)}`;
        });
}


function removerTransacao(id) {
    if (!confirm("Deseja realmente excluir esta transação?")) return;

    db.collection("usuarios")
        .doc(usuarioAtual.uid)
        .collection("transacoes")
        .doc(id)
        .delete()
        .then(() => {
            console.log("Transação removida com sucesso");
        })
        .catch(error => {
            console.error("Erro ao remover transação:", error);
        });
}




function salvarTransacao(tipo) {
    const descricao = descricaoInput.value;
    const valor = Number(valorInput.value);
    const data = dataInput.value;
    const categoria = categoriaInput.value;

    if (!descricao || !valor || !data || !categoria) {
        alert("Preencha todos os campos");
        return;
    }

    const transacao = {
        descricao,
        valor,
        tipo,
        categoria,
        data,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("usuarios")
        .doc(usuarioAtual.uid)
        .collection("transacoes")
        .add(transacao)
        .then(() => {
            limparFormulario();
        })
        .catch(err => alert(err.message));
}

btnEntrada.addEventListener("click", () => {
    salvarTransacao("entrada");
});

btnSaida.addEventListener("click", () => {
    salvarTransacao("saida");
});

function limparFormulario() {
    descricaoInput.value = "";
    valorInput.value = "";
    dataInput.value = "";
    categoriaInput.value = "";
}

function formatarData(data) {
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}