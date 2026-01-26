const LIMITE_FREE = 13;

let graficoResumo = null;
let graficoCategorias = null;




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

const filtroMes = document.getElementById("filtroMes");
const filtroTipo = document.getElementById("filtroTipo");
const btnFiltrar = document.getElementById("btnFiltrar");

let transacoesCache = [];

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

document.getElementById("filtroMes").addEventListener("change", (e) => {
    carregarTransacoes(e.target.value);
});

const filtroCategoria = document.getElementById("filtroCategoria");

filtroCategoria.addEventListener("change", () => {
    const mes = document.getElementById("filtroMes").value;
    carregarTransacoes(mes, filtroCategoria.value);
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
    carregarTransacoes();
}

function carregarTransacoes(mesSelecionado = null, categoriaSelecionada = "") {
    const lista = document.getElementById("lista");

    db.collection("usuarios")
        .doc(usuarioAtual.uid)
        .collection("transacoes")
        .orderBy("criadoEm", "desc")
        .onSnapshot(snapshot => {

            const totalTransacoes = snapshot.size;

            lista.innerHTML = "";

            let saldo = 0;
            let entradas = 0;
            let saidas = 0;

            let categorias = {};

            snapshot.forEach(doc => {
                const t = doc.data();

                if (t.tipo === "saida") {
                    categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
                }

                if (mesSelecionado && !t.data.startsWith(mesSelecionado)) return;
                if (categoriaSelecionada && t.categoria !== categoriaSelecionada) return;

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

                gerarGraficos(entradas, saidas, categorias);

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
    db.collection("usuarios")
        .doc(usuarioAtual.uid)
        .collection("transacoes")
        .get()
        .then(snapshot => {

            

            if (snapshot.size >= LIMITE_FREE) {
                mostrarMensagem("Limite do plano gratuito atingido. Faça upgrade 🚀");
                return;
            }

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
                    mostrarMensagem("Lançamento salvo com sucesso");
                });

        });
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

function mostrarMensagem(texto) {
    const msg = document.getElementById("msg");
    msg.innerText = texto;
    msg.style.display = "block";

    setTimeout(() => {
        msg.style.display = "none";
    }, 3000);
}

function gerarGraficos(entradas, saidas, categorias) {

    if (graficoResumo) graficoResumo.destroy();
    if (graficoCategorias) graficoCategorias.destroy();

    // Entradas x Saídas
    const ctxResumo = document.getElementById("graficoResumo");
    graficoResumo = new Chart(ctxResumo, {
        type: "doughnut",
        data: {
            labels: ["Entradas", "Saídas"],
            datasets: [{
                data: [entradas, saidas],
                backgroundColor: ["#28a745", "#dc3545"]
            }]
        }
    });

    // Categorias
    const ctxCategorias = document.getElementById("graficoCategorias");
    graficoCategorias = new Chart(ctxCategorias, {
        type: "bar",
        data: {
            labels: Object.keys(categorias),
            datasets: [{
                label: "Gastos por categoria",
                data: Object.values(categorias),
                backgroundColor: "#007bff"
            }]
        }
    });
}

function aplicarFiltros() {
    let lista = document.getElementById("lista");
    lista.innerHTML = "";

    let saldo = 0;
    let entradas = 0;
    let saidas = 0;

    const mes = filtroMes.value;
    const tipo = filtroTipo.value;

    transacoesCache.forEach(t => {
        if (mes && !t.data.startsWith(mes)) return;
        if (tipo && t.tipo !== tipo) return;

        const valor = Number(t.valor);
        saldo += t.tipo === "entrada" ? valor : -valor;

        if (t.tipo === "entrada") entradas += valor;
        else saidas += valor;

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${t.descricao}</strong><br>
            ${t.tipo.toUpperCase()} - R$ ${valor.toFixed(2)}<br>
            <small>${t.data}</small>
        `;
        lista.appendChild(li);
    });

    document.getElementById("saldo").innerText = `R$ ${saldo.toFixed(2)}`;
    document.getElementById("entradas").innerText = `R$ ${entradas.toFixed(2)}`;
    document.getElementById("saidas").innerText = `R$ ${saidas.toFixed(2)}`;

    atualizarGrafico(entradas, saidas);

}

btnFiltrar.addEventListener("click", aplicarFiltros);


function atualizarGrafico(entradas, saidas) {
    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Entradas", "Saídas"],
            datasets: [{
                data: [entradas, saidas],
                backgroundColor: ["#2ecc71", "#e74c3c"]
            }]
        }
    });
}

function mesAtual() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    return `${hoje.getFullYear()}-${mes}`;
}

function contarTransacoesMes(uid, mes) {
    return db.collection("usuarios")
        .doc(uid)
        .collection("transacoes")
        .where("data", ">=", `${mes}-01`)
        .where("data", "<=", `${mes}-31`)
        .get()
        .then(snapshot => snapshot.size);
}




