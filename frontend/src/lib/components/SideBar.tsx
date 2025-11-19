'use client'
import { Hamburger, NavDrawer, NavDrawerBody, NavDrawerFooter, NavDrawerHeader, NavItem, Tooltip } from "@fluentui/react-components"
import { ArrowTrendingLinesFilled, HomeRegular, PeopleCommunityRegular, SettingsRegular } from "@fluentui/react-icons"
import { ChatSparkleRegular } from "@fluentui/react-icons/svg/chat-sparkle"
import { Dispatch, SetStateAction } from "react"

const SideBar = ({ isNavOpen, setNavOpen }: { isNavOpen: boolean, setNavOpen: Dispatch<SetStateAction<boolean>> }) => {
  return (
    <>
      <NavDrawer
        open={isNavOpen}
      >
        <NavDrawerHeader className="border-b border-b-gray-400 bg-gray-300">
          <div className="py-3">
            <Tooltip
              content="Close Navigation bar"
              relationship="label"
              positioning="after"
            >
              <Hamburger onClick={() => setNavOpen(false)} />
            </Tooltip>

          </div>
        </NavDrawerHeader>
        <NavDrawerBody className="flex flex-col justify-start">
          <div className="py-3">
            <NavItem
              icon={
                <span className="text-2xl" >
                  <HomeRegular />
                </span>
              }
              href="/home"
              value="1"
              aria-label="Home button"
              className="border"
            >
              <span className="py-1 font-semibold text-lg">
                Home
              </span>
            </NavItem>
            <NavItem
              icon={
                <span className="text-2xl" >
                  <ArrowTrendingLinesFilled />
                </span>
              }
              href="/trending"
              value="2"
              aria-label="Trending button"
              className="border"
            >
              <span className="py-1 font-semibold text-lg">
                Trending
              </span>
            </NavItem>
            <NavItem
              icon={
                <span className="text-2xl" >
                  <ChatSparkleRegular />
                </span>
              }
              href="/chat"
              value="3"
              aria-label="Chat button"
              className="border"
            >
              <span className="py-1 font-semibold text-lg">
                Chat
              </span>
            </NavItem>
            <NavItem
              icon={
                <span className="text-2xl" >
                  <PeopleCommunityRegular />
                </span>
              }
              href="/home"
              value="4"
              aria-label="Community button"
              className="border"
            >
              <span className="py-1 font-semibold text-lg">
                Community
              </span>
            </NavItem>
            <NavItem
              icon={
                <span className="text-2xl" >
                  <SettingsRegular />
                </span>
              }
              href="/home"
              value="5"
              aria-label="Settings button"
              className="border"
            >
              <span className="py-1 font-semibold text-lg">
                Settings
              </span>
            </NavItem>
          </div>
        </NavDrawerBody>
        <NavDrawerFooter className="border-t border-t-gray-400 bg-gray-300">
          <div className="text-sm italic p-3">
            © 2025 CivicSphere
          </div>
        </NavDrawerFooter>
      </NavDrawer>
    </>
  )
}

export default SideBar
