import { createGlobalStyle } from "styled-components";

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
