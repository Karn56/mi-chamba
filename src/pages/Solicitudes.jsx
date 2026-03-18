import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Solicitudes() {
    const [solicitudes, setSolicitudes] = useState([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        const fetchSolicitudes = async () => {
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

                if (currentRole === "cliente") {
                    const { data } = await supabase
                        .from("solicitudes")
                        .select(`
                            id,
                            servicio,
                            descripcion,
                            estado,
                            created_at,
                            tecnico:tecnico_id (
                                id,
                                nombre,
                                especialidad,
                                telefono,
                                calificacion_promedio,
                                tecnico_verificado
                            )
                        `)
                        .eq("cliente_id", user.id)
                        .order("created_at", { ascending: false })

                    setSolicitudes(data || [])
                }

                if (currentRole === "tecnico") {
                    const { data } = await supabase
                        .from("solicitudes")
                        .select(`
                            id,
                            servicio,
                            descripcion,
                            estado,
                            created_at,
                            cliente:cliente_id (
                                id,
                                email
                            )
                        `)
                        .eq("tecnico_id", user.id)
                        .order("created_at", { ascending: false })

                    setSolicitudes(data || [])
                }
            } catch (error) {
                console.error("Error cargando solicitudes:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSolicitudes()
    }, [navigate])

    const formatFecha = (fecha) => {
        if (!fecha) return "Sin fecha"
        return new Date(fecha).toLocaleDateString("es-SV", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getEstadoTexto = (estado) => {
        switch (estado) {
            case "pendiente":
                return "Pendiente"
            case "aceptada":
                return "Aceptada"
            case "finalizada":
                return "Finalizada"
            case "cancelada":
                return "Cancelada"
            default:
                return estado
        }
    }

    if (loading) {
        return (
            <div className="app-shell">
                <div className="content-page">
                    <div className="content-card">
                        <p>Cargando solicitudes...</p>
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
                    <Link to="/profile">Perfil</Link>
                </nav>
            </header>

            <main className="content-page">
                <div className="content-card solicitudes-page-card">
                    {role === "cliente" ? (
                        <>
                            <div className="solicitudes-header cliente-header">
                                <div>
                                    <span className="dashboard-chip">Vista cliente</span>
                                    <h1>Mis solicitudes</h1>
                                    <p>
                                        Aquí puedes dar seguimiento a los servicios que has
                                        solicitado dentro de la plataforma.
                                    </p>
                                </div>

                                <Link
                                    to="/solicitar-servicio"
                                    className="panel-btn primary-panel-btn"
                                >
                                    Nueva solicitud
                                </Link>
                            </div>

                            {solicitudes.length === 0 ? (
                                <div className="empty-solicitudes-box">
                                    <h3>Aún no has realizado solicitudes</h3>
                                    <p>
                                        Cuando solicites un servicio, aquí podrás ver su
                                        estado y la información básica del técnico.
                                    </p>
                                </div>
                            ) : (
                                <div className="cliente-solicitudes-list">
                                    {solicitudes.map((solicitud) => (
                                        <div
                                            key={solicitud.id}
                                            className="cliente-solicitud-card"
                                        >
                                            <div className="solicitud-card-top">
                                                <div>
                                                    <h3>{solicitud.servicio}</h3>
                                                    <p className="solicitud-date">
                                                        Creada el{" "}
                                                        {formatFecha(
                                                            solicitud.created_at
                                                        )}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`estado-badge estado-${solicitud.estado}`}
                                                >
                                                    {getEstadoTexto(
                                                        solicitud.estado
                                                    )}
                                                </span>
                                            </div>

                                            <div className="solicitud-body-grid">
                                                <div>
                                                    <h4>Descripción</h4>
                                                    <p>
                                                        {solicitud.descripcion ||
                                                            "Sin descripción."}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h4>Técnico asignado</h4>
                                                    <p>
                                                        <strong>Nombre:</strong>{" "}
                                                        {solicitud.tecnico?.nombre ||
                                                            "No disponible"}
                                                    </p>
                                                    <p>
                                                        <strong>Especialidad:</strong>{" "}
                                                        {solicitud.tecnico
                                                            ?.especialidad ||
                                                            "No disponible"}
                                                    </p>
                                                    <p>
                                                        <strong>Teléfono:</strong>{" "}
                                                        {solicitud.tecnico
                                                            ?.telefono ||
                                                            "No disponible"}
                                                    </p>
                                                    <p>
                                                        <strong>Calificación:</strong>{" "}
                                                        {solicitud.tecnico
                                                            ?.calificacion_promedio ??
                                                            0}
                                                    </p>

                                                    {solicitud.tecnico
                                                        ?.tecnico_verificado && (
                                                            <span className="mini-badge highlight">
                                                                Técnico verificado
                                                            </span>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="solicitudes-header tecnico-header">
                                <div>
                                    <span className="dashboard-chip tecnico-chip">
                                        Vista técnica
                                    </span>
                                    <h1>Solicitudes recibidas</h1>
                                    <p>
                                        Aquí puedes revisar los trabajos que han sido
                                        enviados a tu perfil como técnico.
                                    </p>
                                </div>

                                <Link
                                    to="/dashboard"
                                    className="panel-btn secondary-panel-btn"
                                >
                                    Volver al dashboard
                                </Link>
                            </div>

                            {solicitudes.length === 0 ? (
                                <div className="empty-solicitudes-box tecnico-empty">
                                    <h3>No tienes solicitudes por ahora</h3>
                                    <p>
                                        Cuando un cliente te seleccione y te envíe una
                                        solicitud, aparecerá aquí como parte de tu bandeja
                                        de trabajo.
                                    </p>
                                </div>
                            ) : (
                                <div className="tecnico-solicitudes-board">
                                    {solicitudes.map((solicitud) => (
                                        <div
                                            key={solicitud.id}
                                            className="tecnico-solicitud-card"
                                        >
                                            <div className="tecnico-card-head">
                                                <span
                                                    className={`estado-badge estado-${solicitud.estado}`}
                                                >
                                                    {getEstadoTexto(
                                                        solicitud.estado
                                                    )}
                                                </span>

                                                <p className="solicitud-date">
                                                    {formatFecha(
                                                        solicitud.created_at
                                                    )}
                                                </p>
                                            </div>

                                            <h3>{solicitud.servicio}</h3>

                                            <div className="tecnico-client-box">
                                                <p>
                                                    <strong>Cliente:</strong>{" "}
                                                    {solicitud.cliente?.email ||
                                                        "No disponible"}
                                                </p>
                                            </div>

                                            <div className="tecnico-description-box">
                                                <h4>Detalle del trabajo</h4>
                                                <p>
                                                    {solicitud.descripcion ||
                                                        "El cliente no dejó descripción."}
                                                </p>
                                            </div>

                                            <div className="tecnico-card-footer">
                                                <span className="mini-badge success">
                                                    Solicitud recibida
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Solicitudes