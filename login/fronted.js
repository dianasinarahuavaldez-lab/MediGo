import { supabase } from "../supabase.js";

async function cargarDashboard() {

    console.log("===== DASHBOARD =====");

    const idPaciente = sessionStorage.getItem("id_paciente");

    console.log("ID guardado:", idPaciente);

    if (!idPaciente) {
        console.log("No existe id_paciente");
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

    if (error) {
        console.error(error);
        return;
    }

    document.getElementById("nombreUsuarioSidebar").innerText = paciente.nombre_completo;
    document.getElementById("nombreUsuario").innerText = "¡Hola, " + paciente.nombre_completo + "!";
    document.getElementById("dniUsuario").innerText = "DNI: " + paciente.dni;
}

cargarDashboard();