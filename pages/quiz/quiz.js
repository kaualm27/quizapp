import { verificarTema, trocarTema } from "../../helpers/trocarTema.js"

const botaoTema = document.querySelector(".tema button")
const body = document.querySelector("body")
const assunto = localStorage.getItem("assunto")

let quiz = {}
let pontos = 0
let pergunta = 1
let resposta = ""
let idInputResposta = ""
let respostaCorretaId = ""

botaoTema.addEventListener("click", () => {
    trocarTema(body, botaoTema)
})

verificarTema(body, botaoTema)

function alterarAssunto() {
    const divIcone = document.querySelector(".assunto_icone")
    const iconeImg = document.querySelector(".assunto_icone img")
    const assuntoTitulo = document.querySelector(".assunto h1")

    divIcone.classList.add(assunto.toLowerCase())
    iconeImg.setAttribute("src", `../../assets/images/icon-${assunto.toLowerCase()}.svg`)
    iconeImg.setAttribute("alt", `icone de ${assunto}`)
    assuntoTitulo.innerText = assunto
}

async function buscarPerguntas() {
    const urlDados = "../../data.json"

    await fetch(urlDados).then(resposta => resposta.json()).then(dados => {
        dados.quizzes.forEach(dados => {
            if (dados.title === assunto) {
                quiz = dados
            }
        })
    })
}

function montarPergunta() {
    const main = document.querySelector(".main")

    main.innerHTML = `
        <section class="pergunta">
            <div>
                <p>Questão ${pergunta} de 10</p>
                <h2>${alterarSinais(quiz.questions[pergunta - 1].question)}</h2>
            </div>
            <div class="barra_progresso">
                <div style="width: ${pergunta * 10}%"></div>
            </div>
        </section>
        <section class="alternativas">
            <form>
                ${quiz.questions[pergunta - 1].options.map((option, index) => `
                    <label for="alternativa_${index}">
                        <input type="radio" id="alternativa_${index}" name="alternativa" value="${alterarSinais(option)}">
                        <div>
                            <span>${String.fromCharCode(65 + index)}</span>
                            ${alterarSinais(option)}
                        </div>
                    </label>
                `).join('')}
            </form>
            <button>Responder</button>
        </section>
    `
}

function alterarSinais(texto) {
    return texto.replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function guardarRespostas(evento) {
    resposta = evento.target.value.trim()
    idInputResposta = evento.target.id
}

function validarResposta() {
    const botaoEnviar = document.querySelector(".alternativas button")
    botaoEnviar.innerText = pergunta === 10 ? "Finalizar" : "Próxima"
    botaoEnviar.removeEventListener("click", validarResposta)
    botaoEnviar.addEventListener("click", pergunta === 10 ? finalizar : proximaPergunta)

    if (resposta === quiz.questions[pergunta - 1].answer) {
        document.querySelector(`label[for='${idInputResposta}']`).setAttribute("id", "correta")
        pontos++
    } else {
        document.querySelector(`label[for='${idInputResposta}']`).setAttribute("id", "errada")
        document.querySelector(`label[for='${respostaCorretaId}']`).setAttribute("id", "correta")
    }

    pergunta++
}

function finalizar() {
    localStorage.setItem("pontos", pontos)
    window.location.href = "../resultado/resultado.html"
}

function proximaPergunta() {
    montarPergunta()
    adicionarEventoInputs()
}

function adicionarEventoInputs() {
    const inputsRespostas = document.querySelectorAll(".alternativas input")
    inputsRespostas.forEach(input => {
        input.addEventListener("click", guardarRespostas)

        if (input.value.trim() === quiz.questions[pergunta - 1].answer) {
            respostaCorretaId = input.id
        }
    })

    const botaoEnviar = document.querySelector(".alternativas button")
    botaoEnviar.addEventListener("click", validarResposta)
}

async function iniciar() {
    alterarAssunto()
    await buscarPerguntas()
    montarPergunta()
    adicionarEventoInputs()
}

iniciar()
