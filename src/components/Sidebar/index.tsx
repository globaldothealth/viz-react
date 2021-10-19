import React, { useState, useEffect } from "react";
import useGoogleSheets from "use-google-sheets";

import {
  SidebarContainer,
  Label,
  Select,
  VariantSelectionContainer,
  StyledRadio,
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
  const [vocList, setVocList] = useState<string[]>([]);
  const [voiList, setVoiList] = useState<string[]>([]);

  // Get data from Google sheets
  const { data, loading, error } = useGoogleSheets({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY || "",
    sheetId: process.env.REACT_APP_SHEETS_ID || "",
    sheetsNames: [process.env.REACT_APP_SHEET_NAME || ""],
  });

  // Parse VoC and VoI from spreadsheet
  useEffect(() => {
    if (error) alert(error);
    if (!data || loading) return;

    console.log(data);

    const { VoC, VoI } = data[0].data[0] as { VoC: string; VoI: string };

    let vocArray = VoC.split(";");
    let voiArray = VoI.split(";");

    // Remove white spaces from each array element
    vocArray = vocArray.map((element) => element.trim());
    voiArray = voiArray.map((element) => element.trim());

    setVocList(vocArray);
    setVoiList(voiArray);
  }, [loading, data, error]);

  const handleVariantTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVariantType = e.target.value as VariantType;

    setVariantType(newVariantType);
    handleVariantChange(
      newVariantType === VariantType.VOC ? vocList[0] : voiList[0]
    );
  };

  return (
    <SidebarContainer>
      <VariantSelectionContainer>
        <StyledRadio
          type="radio"
          name="voc"
          value={VariantType.VOC}
          checked={variantType === VariantType.VOC}
          onChange={handleVariantTypeChange}
        />
        <Label htmlFor="voc">VoC</Label>

        <StyledRadio
          type="radio"
          name="voi"
          value={VariantType.VOI}
          checked={variantType === VariantType.VOI}
          onChange={handleVariantTypeChange}
        />
        <Label htmlFor="voi">VoI</Label>
      </VariantSelectionContainer>

      {variantType === VariantType.VOC ? (
        <>
          <Label block>Choose Variant of Concern</Label>

          <Select onChange={handleVariantChange}>
            {vocList &&
              vocList.map((voc) => (
                <option key={voc} value={voc}>
                  {voc.replace("total_", "")}
                </option>
              ))}
          </Select>
        </>
      ) : (
        <>
          <Label block>Choose Variant of Interest</Label>

          <Select onChange={handleVariantChange}>
            {voiList &&
              voiList.map((voi) => (
                <option key={voi} value={voi}>
                  {voi.replace("total_", "")}
                </option>
              ))}
          </Select>
        </>
      )}
    </SidebarContainer>
  );
};
