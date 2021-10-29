import React from "react";

import { MapLayer } from "../../models/MapLayer";
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
      <Title>Legend</Title>

      {layers.map((layer) => (
        <LegendRow key={layer.id}>
          <ColorSample color={layer.color} outlineColor={layer.outline} />
          <Label>{layer.label}</Label>
        </LegendRow>
      ))}
    </LegendContainer>
  );
};
