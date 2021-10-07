import React, { useState } from "react";

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
  vocList: string[];
  voiList: string[];
}

enum VariantType {
  VOC = "voc",
  VOI = "voi",
}

export const Sidebar: React.FC<SidebarProps> = ({
  handleVariantChange,
  vocList,
  voiList,
}: SidebarProps) => {
  const [variantType, setVariantType] = useState(VariantType.VOC);

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
