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
  filterLookupTable,
  parseStatesData,
} from "../../utils/helperFunctions";
import { StatesData } from "../../data/statesData";
import lookupTable from "../../data/mapbox-boundaries-adm1-v3_3.json";

enum FillColor {
  CheckedHasData = "#00c6af",
  CheckedNoData = "#88d0eb",
  NotChecked = "#FD9986",
}

enum OutlineColor {
  CheckedHasData = "#0e7569",
  CheckedNoData = "#007AEC",
  NotChecked = "#FD685B",
}

export const VocMap: React.FC = () => {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

  // eslint-disable-next-line
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [vocData, setVocData] = useState<VocDataRow[]>();
  const [vocStatesData, setVocStatesData] = useState<StatesData[]>();
  const [vocList, setVocList] = useState<string[]>();
  const [chosenVoc, setChosenVoc] = useState<string>();
  const [popupState, setPopupState] = useState<{
    lngLat: mapboxgl.LngLat;
    locationCode: string;
  }>();
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

        // Add layers to the map
        layers.forEach((layer) => {
          mapRef.addLayer(
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

        // Add Mapbox Boundaries source for state polygons.
        mapRef.addSource("statesData", {
          type: "vector",
          url: "mapbox://mapbox.boundaries-adm1-v3",
        });

        // Add layer from the vector tile source with data-driven style
        mapRef.addLayer(
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

  // Display popup on the map with detailed data
  useEffect(() => {
    const mapRef = map.current;
    if (!popupState || !mapRef || !vocData) return;

    const { lngLat, locationCode } = popupState;

    // Get source url and date checked based on clicked location
    const { sourceUrl, countryName, dateChecked, breakthrough } =
      getDetailedData(vocData, locationCode);

    new mapboxgl.Popup({ className: "custom-popup" })
      .setHTML(
        renderedPopupContent(sourceUrl, countryName, dateChecked, breakthrough)
      )
      .setLngLat(lngLat)
      .addTo(mapRef);
  }, [popupState]);

  // Prepare data
  useEffect(() => {
    // Country resolution
    const rowsWithVoc = getRowsWithVocData(data as VocDataRow[]);
    const list = getVocList(rowsWithVoc);
    const mostRecentData = getMostRecentData(rowsWithVoc);

    setVocData(mostRecentData);
    setVocList(list);
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

  const handleVocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChosenVoc(e.target.value);
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
