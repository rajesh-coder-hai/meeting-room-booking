// src/theme/index.js
import { createTheme } from "@mui/material/styles";

export const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === "light"
            ? {
                // Light mode palette
                primary: {
                    main: "#1976d2",
                },
                background: {
                    default: "#f3f3f",
                    paper: "#fff",
                },
            }
            : {
                // Dark mode palette
                primary: {
                    main: "#90caf9",
                },
                background: {
                    default: "#121212",
                    paper: "#1d1d1d",
                },
            }),
    },
    typography: {
        fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,
    },
    shape: {
        borderRadius: 10,
    },
});
