import { buscarPorTitulo } from "./api.js";

const MIN = 2;
const RETARDO = 300;

const input = document.querySelector("#buscar-titulo");
const estado = document.querySelector("#estado-busqueda");
const lista = document.querySelector("#resultados-busqueda");

let temporizador = null;
let controlador = null;

function mostrarEstado(texto, esError = false) {
    estado.hidden = !texto;
    estado.textContent = texto;
    estado.classList.toggle("error", esError);
}

function limpiar() {
    clearTimeout(temporizador);
    temporizador = null;
    if (controlador) controlador.abort();
    controlador = null;
    lista.replaceChildren();
    mostrarEstado("");
}

async function buscar(q) {
    if (controlador) controlador.abort();
    const actual = new AbortController();
    controlador = actual;
    mostrarEstado("Buscando…");
    lista.replaceChildren();
    try {
        const resultados = await buscarPorTitulo(q, actual.signal);
        if (actual.signal.aborted) return;
        if (!resultados.length) {
            mostrarEstado("No hay resultados");
            return;
        }
        mostrarEstado("");
        lista.replaceChildren(...resultados.map(p => {
            const li = document.createElement("li");
            li.textContent = `${p.titulo} (${p.anio})`;
            return li;
        }));
    } catch (error) {
        if (error.name === "AbortError" || actual.signal.aborted) return;
        lista.replaceChildren();
        mostrarEstado(
            error instanceof TypeError ? "No se pudo conectar con la API" : error.message,
            true
        );
    }
}

input.addEventListener("input", () => {
    clearTimeout(temporizador);
    const q = input.value.trim();
    if (q.length < MIN) {
        limpiar();
        return;
    }
    temporizador = setTimeout(() => buscar(q), RETARDO);
});

input.addEventListener("keydown", evento => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    clearTimeout(temporizador);
    const q = input.value.trim();
    if (q.length >= MIN) buscar(q);
});
