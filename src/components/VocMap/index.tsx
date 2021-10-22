import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { VocDataRow } from "../../models/VocDataRow";

import data from "../../data/voc-new.json";
import {
  MapContainer,
  Legend,
  LegendRow,
  LegendColorSample,
  LegendLabel,
} from "./styled";
import {
  getMostRecentCountryData,
  getMostRecentStatesData,
  sortData,
  getDetailedData,
  sortStatesData,
} from "../../utils/helperFunctions";
import { Sidebar } from "../Sidebar";

enum FillColor {
  CheckedHasData = "#29b1ea",
  CheckedNoData = "#88d0eb",
  NotChecked = "#FD9986",
}

enum OutlineColor {
  CheckedHasData = "#0074ab",
  CheckedNoData = "#007AEC",
  NotChecked = "#FD685B",
}

// Layers to be displayed on map
const layers = [
  {
    id: "checked-has-data",
    color: FillColor.CheckedHasData,
    outline: OutlineColor.CheckedHasData,
    label: "Checked, has data",
  },
  {
    id: "checked-no-data",
    color: FillColor.CheckedNoData,
    outline: OutlineColor.CheckedNoData,
    label: "Checked, does not have data",
  },
  {
    id: "not-checked",
    color: FillColor.NotChecked,
    outline: OutlineColor.NotChecked,
    label: "Not checked",
  },
];

const ANIMATION_DURATION = 500; // map animation duration in ms

