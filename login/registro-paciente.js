
import { supabase } from "../supabase.js";

const TOKEN_DNI = "06f77f01667b58ae8bf57fcfbb6c7e62f918f7ab62d5db2fdd7672a94276";
const TOKEN_WHATSAPP = "8b3b2f2a-65f1-49d0-9f5e-a1c55c715379";

let codigoVerificacionAPI = "";
let codigoWhatsappGenerado = "";

async function buscarDNI() {

    const dni = document.getElementById("dni").value.trim();

    if (dni.length !== 8) {
        alert("Ingrese un DNI válido");
        return;
    }

    try {

        const respuesta = await fetch(
            "https://api.json.pe/api/dni",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${TOKEN_DNI}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    dni: dni
                })
            }
        );

        const resultado = await respuesta.json();

        if (!resultado.success) {
            alert("No se encontró el DNI");
            return;
        }

        const datos = resultado.data;

        document.getElementById("nombres").value =
            datos.nombres || "";

        document.getElementById("apellidoPaterno").value =
            datos.apellido_paterno || "";

        document.getElementById("apellidoMaterno").value =
            datos.apellido_materno || "";

        codigoVerificacionAPI =
            datos.codigo_verificacion || "";

    } catch (error) {

        console.error(error);
        alert("Error al consultar DNI");

    }
}

function validarIdentidad() {

    const btn = document.getElementById("btnValidar");

    if (codigoVerificacionAPI === "") return;

    const codigoIngresado = document
        .getElementById("codigoVerificacion")
        .value
        .trim()
        .toUpperCase();

    const codigoAPI = codigoVerificacionAPI
        .toString()
        .trim()
        .toUpperCase();

    if (codigoIngresado !== codigoAPI) {

        btn.disabled = true;
        btn.classList.remove("habilitado");
        return;
    }

    // ✔ válido
    btn.disabled = false;
    btn.classList.add("habilitado");
}

function mostrarPaso2() {

    document.getElementById("paso1").style.display = "none";

    document.getElementById("paso2").style.display = "block";

    document.getElementById("tituloPaso").innerText =
        "Paso 2 de 2 - Datos de contacto";
}

//--------------------------------------
async function enviarCodigoWhatsapp() {

    const telefono =
        document.getElementById("telefono").value.trim();

    if (telefono.length !== 9) {

        alert("Ingrese un número válido");
        return;
    }

    codigoWhatsappGenerado =
        Math.floor(100000 + Math.random() * 900000)
            .toString();

    console.log("TOKEN:", TOKEN_WHATSAPP);
    console.log("NUMERO:", "51" + telefono);
    console.log("CODIGO:", codigoWhatsappGenerado);

    try {

        const respuesta = await fetch(
            "https://api.whatsapp.json.pe/send/text",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${TOKEN_WHATSAPP}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    number: "51" + telefono,
                    text: `¡Hola! Tu código de verificación para el registro de MediGo es: ${codigoWhatsappGenerado}\n\nEste código expirará en 15 minutos.\n\nSi no solicitaste este código, puedes ignorar este mensaje.`
                })
            }
        );

        const resultado = await respuesta.json();

        console.log("STATUS:", respuesta.status);
        console.log("RESPUESTA:", resultado);

        if (resultado.success) {

            alert("Código enviado correctamente");

        } else {

            alert(resultado.message);
        }

    } catch (error) {

        console.error("ERROR COMPLETO:", error);
        alert("Error al enviar WhatsApp");
    }
}



function validarCodigoWhatsapp() {

    const codigoIngresado =
        document.getElementById("codigoWhatsapp")
            .value.trim();

    const telefono =
        document.getElementById("telefono");

    const codigo =
        document.getElementById("codigoWhatsapp");

    const mensaje =
        document.getElementById("mensajeWhatsapp");

    if (codigoIngresado === codigoWhatsappGenerado) {

        telefono.style.border = "2px solid #22c55e";
        codigo.style.border = "2px solid #22c55e";

        mensaje.innerHTML =
            "✓ Número verificado correctamente";

        mensaje.style.color =
            "#22c55e";

        document.getElementById("correo").disabled = false;
        document.getElementById("fechaNacimiento").disabled = false;
        document.getElementById("direccion").disabled = false;
        document.getElementById("password").disabled = false;
        document.getElementById("confirmarPassword").disabled = false;

    } else {

        telefono.style.border = "2px solid #ef4444";
        codigo.style.border = "2px solid #ef4444";

        mensaje.innerHTML =
            "✗ Código incorrecto";

        mensaje.style.color =
            "#ef4444";

        document.getElementById("correo").disabled = true;
        document.getElementById("fechaNacimiento").disabled = true;
        document.getElementById("direccion").disabled = true;
        document.getElementById("password").disabled = true;
        document.getElementById("confirmarPassword").disabled = true;
    }
}
// Permite llamar estas funciones desde los botones del HTML
window.buscarDNI = buscarDNI;
window.validarIdentidad = validarIdentidad;
window.mostrarPaso2 = mostrarPaso2;
window.enviarCodigoWhatsapp = enviarCodigoWhatsapp;
window.validarCodigoWhatsapp = validarCodigoWhatsapp;


//Guardar los datos antes de ir a Historial
function irHistorial() {

    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmarPassword").value;

    if (password !== confirmar) {
        alert("Las contraseñas no coinciden");
        return;
    }

      // Validar que los campos estén completos
    if (
        document.getElementById("correo").value.trim() === "" ||
        document.getElementById("fechaNacimiento").value === "" ||
        document.getElementById("direccion").value.trim() === ""
    ) {
        alert("Complete todos los campos.");
        return;
    }

    const paciente = {

        dni: document.getElementById("dni").value.trim(),

        nombre_completo:
            document.getElementById("nombres").value.trim() + " " +
            document.getElementById("apellidoPaterno").value.trim() + " " +
            document.getElementById("apellidoMaterno").value.trim(),

        telefono: document.getElementById("telefono").value.trim(),

        correo: document.getElementById("correo").value.trim(),

        fecha_nacimiento:
            document.getElementById("fechaNacimiento").value,

        direccion:
            document.getElementById("direccion").value.trim(),

        contrasena: password

    };

    sessionStorage.setItem(
        "pacienteRegistro",
        JSON.stringify(paciente)
    );

    window.location.href = "Historial.html";

}

window.irHistorial = irHistorial;