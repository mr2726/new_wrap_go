import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FaMoon, FaSun  } from "react-icons/fa";
import {
  getActiveZone,
  getFleetSignedContractsByContractIds,
  getUser,
  getCampaignNamesByOwner,
  getDriversByContractIds,
  getLatestDriverLocations,
  getLatestDriverLocationsByEmails,
  getVehicleImagesBySignedDriverEmails,
  subscribeToDriversAndCampaigns,
  removeRealtimeChannel,
} from "../data/service";
import { useLanguage } from "../context/LanguageContext";

const MAPBOX_ACCESS_TOKEN = (process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "").trim();
const DARK_MAP_STYLE = (process.env.REACT_APP_MAPBOX_STYLE_URL_DARK || "").trim();
const LITE_MAP_STYLE = (process.env.REACT_APP_MAPBOX_STYLE_URL_LITE || "").trim();

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const SQUARE_SOURCE_ID = "active-zones-squares";
const SQUARE_FILL_LAYER_ID = "active-zones-squares-fill";
const SQUARE_LINE_LAYER_ID = "active-zones-squares-line";
const DRIVER_REFRESH_MS = 15000;
const DEFAULT_DRIVER_COORDS = [44.51475588393247, 40.18299309990458];
const INITIAL_MODE = "dark";

const EMPTY_ZONES = {
  type: "FeatureCollection",
  features: [],
};

