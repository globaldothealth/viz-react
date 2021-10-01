import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { VocDataRow } from "../../models/VocDataRow";

import data from "../../data/voc-new.json";
import {
  MapContainer,
  Sidebar,
  VocSelect,
  VocLabel,
  Legend,
  LegendRow,
  LegendColorSample,
  LegendLabel,
} from "./styled";
import {
  getRowsWithVocData,
  getVocList,
  getMostRecentData,
  sortData,
  getDetailedData,
} from "../../utils/helperFunctions";

const ANIMATION_DURATION = 500; // map animation duration in ms

export const VocMap: React.FC = () => {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

  // eslint-disable-next-line
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [vocData, setVocData] = useState<VocDataRow[]>();
  const [vocList, setVocList] = useState<string[]>();
  const [chosenVoc, setChosenVoc] = useState<string>();
  const [popupState, setPopupState] = useState<{
    lngLat: mapboxgl.LngLat;
    locationCode: string;
  }>();

  // Layers to be displayed on map
  const [layers] = useState<
    { id: string; color: string; outline: string; label: string }[]
  >([
    {
      id: "checked-has-data",
      color: "#00c6af",
      outline: "#0e7569",
      label: "Checked, has data",
    },
    {
      id: "checked-no-data",
      color: "#88d0eb",
      outline: "#007AEC",
      label: "Checked, does not have data",
    },
    {
      id: "not-checked",
      color: "#FD9986",
      outline: "#FD685B",
      label: "Not checked",
    },
  ]);

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
      center: [10, 40],
      renderWorldCopies: false,
      minZoom: 1.5,
      zoom: 1,
    })
      .on("load", () => {
        const mapRef = map.current;
        if (!mapRef) return;

        // Add layers to the map
        layers.forEach((layer) => {
          mapRef.addLayer(
            {
              id: layer.id,
              source: {
                type: "vector",
                url: "mapbox://mapbox.country-boundaries-v1",
              },
              "source-layer": "country_boundaries",
              type: "fill",
              paint: {
                "fill-color": layer.color,
                "fill-opacity": 0,
                "fill-outline-color": layer.outline,
                "fill-opacity-transition": { duration: ANIMATION_DURATION },
              },
            },
            "country-label"
          );

          // Display a popup with selected data details
          mapRef.on("click", layer.id, (e) => {
            const { lngLat, features } = e;
            if (!features || features.length === 0 || !features[0].properties)
              return;

            const locationCode = features[0].properties
              .iso_3166_1_alpha_3 as string;

            setPopupState({ lngLat, locationCode });
          });

          mapRef.on("mouseenter", layer.id, () => {
            mapRef.getCanvas().style.cursor = "pointer";
          });

          mapRef.on("mouseleave", layer.id, () => {
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
    if (!popupState || !mapRef || !vocData) return;

    const { lngLat, locationCode } = popupState;

    // Get source url and date checked based on clicked location
    const { sourceUrl, countryName, dateChecked, breakthrough } = getDetailedData(vocData, locationCode);

    new mapboxgl.Popup({ className: "custom-popup" })
      .setHTML(renderedPopupContent(sourceUrl, countryName, dateChecked, breakthrough))
      .setLngLat(lngLat)
      .addTo(mapRef);
  }, [popupState]);

  // Prepare data
  useEffect(() => {
    const rowsWithVoc = getRowsWithVocData(data as VocDataRow[]);
    const list = getVocList(rowsWithVoc);
    const mostRecentData = getMostRecentData(rowsWithVoc);

    setVocData(mostRecentData);
    setVocList(list);
    setChosenVoc(list[0]);
  }, []);

  // Display countries on map
  useEffect(() => {
    if (!vocData || !map.current || !mapLoaded || !chosenVoc) return;

    const { countriesWithData, countriesWithoutData, countriesNotChecked } =
      sortData(vocData, chosenVoc);

    setLayersOpacity(0);

    setTimeout(() => {
      map.current?.setFilter("checked-has-data", [
        "in",
        "iso_3166_1_alpha_3",
        ...countriesWithData,
      ]);

      map.current?.setFilter("checked-no-data", [
        "in",
        "iso_3166_1_alpha_3",
        ...countriesWithoutData,
      ]);

      map.current?.setFilter("not-checked", [
        "in",
        "iso_3166_1_alpha_3",
        ...countriesNotChecked,
      ]);

      setLayersOpacity(1);
    }, ANIMATION_DURATION);
  }, [vocData, mapLoaded, chosenVoc]);

  const handleVocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChosenVoc(e.target.value);
  };

  const setLayersOpacity = (opacity: number) => {
    layers.forEach((layer) => {
      map.current?.setPaintProperty(layer.id, "fill-opacity", opacity);
    });
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
      <Sidebar>
        <VocLabel>Choose Variant</VocLabel>

        <VocSelect onChange={handleVocChange}>
          {vocList &&
            vocList.map((voc) => (
              <option key={voc} value={voc}>
                {voc.replace("total_", "")}
              </option>
            ))}
        </VocSelect>
      </Sidebar>

      <Legend>{renderedLabelItems}</Legend>
    </>
  );
};
