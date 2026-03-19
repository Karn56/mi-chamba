import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MapaArcgis from "../components/MapaArcgis";

export default function MapaPrueba() {
    const [tecnicos, setTecnicos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarTecnicos = async () => {
            setCargando(true);
            setError("");

            const { data, error } = await supabase
                .from("tecnicos")
                .select(`
          id,
          nombre,
          telefono,
          especialidad,
          experiencia_anios,
          descripcion,
          lat,
          lng,
          disponible,
          tecnico_verificado,
          calificacion_promedio,
          trabajos_completados
        `)
                .not("lat", "is", null)
                .not("lng", "is", null)
                .eq("disponible", true);

            if (error) {
                console.error(error);
                setError("No se pudieron cargar los técnicos.");
            } else {
                setTecnicos(data || []);
            }

            setCargando(false);
        };

        cargarTecnicos();
    }, []);

    return (
        <div style={{ padding: "24px" }}>
            <h1>Mapa de técnicos</h1>

            {cargando && <p>Cargando técnicos...</p>}
            {error && <p>{error}</p>}

            {!cargando && !error && (
                <>
                    <p>Técnicos encontrados: {tecnicos.length}</p>
                    <MapaArcgis tecnicos={tecnicos} />
                </>
            )}
        </div>
    );
}