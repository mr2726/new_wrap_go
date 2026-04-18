import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FaMoon, FaSun  } from "react-icons/fa";

mapboxgl.accessToken = "pk.eyJ1Ijoid3JhcGdvMSIsImEiOiJjbW5kaXZ1azAxYTZ3MnFxd3A4MWF0NHV2In0.BRikUTLb_Z45crHjlh2bqg";

const SQUARE_SOURCE_ID = "active-zones-squares";
const SQUARE_FILL_LAYER_ID = "active-zones-squares-fill";
const SQUARE_LINE_LAYER_ID = "active-zones-squares-line";
const DRIVER_COORDS = [44.51475588393247, 40.18299309990458];
const DARK_MAP_STYLE = "mapbox://styles/wrapgo1/cmndum348001w01sablb71mkr";
const LITE_MAP_STYLE = "mapbox://styles/wrapgo1/cmndjj97l001k01sf62cf8x99";
const DRIVER_INFO = {
  fullName: "Alex Morgan",
  activeContractName: "Downtown Delivery Route",
  carPhotoLeft: "https://placehold.co/520x320/121722/39FF14?text=Car+Left+Side",
  carPhotoRight: "https://placehold.co/520x320/121722/39FF14?text=Car+Right+Side",
};

const squareZones = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Square Zone A", zoneType: "square" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [44.51519659461416, 40.18721193708653],
          [44.520837654182756, 40.18205867339929],
          [44.51501188824191, 40.17859953898644],
          [44.509477204799445, 40.182452182873725],
          [44.51519659461416, 40.18721193708653],
        ]],
      },
    }
  ],
};

function addOrUpdateZones(mapInstance) {

  if (mapInstance.getSource(SQUARE_SOURCE_ID)) {
    mapInstance.getSource(SQUARE_SOURCE_ID).setData(squareZones);
  } else {
    mapInstance.addSource(SQUARE_SOURCE_ID, {
      type: "geojson",
      data: squareZones,
    });
  }

  if (!mapInstance.getLayer(SQUARE_FILL_LAYER_ID)) {
    mapInstance.addLayer({
      id: SQUARE_FILL_LAYER_ID,
      type: "fill",
      source: SQUARE_SOURCE_ID,
      paint: {
        "fill-color": "#5c7ad6",
        "fill-opacity": 0.28,
      },
    });
  }

  if (!mapInstance.getLayer(SQUARE_LINE_LAYER_ID)) {
    mapInstance.addLayer({
      id: SQUARE_LINE_LAYER_ID,
      type: "line",
      source: SQUARE_SOURCE_ID,
      paint: {
        "line-color": "#5c7ad6",
        "line-width": 2,
      },
    });
  }
}

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarker = useRef(null);
  const [mode, setMode] = useState("dark");
  const [isDriverDrawerOpen, setIsDriverDrawerOpen] = useState(false);

  const mapStyle =
    mode === "lite" ? LITE_MAP_STYLE : DARK_MAP_STYLE;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: DARK_MAP_STYLE,
      center: [44.514470867659284, 40.1811272387276],
      zoom: 14,
    });

    const markerElement = document.createElement("div");
    markerElement.className = "driver-marker";
    const handleDriverMarkerClick = () => setIsDriverDrawerOpen(true);
    markerElement.addEventListener("click", handleDriverMarkerClick);

    driverMarker.current = new mapboxgl.Marker({
      element: markerElement,
      anchor: "center",
    })
      .setLngLat(DRIVER_COORDS)
      .addTo(map.current);

    const handleResize = () => map.current && map.current.resize();

    const handleMouseEnter = () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = "pointer";
      }
    };

    const handleMouseLeave = () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = "";
      }
    };

    const handleStyleLoad = () => {
      if (!map.current) return;
      addOrUpdateZones(map.current);
      handleResize();
    };

    map.current.on("load", handleStyleLoad);
    map.current.on("style.load", handleStyleLoad);
    map.current.on("mouseenter", SQUARE_FILL_LAYER_ID, handleMouseEnter);
    map.current.on("mouseleave", SQUARE_FILL_LAYER_ID, handleMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      markerElement.removeEventListener("click", handleDriverMarkerClick);
      if (driverMarker.current) {
        driverMarker.current.remove();
        driverMarker.current = null;
      }
      if (map.current) {
        map.current.off("load", handleStyleLoad);
        map.current.off("style.load", handleStyleLoad);
        map.current.off("mouseenter", SQUARE_FILL_LAYER_ID, handleMouseEnter);
        map.current.off("mouseleave", SQUARE_FILL_LAYER_ID, handleMouseLeave);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  useEffect(() => {
    if (!map.current) return;
    map.current.resize();
  }, [isDriverDrawerOpen]);

  return (
    <div className="map-page">
      <div className="switch__mode__button">
        <button onClick={() => setMode(mode === "dark" ? "lite" : "dark")}>
          {mode === "dark" ? <FaSun fontSize={20} /> : <FaMoon fontSize={20} />}
        </button>
      </div>
      <div className="map-page__canvas" ref={mapContainer} />

      <aside className={`driver-drawer ${isDriverDrawerOpen ? "driver-drawer--open" : ""}`}>
        <div className="driver-drawer__header">
          <h3>Driver info</h3>
          <button
            className="driver-drawer__close"
            onClick={() => setIsDriverDrawerOpen(false)}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="driver-drawer__group">
          <p className="driver-drawer__label">Full Name</p>
          <p className="driver-drawer__value">{DRIVER_INFO.fullName}</p>
        </div>

        <div className="driver-drawer__group">
          <p className="driver-drawer__label">Active contract name</p>
          <p className="driver-drawer__value">{DRIVER_INFO.activeContractName}</p>
        </div>

        <div className="driver-drawer__photos">
          <img src={DRIVER_INFO.carPhotoLeft} alt="Car left side" />
          <img src={DRIVER_INFO.carPhotoRight} alt="Car right side" />
        </div>
      </aside>

    </div>
  );
}