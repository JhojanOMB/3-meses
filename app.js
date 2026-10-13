const extensionesImagen = ["jpg", "jpeg", "png", "webp"];
const duracionCancion = document.getElementById("audioCancion");
const lienzoEstrellas = document.getElementById("lienzoEstrellas");
const contextoEstrellas = lienzoEstrellas?.getContext("2d");
const modeloGatito = document.getElementById("modeloGatito");
let estrellas = [];
let formasCorazon = null;

function activarRotacionGatito() {
    if (!modeloGatito || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    modeloGatito.setAttribute("auto-rotate", "");
    modeloGatito.setAttribute("rotation-per-second", "30deg");
    modeloGatito.setAttribute("auto-rotate-delay", "0");
}

function cargarImagenNumerada(imagen) {
    const { serie, numero, alternativa } = imagen.dataset;
    const fuentes = extensionesImagen.map(extension => `Img/${serie}${numero}.${extension}`);
    const contenedorDetalle = imagen.closest(".detalle-collage");
    if (alternativa) fuentes.push(alternativa);

    let indiceFuente = 0;
    const probarSiguienteFuente = () => {
        if (indiceFuente >= fuentes.length) {
            imagen.hidden = true;
            if (contenedorDetalle) contenedorDetalle.hidden = true;
            console.error(`No se encontró la imagen Img/${serie}${numero} en los formatos admitidos.`);
            return;
        }
        imagen.src = fuentes[indiceFuente++];
    };

    imagen.addEventListener("load", () => {
        imagen.classList.add("cargado");
        if (contenedorDetalle) {
            contenedorDetalle.hidden = false;
            contenedorDetalle.classList.add("cargado");
        } else {
            imagen.hidden = false;
        }
    });
    imagen.addEventListener("error", probarSiguienteFuente);
    probarSiguienteFuente();
}

function mostrarAviso(mensaje, esError = false) {
    const aviso = document.getElementById("avisoPagina");
    if (!aviso) return;

    aviso.textContent = mensaje;
    aviso.classList.toggle("aviso-error", esError);
    aviso.classList.add("aviso-mostrado");
    window.clearTimeout(mostrarAviso.temporizador);
    mostrarAviso.temporizador = window.setTimeout(() => {
        aviso.classList.remove("aviso-mostrado");
    }, 4200);
}

function cargarImagenesFijas() {
    document.querySelectorAll("img[data-serie][data-numero]").forEach(imagen => {
        if (imagen.closest(".marco-foto")) imagen.classList.add("marco-foto-imagen");
        cargarImagenNumerada(imagen);
    });
}

function actualizarIconosReproductor() {
    const icono = document.getElementById("iconoReproduccion");
    const boton = document.getElementById("botonReproduccion");
    const iconoEncabezado = document.getElementById("iconoAudioEncabezado");
    const textoEncabezado = document.getElementById("textoAudioEncabezado");
    if (!duracionCancion || !icono || !boton) return;

    const reproduciendo = !duracionCancion.paused;
    icono.classList.toggle("fa-play", !reproduciendo);
    icono.classList.toggle("fa-pause", reproduciendo);
    icono.classList.toggle("ml-0.5", !reproduciendo);
    boton.setAttribute("aria-label", reproduciendo ? "Pausar canción" : "Reproducir canción");
    if (iconoEncabezado) {
        iconoEncabezado.classList.toggle("fa-music", !reproduciendo);
        iconoEncabezado.classList.toggle("fa-volume-high", reproduciendo);
    }
    if (textoEncabezado) {
        textoEncabezado.textContent = reproduciendo ? "Sonando..." : "Música";
    }
}

function formatearTiempo(segundos) {
    if (!Number.isFinite(segundos)) return "0:00";
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = Math.floor(segundos % 60);
    return `${minutos}:${String(segundosRestantes).padStart(2, "0")}`;
}

function actualizarReproductor() {
    if (!duracionCancion) return;
    const tiempoActual = document.getElementById("tiempoActual");
    const duracionTotal = document.getElementById("duracionTotal");
    const barraProgreso = document.getElementById("barraProgreso");
    if (!tiempoActual || !duracionTotal || !barraProgreso) return;

    tiempoActual.textContent = formatearTiempo(duracionCancion.currentTime);
    duracionTotal.textContent = formatearTiempo(duracionCancion.duration);
    const avance = duracionCancion.duration
        ? (duracionCancion.currentTime / duracionCancion.duration) * 100
        : 0;
    barraProgreso.style.width = `${avance}%`;
}

async function alternarReproduccion() {
    if (!duracionCancion) return;
    if (duracionCancion.paused) {
        if (duracionCancion.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            console.error("No hay una fuente de audio que el navegador pueda leer.", duracionCancion.error);
            mostrarAviso("El navegador no pudo leer Universe - Te Amo.mp3. Verifica que sea un archivo MP3 válido.", true);
            return;
        }
        try {
            await duracionCancion.play();
        } catch (error) {
            console.error("No se pudo reproducir la canción Universe - Te Amo.", error);
            mostrarAviso("No se pudo reproducir la canción. Comprueba que el archivo siga dentro de Img.", true);
        }
    } else {
        duracionCancion.pause();
    }
    actualizarIconosReproductor();
}

function buscarAudio(evento) {
    if (!duracionCancion?.duration) return;
    const limites = evento.currentTarget.getBoundingClientRect();
    if (!limites.width) return;
    const posicion = Math.max(0, Math.min(1, (evento.clientX - limites.left) / limites.width));
    duracionCancion.currentTime = posicion * duracionCancion.duration;
}

function saltarCancion(segundos) {
    if (!duracionCancion || !Number.isFinite(duracionCancion.duration)) return;
    duracionCancion.currentTime = Math.max(
        0,
        Math.min(duracionCancion.duration, duracionCancion.currentTime + segundos)
    );
}

function cambiarVolumen(valor) {
    if (duracionCancion) duracionCancion.volume = Number(valor);
}

function voltearMarco(identificador) {
    document.getElementById(identificador)?.classList.toggle("volteado");
}

function actualizarContador() {
    const fechaInicio = new Date(2026, 6, 11);
    const tiempoTranscurrido = Math.max(0, Date.now() - fechaInicio.getTime());
    const valores = {
        contadorDias: Math.floor(tiempoTranscurrido / 86400000),
        contadorHoras: Math.floor((tiempoTranscurrido / 3600000) % 24),
        contadorMinutos: Math.floor((tiempoTranscurrido / 60000) % 60),
        contadorSegundos: Math.floor((tiempoTranscurrido / 1000) % 60)
    };

    Object.entries(valores).forEach(([identificador, valor]) => {
        const elemento = document.getElementById(identificador);
        if (elemento) {
            elemento.textContent = identificador === "contadorDias"
                ? String(valor)
                : String(valor).padStart(2, "0");
        }
    });
}

function lanzarConfeti() {
    if (!window.confetti) {
        console.error("No se pudo cargar la biblioteca de confeti.");
        return;
    }
    window.confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.65 },
        colors: ["#D4AF37", "#FFCCD5", "#B81932", "#FFF0F3"]
    });
}

