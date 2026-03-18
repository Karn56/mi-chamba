import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function SolicitarServicio() {
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState("")
    const [tecnicos, setTecnicos] = useState([])
    const [filtro, setFiltro] = useState("")
    const [selectedTecnico, setSelectedTecnico] = useState(null)

    const [servicio, setServicio] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [clienteLat, setClienteLat] = useState("")
    const [clienteLng, setClienteLng] = useState("")
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
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

                if (profileData?.role !== "cliente") {
                    navigate("/dashboard")
                    return
                }

                setUserId(user.id)

                const { data: tecnicosData, error: tecnicosError } = await supabase
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
                    .order("tecnico_verificado", { ascending: false })
                    .order("calificacion_promedio", { ascending: false })

                if (tecnicosError) {
                    setMessage("No se pudieron cargar los técnicos.")
                } else {
                    setTecnicos(tecnicosData || [])
                }
            } catch (error) {
                console.error(error)
                setMessage("Ocurrió un error al cargar la página.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [navigate])

    const obtenerUbicacion = () => {
        setMessage("")

        if (!navigator.geolocation) {
            setMessage("Tu navegador no permite obtener la ubicación.")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setClienteLat(position.coords.latitude.toString())
                setClienteLng(position.coords.longitude.toString())
            },
            () => {
                setMessage("No se pudo obtener tu ubicación.")
            }
        )
    }

    const handleSelectTecnico = (tecnico) => {
        setSelectedTecnico(tecnico)
        setServicio(tecnico.especialidad || "")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage("")

        if (!selectedTecnico) {
            setMessage("Debes seleccionar un técnico.")
            return
        }

        if (!servicio.trim()) {
            setMessage("Debes indicar el tipo de servicio.")
            return
        }

        if (!clienteLat || !clienteLng) {
            setMessage("Debes ingresar tu ubicación o usar el botón de geolocalización.")
            return
        }

        setSending(true)

        try {
            const { error } = await supabase.from("solicitudes").insert([
                {
                    cliente_id: userId,
                    tecnico_id: selectedTecnico.id,
                    servicio: servicio.trim(),
                    descripcion: descripcion.trim(),
                    cliente_lat: Number(clienteLat),
                    cliente_lng: Number(clienteLng),
                    estado: "pendiente",
                },
            ])

            if (error) {
                setMessage("No se pudo enviar la solicitud.")
                setSending(false)
                return
            }

            setMessage("Solicitud enviada correctamente.")
            setDescripcion("")
            setClienteLat("")
            setClienteLng("")
            setSelectedTecnico(null)
            setServicio("")

            setTimeout(() => {
                navigate("/solicitudes")
            }, 1200)
        } catch (error) {
            console.error(error)
            setMessage("Ocurrió un error inesperado.")
        } finally {
            setSending(false)
        }
    }

    const tecnicosFiltrados = tecnicos.filter((tecnico) => {
        const texto = filtro.toLowerCase()
        return (
            tecnico.nombre?.toLowerCase().includes(texto) ||
            tecnico.especialidad?.toLowerCase().includes(texto)
        )
    })

    if (loading) {
        return (
            <div className="app-shell">
                <div className="content-page">
                    <div className="content-card">
                        <p>Cargando técnicos disponibles...</p>
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
                <div className="content-card solicitar-wrapper">
                    <div className="solicitar-header">
                        <div>
                            <h1>Solicitar servicio</h1>
                            <p>
                                Elige un técnico disponible, agrega una descripción breve
                                y envía tu solicitud.
                            </p>
                        </div>

                        <Link to="/dashboard" className="panel-btn secondary-panel-btn">
                            Volver al dashboard
                        </Link>
                    </div>

                    <div className="solicitar-layout">
                        <section className="tecnicos-panel">
                            <h2>Técnicos disponibles</h2>

                            <input
                                type="text"
                                placeholder="Buscar por nombre o especialidad"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="tecnico-search"
                            />

                            <div className="tecnicos-list">
                                {tecnicosFiltrados.length === 0 ? (
                                    <p>No se encontraron técnicos disponibles.</p>
                                ) : (
                                    tecnicosFiltrados.map((tecnico) => (
                                        <div
                                            key={tecnico.id}
                                            className={`tecnico-card-select ${selectedTecnico?.id === tecnico.id
                                                    ? "tecnico-card-active"
                                                    : ""
                                                }`}
                                        >
                                            <div className="tecnico-card-top">
                                                <h3>{tecnico.nombre}</h3>
                                                <span className="tecnico-tag">
                                                    {tecnico.especialidad}
                                                </span>
                                            </div>

                                            <p>
                                                <strong>Experiencia:</strong>{" "}
                                                {tecnico.experiencia_anios ?? 0} años
                                            </p>

                                            <p>
                                                <strong>Calificación:</strong>{" "}
                                                {tecnico.calificacion_promedio ?? 0}
                                            </p>

                                            <p>
                                                <strong>Trabajos completados:</strong>{" "}
                                                {tecnico.trabajos_completados ?? 0}
                                            </p>

                                            <p>
                                                <strong>Teléfono:</strong>{" "}
                                                {tecnico.telefono || "No disponible"}
                                            </p>

                                            <p className="tecnico-description">
                                                {tecnico.descripcion || "Sin descripción."}
                                            </p>

                                            <div className="verification-row">
                                                {tecnico.identidad_verificada && (
                                                    <span className="mini-badge success">
                                                        Identidad verificada
                                                    </span>
                                                )}
                                                {tecnico.antecedentes_verificados && (
                                                    <span className="mini-badge success">
                                                        Antecedentes verificados
                                                    </span>
                                                )}
                                                {tecnico.tecnico_verificado && (
                                                    <span className="mini-badge highlight">
                                                        Técnico verificado
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                className="panel-btn primary-panel-btn"
                                                onClick={() => handleSelectTecnico(tecnico)}
                                            >
                                                {selectedTecnico?.id === tecnico.id
                                                    ? "Técnico seleccionado"
                                                    : "Seleccionar técnico"}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="solicitud-form-panel">
                            <h2>Formulario de solicitud</h2>

                            {selectedTecnico ? (
                                <div className="selected-tecnico-box">
                                    <p>
                                        <strong>Técnico elegido:</strong>{" "}
                                        {selectedTecnico.nombre}
                                    </p>
                                    <p>
                                        <strong>Especialidad:</strong>{" "}
                                        {selectedTecnico.especialidad}
                                    </p>
                                </div>
                            ) : (
                                <div className="selected-tecnico-box empty">
                                    <p>Aún no has seleccionado un técnico.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <label>Servicio solicitado</label>
                                <input
                                    type="text"
                                    placeholder="Ejemplo: Reparación eléctrica"
                                    value={servicio}
                                    onChange={(e) => setServicio(e.target.value)}
                                    required
                                />

                                <label>Descripción del problema</label>
                                <textarea
                                    placeholder="Describe qué necesitas, qué falla presenta o qué tipo de ayuda buscas."
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    rows="5"
                                />

                                <label>Ubicación del cliente</label>
                                <div className="location-grid">
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Latitud"
                                        value={clienteLat}
                                        onChange={(e) => setClienteLat(e.target.value)}
                                        required
                                    />

                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Longitud"
                                        value={clienteLng}
                                        onChange={(e) => setClienteLng(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="panel-btn secondary-panel-btn location-btn"
                                    onClick={obtenerUbicacion}
                                >
                                    Usar mi ubicación actual
                                </button>

                                <button type="submit" disabled={sending}>
                                    {sending ? "Enviando solicitud..." : "Enviar solicitud"}
                                </button>
                            </form>

                            {message && <p className="auth-message">{message}</p>}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default SolicitarServicio