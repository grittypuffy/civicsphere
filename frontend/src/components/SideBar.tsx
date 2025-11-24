'use client'
import { navStateAtom } from "@/lib/store"
import { Hamburger, NavDrawer, NavDrawerBody, NavDrawerFooter, NavDrawerHeader, NavItem, Tooltip } from "@fluentui/react-components"
import { ArrowTrendingLinesFilled, HomeRegular, PeopleCommunityRegular, SettingsRegular, SignOutRegular } from "@fluentui/react-icons"
import { ChatSparkleRegular } from "@fluentui/react-icons/svg/chat-sparkle"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"

const PAGES = [{
  href: '/u/home', label: 'Home', icon: <HomeRegular />
}, {
  href: '/u/trending', label: 'Trending', icon: <ArrowTrendingLinesFilled />
}, {
  href: '/u/chat', label: 'Chat', icon: <ChatSparkleRegular />
}, {
  href: '/u/communities', label: 'Community', icon: <PeopleCommunityRegular />
}, {
  href: '/u/settings', label: 'Settings', icon: <SettingsRegular />
}]

const SideBar = () => {
  const [navState, setNavOpen] = useAtom(navStateAtom)
  const router = useRouter()
  const handleSignout = async () => {
    try {
      const res = await fetch('/api/v1/auth/sign_out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (res.ok) {
        router.push('/auth?action=signin')
      }
    } catch (error) {
      console.log("Error signing out: ", error)
    }
  }

  const changeRouter = (path: string) => {
    return () => {
      router.push(path)
      setNavOpen(false)
    }
  }

  return (
    <>
      <NavDrawer
        open={navState}
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
        <NavDrawerBody className="flex flex-col justify-start">
          <div className="py-3 px-2">
            {PAGES.map((item, idx) => (
              <NavItem
                key={idx}
                icon={
                  <span className="text-2xl text-sky-600" aria-hidden="true">
                    {item.icon}
                  </span>
                }
                onClick={changeRouter(item.href)}
                value={`${idx + 1}`}
                aria-label={`Navigate to ${item.label} page`}
                className="hover:bg-light-brand rounded-md"
              >
                <span className="py-1 font-semibold text-lg text-ui-heading">
                  {item.label}
                </span>
              </NavItem>
            ))}
            <NavItem
              icon={
                <span className="text-2xl text-sky-600" aria-hidden="true">
                  {<SignOutRegular />}
                </span>
              }
              value={`6`}
              onClick={handleSignout}
              aria-label="Sign out button"
              className="hover:bg-light-brand rounded-md"
            >
              <span className="py-1 font-semibold text-lg text-ui-heading text-red-500">
                Logout
              </span>
            </NavItem>
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
