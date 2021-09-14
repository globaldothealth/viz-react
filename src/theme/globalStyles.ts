import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    html {
        font-size: 62.5%;
    }
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
    #topbar-container {
        background: #ECF3F0;
        position: absolute;
        width: 100%;
        height: 72px;
        z-index: 9;
    } 
    #voc-map-container {
    }
    #logo {
        height: 6rem;
        left: 1rem;
        position: fixed;
        top: 1rem;
        z-index: 999;
        display: flex;
        align-items: center;
    }
    
    #logo #helpGuide span {
        font-size: 4rem !important;
    }
    
    .navlink-question-mark .help-guide-button .MuiSvgIcon-root {
        font-size: 1rem !important;
    }
    
    #logo img {
        border-right: 1px solid #555;
        margin-right: 0.6rem;
        padding-right: 0.6rem;
        object-fit: contain;
        vertical-align: middle;
        width: 5ex;
    }
    
    #logo a {
        text-decoration: none !important;
    }
    
    #logo span {
        color: #0094e2;
        font-size: 5rem;
        vertical-align: middle;
        text-decoration: none;
    }
`;
