import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Dashboard() {
    const [userEmail, setUserEmail] = useState("")
    const [userRole, setUserRole] = useState("")
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                navigate("/login")
                return
            }

            setUserEmail(user.email)

            const { data, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single()

            if (!error && data) {
                setUserRole(data.role)
            }

            setLoading(false)
        }

        fetchProfile()
    }, [navigate])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-card">
                    <p>Cargando perfil...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-card">
                <span className="dashboard-tag">Panel principal</span>
                <h1>Bienvenido a Mi Chamba</h1>
                <p><strong>Correo:</strong> {userEmail}</p>
                <p><strong>Rol:</strong> {userRole}</p>

                {userRole === "cliente" && (
                    <div className="role-box">
                        <h2>Panel de cliente</h2>
                        <p>
                            Aquí podrás buscar técnicos cercanos, solicitar servicios y ver tu
                            historial.
                        </p>
                        <button className="role-btn">Buscar técnicos</button>
                    </div>
                )}

                {userRole === "tecnico" && (
                    <div className="role-box">
                        <h2>Panel de técnico</h2>
                        <p>
                            Aquí podrás completar tu perfil profesional, indicar tu
                            especialidad y aparecer en el mapa.
                        </p>
                        <button className="role-btn">Completar perfil técnico</button>
                    </div>
                )}

                <div className="dashboard-actions">
                    <Link to="/" className="btn secondary">
                        Ir al inicio
                    </Link>

                    <button onClick={handleLogout} className="logout-btn">
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Dashboard