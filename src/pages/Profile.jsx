import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Profile() {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("")
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

            setEmail(user.email || "")

            const { data } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .maybeSingle()

            if (data) {
                setRole(data.role || "")
            }

            setLoading(false)
        }

        fetchProfile()
    }, [navigate])

    if (loading) {
        return (
            <div className="app-shell">
                <div className="content-page">
                    <div className="content-card">
                        <p>Cargando perfil...</p>
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
                <div className="content-card">
                    <h1>Mi perfil</h1>
                    <p><strong>Correo:</strong> {email}</p>
                    <p><strong>Rol:</strong> {role}</p>

                    <div className="panel-actions">
                        <Link to="/dashboard" className="panel-btn secondary-panel-btn">
                            Volver al dashboard
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Profile