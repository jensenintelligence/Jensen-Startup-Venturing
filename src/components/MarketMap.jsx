import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const sentimentColor = {
  bullish: "#3f8f5b",
  bearish: "#b5403a",
  neutral: "#9a8f7a",
  volatile: "#c9a24b",
};

export default function MarketMap({ points = [] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <MapContainer center={[22, 8]} zoom={2} minZoom={2} scrollWheelZoom={false} style={{ height: 520, width: "100%", background: "#e9e2d4" }} className="z-0">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png" />
        {points.filter((p) => p.lat != null && p.lng != null).map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.lat, p.lng]}
            radius={Math.max(9, Math.min(22, Math.abs(p.change_percent || 0) * 1.5 + 11))}
            pathOptions={{ color: sentimentColor[p.sentiment] || sentimentColor.neutral, fillOpacity: 0.5, weight: 1.5 }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{p.city ? `${p.city}, ` : ""}{p.country || p.region}</strong>
                <div style={{ fontSize: 12, marginTop: 4 }}>{p.headline}</div>
                {p.indicator_name && <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>{p.indicator_name}: {p.indicator_value}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}