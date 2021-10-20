import { parse, isAfter } from "date-fns";
import { VocDataRow } from "../models/VocDataRow";
import { statesList, StatesData } from "../data/statesData";

export enum DataStatus {
  CheckedHasData = 1,
  CheckedNoData = 0,
  NotChecked = "",
}

// Get only rows that contain info about at least one VOC
export const getRowsWithVocData = (data: VocDataRow[]) => {
  return data.filter((row) => row.any_variant_info === 1 && row.code !== "USA");
};

// Get only most recent data for each country from the list
export const getMostRecentData = (data: VocDataRow[]) => {
  const locations: string[] = [];
  data.forEach((row) => {
    locations.push(row.location);
  });

  // Remove all duplicates from locations array
  const uniqueLocations = Array.from(new Set(locations));

  // For each unique location get the most recent data
  const recentData: VocDataRow[] = [];

  uniqueLocations.forEach((location) => {
    const locationArray = data.filter((row) => row.location === location);
    let mostRecentDate = parse(
      locationArray[0].epi_date,
      "dd.MM.yyyy",
      new Date()
    );
    let mostRecentRowIndex = 0;

    locationArray.forEach((item, idx) => {
      const date = parse(item.epi_date, "dd.MM.yyyy", new Date());
      if (isAfter(date, mostRecentDate)) {
        mostRecentDate = date;
        mostRecentRowIndex = idx;
      }
    });

    recentData.push(locationArray[mostRecentRowIndex]);
  });

  return recentData;
};

// Get list of all available VOC's from the spreadsheet (hardcoded for now)
export const getVocList = (data: VocDataRow[]) => {
  const keys = Object.keys(data[0]);
  const vocList = keys.slice(12, 65);

  return vocList;
};

// Get list of country codes
export const getCountryCodes = (countries: VocDataRow[]) => {
  return countries.map((country) => country.code);
};

// Sort data based on VOC info availability and variant name
export const sortData = (
  data: VocDataRow[],
  variantName: string
): {
  countriesWithData: string[];
  countriesWithoutData: string[];
  countriesNotChecked: string[];
} => {
  const rowsWithData = getRowsWithVocData(data);
  const recentData = getMostRecentData(rowsWithData);

  let filteredCountries = recentData.filter(
    (dataRow) => dataRow[variantName] === DataStatus.CheckedHasData
  );
  const countriesWithData = filteredCountries.map((country) => country.code);

  filteredCountries = recentData.filter(
    (dataRow) => dataRow[variantName] === DataStatus.CheckedNoData
  );
  const countriesWithoutData = filteredCountries.map((country) => country.code);

  filteredCountries = recentData.filter(
    (dataRow) => dataRow[variantName] === DataStatus.NotChecked
  );
  const countriesNotChecked = filteredCountries.map((country) => country.code);

  return { countriesWithData, countriesWithoutData, countriesNotChecked };
};

// Get source URL and date for specific country
export const getDetailedData = (
  dataList: VocDataRow[],
  locationCode: string
): {
  countryName: string;
  sourceUrl: string;
  dateChecked: string;
  breakthrough: string;
} => {
  const chosenCountry = dataList.filter(
    (dataRow) => dataRow.code === locationCode
  );

  return {
    sourceUrl: chosenCountry[0].source_url,
    countryName: chosenCountry[0].location,
    dateChecked: chosenCountry[0].epi_date,
    breakthrough: chosenCountry[0].breakthrough_status,
  };
};

// Parse data from spreadsheet for Mapbox data join (USA states)
export const parseStatesData = (
  data: VocDataRow[],
  variantName: string
): StatesData[] => {
  // Get state data with any info
  const statesNames = statesList.map((state) => state.name);
  const stateRowsWithVocData = data.filter(
    (row) => statesNames.includes(row.location) && row.code === "USA"
  );

  // Get the most recent data
  const recentData: VocDataRow[] = [];

  statesNames.forEach((name) => {
    const locationArray = stateRowsWithVocData.filter(
      (row) => row.location === name
    );
    let mostRecentDate = parse(
      locationArray[0].epi_date,
      "dd.MM.yyyy",
      new Date()
    );
    let mostRecentRowIndex = 0;

    locationArray.forEach((item, idx) => {
      const date = parse(item.epi_date, "dd.MM.yyyy", new Date());
      if (isAfter(date, mostRecentDate)) {
        mostRecentDate = date;
        mostRecentRowIndex = idx;
      }
    });

    recentData.push(locationArray[mostRecentRowIndex]);
  });

  // Prepare states data in correct format for Mapbox data join
  const statesData: { stateId: string; status: DataStatus }[] = [];
  recentData.forEach((row) => {
    const state = statesList.find((state) => state.name === row.location);
    const stateId = (state && state.stateId) || "00";

    switch (row[variantName]) {
      case DataStatus.CheckedHasData:
        statesData.push({ stateId, status: DataStatus.CheckedHasData });
        break;

      case DataStatus.CheckedNoData:
        statesData.push({ stateId, status: DataStatus.CheckedNoData });
        break;

      case DataStatus.NotChecked:
        statesData.push({ stateId, status: DataStatus.NotChecked });
        break;

      default:
        break;
    }
  });

  return statesData;
};

// Filters lookup table from Mapbox to include only USA states data
export const filterLookupTable = (lookupTable: any) => {
  const lookupData: {
    [key: string]: string;
  } = {};

  for (const layer in lookupTable)
    for (const worldview in lookupTable[layer].data)
      for (const feature in lookupTable[layer].data[worldview]) {
        const featureData = lookupTable[layer].data[worldview][feature];
        // Filter the lookup data for the US
        if (featureData.iso_3166_1 === "US") {
          // Use `unit_code` property that has the FIPS code as the lookup key
          lookupData[featureData["unit_code"]] = featureData;
        }
      }

  return lookupData;
};
