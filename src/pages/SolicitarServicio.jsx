import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import MapaArcgis from "../components/MapaArcgis";

export default function SolicitarServicio() {
    const [usuario, setUsuario] = useState(null);
    const [ubicacion, setUbicacion] = useState(null);
    const [ubicacionError, setUbicacionError] = useState("");

    const [tecnicos, setTecnicos] = useState([]);
    const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);

    const [especialidadFiltro, setEspecialidadFiltro] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [servicio, setServicio] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                setError("");

                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();

                if (userError || !user) {
                    console.error(userError);
                    setError("No se pudo obtener la sesión del usuario.");
                    setCargando(false);
                    return;
                }

                setUsuario(user);

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
            identidad_verificada,
            antecedentes_verificados,
            tecnico_verificado,
            calificacion_promedio,
            trabajos_completados
          `)
                    .eq("disponible", true)
                    .not("lat", "is", null)
                    .not("lng", "is", null)
                    .order("tecnico_verificado", { ascending: false })
                    .order("calificacion_promedio", { ascending: false });

                if (error) {
                    console.error(error);
                    setError("No se pudieron cargar los técnicos.");
                } else {
                    setTecnicos(data || []);
                }
            } catch (err) {
                console.error(err);
                setError("Ocurrió un error inesperado.");
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setUbicacionError("Tu navegador no permite obtener ubicación.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUbicacion({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                setUbicacionError("");
            },
            () => {
                setUbicacionError("No se pudo obtener tu ubicación.");
            }
        );
    }, []);

    const especialidades = useMemo(() => {
        return [...new Set(tecnicos.map((t) => t.especialidad).filter(Boolean))].sort();
    }, [tecnicos]);

    const tecnicosFiltrados = useMemo(() => {
        return tecnicos.filter((t) => {
            const matchEspecialidad = especialidadFiltro
                ? t.especialidad === especialidadFiltro
                : true;

            const textoBusqueda =
                `${t.nombre || ""} ${t.especialidad || ""} ${t.descripcion || ""}`.toLowerCase();

            const matchBusqueda = busqueda
                ? textoBusqueda.includes(busqueda.toLowerCase())
                : true;

            return matchEspecialidad && matchBusqueda;
        });
    }, [tecnicos, especialidadFiltro, busqueda]);

    const enviarSolicitud = async (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");

        if (!usuario) {
            setError("No hay sesión activa.");
            return;
        }

        if (!ubicacion?.lat || !ubicacion?.lng) {
            setError("Necesitamos tu ubicación para enviar la solicitud.");
            return;
        }

        if (!tecnicoSeleccionado) {
            setError("Selecciona un técnico antes de continuar.");
            return;
        }

        if (!servicio.trim()) {
            setError("Escribe el servicio que necesitas.");
            return;
        }

        try {
            setEnviando(true);

            const { error } = await supabase.from("solicitudes").insert({
                cliente_id: usuario.id,
                tecnico_id: tecnicoSeleccionado.id,
                servicio: servicio.trim(),
                descripcion: descripcion.trim() || null,
                cliente_lat: ubicacion.lat,
                cliente_lng: ubicacion.lng,
                estado: "pendiente",
            });

            if (error) {
                console.error(error);
                setError("No se pudo enviar la solicitud.");
                return;
            }

            setMensaje("Solicitud enviada correctamente.");
            setServicio("");
            setDescripcion("");
            setTecnicoSeleccionado(null);

            setTimeout(() => {
                navigate("/solicitudes");
            }, 1000);
        } catch (err) {
            console.error(err);
            setError("Ocurrió un error al enviar la solicitud.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="content-page solicitar-wrapper">
            <div className="content-card solicitudes-page-card">
                <div className="solicitar-header">
                    <div>
                        <span className="dashboard-chip">Cliente</span>
                        <h1>Solicitar servicio</h1>
                        <p>
                            Encuentra técnicos cercanos, revisa su perfil y envía tu solicitud
                            desde un solo lugar.
                        </p>
                    </div>
                </div>

                {ubicacion ? (
                    <p style={{ marginTop: 0 }}>Ubicación detectada correctamente.</p>
                ) : (
                    <p style={{ marginTop: 0 }}>
                        {ubicacionError || "Obteniendo ubicación..."}
                    </p>
                )}

                {cargando && <p>Cargando técnicos...</p>}

                {!cargando && (
                    <div className="solicitar-layout">
                        <div className="tecnicos-panel">
                            <h2>Técnicos disponibles</h2>

                            <input
                                className="tecnico-search"
                                type="text"
                                placeholder="Buscar por nombre o especialidad"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />

                            <div className="field-group" style={{ marginBottom: "1rem" }}>
                                <label>Filtrar por especialidad</label>
                                <select
                                    value={especialidadFiltro}
                                    onChange={(e) => setEspecialidadFiltro(e.target.value)}
                                >
                                    <option value="">Todas</option>
                                    {especialidades.map((esp) => (
                                        <option key={esp} value={esp}>
                                            {esp}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="tecnicos-list">
                                {tecnicosFiltrados.length === 0 && (
                                    <div className="empty-solicitudes-box">
                                        No se encontraron técnicos con ese filtro.
                                    </div>
                                )}

                                {tecnicosFiltrados.map((tecnico) => (
                                    <div
                                        key={tecnico.id}
                                        className={`tecnico-card-select ${tecnicoSeleccionado?.id === tecnico.id
                                                ? "tecnico-card-active"
                                                : ""
                                            }`}
                                        onClick={() => setTecnicoSeleccionado(tecnico)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="tecnico-card-top">
                                            <div>
                                                <h3 style={{ margin: 0 }}>{tecnico.nombre}</h3>
                                                <p className="tecnico-description">
                                                    {tecnico.especialidad}
                                                </p>
                                            </div>

                                            <span className="tecnico-tag">
                                                {tecnico.calificacion_promedio ?? 0} ★
                                            </span>
                                        </div>

                                        <p className="tecnico-description">
                                            {tecnico.descripcion || "Sin descripción"}
                                        </p>

                                        <div className="verification-row">
                                            {tecnico.tecnico_verificado && (
                                                <span className="mini-badge success">Verificado</span>
                                            )}
                                            {tecnico.identidad_verificada && (
                                                <span className="mini-badge highlight">Identidad</span>
                                            )}
                                            {tecnico.antecedentes_verificados && (
                                                <span className="mini-badge highlight">
                                                    Antecedentes
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="solicitud-form-panel">
                            <h2>Mapa y solicitud</h2>

                            <div
                                className={`selected-tecnico-box ${!tecnicoSeleccionado ? "empty" : ""
                                    }`}
                            >
                                {tecnicoSeleccionado ? (
                                    <>
                                        <h3 style={{ marginTop: 0 }}>{tecnicoSeleccionado.nombre}</h3>
                                        <p>
                                            <b>Especialidad:</b> {tecnicoSeleccionado.especialidad}
                                        </p>
                                        <p>
                                            <b>Teléfono:</b>{" "}
                                            {tecnicoSeleccionado.telefono || "No disponible"}
                                        </p>
                                        <p>
                                            <b>Experiencia:</b>{" "}
                                            {tecnicoSeleccionado.experiencia_anios ?? 0} años
                                        </p>
                                    </>
                                ) : (
                                    <p>Selecciona un técnico desde la lista o el mapa.</p>
                                )}
                            </div>

                            <MapaArcgis
                                tecnicos={tecnicosFiltrados}
                                ubicacionCliente={ubicacion}
                                tecnicoSeleccionadoId={tecnicoSeleccionado?.id ?? null}
                                onSelectTecnico={setTecnicoSeleccionado}
                            />

                            <form
                                className="auth-form"
                                onSubmit={enviarSolicitud}
                                style={{ marginTop: "1rem" }}
                            >
                                <div className="field-group">
                                    <label>Servicio que necesitas</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Reparación de fuga en cocina"
                                        value={servicio}
                                        onChange={(e) => setServicio(e.target.value)}
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Descripción</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Describe el problema o lo que necesitas"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                    />
                                </div>

                                {error && <div className="form-feedback error">{error}</div>}
                                {mensaje && <div className="form-feedback success">{mensaje}</div>}

                                <button type="submit" disabled={enviando}>
                                    {enviando ? "Enviando..." : "Enviar solicitud"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}