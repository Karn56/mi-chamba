import { useEffect, useRef } from "react"
import "../lib/arcgis"

import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/views/MapView"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"

function MapaClienteSolicitud({ lat, lng }) {
    const mapRef = useRef(null)
    const viewRef = useRef(null)

    useEffect(() => {
        if (!mapRef.current || lat == null || lng == null) return

        const graphicsLayer = new GraphicsLayer()

        const map = new Map({
            basemap: "arcgis/topographic",
            layers: [graphicsLayer],
        })

        const puntoCliente = new Graphic({
            geometry: {
                type: "point",
                longitude: Number(lng),
                latitude: Number(lat),
            },
            symbol: {
                type: "simple-marker",
                color: "#2563eb",
                size: 14,
                outline: {
                    color: "#ffffff",
                    width: 2,
                },
            },
            popupTemplate: {
                title: "Ubicación del cliente",
                content: "Esta es la ubicación registrada al momento de crear la solicitud.",
            },
        })

        graphicsLayer.add(puntoCliente)

        const view = new MapView({
            container: mapRef.current,
            map,
            center: [Number(lng), Number(lat)],
            zoom: 15,
            popup: {
                dockEnabled: false,
            },
        })

        viewRef.current = view

        view.when(() => {
            view.goTo({
                center: [Number(lng), Number(lat)],
                zoom: 15,
            }).catch(() => {})
        })

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy()
                viewRef.current = null
            }
        }
    }, [lat, lng])

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "260px",
                borderRadius: "18px",
                overflow: "hidden",
                marginTop: "12px",
            }}
        />
    )
}

export default MapaClienteSolicitud