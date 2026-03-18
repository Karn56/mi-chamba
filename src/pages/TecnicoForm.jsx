import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function TecnicoForm() {
    const [nombre, setNombre] = useState("")
    const [telefono, setTelefono] = useState("")
    const [especialidad, setEspecialidad] = useState("")
    const [experienciaAnios, setExperienciaAnios] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [lat, setLat] = useState("")
    const [lng, setLng] = useState("")
    const [disponible, setDisponible] = useState(true)

    const [identidadVerificada, setIdentidadVerificada] = useState(false)
    const [antecedentesVerificados, setAntecedentesVerificados] = useState(false)
    const [tecnicoVerificado, setTecnicoVerificado] = useState(false)

    const [message, setMessage] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage("")

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setMessage("No se pudo identificar al usuario.")
            return
        }

        const { error } = await supabase.from("tecnicos").upsert({
            id: user.id,
            nombre,
            telefono,
            especialidad,
            experiencia_anios: Number(experienciaAnios),
            descripcion,
            lat: Number(lat),
            lng: Number(lng),
            disponible,
            identidad_verificada: identidadVerificada,
            antecedentes_verificados: antecedentesVerificados,
            tecnico_verificado: tecnicoVerificado,
        })

        if (error) {
            setMessage("Hubo un error al guardar el perfil técnico.")
            return
        }

        setMessage(
            "Perfil técnico guardado correctamente. Los documentos visuales aún no se almacenan, solo están indicados en el formulario."
        )

        setTimeout(() => {
            navigate("/dashboard")
        }, 1500)
    }

    return (
        <div className="auth-page">
            <div className="auth-card tecnico-card">
                <h1>Perfil técnico</h1>
                <p>
                    Completa tu información profesional para aparecer en Mi Chamba.
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-section">
                        <h2>Información general</h2>

                        <div className="form-grid">
                            <div className="field-group">
                                <label>Nombre completo</label>
                                <input
                                    type="text"
                                    placeholder="Juan Pérez"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="field-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    placeholder="7000-0000"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="field-group">
                                <label>Especialidad</label>
                                <select
                                    value={especialidad}
                                    onChange={(e) => setEspecialidad(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona una especialidad</option>
                                    <option value="Plomería">Plomería</option>
                                    <option value="Electricidad">Electricidad</option>
                                    <option value="Mecánica automotriz">Mecánica automotriz</option>
                                    <option value="Mecánica de motos">Mecánica de motos</option>
                                    <option value="Electrodomésticos">Electrodomésticos</option>
                                    <option value="Soporte técnico">Soporte técnico</option>
                                    <option value="Reparación de computadoras">
                                        Reparación de computadoras
                                    </option>
                                    <option value="Instalación de cámaras">
                                        Instalación de cámaras
                                    </option>
                                    <option value="Instalación de aire acondicionado">
                                        Instalación de aire acondicionado
                                    </option>
                                    <option value="Refrigeración">Refrigeración</option>
                                    <option value="Carpintería">Carpintería</option>
                                    <option value="Soldadura">Soldadura</option>
                                    <option value="Albañilería">Albañilería</option>
                                    <option value="Pintura">Pintura</option>
                                    <option value="Jardinería">Jardinería</option>
                                    <option value="Cerrajería">Cerrajería</option>
                                    <option value="Instalación de muebles">
                                        Instalación de muebles
                                    </option>
                                    <option value="Limpieza de hogares">Limpieza de hogares</option>
                                    <option value="Lavado de vehículos">Lavado de vehículos</option>
                                    <option value="Tapicería">Tapicería</option>
                                </select>
                            </div>

                            <div className="field-group">
                                <label>Años de experiencia</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={experienciaAnios}
                                    onChange={(e) => setExperienciaAnios(e.target.value)}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="field-group full-width">
                                <label>Descripción profesional</label>
                                <textarea
                                    placeholder="Cuéntanos a qué te dedicas, qué tipo de trabajos haces y qué experiencia tienes."
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    rows="4"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Ubicación</h2>

                        <input
                            type="number"
                            step="any"
                            placeholder="Latitud"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            required
                        />

                        <input
                            type="number"
                            step="any"
                            placeholder="Longitud"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            required
                        />

                    </div>

                   

                    <div className="form-section">
                        <h2>Documentación y evidencia</h2>
                        <p className="section-note">
                            Estos campos son visuales únicamente por el momento.
                        </p>

                        <label className="file-label">
                            Foto de identidad / DUI
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                        </label>

                        <label className="file-label">
                            Antecedentes penales o policiales
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                        </label>

                        <label className="file-label">
                            Certificación o diploma técnico
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                        </label>

                        <label className="file-label">
                            Foto de trabajo realizado 1
                            <input type="file" accept=".jpg,.jpeg,.png" />
                        </label>

                        <label className="file-label">
                            Foto de trabajo realizado 2
                            <input type="file" accept=".jpg,.jpeg,.png" />
                        </label>

                        <label className="file-label">
                            Otro documento de respaldo
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                        </label>
                    </div>

                    <button type="submit">Guardar perfil técnico</button>
                </form>

                {message && <p className="auth-message">{message}</p>}

                <p className="auth-link-text">
                    <Link to="/dashboard">Volver al dashboard</Link>
                </p>
            </div>
        </div>
    )
}

export default TecnicoForm