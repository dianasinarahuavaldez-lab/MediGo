import { supabase } from "../supabase.js";

const paciente = JSON.parse(sessionStorage.getItem("pacienteRegistro"));

if (!paciente) {
    alert("No se encontraron los datos del registro.");
    window.location.href = "registro-paciente.html";
}

async function finalizarRegistro() {

    const tipoSangre = document.getElementById("tipoSangre").value;
    const alergias = document.getElementById("alergias").value;
    const enfermedades = document.getElementById("enfermedades").value;
    const contactoEmergencia = document.getElementById("contactoEmergencia").value.trim();
    const telefonoEmergencia = document.getElementById("telefonoEmergencia").value.trim();

    if (
        tipoSangre === "" ||
        contactoEmergencia === "" ||
        telefonoEmergencia === ""
    ) {
        alert("Complete los campos obligatorios.");
        return;
    }

    // Verificar si el DNI ya existe
    const { data: existe, error: errorBusqueda } = await supabase
        .from("paciente")
        .select("id_paciente")
        .eq("dni", paciente.dni)
        .maybeSingle();

    if (errorBusqueda) {
        alert("Error al verificar el DNI.");
        console.error(errorBusqueda);
        return;
    }

    if (existe) {
        alert("Este DNI ya se encuentra registrado.");
        return;
    }

    // Registrar paciente
    const { error } = await supabase
        .from("paciente")
        .insert({
            dni: paciente.dni,
            nombre_completo: paciente.nombre_completo,
            correo: paciente.correo,
            contrasena: paciente.contrasena,
            telefono: paciente.telefono,
            fecha_nacimiento: paciente.fecha_nacimiento,
            direccion: paciente.direccion,

            tipo_sangre: tipoSangre,
            alergias: alergias,
            enfermedades_cronicas: enfermedades,

            contacto_emergencia: contactoEmergencia,
            telefono_emergencia: telefonoEmergencia,

            estado: "ACTIVO"
        });

    if (error) {
        console.error(error);
        alert("Error al registrar: " + error.message);
        return;
    }

    alert("Registro completado correctamente.");

    sessionStorage.removeItem("pacienteRegistro");

    window.location.href = "paciente.html";
}

window.finalizarRegistro = finalizarRegistro;