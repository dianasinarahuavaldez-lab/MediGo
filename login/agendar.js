import { supabase } from "../supabase.js";

const pasos = ["Especialidad", "Doctor", "Fecha", "Hora", "Detalle", "Pago"];

let estado = {
    paso: 0,
    idEspecialidad: null,
    especialidad: "",
    doctor: "",
    fecha: "",
    hora: "",
    detalle: "",
    metodo: "",
    idDoctor: null
};

// ---------- DECORATOR ----------
class ConsultaBase {
    precio() {
        return 35;
    }
}

class EspecialidadDecorator {
    constructor(consulta, extra) {
        this.consulta = consulta;
        this.extra = extra;
    }

    precio() {
        return this.consulta.precio() + this.extra;
    }
}

let consultaActual = new ConsultaBase();
let especialidades = [];
let doctores = [];

let horarios = [];

async function cargarEspecialidades() {

    const { data, error } = await supabase
        .from("especialidad")
        .select("*")
        .order("id_especialidad");

    if (error) {
        console.error(error);
        return;
    }

    especialidades = data;

    render();
}

// ---------- RENDER ----------
function render() {

    document.getElementById("barra-progreso").innerHTML = pasos.map((p, i) => `
        <div class="step-item">
            <div class="step-dot ${i <= estado.paso ? "active" : ""}">
                ${i + 1}
            </div>
            <span>${p}</span>
        </div>
        ${i < pasos.length - 1 ? '<div class="line"></div>' : ""}
    `).join("");

    const div = document.getElementById("pantalla-flujo");

    if (estado.paso === 0) {

    div.innerHTML = `
        <h2>Selecciona Especialidad</h2>

        <div class="grid-2">

            ${especialidades.map(e => `

                <div class="card"
                     onclick="guardarEspecialidad(${e.id_especialidad},'${e.nombre}',${e.precio})">

                    <i class="${obtenerIcono(e.nombre)}"></i>

                    <h3>${e.nombre}</h3>

                    <p class="descripcion-especialidad">
                        ${e.descripcion}
                    </p>

                    <strong>S/. ${e.precio}</strong>

                </div>

            `).join("")}

        </div>
    `;

}
   else if (estado.paso === 1) {

    div.innerHTML = `
        <h2>Selecciona Doctor</h2>

        <div class="grid-2">

            ${doctores.map(d => `

                <div class="card"
                     onclick="guardarDoctor(${d.id_doctor}, '${d.nombre_completo}')">

                    <i class="fas fa-user-md"></i><br>

                    <strong>${d.nombre_completo}</strong>

                    <br>

                    CMP: ${d.cmp}

                </div>

            `).join("")}

        </div>
    `;
}
else if (estado.paso === 2) {

    const cards = horarios.map(h => `

        <div class="card"
            onclick="guardar('fecha','${h.dia}',3)">

            <strong>${h.dia}</strong>

            <br>

            ${h.hora_inicio} - ${h.hora_fin}

        </div>

    `).join("");

    div.innerHTML = `

        <h2>Selecciona Fecha</h2>

        <div class="grid-2">

            ${cards}

        </div>

    `;
}

    else if (estado.paso === 3) {

        div.innerHTML = `
        <h2>Selecciona Hora</h2>

        <div class="grid-2">

            <div class="card" onclick="guardar('hora','09:00 AM',4)">
                09:00 AM
            </div>

            <div class="card" onclick="guardar('hora','11:00 AM',4)">
                11:00 AM
            </div>

            <div class="card" onclick="guardar('hora','03:00 PM',4)">
                03:00 PM
            </div>

            <div class="card" onclick="guardar('hora','05:00 PM',4)">
                05:00 PM
            </div>

        </div>
        `;
    }

    else if (estado.paso === 4) {

        div.innerHTML = `
        <h2>Detalles de la consulta</h2>

        <div class="resumen-container">

            <div class="row">
                <span>Especialidad</span>
                <strong>${estado.especialidad}</strong>
            </div>

            <div class="row">
                <span>Doctor</span>
                <strong>${estado.doctor}</strong>
            </div>

            <div class="row">
                <span>Cita</span>
                <strong>${estado.fecha} - ${estado.hora}</strong>
            </div>

        </div>

        <textarea id="input-detalle" placeholder="Motivo de la consulta..."></textarea>

        <button class="btn-final"
            onclick="guardar('detalle',document.getElementById('input-detalle').value,5)">
            Continuar al pago
        </button>
        `;
    }

    else {

        div.innerHTML = `
        <h2>Resumen y Pago</h2>

        <div class="resumen-container">

            <div class="row">
                <span>Especialidad</span>
                <strong>${estado.especialidad}</strong>
            </div>

            <div class="row">
                <span>Doctor</span>
                <strong>${estado.doctor}</strong>
            </div>

            <div class="row">
                <span>Motivo</span>
                <strong>${estado.detalle || "Ninguno"}</strong>
            </div>

            <hr>

            <div class="row">
                <strong>Total</strong>
                <strong>S/. ${consultaActual.precio()}</strong>
            </div>

        </div>

        <div class="grid-2">

            <div class="pay-card" onclick="seleccionarMetodo(this,'Yape')">Yape</div>

            <div class="pay-card" onclick="seleccionarMetodo(this,'Plin')">Plin</div>

            <div class="pay-card" onclick="seleccionarMetodo(this,'Transferencia')">Transferencia</div>

            <div class="pay-card" onclick="seleccionarMetodo(this,'Tarjeta')">Tarjeta</div>

        </div>

        <button class="btn-final"
            id="btn-pagar"
            onclick="ejecutarPago()"
            disabled>

            Confirmar pago S/. ${consultaActual.precio()}

        </button>
        `;
    }
}

