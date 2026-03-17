import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setMessage("")

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessage(error.message)
            return
        }

        navigate("/dashboard")
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Iniciar sesión</h1>
                <p>Accede a Mi Chamba para solicitar o gestionar servicios.</p>

                <form onSubmit={handleLogin} className="auth-form">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Entrar</button>
                </form>

                {message && <p className="auth-message">{message}</p>}

                <p className="auth-link-text">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>

                <p className="auth-link-text">
                    <Link to="/">Volver al inicio</Link>
                </p>
            </div>
        </div>
    )
}

export default Login