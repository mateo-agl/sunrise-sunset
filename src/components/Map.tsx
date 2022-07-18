import React from "react";
import { Card } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

export const Map = ({ lat, lon }) => ( lat && lon &&
    <Card className="py-4 mt-4 mx-auto shadow rounded-1">
        <MapContainer id="map" center={[lat, lon]} zoom={13} scrollWheelZoom={false}>
            <ChangeView center={[lat, lon]} zoom={13} /> 
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lon]}/>
        </MapContainer>
    </Card>
)