function guardar(key, valor, siguiente, extra = 0) {

    estado[key] = valor;

    if (key === "especialidad") {
        consultaActual = new EspecialidadDecorator(new ConsultaBase(), extra);
    }

    estado.paso = siguiente;

    render();
}

async function guardarEspecialidad(id, nombre, precio) {

    estado.idEspecialidad = id;
    estado.especialidad = nombre;

    consultaActual = new EspecialidadDecorator(
        new ConsultaBase(),
        precio
    );

    await cargarDoctores(); // 👈 esto carga datos

    render(); // 👈 ya no necesitas estado.paso aquí
}

async function guardarDoctor(idDoctor, nombre){

    estado.idDoctor = idDoctor;
    estado.doctor = nombre;

    await cargarHorarios(idDoctor);

}

async function cargarHorarios(idDoctor){

    const { data, error } = await supabase
        .from("horario_doctor")
        .select("*")
        .eq("id_doctor", idDoctor)
        .order("dia");

    if(error){
        console.error(error);
        return;
    }

    horarios = data;

    estado.paso = 2;

    render();
}

function obtenerIcono(nombre) {

    switch (nombre) {

        case "Cardiología":
            return "fas fa-heartbeat";

        case "Dermatología":
            return "fas fa-user-md";

        case "Pediatría":
            return "fas fa-child";

        case "Psicología":
            return "fas fa-brain";

        case "Medicina General":
            return "fas fa-stethoscope";

        case "Traumatología":
            return "fas fa-bone";

        default:
            return "fas fa-user-md";
    }

}

async function cargarDoctores() {

    const { data, error } = await supabase
        .from("doctor")
        .select("*")
        .eq("id_especialidad", estado.idEspecialidad);

    console.log("DOCTORES DATA:", data);
    console.log("DOCTORES ERROR:", error);

    if (error) {
        console.error(error);
        return;
    }

    doctores = data;

    estado.paso = 1;

    render();
}

function seleccionarMetodo(card, metodo) {

    estado.metodo = metodo;

    document.querySelectorAll(".pay-card").forEach(c => {
        c.style.borderColor = "#e2e8f0";
    });

    card.style.borderColor = "#0284c7";

    document.getElementById("btn-pagar").disabled = false;
}

function ejecutarPago() {

    alert("Pago confirmado por S/. " + consultaActual.precio());

    window.location.href = "fronted.html";
}

window.guardar = guardar;
window.guardarEspecialidad = guardarEspecialidad;
window.seleccionarMetodo = seleccionarMetodo;
window.ejecutarPago = ejecutarPago;
window.guardarDoctor = guardarDoctor;

cargarEspecialidades();
