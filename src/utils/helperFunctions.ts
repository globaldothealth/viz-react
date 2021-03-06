import { parse, isAfter } from "date-fns";
import { VocDataRow } from "../models/VocDataRow";
import { VariantDataRow } from "../models/VariantDataRow";
import { statesList, StatesData } from "../data/statesData";

export enum DataStatus {
  CheckedHasData = 1,
  CheckedNoData = 0,
  NotChecked = "",
}

export enum BreakthroughStatus {
  Yes = 1,
  No = 0,
  ToBeDetemined = "",
}

export const getNonUsData = (data: VocDataRow[]): VocDataRow[] => {
  return data.filter((row) => row.code !== "USA");
};

// Get only the most recent data for each country from the list
export const getMostRecentCountryData = (data: VocDataRow[]) => {
  const dataWithAnyInfo = getNonUsData(data);

  const locations: string[] = [];
  dataWithAnyInfo.forEach((row) => {
    locations.push(row.location);
  });

  // Remove all duplicates from locations array
  const uniqueLocations = Array.from(new Set(locations));

  // For each unique location get the most recent data
  const recentData: VocDataRow[] = [];

  uniqueLocations.forEach((location) => {
    const locationArray = dataWithAnyInfo.filter(
      (row) => row.location === location
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

  return recentData;
};

// Get only the most recent data for each US state from the list
export const getMostRecentStatesData = (data: VocDataRow[]): VocDataRow[] => {
  // Get states data with any info
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

    if (locationArray.length > 0) {
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
    }
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
  const recentData = getMostRecentCountryData(data);

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

export const getBreakthroughStatusName = (
  status: BreakthroughStatus
): string => {
  switch (status) {
    case BreakthroughStatus.Yes:
      return "Yes";

    case BreakthroughStatus.No:
      return "No";

    case BreakthroughStatus.ToBeDetemined:
      return "To be determined";

    default:
      return "-";
  }
};

// Get source URL and date for specific country
export const getDetailedData = (
  dataList: VocDataRow[],
  location: string
): {
  countryName: string;
  sourceUrl: string;
  dateChecked: string;
  breakthrough: string;
} => {
  const chosenCountry = dataList.filter(
    (dataRow) => dataRow.code === location || dataRow.location === location
  );

  const breakthroughStatus = chosenCountry[0]
    .breakthrough_status as BreakthroughStatus;
  const breakthrough = getBreakthroughStatusName(breakthroughStatus);

  return {
    sourceUrl: chosenCountry[0].source_url,
    countryName: chosenCountry[0].location,
    dateChecked: chosenCountry[0].epi_date,
    breakthrough,
  };
};

// Prepare data from spreadsheet to display US states on the map
export const sortStatesData = (
  data: VocDataRow[],
  variantName: string
): {
  statesWithData: string[];
  statesWithoutData: string[];
  statesNotChecked: string[];
} => {
  const recentData = getMostRecentStatesData(data);

  // Prepare states data in correct format for Mapbox data join
  const statesData: StatesData[] = [];
  recentData.forEach((row) => {
    const state = statesList.find((state) => state.name === row.location);
    const stateId = (state && state.stateId) || "00";

    switch (row[variantName]) {
      case DataStatus.CheckedHasData:
        statesData.push({
          stateId,
          status: DataStatus.CheckedHasData,
        });
        break;

      case DataStatus.CheckedNoData:
        statesData.push({
          stateId,
          status: DataStatus.CheckedNoData,
        });
        break;

      case DataStatus.NotChecked:
        statesData.push({
          stateId,
          status: DataStatus.NotChecked,
        });
        break;

      default:
        break;
    }
  });

  let filteredStates = statesData.filter(
    (dataRow) => dataRow.status === DataStatus.CheckedHasData
  );
  const statesWithData = filteredStates.map((row) => row.stateId);

  filteredStates = statesData.filter(
    (dataRow) => dataRow.status === DataStatus.CheckedNoData
  );
  const statesWithoutData = filteredStates.map((row) => row.stateId);

  filteredStates = statesData.filter(
    (dataRow) => dataRow.status === DataStatus.NotChecked
  );
  const statesNotChecked = filteredStates.map((row) => row.stateId);

  return { statesWithData, statesWithoutData, statesNotChecked };
};

// Parse variant data from Google spreadsheet
export const parseVariantData = (
  data: VariantDataRow[]
): {
  vocList: { pango: string; whoLabel: string }[];
  voiList: { pango: string; whoLabel: string }[];
} => {
  const voc = data.filter((el) => el["is VoI"].trim() === "0");
  const voi = data.filter((el) => el["is VoI"].trim() === "1");

  const vocList = voc.map((vocEl) => {
    return {
      pango: vocEl["Pango lineage"].trim(),
      whoLabel: vocEl["WHO label"].trim(),
    };
  });
  const voiList = voi.map((voiEl) => {
    return {
      pango: voiEl["Pango lineage"].trim(),
      whoLabel: voiEl["WHO label"].trim(),
    };
  });

  return { vocList, voiList };
};
