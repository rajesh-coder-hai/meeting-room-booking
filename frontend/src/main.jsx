import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./app.css";
import { Provider } from "react-redux";
import store from "./store/index.js";
import { CustomThemeProvider } from "./muiTheme/ThemeContext.jsx";
// import { CustomThemeProvider } from "./muiTheme/ThemeContext.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CustomThemeProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </CustomThemeProvider>
  </StrictMode>
);
