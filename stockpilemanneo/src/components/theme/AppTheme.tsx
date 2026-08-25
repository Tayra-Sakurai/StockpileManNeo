import { createTheme, ThemeProvider, useColorScheme } from "@mui/material";
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
  const { mode } = useColorScheme();
  if (!mode)
    return (
      <>{children}</>
    );

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

export default AppTheme;