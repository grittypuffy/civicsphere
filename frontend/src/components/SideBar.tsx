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
        <NavDrawerHeader className="border-b border-b-sky-100 bg-navbar text-white">
          <div className="py-3 flex items-center gap-3 px-2">
            <Tooltip
              content="Close Navigation bar"
              relationship="label"
              positioning="after"
            >
              <Hamburger
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation menu"
                className="text-white"
              />
            </Tooltip>
            <div className="font-semibold">CivicSphere</div>
          </div>

        </NavDrawerHeader>
        <NavDrawerBody className="flex flex-col justify-start bg-page">
          <div className="py-3 px-2">
            {[{
              href: '/u/home', label: 'Home', icon: <HomeRegular />
            },{
              href: '/u/trending', label: 'Trending', icon: <ArrowTrendingLinesFilled />
            },{
              href: '/u/chat', label: 'Chat', icon: <ChatSparkleRegular />
            },{
              href: '/home', label: 'Community', icon: <PeopleCommunityRegular />
            },{
              href: '/u/settings', label: 'Settings', icon: <SettingsRegular />
            }].map((item, idx) => (
              <NavItem
                key={idx}
                icon={
                  <span className="text-2xl text-sky-600" aria-hidden="true">
                    {item.icon}
                  </span>
                }
                href={item.href}
                value={`${idx + 1}`}
                aria-label={`Navigate to ${item.label} page`}
                className="hover:bg-light-brand rounded-md"
              >
                <span className="py-1 font-semibold text-lg text-ui-heading">
                  {item.label}
                </span>
              </NavItem>
            ))}
          </div>
        </NavDrawerBody>
        <NavDrawerFooter className="border-t border-t-sky-100 bg-brand/5">
          <div className="text-sm italic p-3 text-ui-muted" role="contentinfo">
            © 2025 CivicSphere
          </div>
        </NavDrawerFooter>
      </NavDrawer>
    </>
  )
}

export default SideBar