export const VocMap: React.FC = () => {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

  // eslint-disable-next-line
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [vocCountryData, setVocCountryData] = useState<VocDataRow[]>();
  const [vocStateData, setVocStateData] = useState<VocDataRow[]>();
  const [chosenVoc, setChosenVoc] = useState<string>();
  const [popupState, setPopupState] = useState<{
    lngLat: mapboxgl.LngLat;
    locationCode: string;
    stateResolution: boolean;
  }>();

  const renderedPopupContent = (
    sourceUrl: string,
    countryName: string,
    dateChecked: string,
    breakthrough: string
  ): string =>
    `<h2>${countryName}</h2><hr><p><a class="button" href="${sourceUrl}" target="_blank">Go To Source</a></p>
    <p><strong>Date checked:</strong> ${dateChecked}</p><p><strong>Breakthrough Status:</strong> ${breakthrough}</p>`;

  // Setup Mapbox and configure map
  useEffect(() => {
    // if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: process.env.REACT_APP_MAP_THEME_URL,
      center: [0, 40],
      renderWorldCopies: false,
      minZoom: 1.5,
      zoom: 2.5,
    })
      .on("load", () => {
        const mapRef = map.current;
        if (!mapRef) return;

        mapRef.addSource("countriesData", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        mapRef.addSource("states", {
          type: "geojson",
          data: "https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson",
        });

        // Add layers to the map
        layers.forEach((layer) => {
          // Layer for countries
          mapRef.addLayer(
            {
              id: layer.id,
              source: "countriesData",
              "source-layer": "country_boundaries",
              type: "fill",
              paint: {
                "fill-color": layer.color,
                "fill-outline-color": layer.outline,
                "fill-opacity": 0,
                "fill-opacity-transition": { duration: ANIMATION_DURATION },
              },
            },
            "country-label"
          );

          // Layer for US states
          mapRef.addLayer(
            {
              id: `states-${layer.id}`,
              source: "states",
              type: "fill",
              paint: {
                "fill-color": layer.color,
                "fill-outline-color": layer.outline,
                "fill-opacity": 0,
                "fill-opacity-transition": { duration: ANIMATION_DURATION },
              },
            },
            "waterway-label"
          );

          // Display a popup with selected data details
          mapRef.on("click", layer.id, (e) => {
            const { lngLat, features } = e;
            if (!features || features.length === 0 || !features[0].properties)
              return;

            const locationCode = features[0].properties
              .iso_3166_1_alpha_3 as string;

            setPopupState({ lngLat, locationCode, stateResolution: false });
          });

          // Display a popup with selected data details when clicking on individual state
          mapRef.on("click", `states-${layer.id}`, (e) => {
            const { lngLat, features } = e;
            if (!features || features.length === 0 || !features[0].properties)
              return;

            const locationCode = features[0].properties.STATE_NAME as string;

            setPopupState({ lngLat, locationCode, stateResolution: true });
          });

          // Change cursor to pointer when hovering above countries
          mapRef.on("mouseenter", layer.id, () => {
            mapRef.getCanvas().style.cursor = "pointer";
          });

          mapRef.on("mouseleave", layer.id, () => {
            mapRef.getCanvas().style.cursor = "";
          });

          // Change cursor to pointer when hovering above US states
          mapRef.on("mouseenter", `states-${layer.id}`, () => {
            mapRef.getCanvas().style.cursor = "pointer";
          });

          mapRef.on("mouseleave", `states-${layer.id}`, () => {
            mapRef.getCanvas().style.cursor = "";
          });
        });

        setMapLoaded(true);
      })
      .addControl(new mapboxgl.NavigationControl(), "bottom-right");
  }, []);

  // Display popup on the map with detailed data
  useEffect(() => {
    const mapRef = map.current;
    if (!popupState || !mapRef || !vocCountryData || !vocStateData) return;

    const { lngLat, locationCode, stateResolution } = popupState;

    // Get source url and date checked based on clicked location
    const { sourceUrl, countryName, dateChecked, breakthrough } =
      getDetailedData(
        stateResolution ? vocStateData : vocCountryData,
        locationCode
      );

    new mapboxgl.Popup({ className: "custom-popup" })
      .setHTML(
        renderedPopupContent(sourceUrl, countryName, dateChecked, breakthrough)
      )
      .setLngLat(lngLat)
      .addTo(mapRef);
  }, [popupState]);

  // Prepare data
  useEffect(() => {
    const mostRecentCountryData = getMostRecentCountryData(
      data as VocDataRow[]
    );
    const mostRecentVocStateData = getMostRecentStatesData(
      data as VocDataRow[]
    );

    setVocStateData(mostRecentVocStateData);
    setVocCountryData(mostRecentCountryData);
  }, []);

  // Display countries and states on the map
  useEffect(() => {
    const mapRef = map.current;

    if (!vocCountryData || !mapRef || !mapLoaded || !chosenVoc) return;

    const { countriesWithData, countriesWithoutData, countriesNotChecked } =
      sortData(vocCountryData, chosenVoc);

    const { statesWithData, statesWithoutData, statesNotChecked } =
      sortStatesData(data as VocDataRow[], chosenVoc);

    setLayersOpacity(0);

    setTimeout(() => {
      mapRef.setFilter("checked-has-data", [
        "in",
        "iso_3166_1_alpha_3",
        ...countriesWithData,
      ]);

      mapRef.setFilter("checked-no-data", [
        "in",
        "iso_3166_1_alpha_3",
        ...countriesWithoutData,
      ]);

      mapRef.setFilter("not-checked", [
        "in",
        "iso_3166_1_alpha_3",
        ...countriesNotChecked,
      ]);

      mapRef.setFilter("states-checked-has-data", [
        "in",
        "STATE_ID",
        ...statesWithData,
      ]);

      mapRef.setFilter("states-checked-no-data", [
        "in",
        "STATE_ID",
        ...statesWithoutData,
      ]);

      mapRef.setFilter("states-not-checked", [
        "in",
        "STATE_ID",
        ...statesNotChecked,
      ]);

      setLayersOpacity(1);
    }, ANIMATION_DURATION);
  }, [vocCountryData, mapLoaded, chosenVoc]);

  const setLayersOpacity = (opacity: number) => {
    layers.forEach((layer) => {
      map.current?.setPaintProperty(layer.id, "fill-opacity", opacity);
      map.current?.setPaintProperty(
        `states-${layer.id}`,
        "fill-opacity",
        opacity
      );
    });
  };

  const handleVariantChange = (
    e: React.ChangeEvent<HTMLSelectElement> | string
  ) => {
    setChosenVoc(typeof e === "string" ? e : e.target.value);
  };

  const renderedLabelItems = layers.map((layer) => (
    <LegendRow key={layer.id}>
      <LegendColorSample color={layer.color} />
      <LegendLabel>{layer.label}</LegendLabel>
    </LegendRow>
  ));

  return (
    <>
      <MapContainer ref={mapContainer} />

      <Sidebar handleVariantChange={handleVariantChange} />

      <Legend>{renderedLabelItems}</Legend>
    </>
  );
};
