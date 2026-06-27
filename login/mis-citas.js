import { supabase } from "../supabase.js";

let todasLasCitas = [];

async function cargarPaciente() {

    const idPaciente = sessionStorage.getItem("id_paciente");

    if (!idPaciente) {
        window.location.href = "paciente.html";
        return null;
    }

    const { data: paciente, error } = await supabase
        .from("paciente")
        .select("*")
        .eq("id_paciente", idPaciente)
        .single();

    if (error) {
        console.error(error);
        return null;
    }

    document.getElementById("nombreUsuarioSidebar").innerText = paciente.nombre_completo;
    document.getElementById("dniUsuario").innerText = "DNI: " + paciente.dni;

    return idPaciente;
}

async function cargarCitas(idPaciente) {

    const { data, error } = await supabase
        .from("cita")
        .select(`
            id_cita,
            fecha,
            hora,
            motivo,
            estado,
            doctor ( nombre_completo ),
            especialidad ( nombre ),
            pago ( monto, estado_pago, comprobante, metodo_pago )
        `)
        .eq("id_paciente", idPaciente)
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false });

    if (error) {
        console.error(error);
        document.getElementById("lista-citas").innerHTML =
            "<p class='cargando-texto'>Ocurrió un error al cargar tus citas.</p>";
        return;
    }

    todasLasCitas = data;

    renderCitas(todasLasCitas);
}

function obtenerIconoEspecialidad(nombre) {

    switch (nombre) {
        case "Cardiología": return "fas fa-heartbeat";
        case "Dermatología": return "fas fa-user-md";
        case "Pediatría": return "fas fa-child";
        case "Psicología": return "fas fa-brain";
        case "Medicina General": return "fas fa-stethoscope";
        case "Traumatología": return "fas fa-bone";
        default: return "fas fa-user-md";
    }
}

function formatearFecha(fecha) {

    return new Date(fecha + "T00:00:00").toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function claseBadge(estadoCita, estadoPago) {

    // Si la cita aún no tiene pago confirmado
    if (estadoCita === "ESPERANDO_PAGO") return "badge-esperando_pago";
    if (estadoPago === "PENDIENTE") return "badge-pendiente";
    if (estadoCita === "FINALIZADA") return "badge-finalizada";
    if (estadoCita === "CANCELADA") return "badge-cancelada";

    return "badge-confirmada";
}

function textoBadge(estadoCita, estadoPago) {

    if (estadoCita === "ESPERANDO_PAGO") return "Esperando pago";
    if (estadoPago === "PENDIENTE") return "Pago pendiente";
    if (estadoCita === "FINALIZADA") return "Finalizada";
    if (estadoCita === "CANCELADA") return "Cancelada";

    return "Confirmada";
}

function renderCitas(citas) {

    const contenedor = document.getElementById("lista-citas");
    const vacio = document.getElementById("empty-citas");

    if (!citas || citas.length === 0) {
        contenedor.innerHTML = "";
        vacio.style.display = "block";
        return;
    }

    vacio.style.display = "none";

    contenedor.innerHTML = citas.map(c => {

        const nombreDoctor = c.doctor?.nombre_completo || "Doctor no asignado";
        const nombreEspecialidad = c.especialidad?.nombre || "";
        const pago = Array.isArray(c.pago) ? c.pago[0] : c.pago;

        const monto = pago?.monto ? `S/. ${pago.monto}` : "—";
        const badge = claseBadge(c.estado, pago?.estado_pago);
        const texto = textoBadge(c.estado, pago?.estado_pago);

        const linkComprobante = pago?.comprobante
            ? `<a class="ver-comprobante" href="${pago.comprobante}" target="_blank">Ver comprobante</a>`
            : "";

        return `
            <div class="cita-card" data-estado="${badge.replace('badge-', '')}">

                <div class="cita-info">

                    <div class="cita-icono">
                        <i class="${obtenerIconoEspecialidad(nombreEspecialidad)}"></i>
                    </div>

                    <div class="cita-detalle">
                        <h3>${nombreEspecialidad}</h3>
                        <p>Dr(a). ${nombreDoctor}</p>
                        <p>${c.motivo || "Sin motivo especificado"}</p>
                        <p class="cita-fecha">
                            ${formatearFecha(c.fecha)} · ${c.hora.slice(0,5)}
                        </p>
                    </div>

                </div>

                <div class="cita-acciones">
                    <span class="badge-estado ${badge}">${texto}</span>
                    <span class="cita-monto">${monto}</span>
                    ${linkComprobante}
                </div>

            </div>
        `;

    }).join("");
}

function filtrarCitas(filtro, boton) {

    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
    boton.classList.add("active");

    if (filtro === "todas") {
        renderCitas(todasLasCitas);
        return;
    }

    const filtradas = todasLasCitas.filter(c => {

        const pago = Array.isArray(c.pago) ? c.pago[0] : c.pago;
        const badge = claseBadge(c.estado, pago?.estado_pago).replace("badge-", "");

        if (filtro === "pendiente") {
            return badge === "esperando_pago" || badge === "pendiente";
        }

        return badge === filtro;
    });

    renderCitas(filtradas);
}

window.filtrarCitas = filtrarCitas;

async function iniciar() {

    const idPaciente = await cargarPaciente();

    if (!idPaciente) return;

    await cargarCitas(idPaciente);
}

iniciar();
