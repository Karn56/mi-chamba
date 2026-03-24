import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function ComentariosTecnico() {
    const [loading, setLoading] = useState(true)
    const [comentarios, setComentarios] = useState([])
    const [tecnicoInfo, setTecnicoInfo] = useState(null)
    const [role, setRole] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        const cargarComentarios = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    navigate("/login")
                    return
                }

                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .maybeSingle()

                const currentRole = profileData?.role || ""
                setRole(currentRole)

                if (currentRole !== "tecnico") {
                    navigate("/dashboard")
                    return
                }

                const { data: tecnicoData } = await supabase
                    .from("tecnicos")
                    .select(`
                        id,
                        nombre,
                        calificacion_promedio,
                        trabajos_completados,
                        tecnico_verificado
                    `)
                    .eq("id", user.id)
                    .maybeSingle()

                setTecnicoInfo(tecnicoData || null)

                const { data: comentariosData, error } = await supabase
                    .from("calificaciones")
                    .select(`
                        id,
                        puntuacion,
                        comentario,
                        created_at,
                        cliente:cliente_id (
                            id,
                            email
                        ),
                        solicitud:solicitud_id (
                            id,
                            servicio,
                            estado
                        )
                    `)
                    .eq("tecnico_id", user.id)
                    .order("created_at", { ascending: false })

                if (error) {
                    console.error("Error cargando comentarios:", error)
                    setComentarios([])
                } else {
                    setComentarios(comentariosData || [])
                }
            } catch (error) {
                console.error("Error inesperado:", error)
                setComentarios([])
            } finally {
                setLoading(false)
            }
        }

        cargarComentarios()
    }, [navigate])

    const promedioVisible = useMemo(() => {
        if (!comentarios.length) return 0
        const suma = comentarios.reduce(
            (acc, item) => acc + Number(item.puntuacion || 0),
            0
        )
        return (suma / comentarios.length).toFixed(1)
    }, [comentarios])

    const formatFecha = (fecha) => {
        if (!fecha) return "Sin fecha"
        return new Date(fecha).toLocaleDateString("es-SV", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const renderEstrellas = (valor) => {
        const estrellas = Number(valor) || 0
        return "★".repeat(estrellas) + "☆".repeat(5 - estrellas)
    }

    if (loading) {
        return (
            <div className="app-shell">
                <div className="content-page">
                    <div className="content-card">
                        <p>Cargando comentarios...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="app-shell">
            <header className="app-navbar">
                <div className="app-brand">Mi Chamba</div>

                <nav className="app-nav">
                    <Link to="/dashboard">Inicio</Link>
                    <Link to="/solicitudes">Solicitudes</Link>
                    <Link to="/comentarios-tecnico">Comentarios</Link>
                    <Link to="/profile">Perfil</Link>
                </nav>
            </header>

            <main className="content-page">
                <div className="content-card">
                    <div className="solicitudes-header tecnico-header">
                        <div>
                            <span className="dashboard-chip tecnico-chip">
                                Vista técnica
                            </span>
                            <h1>Comentarios y calificaciones</h1>
                            <p>
                                Aquí puedes leer lo que tus clientes han opinado
                                sobre los trabajos finalizados.
                            </p>
                        </div>

                        <Link
                            to="/dashboard"
                            className="panel-btn secondary-panel-btn"
                        >
                            Volver al dashboard
                        </Link>
                    </div>

                    <div className="comentarios-summary-grid">
                        <div className="summary-card tecnico-summary-card">
                            <h3>{tecnicoInfo?.nombre || "Mi perfil técnico"}</h3>
                            <p>
                                <strong>Calificación promedio:</strong>{" "}
                                {tecnicoInfo?.calificacion_promedio ?? promedioVisible} ★
                            </p>
                            <p>
                                <strong>Comentarios recibidos:</strong>{" "}
                                {comentarios.length}
                            </p>
                            <p>
                                <strong>Trabajos completados:</strong>{" "}
                                {tecnicoInfo?.trabajos_completados ?? 0}
                            </p>

                            {tecnicoInfo?.tecnico_verificado && (
                                <span className="mini-badge success">
                                    Técnico verificado
                                </span>
                            )}
                        </div>
                    </div>

                    {comentarios.length === 0 ? (
                        <div className="empty-solicitudes-box tecnico-empty">
                            <h3>Aún no tienes comentarios</h3>
                            <p>
                                Cuando finalices trabajos y tus clientes te
                                califiquen, aquí aparecerán sus opiniones.
                            </p>
                        </div>
                    ) : (
                        <div className="comentarios-grid">
                            {comentarios.map((item) => (
                                <div key={item.id} className="comentario-card">
                                    <div className="comentario-card-head">
                                        <div>
                                            <h3>
                                                {item.solicitud?.servicio ||
                                                    "Servicio realizado"}
                                            </h3>
                                            <p className="solicitud-date">
                                                {formatFecha(item.created_at)}
                                            </p>
                                        </div>

                                        <span className="tecnico-tag">
                                            {item.puntuacion} ★
                                        </span>
                                    </div>

                                    <div className="rating-stars">
                                        {renderEstrellas(item.puntuacion)}
                                    </div>

                                    <div className="comentario-meta">
                                        <p>
                                            <strong>Cliente:</strong>{" "}
                                            {item.cliente?.email || "No disponible"}
                                        </p>
                                        <p>
                                            <strong>Estado del trabajo:</strong>{" "}
                                            {item.solicitud?.estado || "No disponible"}
                                        </p>
                                    </div>

                                    <div className="comentario-box">
                                        <h4>Comentario</h4>
                                        <p>
                                            {item.comentario ||
                                                "El cliente no dejó comentario."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ComentariosTecnico