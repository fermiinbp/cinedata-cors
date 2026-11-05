import { API_URL } from "./config.js";

async function pedir(ruta, opciones = {}) {
    const cabecera = {};
    const token = localStorage.getItem("token");
    if (token) cabecera.Authorization = `Bearer ${token}`;
    if (opciones.body) cabecera["Content-Type"] = "application/json";

    const res = await fetch(`${API_URL}${ruta}`, {...opciones, headers: cabecera});
    const datos = res.status === 204 ? null : await res.json();
    if (!res.ok){
        const error = new Error(datos?.error || `Error ${res.status}`);
        error.detalles = Array.isArray(datos?.detalles) ? datos.detalles : [];
        throw error;
    }
    return datos;
}

export function estadisticasPorGenero(minimo) {
    const query = new URLSearchParams();
    if (minimo !== undefined && minimo !== "") query.set("minimo", minimo);
    const texto = query.toString();
    return pedir(`/peliculas/estadisticas${texto ? `?${texto}` : ""}`);
}

export function listarPeliculas(parametros) {
    const query = new URLSearchParams(parametros);
    return pedir(`/peliculas?${query}`);
}

export function resenasDe(peliculaId) {
    return pedir(`/peliculas/${peliculaId}/resenas`);
}

export function escribirResena(peliculaId, texto, estrellas) {
    const cuerpoRespuesta = { texto, estrellas }
    return pedir(`/peliculas/${peliculaId}/resenas`, { 
        method: "POST", 
        body: JSON.stringify(cuerpoRespuesta)
    })
}

export async function login(email, password) {
    const datos = await pedir("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });

    if(!datos) {
        throw new Error({error: "Usuario y contraseña incorrectos"});
    }

    localStorage.setItem("token", datos.token);
    localStorage.setItem("usuario", JSON.stringify(datos.usuario));

    return datos.usuario;
}

export function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
}

export function usuarioActual() {
    return JSON.parse(localStorage.getItem("usuario"));
}

