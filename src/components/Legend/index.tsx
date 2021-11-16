import React from "react";

import { MapLayer, FillColor } from "../../models/MapLayer";
import {
  LegendContainer,
  Title,
  LegendRow,
  ColorSample,
  Label,
} from "./styled";

interface LegendProps {
  layers: MapLayer[];
}

export const Legend: React.FC<LegendProps> = ({ layers }: LegendProps) => {
  return (
    <LegendContainer>
      <Title>Variant Reporting</Title>

      {layers.map((layer) => (
        <LegendRow key={layer.id}>
          <ColorSample color={layer.color} outlineColor={layer.outline} />
          <Label>{layer.label}</Label>
        </LegendRow>
      ))}

      <LegendRow>
        <ColorSample color={FillColor.NoData} />
        <Label>No data</Label>
      </LegendRow>
    </LegendContainer>
  );
};
