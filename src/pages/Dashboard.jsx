import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Dashboard() {
    const [userEmail, setUserEmail] = useState("")
    const [userRole, setUserRole] = useState("")
    const [loading, setLoading] = useState(true)
    const [pendingCount, setPendingCount] = useState(0)
    const [tecnicoData, setTecnicoData] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    navigate("/login")
                    return
                }

                setUserEmail(user.email || "")

                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .maybeSingle()

                if (!profileError && profileData) {
                    setUserRole(profileData.role || "")
                }

                if (profileData?.role === "tecnico") {
                    const { data: tecnicoInfo } = await supabase
                        .from("tecnicos")
                        .select(`
                            nombre,
                            especialidad,
                            disponible,
                            identidad_verificada,
                            antecedentes_verificados,
                            tecnico_verificado,
                            calificacion_promedio,
                            trabajos_completados
                        `)
                        .eq("id", user.id)
                        .maybeSingle()

                    if (tecnicoInfo) {
                        setTecnicoData(tecnicoInfo)
                    }
                }

                let solicitudesQuery = supabase
                    .from("solicitudes")
                    .select("*", { count: "exact", head: true })
                    .eq("estado", "pendiente")

                if (profileData?.role === "cliente") {
                    solicitudesQuery = solicitudesQuery.eq("cliente_id", user.id)
                }

                if (profileData?.role === "tecnico") {
                    solicitudesQuery = solicitudesQuery.eq("tecnico_id", user.id)
                }

                const { count } = await solicitudesQuery
                setPendingCount(count || 0)
            } catch (error) {
                console.error("Error cargando dashboard:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [navigate])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    if (loading) {
        return (
            <div className="app-shell">
                <div className="dashboard-home">
                    <div className="dashboard-panel">
                        <p>Cargando dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    const tecnicoNombre = tecnicoData?.nombre || "Técnico"
    const tecnicoEspecialidad = tecnicoData?.especialidad || "No definida"
    const tecnicoDisponible = tecnicoData?.disponible ?? false
    const tecnicoCalificacion = tecnicoData?.calificacion_promedio ?? 0
    const tecnicoTrabajos = tecnicoData?.trabajos_completados ?? 0

    return (
        <div className="app-shell">
            <header className="app-navbar">
                <div className="app-brand">Mi Chamba</div>

                <nav className="app-nav">
                    <Link to="/dashboard">Inicio</Link>
                    <Link to="/solicitudes">Solicitudes</Link>
                    <Link to="/profile">Perfil</Link>
                </nav>

                <button onClick={handleLogout} className="nav-logout-btn">
                    Cerrar sesión
                </button>
            </header>

            <main className="dashboard-home">
                {userRole === "tecnico" ? (
                    <>
                        <section className="hero-dashboard tecnico-hero">
                            <div className="hero-dashboard-text">
                                <span className="dashboard-chip tecnico-chip">
                                    Panel técnico
                                </span>

                                <h1>Hola, {tecnicoNombre}</h1>

                                <p>
                                    Desde aquí puedes gestionar tu perfil profesional,
                                    revisar solicitudes pendientes y fortalecer tu
                                    presencia dentro de la plataforma.
                                </p>
                            </div>

                            <div className="hero-dashboard-summary">
                                <div className="summary-card tecnico-summary-card">
                                    <h3>Resumen profesional</h3>

                                    <p>
                                        <strong>Correo:</strong> {userEmail}
                                    </p>

                                    <p>
                                        <strong>Especialidad:</strong>{" "}
                                        {tecnicoEspecialidad}
                                    </p>

                                    <p>
                                        <strong>Disponibilidad:</strong>{" "}
                                        <span
                                            className={`status-badge ${tecnicoDisponible
                                                    ? "status-on"
                                                    : "status-off"
                                                }`}
                                        >
                                            {tecnicoDisponible
                                                ? "Disponible"
                                                : "No disponible"}
                                        </span>
                                    </p>

                                    <p>
                                        <strong>Calificación:</strong>{" "}
                                        {tecnicoCalificacion}
                                    </p>

                                    <p>
                                        <strong>Trabajos completados:</strong>{" "}
                                        {tecnicoTrabajos}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="dashboard-grid tecnico-grid">
                            <div className="dashboard-panel tecnico-panel">
                                <h2>Solicitudes nuevas</h2>
                                <p>
                                    Tienes <strong>{pendingCount}</strong> solicitud
                                    {pendingCount === 1 ? "" : "es"} pendiente
                                    {pendingCount === 1 ? "" : "s"} por revisar.
                                </p>

                                <div className="panel-actions">
                                    <Link
                                        to="/solicitudes"
                                        className="panel-btn primary-panel-btn"
                                    >
                                        Revisar solicitudes
                                    </Link>
                                </div>
                            </div>

                            <div className="dashboard-panel tecnico-panel">
                                <h2>Estado profesional</h2>

                                <div className="tecnico-metric-list">
                                    <p>
                                        <strong>Especialidad:</strong>{" "}
                                        {tecnicoEspecialidad}
                                    </p>
                                    <p>
                                        <strong>Disponibilidad actual:</strong>{" "}
                                        {tecnicoDisponible
                                            ? "Activa"
                                            : "Desactivada"}
                                    </p>
                                    <p>
                                        <strong>Calificación promedio:</strong>{" "}
                                        {tecnicoCalificacion}
                                    </p>
                                    <p>
                                        <strong>Servicios completados:</strong>{" "}
                                        {tecnicoTrabajos}
                                    </p>
                                </div>
                            </div>

                            <div className="dashboard-panel tecnico-panel">
                                <h2>Verificaciones</h2>

                                <div className="verification-list">
                                    <p
                                        className={`verification-item ${tecnicoData?.identidad_verificada
                                                ? "verified"
                                                : "pending-verification"
                                            }`}
                                    >
                                        Identidad:{" "}
                                        {tecnicoData?.identidad_verificada
                                            ? "Verificada"
                                            : "Pendiente"}
                                    </p>

                                    <p
                                        className={`verification-item ${tecnicoData?.antecedentes_verificados
                                                ? "verified"
                                                : "pending-verification"
                                            }`}
                                    >
                                        Antecedentes:{" "}
                                        {tecnicoData?.antecedentes_verificados
                                            ? "Verificados"
                                            : "Pendiente"}
                                    </p>

                                    <p
                                        className={`verification-item ${tecnicoData?.tecnico_verificado
                                                ? "verified"
                                                : "pending-verification"
                                            }`}
                                    >
                                        Perfil técnico:{" "}
                                        {tecnicoData?.tecnico_verificado
                                            ? "Aprobado"
                                            : "En revisión"}
                                    </p>
                                </div>
                            </div>

                            <div className="dashboard-panel accent-panel tecnico-highlight">
                                <h2>Perfil profesional</h2>
                                <p>
                                    Completa o actualiza tu perfil técnico para generar
                                    más confianza y mejorar tu visibilidad dentro de Mi
                                    Chamba.
                                </p>

                                <div className="panel-actions">
                                    <Link
                                        to="/tecnico-form"
                                        className="panel-btn primary-panel-btn"
                                    >
                                        Editar perfil técnico
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    <>
                        <section className="hero-dashboard">
                            <div className="hero-dashboard-text">
                                <span className="dashboard-chip">
                                    Cuenta cliente
                                </span>

                                <h1>Bienvenido a Mi Chamba</h1>

                                <p>
                                    Desde aquí puedes gestionar tu cuenta, revisar tus
                                    solicitudes y encontrar ayuda confiable cerca de ti.
                                </p>
                            </div>

                            <div className="hero-dashboard-summary">
                                <div className="summary-card">
                                    <h3>Resumen de cuenta</h3>
                                    <p>
                                        <strong>Correo:</strong> {userEmail}
                                    </p>
                                    <p>
                                        <strong>Rol:</strong> {userRole}
                                    </p>
                                    <p>
                                        <strong>Solicitudes pendientes:</strong>{" "}
                                        {pendingCount}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="dashboard-grid">
                            <div className="dashboard-panel">
                                <h2>Solicitudes pendientes</h2>
                                <p>
                                    Actualmente tienes <strong>{pendingCount}</strong>{" "}
                                    solicitud{pendingCount === 1 ? "" : "es"} pendiente
                                    {pendingCount === 1 ? "" : "s"}.
                                </p>

                                <div className="panel-actions">
                                    <Link
                                        to="/solicitudes"
                                        className="panel-btn primary-panel-btn"
                                    >
                                        Ver solicitudes
                                    </Link>
                                </div>
                            </div>

                            <div className="dashboard-panel">
                                <h2>Perfil</h2>
                                <p>
                                    Consulta tu información personal y mantén tus datos
                                    actualizados dentro de la plataforma.
                                </p>

                                <div className="panel-actions">
                                    <Link
                                        to="/profile"
                                        className="panel-btn secondary-panel-btn"
                                    >
                                        Ver perfil
                                    </Link>
                                </div>
                            </div>

                            <div className="dashboard-panel accent-panel">
                                <h2>Explorar técnicos</h2>
                                <p>
                                    Próximamente podrás visualizar técnicos cercanos en el
                                    mapa, revisar perfiles y solicitar un servicio.
                                </p>

                                <div className="panel-actions">
                                        <Link to="/solicitar-servicio" className="panel-btn primary-panel-btn">
                                            Buscar técnicos
                                        </Link>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}

export default Dashboard