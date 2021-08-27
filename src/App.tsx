import React from "react";
import { GlobalStyle } from "./theme/globalStyles";

import { VocMap } from "./components/VocMap";

const App: React.FC = () => {
  return (
    <div className="App">
      <GlobalStyle />
      <VocMap />
    </div>
  );
};

export default App;
