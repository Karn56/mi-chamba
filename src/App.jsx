import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TecnicoForm from "./pages/TecnicoForm";
import Profile from "./pages/Profile";
import Solicitudes from "./pages/Solicitudes";
import MapaPrueba from "./pages/MapaPrueba";
import SolicitarServicio from "./pages/SolicitarServicio";
import Explorar from "./pages/Explorar";
import ComentariosTecnico from "./pages/ComentariosTecnico";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/comentarios-tecnico" element={<ComentariosTecnico />} />
                <Route path="/explorar" element={<Explorar />} />
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tecnico-form" element={<TecnicoForm />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/solicitudes" element={<Solicitudes />} />
                <Route path="/mapa-prueba" element={<MapaPrueba />} />
                <Route path="/solicitar-servicio" element={<SolicitarServicio />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;