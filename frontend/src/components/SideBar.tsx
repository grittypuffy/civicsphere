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
        aria-label="Main navigation"
        role="navigation"
      >
        <NavDrawerHeader className="border-b border-b-gray-400 bg-gray-300">
          <div className="py-3">
            <Tooltip
              content="Close Navigation bar"
              relationship="label"
              positioning="after"
            >
              <Hamburger
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation menu"
              />
            </Tooltip>

          </div>
        </NavDrawerHeader>
        <NavDrawerBody className="flex flex-col justify-start">
          <div className="py-3">
            <NavItem
              icon={
                <span className="text-2xl" aria-hidden="true">
                  <HomeRegular />
                </span>
              }
              href="/u/home"
              value="1"
              aria-label="Navigate to Home page"
            >
              <span className="py-1 font-semibold text-lg">
                Home
              </span>
            </NavItem>
            <NavItem
              icon={
                <span className="text-2xl" aria-hidden="true">
                  <ArrowTrendingLinesFilled />
                </span>
              }
              href="/trending"
              value="2"
              aria-label="Navigate to Trending page"
            >
              <span className="py-1 font-semibold text-lg">
                Trending
              </span>
            </NavItem>
            <NavItem
              icon={
                <span className="text-2xl" aria-hidden="true">
                  <ChatSparkleRegular />
                </span>
              }
              href="/u/chat"
              value="3"
              aria-label="Navigate to Chat page"
            >
              <span className="py-1 font-semibold text-lg">
                Chat
              </span>
            </NavItem>
            <NavItem
              icon={
                <span className="text-2xl" aria-hidden="true">
                  <PeopleCommunityRegular />
                </span>
              }
              href="/home"
              value="4"
              aria-label="Navigate to Community page"
            >
              <span className="py-1 font-semibold text-lg">
                Community
              </span>
            </NavItem>
            <NavItem
              icon={
                <span className="text-2xl" aria-hidden="true">
                  <SettingsRegular />
                </span>
              }
              href="/u/settings"
              value="5"
              aria-label="Navigate to Settings page"
            >
              <span className="py-1 font-semibold text-lg">
                Settings
              </span>
            </NavItem>
          </div>
        </NavDrawerBody>
        <NavDrawerFooter className="border-t border-t-gray-400 bg-gray-300">
          <div className="text-sm italic p-3" role="contentinfo">
            © 2025 CivicSphere
          </div>
        </NavDrawerFooter>
      </NavDrawer>
    </>
  )
}

export default SideBar
