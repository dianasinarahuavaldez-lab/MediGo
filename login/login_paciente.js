import { supabase } from "../supabase.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const dni = document.getElementById("dni").value.trim();
    const password = document.getElementById("password").value.trim();

    console.log("===== INICIO LOGIN =====");
    console.log("DNI:", dni);
    console.log("Contraseña:", password);

    const { data: paciente, error } = await supabase
        .from("paciente")
        .select("*")
        .eq("dni", dni)
        .eq("contrasena", password)
        .maybeSingle();

    console.log("Paciente encontrado:", paciente);
    console.log("Error Supabase:", error);

    if (error) {
        console.error("Error de Supabase:", error);
        alert(error.message);
        return;
    }

    if (!paciente) {
        console.log("No existe un paciente con esos datos.");
        alert("DNI o contraseña incorrectos.");
        return;
    }

    console.log("Login correcto.");
    console.log("ID Paciente:", paciente.id_paciente);

    sessionStorage.setItem("id_paciente", paciente.id_paciente);

    console.log("Redireccionando a fronted.html...");

    window.location.href = "fronted.html";

});