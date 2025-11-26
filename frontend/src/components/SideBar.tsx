"use client";
import { navStateAtom } from "@/lib/store";
import { useRouter } from "@/lib/i18n/navigation";
import {
  Hamburger,
  NavDrawer,
  NavDrawerBody,
  NavDrawerFooter,
  NavDrawerHeader,
  NavItem,
  Tooltip,
} from "@fluentui/react-components";
import {
  ArrowTrendingLinesFilled,
  HomeRegular,
  PeopleCommunityRegular,
  SettingsRegular,
  SignOutRegular,
} from "@fluentui/react-icons";
import { ChatSparkleRegular } from "@fluentui/react-icons/svg/chat-sparkle";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";

const SideBar = () => {
  const [navState, setNavOpen] = useAtom(navStateAtom);
  const router = useRouter();
  const t = useTranslations("sidebar");

  const PAGES = [
    {
      href: "/u/home",
      label: t("nav.home"),
      icon: <HomeRegular />,
    },
    {
      href: "/u/trending",
      label: t("nav.trending"),
      icon: <ArrowTrendingLinesFilled />,
    },
    {
      href: "/u/chat",
      label: t("nav.chat"),
      icon: <ChatSparkleRegular />,
    },
    {
      href: "/u/communities",
      label: t("nav.community"),
      icon: <PeopleCommunityRegular />,
    },
    {
      href: "/u/settings",
      label: t("nav.settings"),
      icon: <SettingsRegular />,
    },
  ];

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/v1/auth/sign_out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.ok) {
        router.push("/auth?action=signin");
      }
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  const changeRouter = (path: string) => {
    return () => {
      router.push(path);
      setNavOpen(false);
    };
  };

  return (
    <>
      <NavDrawer
        open={navState}
        aria-label={t("aria.mainNavigation")}
        role="navigation"
      >
        <NavDrawerHeader className="border-b border-b-sky-100 bg-navbar text-white">
          <div className="py-3 flex items-center gap-3 px-2">
            <Tooltip
              content={t("tooltip.close")}
              relationship="label"
              positioning="after"
            >
              <Hamburger
                onClick={() => setNavOpen(false)}
                aria-label={t("aria.closeNavigation")}
                className="text-white"
              />
            </Tooltip>
            <div className="font-semibold">{t("appName")}</div>
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
                aria-label={t("aria.navigateTo", { page: item.label })}
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
              aria-label={t("aria.signOut")}
              className="hover:bg-light-brand rounded-md"
            >
              <span className="py-1 font-semibold text-lg text-ui-heading text-red-500">
                {t("signout")}
              </span>
            </NavItem>
          </div>
        </NavDrawerBody>

        <NavDrawerFooter className="border-t border-t-sky-100 bg-brand/5">
          <div className="text-sm italic p-3 text-ui-muted" role="contentinfo">
            {t("copyright", {
              year: String(new Date().getFullYear()),
              appName: t("appName"),
            })}
          </div>
        </NavDrawerFooter>
      </NavDrawer>
    </>
  );
};

export default SideBar;
