import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

const serviciosBase = [
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
]

function Explorar() {
    const [tecnicos, setTecnicos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const cargarTecnicos = async () => {
            try {
                const { data, error } = await supabase
                    .from("tecnicos")
                    .select(`
            id,
            nombre,
            telefono,
            especialidad,
            experiencia_anios,
            descripcion,
            disponible,
            tecnico_verificado,
            calificacion_promedio,
            trabajos_completados
          `)
                    .eq("disponible", true)
                    .order("tecnico_verificado", { ascending: false })
                    .order("calificacion_promedio", { ascending: false })
                    .limit(12)

                if (error) {
                    console.error("Error cargando técnicos:", error)
                    setTecnicos([])
                } else {
                    setTecnicos(data || [])
                }
            } catch (error) {
                console.error("Error inesperado:", error)
                setTecnicos([])
            } finally {
                setLoading(false)
            }
        }

        cargarTecnicos()
    }, [])

    return (
        <div className="page explorar-page">
            <header className="navbar explorar-navbar">
                <div className="logo">Mi Chamba</div>

                <nav className="nav-links">
                    <Link to="/">Inicio</Link>
                    <Link to="/login">Ingresar</Link>
                </nav>
            </header>

            <section className="explorar-hero">
                <div className="explorar-hero-text">
                    <span className="tag">Encuentra ayuda confiable</span>
                    <h1>Servicios y técnicos en un solo lugar</h1>
                    <p>
                        Explora especialidades, conoce perfiles técnicos y encuentra opciones
                        listas para ayudarte con necesidades reales del día a día.
                    </p>

                    <div className="hero-buttons">
                        <a href="#servicios" className="btn primary">
                            Ver servicios
                        </a>
                        <a href="#tecnicos" className="btn secondary">
                            Ver técnicos
                        </a>
                    </div>
                </div>
            </section>

            <section id="servicios" className="explorar-section">
                <div className="section-heading">
                    <span className="dashboard-chip">Servicios</span>
                    <h2>Áreas disponibles dentro de Mi Chamba</h2>
                    <p>
                        Estas son algunas de las especialidades que los usuarios pueden
                        encontrar dentro de la plataforma.
                    </p>
                </div>

                <div className="servicios-grid">
                    {serviciosBase.map((servicio) => (
                        <div key={servicio} className="servicio-card">
                            <h3>{servicio}</h3>
                            <p>
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="tecnicos" className="explorar-section">
                <div className="section-heading">
                    <span className="dashboard-chip tecnico-chip">Técnicos</span>
                    <h2>Técnicos disponibles</h2>
                    <p>
                        Conoce algunos de los perfiles que ya forman parte de la plataforma.
                    </p>
                </div>

                {loading ? (
                    <div className="empty-solicitudes-box">
                        <p>Cargando técnicos...</p>
                    </div>
                ) : tecnicos.length === 0 ? (
                    <div className="empty-solicitudes-box">
                        <h3>Aún no hay técnicos visibles</h3>
                        <p>Cuando haya perfiles disponibles, aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="tecnicos-public-grid">
                        {tecnicos.map((tecnico) => (
                            <div key={tecnico.id} className="tecnico-public-card">
                                <div className="tecnico-public-head">
                                    <div>
                                        <h3>{tecnico.nombre}</h3>
                                        <p>{tecnico.especialidad}</p>
                                    </div>

                                    <span className="tecnico-tag">
                                        {tecnico.calificacion_promedio ?? 0} ★
                                    </span>
                                </div>

                                <p className="tecnico-public-description">
                                    {tecnico.descripcion || "Técnico disponible dentro de la plataforma."}
                                </p>

                                <div className="verification-row">
                                    {tecnico.tecnico_verificado && (
                                        <span className="mini-badge success">Verificado</span>
                                    )}
                                    <span className="mini-badge highlight">
                                        {tecnico.experiencia_anios ?? 0} años
                                    </span>
                                    <span className="mini-badge highlight">
                                        {tecnico.trabajos_completados ?? 0} trabajos
                                    </span>
                                </div>

                                <div className="tecnico-public-footer">
                                    <p>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Explorar