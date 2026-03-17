import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("cliente")
    const [message, setMessage] = useState("")

    const handleRegister = async (e) => {
        e.preventDefault()
        setMessage("")

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setMessage(error.message)
            return
        }

        const user = data.user

        if (user) {
            const { error: profileError } = await supabase.from("profiles").insert([
                {
                    id: user.id,
                    email: user.email,
                    role: role,
                },
            ])

            if (profileError) {
                setMessage("Cuenta creada, pero hubo un problema guardando el perfil.")
                return
            }
        }

        setMessage("Cuenta creada correctamente.")
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Crear cuenta</h1>
                <p>Regístrate en Mi Chamba para encontrar o brindar servicios.</p>

                <form onSubmit={handleRegister} className="auth-form">
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

                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="cliente">Quiero solicitar servicios</option>
                        <option value="tecnico">Quiero trabajar como técnico</option>
                    </select>

                    <button type="submit">Registrarme</button>
                </form>

                {message && <p className="auth-message">{message}</p>}

                <p className="auth-link-text">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>

                <p className="auth-link-text">
                    <Link to="/">Volver al inicio</Link>
                </p>
            </div>
        </div>
    )
}

export default Register