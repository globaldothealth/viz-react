import styled from "styled-components";
import { Card } from "../../theme/globalStyles";

export const SidebarContainer = styled(Card)`
  top: 100px;
  left: 50px;
`;

interface LabelProps {
  block?: boolean;
}

export const Label = styled.label<LabelProps>`
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;

  ${(props) =>
    props.block &&
    `
      display: block;
      margin-bottom: 10px;      
  `}
`;

export const Select = styled.select`
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  min-width: 200px;
`;

export const VariantSelectionContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export const StyledRadio = styled.input`
  &:last-of-type {
    margin-left: 10px;
  }
`;
