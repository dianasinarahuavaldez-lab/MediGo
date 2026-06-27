import { supabase } from "../supabase.js";

async function probarConexion() {

    const { data, error } = await supabase
        .from("especialidad")
        .select("*");

    if (error) {

        console.error(error);
        alert("❌ Error de conexión");

    } else {

        console.log(data);
        alert("✅ Conexión exitosa");

    }

}

probarConexion();