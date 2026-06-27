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


    async function cargarPaciente() {

    console.log("===== AGENDAR =====");

    const idPaciente = sessionStorage.getItem("id_paciente");

    console.log("ID guardado:", idPaciente);

    if (!idPaciente) {
        window.location.href = "paciente.html";
        return;
    }

    const { data: paciente, error } = await supabase
        .from("paciente")
        .select("*")
        .eq("id_paciente", idPaciente)
        .single();

    console.log("Paciente:", paciente);
    console.log("Error:", error);

    if (error) return;

    document.getElementById("nombreUsuarioSidebar").innerText =
        paciente.nombre_completo;

    document.getElementById("dniUsuario").innerText =
        "DNI: " + paciente.dni;

}

// ---------- DECORATOR ----------
class ConsultaBase {
    precio() {
        return 20;
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

let horaInicioSeleccionada = "";
let horaFinSeleccionada = "";
let duracionConsulta = 30;
let archivoComprobante = null;

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
        onclick="seleccionarHorario(
        '${h.dia}',
        '${h.hora_inicio}',
        '${h.hora_fin}'
        )">

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

    const horas = generarHoras(
        horaInicioSeleccionada,
        horaFinSeleccionada
    );

    div.innerHTML = `
        <h2>Selecciona Hora</h2>

        <div class="grid-2">

            ${horas.map(h => `

                <div class="card"
                    onclick="guardar('hora','${h}',4)">

                    ${h}

                </div>

            `).join("")}

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
                <strong>${formatearFecha(estado.fecha)} - ${estado.hora}</strong>
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

        <div class="comprobante-container" style="margin-top: 16px;">
            <label for="input-comprobante">
                Sube tu captura del pago (comprobante)
            </label>
            <input type="file" id="input-comprobante" accept="image/*">
            <p id="comprobante-nombre" style="font-size: 13px; color: #64748b;"></p>
        </div>

        <button class="btn-final"
            id="btn-pagar"
            onclick="ejecutarPago()"
            disabled>

            Confirmar pago S/. ${consultaActual.precio()}

        </button>
        `;

        document.getElementById("input-comprobante")
            .addEventListener("change", (e) => {
                const archivo = e.target.files[0];
                archivoComprobante = archivo || null;
                document.getElementById("comprobante-nombre").innerText =
                    archivo ? "Archivo seleccionado: " + archivo.name : "";
            });
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

    const especialidad = especialidades.find(e => e.id_especialidad === id);

    duracionConsulta = especialidad.duracion_minutos;

    await cargarDoctores();

    render();
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

function seleccionarHorario(dia, horaInicio, horaFin) {

    const fecha = obtenerProximaFecha(dia);

    estado.fecha = fecha;

    horaInicioSeleccionada = horaInicio;
    horaFinSeleccionada = horaFin;

    estado.paso = 3;

    render();
}

function obtenerProximaFecha(nombreDia) {

    const dias = {
        "Domingo": 0,
        "Lunes": 1,
        "Martes": 2,
        "Miércoles": 3,
        "Jueves": 4,
        "Viernes": 5,
        "Sábado": 6
    };

    const hoy = new Date();

    const objetivo = dias[nombreDia];

    let diferencia = objetivo - hoy.getDay();

    if (diferencia < 0) {
        diferencia += 7;
    }

    const fecha = new Date(hoy);

    fecha.setDate(hoy.getDate() + diferencia);

    return fecha.toISOString().split("T")[0];
}

function formatearFecha(fecha) {

    return new Date(fecha).toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

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

function generarHoras(inicio, fin) {

    const horas = [];

    let [h, m] = inicio.split(":").map(Number);
    const [hf, mf] = fin.split(":").map(Number);

    while (true) {

        const inicioMin = h * 60 + m;
        const finHorario = hf * 60 + mf;

        // La cita debe terminar antes de que acabe el horario
        if (inicioMin + duracionConsulta > finHorario) {
            break;
        }

        horas.push(
            `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );

        // duración de la consulta + 10 minutos de descanso
        let siguiente = inicioMin + duracionConsulta + 10;

        h = Math.floor(siguiente / 60);
        m = siguiente % 60;
    }

    return horas;
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

// ---------- PAGO Y GUARDADO EN BASE DE DATOS ----------
async function ejecutarPago() {

    const idPaciente = sessionStorage.getItem("id_paciente");

    // 1) Insertar la cita
    const { data: citaCreada, error: errorCita } = await supabase
        .from("cita")
        .insert({
            id_paciente: idPaciente,
            id_doctor: estado.idDoctor,
            id_especialidad: estado.idEspecialidad,
            fecha: estado.fecha,
            hora: estado.hora,
            motivo: estado.detalle
        })
        .select()
        .single();

    if (errorCita) {
        console.error(errorCita);
        alert("Ocurrió un error al guardar la cita. Intenta de nuevo.");
        return;
    }

    // 2) Subir el comprobante (si el paciente seleccionó una imagen)
    let urlComprobante = null;

    if (archivoComprobante) {

        const extension = archivoComprobante.name.split(".").pop();
        const nombreArchivo = `cita_${citaCreada.id_cita}_${Date.now()}.${extension}`;

        const { error: errorSubida } = await supabase.storage
            .from("comprobantes")
            .upload(nombreArchivo, archivoComprobante);

        if (errorSubida) {
            console.error(errorSubida);
            alert("La cita se guardó, pero hubo un error al subir el comprobante.");
            return;
        }

        const { data: urlData } = supabase.storage
            .from("comprobantes")
            .getPublicUrl(nombreArchivo);

        urlComprobante = urlData.publicUrl;
    }

    // 3) Insertar el pago asociado a esa cita
    const { error: errorPago } = await supabase
        .from("pago")
        .insert({
            id_cita: citaCreada.id_cita,
            metodo_pago: estado.metodo,
            monto: consultaActual.precio(),
            comprobante: urlComprobante
        });

    if (errorPago) {
        console.error(errorPago);
        alert("La cita se guardó, pero hubo un error al registrar el pago.");
        return;
    }

    alert("Pago confirmado por S/. " + consultaActual.precio());

    window.location.href = "fronted.html";
}

window.guardar = guardar;
window.guardarEspecialidad = guardarEspecialidad;
window.seleccionarMetodo = seleccionarMetodo;
window.ejecutarPago = ejecutarPago;
window.guardarDoctor = guardarDoctor;
window.seleccionarHorario = seleccionarHorario;
cargarPaciente();
cargarEspecialidades();
