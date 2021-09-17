import styled from "styled-components";

export const MapContainer = styled.div`
  width: 100vw;
  height: 100vh;
`;

const Card = styled.div`
  position: absolute;
  background-color: white;
  z-index: 100;
  padding: 20px;
  border-radius: 5px;
`;

export const Sidebar = styled(Card)`
  top: 100px;
  left: 50px;
`;

export const VocLabel = styled.p`
  font-size: 12px;
  margin-bottom: 10px;
  font-weight: bold;
`;

export const VocSelect = styled.select`
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
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
`;

export const LegendLabel = styled.p`
  font-size: 14px;
  margin-left: 10px;
`;
