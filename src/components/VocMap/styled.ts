import styled from "styled-components";

export const MapContainer = styled.div`
  width: 100vw;
  height: 100vh;
`;

const Card = styled.div`
  position: absolute;
  background-color: white;
  z-index: 100;
  padding: 2rem;
  border-radius: 0.5rem;
`;

export const Sidebar = styled(Card)`
  top: 5rem;
  left: 5rem;
`;

export const VocLabel = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: bold;
`;

export const VocSelect = styled.select`
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
`;

export const Legend = styled(Card)`
  bottom: 5rem;
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
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.5rem;
  background-color: ${(props) => props.color};
`;

export const LegendLabel = styled.p`
  font-size: 1.6rem;
  margin-left: 1rem;
`;
