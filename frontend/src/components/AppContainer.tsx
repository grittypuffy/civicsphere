"use client"
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

const AppContainer = (
  { children, }: Readonly<{ children: React.ReactNode }>
) => {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="bg-linear-to-b from-sky-200 to-white min-h-screen flex flex-col w-full mx-auto overflow-hidden">
        {children}
      </div>
    </FluentProvider>
  )
}

export default AppContainer
