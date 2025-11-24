"use client"
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

const AppContainer = (
  { children, }: Readonly<{ children: React.ReactNode }>
) => {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="page-bg min-h-screen flex flex-col w-full mx-auto overflow-hidden">
        {children}
      </div>
    </FluentProvider>
  )
}

export default AppContainer