function lanzarLluviaCorazones() {
    crearCorazonesAnimados();

    if (!window.confetti || typeof window.confetti.shapeFromText !== "function") {
        console.warn("No se pudo cargar canvas-confetti; se mostrarán los corazones animados de respaldo.");
        return;
    }

    if (!formasCorazon) {
        const colores = ["#b81932", "#ff5c8a", "#ffccd5", "#d4af37"];
        formasCorazon = colores.map(color =>
            window.confetti.shapeFromText({ text: "♥", scalar: 1.1, color })
        );
    }
    [0, 180, 360, 540, 720].forEach(retraso => {
        window.setTimeout(() => {
            window.confetti({
                particleCount: 18,
                angle: 270,
                spread: 36,
                startVelocity: 9,
                gravity: 0.9,
                ticks: 300,
                scalar: 1.2,
                shapes: formasCorazon,
                origin: { x: Math.random(), y: 0.02 },
                disableForReducedMotion: true
            });
        }, retraso);
    });
}

function crearCorazonesAnimados() {
    const colores = ["#b81932", "#ff5c8a", "#ffccd5", "#d4af37"];
    const cantidad = 42;

    for (let indice = 0; indice < cantidad; indice += 1) {
        const corazon = document.createElement("span");
        const demora = Math.random() * 1.4;
        const duracion = 2.8 + Math.random() * 2.4;
        corazon.className = "corazon-lluvia";
        corazon.textContent = "♥";
        corazon.setAttribute("aria-hidden", "true");
        corazon.style.setProperty("--posicion-x", `${Math.random() * 100}vw`);
        corazon.style.setProperty("--duracion-caida", `${duracion}s`);
        corazon.style.setProperty("--retraso-caida", `${demora}s`);
        corazon.style.setProperty("--deriva-x", `${Math.random() * 160 - 80}px`);
        corazon.style.setProperty("--giro-corazon", `${Math.random() * 100 - 50}deg`);
        corazon.style.setProperty("--color-corazon", colores[indice % colores.length]);
        corazon.style.setProperty("--tamano-corazon", `${16 + Math.random() * 24}px`);
        corazon.addEventListener("animationend", () => corazon.remove(), { once: true });
        document.body.append(corazon);
        window.setTimeout(() => corazon.remove(), (demora + duracion + 0.5) * 1000);
    }
}

