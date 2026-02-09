// ============================
// VARIÁVEIS GLOBAIS
// ============================
const inputNome = document.getElementById("nome");
const inputQuantidade = document.getElementById("quantidade");
const inputPreco = document.getElementById("preco");
const tabela = document.getElementById("tabelaProdutos");
const botao = document.getElementById("btnAdicionar");
const totalEstoqueSpan = document.getElementById("totalEstoque");

let produtos = [];

// ============================
// EVENTOS
// ============================
botao.addEventListener("click", adicionarProduto);

// ============================
// FUNÇÕES
// ============================

function adicionarProduto() {
    const nome = inputNome.value;
    const quantidade = inputQuantidade.value;
    const preco = inputPreco.value;

    if (nome === "" || quantidade === "" || preco === "") {
        alert("Preencha todos os campos!");
        return;
    }

    const produto = {
        nome: nome,
        quantidade: quantidade,
        preco: preco
    };

    produtos.push(produto);
    salvarProdutos();
    atualizarTabela();
    limparCampos();
}

function atualizarTabela() {
    tabela.innerHTML = "";

    produtos.forEach(function (produto, index) {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.preco}</td>
            <td>
                <button onclick="removerProduto(${index})">Excluir</button>
            </td>
        `;

        tabela.appendChild(linha);
    });
}

function removerProduto(index) {
    produtos.splice(index, 1);
    salvarProdutos();
    atualizarTabela();
}

function limparCampos() {
    inputNome.value = "";
    inputQuantidade.value = "";
    inputPreco.value = "";
}

function salvarProdutos() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function carregarProdutos() {
    const dados = localStorage.getItem("produtos");

    if (dados) {
        produtos = JSON.parse(dados);
        atualizarTabela();
    }
}

function calcularTotalEstoque() {
    let total = 0;

    produtos.forEach(function (produto) {
        total += produto.quantidade * produto.preco;
    });

    totalEstoqueSpan.innerText = "R$ " + total.toFixed(2);
}

carregarProdutos();
