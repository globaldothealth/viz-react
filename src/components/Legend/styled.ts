import styled from "styled-components";

export const LegendContainer = styled.div`
  position: absolute;
  top: 5.5rem;
  right: 1rem;
  padding: 0.5rem 0.25rem;
  border-radius: 0.2rem;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.8);
  font-size: 11px;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.p`
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333333;
`;

export const LegendRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
`;

interface ColorSampleProps {
  color: string;
  outlineColor: string;
}

export const ColorSample = styled.div<ColorSampleProps>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  border-color: ${(props) => props.outlineColor};
`;

export const Label = styled.p`
  margin: 2px 0 0 0;
  color: #333333;
`;