function alternarRegalo() {
    const boton = document.getElementById("botonAbrirRegalo");
    const cupon = document.getElementById("contenidoCupon");
    const texto = document.getElementById("textoBotonRegalo");
    if (!boton || !cupon || !texto) return;

    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto));
    boton.classList.toggle("regalo-abierto", !abierto);
    texto.textContent = abierto ? "Toca aquí amor" : "Cerrar regalo";
    cupon.hidden = abierto;
    cupon.classList.toggle("cupon-visible", !abierto);

    if (!abierto) {
        cupon.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function ajustarLienzoEstrellas() {
    if (!lienzoEstrellas || !contextoEstrellas) return;
    const escala = Math.min(window.devicePixelRatio || 1, 2);
    lienzoEstrellas.width = Math.floor(window.innerWidth * escala);
    lienzoEstrellas.height = Math.floor(window.innerHeight * escala);
    lienzoEstrellas.style.width = `${window.innerWidth}px`;
    lienzoEstrellas.style.height = `${window.innerHeight}px`;
    contextoEstrellas.setTransform(escala, 0, 0, escala, 0, 0);
    estrellas = Array.from({ length: 65 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        tamano: Math.random() * 1.7 + 0.4,
        fase: Math.random() * Math.PI * 2,
        velocidad: Math.random() * 0.001 + 0.0003
    }));
}

function animarEstrellas(instante) {
    if (!contextoEstrellas) return;
    contextoEstrellas.clearRect(0, 0, window.innerWidth, window.innerHeight);
    estrellas.forEach(estrella => {
        const opacidad = 0.2 + (Math.sin(instante * estrella.velocidad + estrella.fase) + 1) * 0.3;
        contextoEstrellas.beginPath();
        contextoEstrellas.arc(estrella.x, estrella.y, estrella.tamano, 0, Math.PI * 2);
        contextoEstrellas.fillStyle = `rgba(248, 231, 155, ${opacidad})`;
        contextoEstrellas.fill();
    });
    window.requestAnimationFrame(animarEstrellas);
}

window.alternarReproduccion = alternarReproduccion;
window.actualizarReproductor = actualizarReproductor;
window.buscarAudio = buscarAudio;
window.saltarCancion = saltarCancion;
window.cambiarVolumen = cambiarVolumen;
window.voltearMarco = voltearMarco;
window.lanzarConfeti = lanzarConfeti;
window.lanzarLluviaCorazones = lanzarLluviaCorazones;

document.getElementById("botonAbrirRegalo")?.addEventListener("click", alternarRegalo);
customElements.whenDefined("model-viewer").then(activarRotacionGatito);

try {
    cargarImagenesFijas();
} catch (error) {
    console.error("No se pudieron cargar las fotos fijas del collage.", error);
    mostrarAviso("No se pudieron cargar las fotos del collage.", true);
}

if (duracionCancion) {
    actualizarIconosReproductor();
    duracionCancion.addEventListener("loadedmetadata", actualizarReproductor);
    duracionCancion.addEventListener("timeupdate", actualizarReproductor);
    duracionCancion.addEventListener("play", actualizarIconosReproductor);
    duracionCancion.addEventListener("pause", actualizarIconosReproductor);
    duracionCancion.addEventListener("ended", actualizarIconosReproductor);
    duracionCancion.addEventListener("error", () => {
        console.error("El navegador no pudo leer Universe - Te Amo.mp3.", duracionCancion.error);
        mostrarAviso("El navegador no pudo leer Universe - Te Amo.mp3. Verifica que sea un archivo MP3 válido.", true);
    });
}

actualizarContador();
window.setInterval(actualizarContador, 1000);
window.addEventListener("resize", ajustarLienzoEstrellas);
ajustarLienzoEstrellas();
window.requestAnimationFrame(animarEstrellas);
