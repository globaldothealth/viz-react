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
  getRowsWithVocData,
  getVocList,
  getMostRecentData,
  sortData,
  filterLookupTable,
  parseStatesData,
} from "../../utils/helperFunctions";
import { Sidebar } from "../Sidebar";
import { StatesData } from "../../data/statesData";
import lookupTable from "../../data/mapbox-boundaries-adm1-v3_3.json";

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

export const VocMap: React.FC = () => {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

  // eslint-disable-next-line
  const mapContainer = useRef<any>("");
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [vocData, setVocData] = useState<VocDataRow[]>();
  const [vocStatesData, setVocStatesData] = useState<StatesData[]>();
  const [vocList, setVocList] = useState<string[]>();
  const [chosenVoc, setChosenVoc] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  // Layers to be displayed on map
  const [layers] = useState<
    { id: string; color: string; outline: string; label: string }[]
  >([
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
  ]);

  // Setup Mapbox and configure map
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: process.env.REACT_APP_MAP_THEME_URL,
      center: [0, 40],
      renderWorldCopies: false,
      minZoom: 1.5,
      zoom: 2.5,
    })
      .on("load", () => {
        map.current?.addSource("countriesData", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        // Add layers to the map
        layers.forEach((layer) => {
          map.current?.addLayer(
            {
              id: layer.id,
              source: "countriesData",
              "source-layer": "country_boundaries",
              type: "fill",
              paint: {
                "fill-color": layer.color,
                "fill-outline-color": layer.outline,
              },
            },
            "country-label"
          );
        });

        // Add Mapbox Boundaries source for state polygons.
        map.current?.addSource("statesData", {
          type: "vector",
          url: "mapbox://mapbox.boundaries-adm1-v3",
        });

        // Add layer from the vector tile source with data-driven style
        map.current?.addLayer(
          {
            id: "states-join",
            type: "fill",
            source: "statesData",
            "source-layer": "boundaries_admin_1",
            paint: {
              "fill-color": [
                "case",
                ["==", ["feature-state", "variantStatus"], 0],
                "rgba(136, 208, 235, 1)",
                ["==", ["feature-state", "variantStatus"], 1],
                "rgba(41, 177, 234, 1)",
                ["==", ["feature-state", "variantStatus"], ""],
                "rgba(253, 153, 134, 1)",
                "rgba(255, 255, 255, 0)",
              ],
              "fill-outline-color": [
                "case",
                ["==", ["feature-state", "variantStatus"], 0],
                "rgba(0, 122, 236, 1)",
                ["==", ["feature-state", "variantStatus"], 1],
                "rgba(0, 116, 171, 1)",
                ["==", ["feature-state", "variantStatus"], ""],
                "rgba(253, 104, 91, 1)",
                "rgba(255, 255, 255, 0)",
              ],
            },
          },
          "waterway-label"
        );

        // After states source is loaded handler
        const setAfterLoad = ({
          sourceID,
          isSourceLoaded,
        }: {
          sourceID: string;
          isSourceLoaded: boolean;
        }) => {
          if (sourceID !== "statesData" && !isSourceLoaded) return;

          setMapLoaded(true);
          map.current?.off("sourcedata", setAfterLoad);
        };

        if (map.current?.isSourceLoaded("statesData")) {
          setMapLoaded(true);
        } else {
          map.current?.on("sourcedata", setAfterLoad);
        }
      })
      .addControl(new mapboxgl.NavigationControl(), "bottom-right");
  }, []);

  // Prepare data
  useEffect(() => {
    // Country resolution
    const rowsWithVoc = getRowsWithVocData(data as VocDataRow[]);
    const list = getVocList(rowsWithVoc);
    const mostRecentData = getMostRecentData(rowsWithVoc);

    setVocData(mostRecentData);
    setChosenVoc(list[0]);
  }, []);

  // Prepare states data
  useEffect(() => {
    if (!chosenVoc) return;

    const statesData = parseStatesData(data as VocDataRow[], chosenVoc);
    setVocStatesData(statesData);
  }, [chosenVoc]);

  // Display US states on map
  useEffect(() => {
    if (!map.current || !mapLoaded || !vocStatesData) return;

    const setStates = (lookupData: any) => {
      for (const { stateId, status } of vocStatesData) {
        map.current?.setFeatureState(
          {
            source: "statesData",
            sourceLayer: "boundaries_admin_1",
            id: lookupData[stateId].feature_id,
          },
          {
            variantStatus: status,
          }
        );
      }
    };

    const lookupData = filterLookupTable(lookupTable);
    setStates(lookupData);
  }, [mapLoaded, vocStatesData]);

  // Display countries on map
  useEffect(() => {
    if (!vocData || !map.current || !mapLoaded || !chosenVoc) return;

    const { countriesWithData, countriesWithoutData, countriesNotChecked } =
      sortData(vocData, chosenVoc);

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

    // In order to avoid flickering during first render
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }
  }, [vocData, mapLoaded, chosenVoc]);

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
      <MapContainer ref={mapContainer} visible={!isLoading} />

      <Sidebar handleVariantChange={handleVariantChange} />

      <Legend>{renderedLabelItems}</Legend>
    </>
  );
};
