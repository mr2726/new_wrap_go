import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1Ijoid3JhcGdvMSIsImEiOiJjbW5kaXZ1azAxYTZ3MnFxd3A4MWF0NHV2In0.BRikUTLb_Z45crHjlh2bqg";

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // чтобы не создавать карту дважды

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/wrapgo1/cmndjj97l001k01sf62cf8x99",
      center: [44.514470867659284, 40.1811272387276],
      zoom: 14,
    });
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}