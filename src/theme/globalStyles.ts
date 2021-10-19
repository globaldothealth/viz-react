import styled, { createGlobalStyle } from "styled-components";

// Some styles are commented out not to override css from viz app
export const GlobalStyle = createGlobalStyle`    
    body {
        margin: 0;
        font-family: 'Roboto', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;        
        background-color: #ECF3F0;
    }
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }        
`;

export const Card = styled.div`
  position: absolute;
  background-color: white;
  z-index: 100;
  padding: 2rem;
  border-radius: 0.5rem;
`;
