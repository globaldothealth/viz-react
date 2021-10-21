import styled from "styled-components";
import { Card } from "../../theme/globalStyles";

export const MapContainer = styled.div`
  width: 100vw;
  height: 100vh;
`;

export const Legend = styled(Card)`
  bottom: 24px;
  right: 50px;
`;

export const LegendRow = styled.div`
  display: flex;
  align-items: center;

  &:not(:last-of-type) {
    margin-bottom: 10px;
  }
`;

interface LegendColorSampleProps {
  color: string;
}

export const LegendColorSample = styled.div<LegendColorSampleProps>`
  width: 12px;
  height: 12px;
  border-radius: 24px;
  background-color: ${(props) => props.color};
  margin-right: 10px;
`;

export const LegendLabel = styled.p`
  font-size: 14px;
  margin: 0;
`;
