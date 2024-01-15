import { MapContainer, useOLMap } from "../../src";
import LayerSwitcherControl from "../../src/LayerSwitcher";

export default function App() {
  const { mapRef, map } = useOLMap({
    center: [0, 0],
    zoom: 1,
    maxZoom: 25,
  });

  return (
    <MapContainer
      style={{ width: "100%", height: "500px" }}
      ref={mapRef}
      mapInstance={map}
    >
      <LayerSwitcherControl visible="osm" />
    </MapContainer>
  );
}
