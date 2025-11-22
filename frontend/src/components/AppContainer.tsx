"use client"
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

const AppContainer = (
  { children, }: Readonly<{ children: React.ReactNode }>
) => {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="w-full min-h-screen mx-auto overflow-x-hidden">
        {children}
      </div>
    </FluentProvider>
  )
}

export default AppContainer
