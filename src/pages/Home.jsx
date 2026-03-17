import { Link } from "react-router-dom"
import tecnicoImg from "../assets/tecnico.jpg"

function Home() {
    return (
        <div className="page">
            <header className="navbar">
                <div className="logo">Mi Chamba</div>

                <nav className="nav-links">
                    <a href="#">Inicio</a>
                    <a href="#">Servicios</a>
                    <a href="#">Técnicos</a>
                </nav>
            </header>

            <main className="hero">
                <section className="hero-text">
                    <span className="tag">Servicios cerca de ti</span>

                    <h1>Encuentra ayuda confiable, rápida y cercana</h1>

                    <p>
                        Mi Chamba conecta a usuarios con técnicos y talleres cercanos para
                        resolver necesidades del día a día de forma más humana, segura y
                        práctica.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/login" className="btn primary">
                            Solicitar servicio
                        </Link>

                        <Link to="/register" className="btn secondary">
                            Quiero trabajar
                        </Link>
                    </div>
                </section>

                <section className="hero-visual">
                    <div className="image-frame">
                        <img src={tecnicoImg} alt="Técnico trabajando" />
                        <div className="image-badge">Servicio confiable</div>
                    </div>
                </section>
            </main>

            <section className="benefits">
                <div className="benefit">
                    <h3>Confianza</h3>
                    <p>
                        Consulta perfiles, calificaciones y disponibilidad antes de
                        contratar.
                    </p>
                </div>

                <div className="benefit">
                    <h3>Cercanía</h3>
                    <p>
                        Encuentra técnicos y talleres según tu ubicación en tiempo real.
                    </p>
                </div>

                <div className="benefit">
                    <h3>Oportunidad</h3>
                    <p>
                        Los trabajadores ganan más visibilidad y acceso a nuevos clientes.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default Home