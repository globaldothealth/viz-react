import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { VocDataRow } from "../../models/VocDataRow";

import data from "../../data/voc.json";
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
} from "../../utils/helperFunctions";

const ANIMATION_DURATION = 500; // map animation duration in ms

export const VocMap: React.FC = () => {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

  // eslint-disable-next-line
  const mapContainer = useRef<any>("");
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [vocData, setVocData] = useState<VocDataRow[]>();
  const [vocList, setVocList] = useState<string[]>();
  const [chosenVoc, setChosenVoc] = useState<string>();

  // Layers to be displayed on map
  const [layers] = useState<{ id: string; color: string; label: string }[]>([
    { id: "checked-has-data", color: "#440053", label: "Checked, has data" },
    {
      id: "checked-no-data",
      color: "#218F8C",
      label: "Checked, does not have data",
    },
    { id: "not-checked", color: "#FDE624", label: "Not checked" },
  ]);

  // Setup Mapbox and configure map
  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: process.env.REACT_APP_MAP_THEME_URL,
      center: [10, 40],
      renderWorldCopies: false,
      minZoom: 1.5,
      zoom: 2.5,
    })
      .addControl(new mapboxgl.NavigationControl())
      .on("load", () => {
        // Add layers to the map
        layers.forEach((layer) => {
          map.current?.addLayer(
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
                "fill-opacity-transition": { duration: ANIMATION_DURATION },
              },
            },
            "country-label"
          );
        });

        setMapLoaded(true);
      });
  }, []);

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
        <VocLabel>Choose VOC</VocLabel>

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