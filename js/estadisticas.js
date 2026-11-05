import { estadisticasPorGenero } from "./api.js";

const $ = selector => document.querySelector(selector);

function mostrarMensaje(texto, esError = false, detalles = []) {
    const caja = $("#estado");
    caja.replaceChildren();
    caja.hidden = !texto;
    caja.classList.toggle("error", esError);
    if (!texto) return;

    caja.append(document.createTextNode(texto));
    if (detalles.length) {
        const lista = document.createElement("ul");
        for (const detalle of detalles) {
            const li = document.createElement("li");
            li.textContent = String(detalle);
            lista.append(li);
        }
        caja.append(lista);
    }
}

function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}

function pintarTabla(filas) {
    const cuerpo = $("#cuerpo-tabla");
    cuerpo.replaceChildren();
    for (const fila of filas) {
        const tr = document.createElement("tr");
        tr.append(celda(fila.genero), celda(fila.total), celda(fila.notaMedia));
        cuerpo.append(tr);
    }
    $("#tabla").hidden = filas.length === 0;
}

async function cargarEstadisticas(minimo) {
    mostrarMensaje("...Cargando");
    $("#tabla").hidden = true;
    try {
        const filas = await estadisticasPorGenero(minimo);
        pintarTabla(filas);
        mostrarMensaje(
            filas.length
                ? `${filas.length} géneros`
                : "Ningún género cumple el mínimo indicado."
        );
    } catch (error) {
        const sinConexion = error instanceof TypeError;
        mostrarMensaje(
            sinConexion ? "No se pudo conectar con la API." : error.message,
            true,
            error.detalles || []
        );
    }
}

$("#form-minimo").addEventListener("submit", evento => {
    evento.preventDefault();
    cargarEstadisticas($("#minimo").value.trim());
});

cargarEstadisticas();
