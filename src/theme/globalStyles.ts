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
    a {
        text-decoration: none;
        outline: none;
        color: inherit;
    }   
    .custom-popup {
        font-size: 16px;        
        width: auto;
        overflow: hidden;        
    }
    .mapboxgl-popup-content h2 {
        display: block;
        margin-bottom: 10px;
        line-height: 1.2em;
    }
    .mapboxgl-popup-content .button {
        background: #0094e2;
        padding: 5px 15px;
        margin: 10px 0;
        color: #ffffff;
        font-size: 12px;
        text-transform: uppercase;
        border-radius: 4px;
        display: inline-block;
    }

    .mapboxgl-popup-content .button:hover {
        background: #007AEC;
    }
    .mapboxgl-popup-content p {
        font-size: 14px;
    }
    }        
`;
