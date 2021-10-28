import React, { useState, useEffect } from "react";
import useGoogleSheets from "use-google-sheets";

import { VariantDataRow } from "../../models/VariantDataRow";
import { parseVariantData } from "../../utils/helperFunctions";
import {
  SidebarContainer,
  Label,
  Select,
  VariantSelectionContainer,
  StyledRadio,
  SidebarTab,
  SidebarTabIcon,
} from "./styled";

interface SidebarProps {
  handleVariantChange: (
    e: React.ChangeEvent<HTMLSelectElement> | string
  ) => void;
}

enum VariantType {
  VOC = "voc",
  VOI = "voi",
}

export const Sidebar: React.FC<SidebarProps> = ({
  handleVariantChange,
}: SidebarProps) => {
  const [variantType, setVariantType] = useState(VariantType.VOC);
  const [vocArray, setVocArray] = useState<
    { pango: string; whoLabel: string }[]
  >([]);
  const [voiArray, setVoiArray] = useState<
    { pango: string; whoLabel: string }[]
  >([]);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  // Get data from Google sheets
  const { data, loading, error } = useGoogleSheets({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY || "",
    sheetId: process.env.REACT_APP_SHEETS_ID || "",
    sheetsNames: [process.env.REACT_APP_SHEET_NAME || ""],
  });

  // Parse VoC and VoI from spreadsheet
  useEffect(() => {
    if (error) {
      alert(error);
      return;
    }
    if (!data || loading) return;

    const { vocList, voiList } = parseVariantData(
      data[0].data as VariantDataRow[]
    );

    setVocArray(vocList);
    setVoiArray(voiList);
    handleVariantChange(vocList[0].pango);
  }, [loading, data, error]);

  const handleVariantTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVariantType = e.target.value as VariantType;

    setVariantType(newVariantType);
    handleVariantChange(
      newVariantType === VariantType.VOC ? vocArray[0].pango : voiArray[0].pango
    );
  };

  return (
    <SidebarContainer sidebarHidden={sidebarHidden}>
      <VariantSelectionContainer>
        <StyledRadio
          type="radio"
          id="voc"
          name="voc"
          value={VariantType.VOC}
          checked={variantType === VariantType.VOC}
          onChange={handleVariantTypeChange}
        />
        <Label htmlFor="voc">Variants of concern</Label>

        <StyledRadio
          type="radio"
          id="voi"
          name="voi"
          value={VariantType.VOI}
          checked={variantType === VariantType.VOI}
          onChange={handleVariantTypeChange}
        />
        <Label htmlFor="voi">Variants of interest</Label>
      </VariantSelectionContainer>

      {variantType === VariantType.VOC ? (
        <>
          <Label block>Choose Variant of Concern</Label>

          <Select onChange={handleVariantChange}>
            {vocArray &&
              vocArray.map((voc) => (
                <option key={voc.pango} value={voc.pango}>
                  {voc.pango.replace("total_", "")} ({voc.whoLabel})
                </option>
              ))}
          </Select>
        </>
      ) : (
        <>
          <Label block>Choose Variant of Interest</Label>

          <Select onChange={handleVariantChange}>
            {voiArray &&
              voiArray.map((voi) => (
                <option key={voi.pango} value={voi.pango}>
                  {voi.pango.replace("total_", "")} ({voi.whoLabel})
                </option>
              ))}
          </Select>
        </>
      )}

      <SidebarTab
        onClick={() =>
          setSidebarHidden((currentSidebarHidden) => !currentSidebarHidden)
        }
      >
        <SidebarTabIcon sidebarHidden={sidebarHidden}>◀</SidebarTabIcon>
      </SidebarTab>
    </SidebarContainer>
  );
};
