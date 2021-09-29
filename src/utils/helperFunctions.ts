import { parse, isAfter } from "date-fns";
import { VocDataRow } from "../models/VocDataRow";

// Get only rows that contain info about at least one VOC
export const getRowsWithVocData = (data: VocDataRow[]) => {
  return data.filter((row) => row.any_variant_info === 1);
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
    (dataRow) => dataRow[variantName] === 1
  );
  const countriesWithData = filteredCountries.map((country) => country.code);

  filteredCountries = recentData.filter(
    (dataRow) => dataRow[variantName] === 0
  );
  const countriesWithoutData = filteredCountries.map((country) => country.code);

  filteredCountries = recentData.filter(
    (dataRow) => dataRow[variantName] === ""
  );
  const countriesNotChecked = filteredCountries.map((country) => country.code);

  return { countriesWithData, countriesWithoutData, countriesNotChecked };
};

// Get source URL and date for specific country
export const getDetailedData = (
  dataList: VocDataRow[],
  locationCode: string
): { sourceUrl: string; dateChecked: string } => {
  const chosenCountry = dataList.filter(
    (dataRow) => dataRow.code === locationCode
  );

  return {
    sourceUrl: chosenCountry[0].source_url,
    dateChecked: chosenCountry[0].epi_date,
  };
};
