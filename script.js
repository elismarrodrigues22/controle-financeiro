
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
let usuarioLogado = localStorage.getItem("usuarioLogado");
let transacoes = [];




const saldoTela = document.getElementById("saldo");
const lista = document.getElementById("lista");

function atualizarTela() {
    lista.innerHTML = "";
    let saldo = 0;
    let entradas = 0;
    let saidas = 0;

    transacoes.forEach((transacao, index) => {
        saldo += transacao.valor;

        if (transacao.valor > 0) {
            entradas += transacao.valor;
        } else {
            saidas += transacao.valor;
        }

        adicionarNaLista(transacao, index);
    });

    saldoTela.innerText = `R$ ${saldo.toFixed(2)}`;
    document.getElementById("totalEntradas").innerText = `R$ ${entradas.toFixed(2)}`;
    document.getElementById("totalSaidas").innerText = `R$ ${Math.abs(saidas).toFixed(2)}`;

    localStorage.setItem("transacoes", JSON.stringify(transacoes));
    usuarios[usuarioLogado].transacoes = transacoes;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

}

function adicionarEntrada() {
    adicionarTransacao(true);
}

function adicionarSaida() {
    adicionarTransacao(false);
}

function adicionarTransacao(entrada) {
    const descricao = document.getElementById("descricao").value;
    const valor = Number(document.getElementById("valor").value);
    const categoria = document.getElementById("categoria").value;
    const data = document.getElementById("data").value;

    if (descricao === "" || valor <= 0 || categoria === "" || data === "") {
        alert("Preencha todos os campos");
        return;
    }

    const transacao = {
        descricao,
        valor: entrada ? valor : -valor,
        categoria,
        data
    };

    transacoes.push(transacao);
    atualizarTela();
    limparCampos();
}


function adicionarNaLista(transacao, index) {
    const li = document.createElement("li");
    li.classList.add(transacao.valor > 0 ? "entrada" : "saida");

    li.innerHTML = `
        <div>
            <strong>${transacao.descricao}</strong><br>
            <small>${transacao.categoria} | ${formatarData(transacao.data)}</small>
        </div>
        <div>
            ${transacao.valor > 0 ? "+" : ""}R$ ${transacao.valor.toFixed(2)}
            <button onclick="removerTransacao(${index})">x</button>
        </div>
    `;

    lista.appendChild(li);
}


function limparCampos() {
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("data").value = "";
}


function removerTransacao(index) {
    transacoes.splice(index, 1);
    atualizarTela();
}

function formatarData(data) {
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function filtrarPorMes() {
    const mesSelecionado = document.getElementById("filtroMes").value;
    lista.innerHTML = "";

    let saldo = 0;
    let entradas = 0;
    let saidas = 0;

    transacoes.forEach((transacao, index) => {
        if (transacao.data.startsWith(mesSelecionado)) {
            saldo += transacao.valor;

            if (transacao.valor > 0) entradas += transacao.valor;
            else saidas += transacao.valor;

            adicionarNaLista(transacao, index);
        }
    });

    saldoTela.innerText = `R$ ${saldo.toFixed(2)}`;
    document.getElementById("totalEntradas").innerText = `R$ ${entradas.toFixed(2)}`;
    document.getElementById("totalSaidas").innerText = `R$ ${Math.abs(saidas).toFixed(2)}`;
}

function login() {
    const user = document.getElementById("loginUsuario").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();

    if (!usuarios[user]) {
        alert("Usuário não encontrado");
        return;
    }

    if (usuarios[user].senha !== senha) {
        alert("Senha incorreta");
        return;
    }

    usuarioLogado = user;
    localStorage.setItem("usuarioLogado", user);

    transacoes = usuarios[user].transacoes || [];
    mostrarSistema();
}


function cadastrar() {
    const user = document.getElementById("loginUsuario").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();

    if (user === "" || senha === "") {
        alert("Preencha todos os campos");
        return;
    }

    if (usuarios[user]) {
        alert("Usuário já existe");
        return;
    }

    usuarios[user] = {
        senha: senha,
        transacoes: []
    };

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Usuário cadastrado com sucesso");
}


function mostrarSistema() {
    document.getElementById("loginArea").style.display = "none";
    document.querySelector(".container").style.display = "block";
    atualizarTela();
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    location.reload();
}



atualizarTela();

if (usuarioLogado && usuarios[usuarioLogado]) {
    transacoes = usuarios[usuarioLogado].transacoes || [];
    mostrarSistema();
}
