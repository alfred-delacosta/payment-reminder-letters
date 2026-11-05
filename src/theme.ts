/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 *
 * Cobalt Saffron (seed 715272814, mood technical, complementary).
 * Light/dark roles from the frontend-web-design palette generator.
 */

import { createTheme } from "@mui/material/styles";

export const FONT_SANS = '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif';
export const FONT_MONO = '"IBM Plex Mono", ui-monospace, monospace';

declare module "@mui/material/styles" {
  interface Palette {
    focusRing: string;
    borderControl: string;
  }
  interface PaletteOptions {
    focusRing?: string;
    borderControl?: string;
  }
}

export const appTheme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#007da2", dark: "#006d8e", contrastText: "#ffffff" },
        secondary: { main: "#ab5421", contrastText: "#ffffff" },
        success: { main: "#0a7e3a" },
        warning: { main: "#996000" },
        error: { main: "#b54b43" },
        info: { main: "#0075a3" },
        background: { default: "#f5fbff", paper: "#ffffff" },
        text: { primary: "#0f171b", secondary: "#656f74" },
        divider: "#d5e0e5",
        focusRing: "#008db6",
        borderControl: "#889397",
      },
    },
    dark: {
      palette: {
        primary: { main: "#39bdee", dark: "#4eceff", contrastText: "#0b1316" },
        secondary: { main: "#e68959", contrastText: "#0b1316" },
        success: { main: "#65c67d" },
        warning: { main: "#e69c3a" },
        error: { main: "#fa887d" },
        info: { main: "#3cbbf9" },
        background: { default: "#0c1012", paper: "#161a1c" },
        text: { primary: "#e5f1f6", secondary: "#8a9499" },
        divider: "#272f33",
        focusRing: "#1eaddd",
        borderControl: "#5e686c",
      },
    },
  },
  typography: {
    fontFamily: FONT_SANS,
    fontSize: 16,
    htmlFontSize: 16,
    h1: {
      fontFamily: FONT_SANS,
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: FONT_SANS,
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: FONT_SANS,
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: FONT_MONO,
      fontSize: "1.728rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: FONT_SANS,
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontFamily: FONT_SANS,
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    body2: { fontSize: "1rem", lineHeight: 1.5 },
    button: { fontWeight: 500, textTransform: "none" },
    caption: { fontSize: "0.875rem", lineHeight: 1.5 },
    overline: {
      fontSize: "0.75rem",
      letterSpacing: "0.06em",
      fontWeight: 500,
      lineHeight: 1.4,
    },
  },
  spacing: 8,
  shape: { borderRadius: 4 },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 220,
      standard: 300,
      complex: 300,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeOut: "cubic-bezier(0.2, 0, 0, 1)",
      easeIn: "cubic-bezier(0.3, 0, 0.8, 0.15)",
      sharp: "cubic-bezier(0.2, 0, 0, 1)",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitTextSizeAdjust: "100%",
          scrollPaddingTop: 72,
          scrollPaddingBottom: 88,
        },
        body: {
          margin: 0,
          minHeight: "100vh",
          "@supports (min-height: 100dvh)": {
            minHeight: "100dvh",
          },
        },
        "#root": {
          minHeight: "100vh",
          "@supports (min-height: 100dvh)": {
            minHeight: "100dvh",
          },
          display: "flex",
          flexDirection: "column",
        },
        ":focus-visible": {
          outline: "2px solid var(--mui-palette-focusRing)",
          outlineOffset: 2,
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            animationIterationCount: 1,
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: "none",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "medium",
      },
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": {
            fontSize: 16,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "var(--mui-palette-borderControl)",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "var(--mui-palette-primary-main)",
        },
      },
    },
  },
});
