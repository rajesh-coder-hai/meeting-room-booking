import React, { createContext, useMemo, useState, useContext } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getDesignTokens } from "./theme";
import { createTheme } from "@mui/material/styles";

const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

export const CustomThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(
        localStorage.getItem("themeMode") || "light"
    );

    const toggleColorMode = () => {
        setMode((prevMode) => {
            const nextMode = prevMode === "light" ? "dark" : "light";
            localStorage.setItem("themeMode", nextMode);
            return nextMode;
        });
    };


    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    return (
        <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};