function isValidCoordPair(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

function closeRing(coords) {
  if (coords.length < 3) return null;

  const [firstLng, firstLat] = coords[0];
  const [lastLng, lastLat] = coords[coords.length - 1];
  if (firstLng === lastLng && firstLat === lastLat) {
    return coords;
  }

  return [...coords, [firstLng, firstLat]];
}

function buildZonesFeatureCollection(rows) {
  const features = (rows || [])
    .map((row, index) => {
      const coords = Array.isArray(row?.activezone)
        ? row.activezone.filter(isValidCoordPair)
        : [];
      const ring = closeRing(coords);
      if (!ring) return null;

      return {
        type: "Feature",
        properties: {
          id: row?.id ?? `zone-${index + 1}`,
          name: row?.name || `Active Zone ${index + 1}`,
          zoneType: "square",
        },
        geometry: {
          type: "Polygon",
          coordinates: [ring],
        },
      };
    })
    .filter(Boolean);

  return {
    type: "FeatureCollection",
    features,
  };
}

function addOrUpdateZones(mapInstance, zonesData) {

  if (mapInstance.getSource(SQUARE_SOURCE_ID)) {
    mapInstance.getSource(SQUARE_SOURCE_ID).setData(zonesData);
  } else {
    mapInstance.addSource(SQUARE_SOURCE_ID, {
      type: "geojson",
      data: zonesData,
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

function fitMapToActiveZones(mapInstance, zonesData) {
  const allCoords = (zonesData?.features || []).flatMap((feature) => {
    if (feature?.geometry?.type !== "Polygon") return [];
    const ring = feature?.geometry?.coordinates?.[0] || [];
    return ring.filter(isValidCoordPair);
  });

  if (!allCoords.length) return;

  const bounds = allCoords.reduce(
    (acc, coord) => acc.extend(coord),
    new mapboxgl.LngLatBounds(allCoords[0], allCoords[0])
  );

  mapInstance.fitBounds(bounds, {
    padding: 50,
    duration: 0,
    maxZoom: 16,
  });
}

export default function Map() {
  const { data: pageData } = useLanguage();
  const DEFAULT_DRIVER_INFO = pageData?.ui?.mapBox?.defaultDriver || {
    fullName: "Alex Morgan",
    activeContractName: "Downtown Delivery Route",
    carPhotoLeft: "https://placehold.co/520x320/121722/39FF14?text=Car+Left+Side",
    carPhotoRight: "https://placehold.co/520x320/121722/39FF14?text=Car+Right+Side"
  };
  const MAP_DRAWER_TEXT = pageData?.ui?.mapBox?.drawer || {
    title: "Driver info",
    close: "Close",
    fullName: "Full Name",
    activeCampaign: "Active campaign name",
    carLeftAlt: "Car left side",
    carRightAlt: "Car right side"
  };

  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarkersRef = useRef([]);
  const activeZonesRef = useRef(EMPTY_ZONES);
  const driverCoordsRef = useRef(DEFAULT_DRIVER_COORDS);
  const [mode, setMode] = useState(INITIAL_MODE);
  const [isDriverDrawerOpen, setIsDriverDrawerOpen] = useState(false);
  const [driverInfo, setDriverInfo] = useState(DEFAULT_DRIVER_INFO);
  const [driversData, setDriversData] = useState([]);

  const mapStyle =
    mode === "lite" ? DARK_MAP_STYLE : LITE_MAP_STYLE;

  const initialMapStyle =
    INITIAL_MODE === "lite" ? DARK_MAP_STYLE : LITE_MAP_STYLE;

  const initialMarkerClass =
    INITIAL_MODE === "dark" ? "driver-marker-in-light" : "driver-marker-in-dark";

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialMapStyle,
      center: [44.514470867659284, 40.1811272387276],
      zoom: 14,
    });

    const markerElement = document.createElement("div");
    markerElement.className = `driver-marker ${initialMarkerClass}`;
    const defaultMarkerClick = () => setIsDriverDrawerOpen(true);
    markerElement.addEventListener("click", defaultMarkerClick);

    const defaultMarker = new mapboxgl.Marker({
      element: markerElement,
      anchor: "center",
    })
      .setLngLat(driverCoordsRef.current)
      .addTo(map.current);
    driverMarkersRef.current.push(defaultMarker);

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
      addOrUpdateZones(map.current, activeZonesRef.current);
      fitMapToActiveZones(map.current, activeZonesRef.current);
      handleResize();
    };

    map.current.on("load", handleStyleLoad);
    map.current.on("style.load", handleStyleLoad);
    map.current.on("mouseenter", SQUARE_FILL_LAYER_ID, handleMouseEnter);
    map.current.on("mouseleave", SQUARE_FILL_LAYER_ID, handleMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      markerElement.removeEventListener("click", defaultMarkerClick);
      driverMarkersRef.current.forEach((marker) => marker.remove());
      driverMarkersRef.current = [];
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
  }, [initialMapStyle, initialMarkerClass]);

  useEffect(() => {
    let isActive = true;

    const fetchActiveZones = async () => {
      const { data, error } = await getActiveZone();

      if (!isActive) return;

      if (error) {
        console.error("Failed to load active zones:", error);
        activeZonesRef.current = EMPTY_ZONES;
      } else {
        activeZonesRef.current = buildZonesFeatureCollection(data);
      }

      if (map.current && map.current.isStyleLoaded()) {
        addOrUpdateZones(map.current, activeZonesRef.current);
        fitMapToActiveZones(map.current, activeZonesRef.current);
      }
    };

    fetchActiveZones();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    let isFetching = false;
    let pollingId;

    const fetchDriverData = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const { data: authData, error: authError } = await getUser();
        if (authError || !authData?.user) {
          if (authError) {
            console.error("Failed to get current user:", authError);
          }
          return;
        }

        const userId = authData.user.id;
        const { data: campaignRows, error: campaignError } = await getCampaignNamesByOwner(userId);

        if (!isActive) return;

        if (campaignError) {
          console.error("Failed to load campaigns:", campaignError);
        }

        const campaignIds = (campaignRows || []).map((campaign) => campaign.id);
        const campaignNameById = (campaignRows || []).reduce((acc, campaign) => {
          acc[campaign.id] = campaign.name;
          return acc;
        }, {});

        let driverRows = [];
        if (campaignIds.length) {
          const { data, error } = await getDriversByContractIds(campaignIds);

          if (!isActive) return;

          if (error) {
            console.error("Failed to load driver data:", error);
          } else {
            driverRows = data || [];
          }
        } else {
          console.warn("No campaigns found for current user.");
        }

        let signedContractRows = [];
        if (campaignIds.length) {
          const { data, error } = await getFleetSignedContractsByContractIds(campaignIds);

          if (!isActive) return;

          if (error) {
            console.error("Failed to load signed contracts:", error);
          } else {
            signedContractRows = data || [];
          }
        }

        const signedEmailsByContract = signedContractRows.reduce((acc, row) => {
          const contractId = String(row?.contract_id || "");
          const email = (row?.driver_email || "").trim().toLowerCase();
          if (!contractId || !email) return acc;

          if (!acc[contractId]) {
            acc[contractId] = [];
          }

          if (!acc[contractId].includes(email)) {
            acc[contractId].push(email);
          }

          return acc;
        }, {});

        const driverEmails = [
          ...new Set(
            [
              ...driverRows.map((driver) => (driver?.email || "").trim().toLowerCase()),
              ...signedContractRows.map((row) => (row?.driver_email || "").trim().toLowerCase()),
            ].filter(Boolean)
          ),
        ];

        let locationRows = [];
        if (driverEmails.length) {
          const { data, error } = await getLatestDriverLocationsByEmails(driverEmails);

          if (!isActive) return;

          if (error) {
            console.error("Failed to load driver locations:", error);
          } else {
            locationRows = data || [];
          }
        } else {
          const { data, error } = await getLatestDriverLocations();

          if (!isActive) return;

          if (error) {
            console.error("Failed to load fallback driver locations:", error);
          } else {
            locationRows = data || [];
          }
        }

        // console.log("driver_location_updates:", locationRows);

        const locationEmails = [
          ...new Set(
            (locationRows || [])
              .map((row) => (row?.driver_email || "").trim().toLowerCase())
              .filter(Boolean)
          ),
        ];

        const imageLookupEmails = [
          ...new Set([...driverEmails, ...locationEmails]),
        ];

        const { data: vehicleImageRows, error: vehicleImageError } =
          await getVehicleImagesBySignedDriverEmails(imageLookupEmails);

        if (!isActive) return;

        if (vehicleImageError) {
          console.error("Failed to load vehicle images:", vehicleImageError);
        }

        const vehicleMediaByEmail = (vehicleImageRows || []).reduce((acc, row) => {
          const email = (row?.signeddriveremail || "").trim().toLowerCase();
          if (!email || acc[email]) return acc;

          acc[email] = {
            left: row?.left_img || DEFAULT_DRIVER_INFO.carPhotoLeft,
            right: row?.right_img || DEFAULT_DRIVER_INFO.carPhotoRight,
          };

          return acc;
        }, {});

        const latestLocationByEmail = locationRows.reduce((acc, row) => {
          const driverEmail = (row?.driver_email || "").trim().toLowerCase();
          if (!driverEmail || acc[driverEmail]) return acc;

          const lng = Number(row?.longitude);
          const lat = Number(row?.latitude);
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) return acc;

          acc[driverEmail] = [lng, lat];
          return acc;
        }, {});

        const normalizedFromDrivers = driverRows
          .map((driver) => {
            const contractKey = String(driver?.contractid || "");
            const contractEmails = signedEmailsByContract[contractKey] || [];

            const driverEmail =
              (driver?.email || "").trim().toLowerCase() ||
              contractEmails[0] ||
              "";

            const driverMedia = vehicleMediaByEmail[driverEmail] || {};

            const latestCoords = driverEmail ? latestLocationByEmail[driverEmail] : null;

            const fallbackLng = Number(driver?.lan);
            const fallbackLat = Number(driver?.lat);
            const hasFallbackCoords = Number.isFinite(fallbackLng) && Number.isFinite(fallbackLat);
            const fallbackCoords = hasFallbackCoords ? [fallbackLng, fallbackLat] : null;

            const coords = latestCoords || fallbackCoords;
            if (!coords) return null;

            return {
              id: driver.id,
              fullName: driver?.name || DEFAULT_DRIVER_INFO.fullName,
              activeContractName:
                campaignNameById[driver.contractid] || DEFAULT_DRIVER_INFO.activeContractName,
              coords,
              carPhotoLeft: driverMedia.left || DEFAULT_DRIVER_INFO.carPhotoLeft,
              carPhotoRight: driverMedia.right || DEFAULT_DRIVER_INFO.carPhotoRight,
            };
          })
          .filter(Boolean);

        const normalizedFromLocations = Object.entries(latestLocationByEmail).map(
          ([email, coords], index) => {
            const driverMedia = vehicleMediaByEmail[email] || {};

            return {
              id: `location-${email || index}`,
              fullName: email || DEFAULT_DRIVER_INFO.fullName,
              activeContractName: DEFAULT_DRIVER_INFO.activeContractName,
              coords,
              carPhotoLeft: driverMedia.left || DEFAULT_DRIVER_INFO.carPhotoLeft,
              carPhotoRight: driverMedia.right || DEFAULT_DRIVER_INFO.carPhotoRight,
            };
          }
        );

        const normalizedDrivers =
          normalizedFromDrivers.length > 0 ? normalizedFromDrivers : normalizedFromLocations;

        setDriversData(normalizedDrivers);

        if (normalizedDrivers.length) {
          driverCoordsRef.current = normalizedDrivers[0].coords;
          setDriverInfo((prev) => ({ ...prev, ...normalizedDrivers[0] }));
          // console.log("Driver data updated:", normalizedDrivers);
        }
      } finally {
        isFetching = false;
      }
    };

    fetchDriverData();

    pollingId = window.setInterval(fetchDriverData, DRIVER_REFRESH_MS);

    const realtimeChannel = subscribeToDriversAndCampaigns(() => fetchDriverData());

    return () => {
      isActive = false;
      window.clearInterval(pollingId);
      removeRealtimeChannel(realtimeChannel);
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

  useEffect(() => {
    if (!map.current) return;

    driverMarkersRef.current.forEach((marker) => marker.remove());
    driverMarkersRef.current = [];

    if (!driversData.length) {
      return;
    }

    const modeClass = mode === "dark" ? "driver-marker-in-dark" : "driver-marker-in-light";

    driversData.forEach((driver) => {
      const markerElement = document.createElement("div");
      markerElement.className = `driver-marker ${modeClass}`;
      markerElement.addEventListener("click", () => {
        setDriverInfo((prev) => ({ ...prev, ...driver }));
        setIsDriverDrawerOpen(true);
      });

      const marker = new mapboxgl.Marker({ element: markerElement, anchor: "center" })
        .setLngLat(driver.coords)
        .addTo(map.current);

      driverMarkersRef.current.push(marker);
    });

    return () => {
      driverMarkersRef.current.forEach((marker) => marker.remove());
      driverMarkersRef.current = [];
    };
  }, [driversData, mode]);

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
          <h3>{MAP_DRAWER_TEXT.title}</h3>
          <button
            className="driver-drawer__close"
            onClick={() => setIsDriverDrawerOpen(false)}
            type="button"
          >
            {MAP_DRAWER_TEXT.close}
          </button>
        </div>

        <div className="driver-drawer__group">
          <p className="driver-drawer__label">{MAP_DRAWER_TEXT.fullName}</p>
          <p className="driver-drawer__value">{driverInfo.fullName}</p>
        </div>

        <div className="driver-drawer__group">
          <p className="driver-drawer__label">{MAP_DRAWER_TEXT.activeCampaign}</p>
          <p className="driver-drawer__value">{driverInfo.activeContractName}</p>
        </div>

        <div className="driver-drawer__photos">
          <img src={driverInfo.carPhotoLeft} alt={MAP_DRAWER_TEXT.carLeftAlt} />
          <img src={driverInfo.carPhotoRight} alt={MAP_DRAWER_TEXT.carRightAlt} />
        </div>
      </aside>

    </div>
  );
}