import { listarPeliculas, resenasDe, escribirResena, login, logout, usuarioActual } from "./api.js";

//  ATAJO
const estado = {pagina: 1, limite: 4, filtros: {}, peliculaAbierta: null};

const $ = selector => document.querySelector(selector);

function mostrarMensaje(texto, esError = false){
    $("#estado").textContent = texto;
    $("#estado").classList.toggle("error", esError);
}

// Crea un elemento con texto plano (textContent): evita XSS
function elemento(etiqueta, texto, clase) {
    const el = document.createElement(etiqueta);
    el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

async function cargarPeliculas() {
    mostrarMensaje("...Cargando");
    try {
        const { datos, paginacion} = await listarPeliculas({
            ...estado.filtros,
            page: estado.pagina,
            limit: estado.limite
        });
        pintarPeliculas(datos);
        pintarPaginacion(paginacion);
        mostrarMensaje(`${paginacion.total} peliculas`);
    }catch (error) {
        mostrarMensaje(error.mensaje, true)
    }
}

function pintarPeliculas(peliculas) {
    const tarjetas = peliculas.map(p => {
        const art = elemento("article", "", "tarjeta");
        const boton = elemento("button", "Reseñas");
        boton.dataset.id = p.id;
        boton.dataset.titulo = p.titulo;
        art.append(
            elemento("h3", p.titulo),
            elemento("p", p.anio),
            elemento("p", `* ${p.nota}`, "nota"),
            boton
        );
        return art;
    });
    $("#rejilla").replaceChildren(...tarjetas);
}
//PAGINCACION
function pintarPaginacion({pagina, paginas}){
    $("#info-pagina").textContent = `Pagina ${pagina} de ${paginas || 1}`;
    $("#btn-anterior").disabled = pagina <= 1;
    $("#btn-siguiente").disabled = pagina >= paginas;
}

$("#btn-anterior").addEventListener("click", () => {
    estado.pagina--;
    cargarPeliculas();
});
$("#btn-siguiente").addEventListener("click", () => {
    estado.pagina++;
    cargarPeliculas();
});
//FILTROS
$("#form-filtros").addEventListener("submit", evento => {
    evento.preventDefault();
    const valores = Object.fromEntries(new FormData(evento.target));
    estado.filtros = Object.fromEntries(
        Object.entries(valores).filter(([, valor]) => valor !== "")
    );
    estado.pagina = 1;
    cargarPeliculas();
});

function pintarSesion() {
    const usuario = usuarioActual();
    $("#form-login").hidden = Boolean(usuario);
    $("#sesion").hidden = !usuario;
    $("#form-resena").hidden = !usuario;
    if (usuario) $("#saludo").textContent = `Hola, ${usuario.nombre}`;
}

 $("#form-login").addEventListener("submit", async evento => {
    evento.preventDefault();
    const {email, password} = Object.fromEntries(new FormData(evento.target));
    try {
        await login(email, password);
        pintarSesion();
        mostrarMensaje("Sesion Iniciada");
    }catch (error) {
        mostrarMensaje(error.message, true);
    }
 });
 $("#btn-salir").addEventListener("click", () => {
    logout();
    pintarSesion();
 });

 // RESEÑAS
 async function cargarResenas() {
    const resenas = await resenasDe(estado.peliculaAbierta);
    const items = resenas.length
        ? resenas.map(r => {
            const li = document.createElement("li");
            li.append(elemento("b", r.usuario), ` ${r.valoracion} * ${r.texto}`);
            return li;
        })
        : [elemento("li", "Todavia no hay reseñas.")];
    $("#lista-resenas").replaceChildren(...items);
    $("#panel-resenas").hidden = false;
 }

 $("#rejilla").addEventListener("click", evento => {
    const boton = evento.target.closest("button[data-id]");
    if (!boton) return;
    estado.peliculaAbierta = boton.dataset.id;
    $("#titulo-resenas").textContent = `Reseñas de ${boton.dataset.titulo}`;
    cargarResenas();
 });

 $("#form-resena").addEventListener("submit", async evento => {
    evento.preventDefault();
    const {texto, estrellas } = Object.fromEntries(new FormData(evento.target));
    try {
        await escribirResena(estado.peliculaAbierta, texto, estrellas);
        evento.target.reset();
        cargarResenas();
        mostrarMensaje("Resena publicada");
    }catch (error) {
        mostrarMensaje(error.message, true);
    }
 });

pintarSesion();
cargarPeliculas();
