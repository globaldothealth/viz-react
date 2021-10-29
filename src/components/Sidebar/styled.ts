import styled from "styled-components";

interface SidebarContainerProps {
  sidebarHidden: boolean;
}

export const SidebarContainer = styled.div<SidebarContainerProps>`
  position: absolute;
  z-index: 100;
  top: 15%;
  left: 2ex;
  width: 18rem;
  margin-top: 0;
  padding: 2ex;
  background-color: white;
  box-shadow: 0 10px 30px 1px rgb(0 0 0 / 10%);
  backdrop-filter: blur(0.5rem);
  transition: left 0.2s;
  border-radius: 0.5rem;

  ${(props) =>
    props.sidebarHidden &&
    `
    left: -18rem;
  `}
`;

export const SidebarTab = styled.div`
  position: absolute;
  width: 2.5ex;
  height: 5ex;
  top: 5ex;
  left: 100%;
  background-color: #fff;
  border-top-right-radius: 7px;
  border-bottom-right-radius: 7px;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
`;

interface SidebarTabIconProps {
  sidebarHidden: boolean;
}

export const SidebarTabIcon = styled.span<SidebarTabIconProps>`
  font-size: 80%;
  color: #aaa;
  transition: transform 0.2s;

  ${(props) =>
    props.sidebarHidden &&
    `
      transform: rotateY(180deg);
  `};
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
      margin-left: 0;
      display: block;
      margin-bottom: 10px;      
      font-weight: 400;      
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
  margin-bottom: 40px;
`;

export const StyledRadio = styled.input`
  &:last-of-type {
    margin-left: 10px;
  }
`;
