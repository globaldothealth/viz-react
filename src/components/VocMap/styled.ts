import styled from "styled-components";
import { Card } from "../../theme/globalStyles";

export const MapContainer = styled.div`
  width: 100vw;
  height: 100vh;
`;

export const Legend = styled(Card)`
  bottom: 2.4rem;
  right: 5rem;
`;

export const LegendRow = styled.div`
  display: flex;
  align-items: center;

  &:not(:last-of-type) {
    margin-bottom: 1rem;
  }
`;

interface LegendColorSampleProps {
  color: string;
}

export const LegendColorSample = styled.div<LegendColorSampleProps>`
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 2.4rem;
  background-color: ${(props) => props.color};
`;

export const LegendLabel = styled.p`
  font-size: 1.4rem;
  margin-left: 1rem;
`;
