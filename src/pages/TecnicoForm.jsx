import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import SelectorUbicacionMapa from "../components/SelectorUbicacionMapa";

const especialidadesDisponibles = [
    "Plomería",
    "Electricidad",
    "Mecánica automotriz",
    "Mecánica de motos",
    "Electrodomésticos",
    "Soporte técnico",
    "Reparación de computadoras",
    "Instalación de cámaras",
    "Instalación de aire acondicionado",
    "Refrigeración",
    "Carpintería",
    "Soldadura",
    "Albañilería",
    "Pintura",
    "Jardinería",
    "Cerrajería",
    "Instalación de muebles",
    "Limpieza de hogares",
    "Lavado de vehículos",
    "Tapicería",
];

function TecnicoForm() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        especialidad: "",
        experiencia_anios: "",
        descripcion: "",
        lat: "",
        lng: "",
    });

    useEffect(() => {
        const cargarPerfilTecnico = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    navigate("/login");
                    return;
                }

                const { data: tecnicoData, error } = await supabase
                    .from("tecnicos")
                    .select(`
            nombre,
            telefono,
            especialidad,
            experiencia_anios,
            descripcion,
            lat,
            lng,
            disponible,
            identidad_verificada,
            antecedentes_verificados,
            tecnico_verificado
          `)
                    .eq("id", user.id)
                    .maybeSingle();

                if (error) {
                    console.error("Error cargando técnico:", error);
                }

                if (tecnicoData) {
                    setFormData({
                        nombre: tecnicoData.nombre || "",
                        telefono: tecnicoData.telefono || "",
                        especialidad: tecnicoData.especialidad || "",
                        experiencia_anios:
                            tecnicoData.experiencia_anios !== null &&
                                tecnicoData.experiencia_anios !== undefined
                                ? String(tecnicoData.experiencia_anios)
                                : "",
                        descripcion: tecnicoData.descripcion || "",
                        lat:
                            tecnicoData.lat !== null &&
                                tecnicoData.lat !== undefined &&
                                Number(tecnicoData.lat) !== 0
                                ? String(tecnicoData.lat)
                                : "",
                        lng:
                            tecnicoData.lng !== null &&
                                tecnicoData.lng !== undefined &&
                                Number(tecnicoData.lng) !== 0
                                ? String(tecnicoData.lng)
                                : "",
                    });
                }
            } catch (err) {
                console.error("Error inesperado:", err);
            } finally {
                setLoading(false);
            }
        };

        cargarPerfilTecnico();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleUbicacionSeleccionada = (lat, lng) => {
        setFormData((prev) => ({
            ...prev,
            lat: String(lat),
            lng: String(lng),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!formData.nombre.trim()) {
            setError("Escribe tu nombre.");
            return;
        }

        if (!formData.especialidad.trim()) {
            setError("Selecciona o escribe tu especialidad.");
            return;
        }

        try {
            setGuardando(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setError("No hay sesión activa.");
                return;
            }

            const { error } = await supabase.from("tecnicos").upsert({
                id: user.id,
                nombre: formData.nombre.trim(),
                telefono: formData.telefono.trim() || null,
                especialidad: formData.especialidad.trim(),
                experiencia_anios: formData.experiencia_anios
                    ? Number(formData.experiencia_anios)
                    : 0,
                descripcion: formData.descripcion.trim() || null,
                lat: formData.lat !== "" ? Number(formData.lat) : null,
                lng: formData.lng !== "" ? Number(formData.lng) : null,
            })

            if (error) {
                console.error("Error guardando técnico:", error);
                setError("No se pudo guardar el perfil técnico.");
                return;
            }

            setMensaje("Perfil técnico guardado correctamente.");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (err) {
            console.error("Error inesperado:", err);
            setError("Ocurrió un error al guardar el perfil.");
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className="app-shell">
                <div className="content-page">
                    <div className="content-card">
                        <p>Cargando perfil técnico...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <header className="app-navbar">
                <div className="app-brand">Mi Chamba</div>

                <nav className="app-nav">
                    <Link to="/dashboard">Inicio</Link>
                    <Link to="/solicitudes">Solicitudes</Link>
                    <Link to="/profile">Perfil</Link>
                </nav>
            </header>

            <main className="content-page">
                <div className="content-card tecnico-form-card">
                    <span className="dashboard-chip tecnico-chip">Perfil técnico</span>
                    <h1>Completa tu perfil profesional</h1>
                    <p>
                        Llena tu información para mejorar tu visibilidad dentro de Mi Chamba
                        y generar más confianza en los clientes.
                    </p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h2>Información básica</h2>

                            <div className="form-grid">
                                <div className="field-group">
                                    <label>Nombre completo</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej. Carlos Hernández"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="Ej. 7012-3456"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Especialidad</label>
                                    <select
                                        name="especialidad"
                                        value={formData.especialidad}
                                        onChange={handleChange}
                                    >
                                        <option value="">Selecciona una especialidad</option>
                                        {especialidadesDisponibles.map((especialidad) => (
                                            <option key={especialidad} value={especialidad}>
                                                {especialidad}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field-group">
                                    <label>Años de experiencia</label>
                                    <input
                                        type="number"
                                        name="experiencia_anios"
                                        min="0"
                                        value={formData.experiencia_anios}
                                        onChange={handleChange}
                                        placeholder="Ej. 5"
                                    />
                                </div>

                                <div className="field-group full-width">
                                    <label>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        rows="4"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        placeholder="Cuéntale al cliente qué tipo de trabajos realizas."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2>Ubicación en el mapa</h2>
                            <p className="section-note">
                                Haz clic en el mapa para seleccionar la ubicación donde ofreces
                                tus servicios.
                            </p>

                            <SelectorUbicacionMapa
                                lat={formData.lat}
                                lng={formData.lng}
                                onChangeUbicacion={handleUbicacionSeleccionada}
                            />

                            <div className="location-grid" style={{ marginTop: "1rem" }}>
                                <div className="field-group">
                                    <label>Latitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lat"
                                        value={formData.lat}
                                        onChange={handleChange}
                                        placeholder="Latitud"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Longitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lng"
                                        value={formData.lng}
                                        onChange={handleChange}
                                        placeholder="Longitud"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2>Documentos y evidencias</h2>
                            <p className="section-note">
                                Puedes seleccionar archivos como referencia visual.
                            </p>

                            <div className="form-grid">
                                <div className="field-group">
                                    <label className="file-label">
                                        DUI o documento de identidad
                                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" />
                                    </label>
                                </div>

                                <div className="field-group">
                                    <label className="file-label">
                                        Antecedentes o respaldo
                                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" />
                                    </label>
                                </div>

                                <div className="field-group">
                                    <label className="file-label">
                                        Certificación o constancia
                                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" />
                                    </label>
                                </div>

                                <div className="field-group">
                                    <label className="file-label">
                                        Foto de trabajos realizados
                                        <input type="file" accept=".jpg,.jpeg,.png" multiple />
                                    </label>
                                </div>

                                <div className="field-group full-width">
                                    <label className="file-label">
                                        Otros respaldos
                                        <input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" multiple />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {error && <div className="form-feedback error">{error}</div>}
                        {mensaje && <div className="form-feedback success">{mensaje}</div>}

                        <button type="submit" disabled={guardando}>
                            {guardando ? "Guardando..." : "Guardar perfil técnico"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default TecnicoForm;