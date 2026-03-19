import { useEffect, useRef } from "react";
import "../lib/arcgis";

import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";

export default function MapaArcgis({ tecnicos = [] }) {
    const mapRef = useRef(null);
    const viewRef = useRef(null);
    const graphicsLayerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || viewRef.current) return;

        const map = new Map({
            basemap: "arcgis/topographic",
        });

        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);
        graphicsLayerRef.current = graphicsLayer;

        const view = new MapView({
            container: mapRef.current,
            map,
            center: [-89.2182, 13.6929], // San Salvador
            zoom: 12,
            popup: {
                dockEnabled: true,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false,
                    position: "bottom-right",
                },
            },
        });

        viewRef.current = view;

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const view = viewRef.current;
        const graphicsLayer = graphicsLayerRef.current;

        if (!view || !graphicsLayer) return;

        graphicsLayer.removeAll();

        const tecnicosValidos = tecnicos.filter(
            (t) =>
                t.lat !== null &&
                t.lng !== null &&
                !Number.isNaN(Number(t.lat)) &&
                !Number.isNaN(Number(t.lng))
        );

        const graphics = tecnicosValidos.map((tecnico) => {
            return new Graphic({
                geometry: {
                    type: "point",
                    longitude: Number(tecnico.lng),
                    latitude: Number(tecnico.lat),
                },
                symbol: {
                    type: "simple-marker",
                    color: tecnico.tecnico_verificado ? "#4f7f2d" : "#8fcd49",
                    size: 12,
                    outline: {
                        color: "#ffffff",
                        width: 2,
                    },
                },
                attributes: tecnico,
                popupTemplate: {
                    title: tecnico.nombre || "Técnico",
                    content: `
            <b>Especialidad:</b> ${tecnico.especialidad || "No especificada"}<br/>
            <b>Teléfono:</b> ${tecnico.telefono || "No disponible"}<br/>
            <b>Experiencia:</b> ${tecnico.experiencia_anios ?? 0} años<br/>
            <b>Disponible:</b> ${tecnico.disponible ? "Sí" : "No"}<br/>
            <b>Verificado:</b> ${tecnico.tecnico_verificado ? "Sí" : "No"}<br/>
            <b>Calificación:</b> ${tecnico.calificacion_promedio ?? 0}<br/>
            <b>Trabajos completados:</b> ${tecnico.trabajos_completados ?? 0}<br/>
            <b>Descripción:</b> ${tecnico.descripcion || "Sin descripción"}
          `,
                },
            });
        });

        if (graphics.length > 0) {
            graphicsLayer.addMany(graphics);

            if (graphics.length === 1) {
                view.goTo({
                    center: [Number(tecnicosValidos[0].lng), Number(tecnicosValidos[0].lat)],
                    zoom: 15,
                }).catch(() => { });
            } else {
                view.goTo(graphics).catch(() => { });
            }
        }
    }, [tecnicos]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "500px",
                borderRadius: "20px",
                overflow: "hidden",
            }}
        />
    );
}