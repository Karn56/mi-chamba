import { useEffect, useRef } from "react";
import "../lib/arcgis";

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

function esUbicacionValida(lat, lng) {
    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return false;
    if (latNum === 0 && lngNum === 0) return false;
    if (latNum < -90 || latNum > 90) return false;
    if (lngNum < -180 || lngNum > 180) return false;

    return true;
}

function SelectorUbicacionMapa({ lat, lng, onChangeUbicacion }) {
    const mapRef = useRef(null);
    const viewRef = useRef(null);
    const graphicsLayerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || viewRef.current) return;

        const graphicsLayer = new GraphicsLayer();

        const tieneUbicacionValida = esUbicacionValida(lat, lng);

        const map = new Map({
            basemap: "arcgis/topographic",
            layers: [graphicsLayer],
        });

        const view = new MapView({
            container: mapRef.current,
            map,
            center: tieneUbicacionValida
                ? [Number(lng), Number(lat)]
                : [-89.2182, 13.6929], // San Salvador
            zoom: tieneUbicacionValida ? 15 : 11,
        });

        graphicsLayerRef.current = graphicsLayer;
        viewRef.current = view;

        view.on("click", (event) => {
            const point = event.mapPoint;
            if (!point) return;

            const nuevaLat = Number(point.latitude.toFixed(6));
            const nuevaLng = Number(point.longitude.toFixed(6));

            onChangeUbicacion(nuevaLat, nuevaLng);
        });

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, [lat, lng, onChangeUbicacion]);

    useEffect(() => {
        const view = viewRef.current;
        const graphicsLayer = graphicsLayerRef.current;

        if (!view || !graphicsLayer) return;

        graphicsLayer.removeAll();

        if (!esUbicacionValida(lat, lng)) {
            view
                .goTo({
                    center: [-89.2182, 13.6929],
                    zoom: 11,
                })
                .catch(() => { });
            return;
        }

        const punto = new Graphic({
            geometry: {
                type: "point",
                longitude: Number(lng),
                latitude: Number(lat),
            },
            symbol: {
                type: "simple-marker",
                color: "#f97316",
                size: 14,
                outline: {
                    color: "#ffffff",
                    width: 2,
                },
            },
            popupTemplate: {
                title: "Ubicación seleccionada",
                content: `Lat: ${lat}<br/>Lng: ${lng}`,
            },
        });

        graphicsLayer.add(punto);

        view
            .goTo({
                center: [Number(lng), Number(lat)],
                zoom: 15,
            })
            .catch(() => { });
    }, [lat, lng]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "360px",
                borderRadius: "20px",
                overflow: "hidden",
                marginTop: "12px",
            }}
        />
    );
}

export default SelectorUbicacionMapa;