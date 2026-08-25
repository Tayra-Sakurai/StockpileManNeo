import { createTheme, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";

type AppThemeProps = {
  children: ReactNode,
};

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

function AppTheme(props: AppThemeProps) {
  const { children } = props;

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

export default AppTheme;