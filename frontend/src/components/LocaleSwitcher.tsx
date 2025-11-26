'use client'

import { LANGS } from '@/lib/consts'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import {
    Button,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Tooltip,
} from '@fluentui/react-components'
import { LocalLanguageRegular } from '@fluentui/react-icons'
import { useLocale } from 'next-intl'
import { useTransition } from 'react'

interface LocaleSwitcherProps {
    variant?: 'navbar' | 'standalone'
}

export default function LocaleSwitcher({ variant = 'navbar' }: LocaleSwitcherProps) {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const currentLanguage = LANGS.find((lang) => lang.code === locale)

    const handleLocaleChange = (newLocale: string) => {
        startTransition(() => {
            router.replace(pathname, { locale: newLocale as any })
        })
    }

    if (variant === 'standalone') {
        return (
            <div className="fixed top-4 right-4 z-50">
                <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <Tooltip content="Change language" relationship="label">
                            <Button
                                appearance="primary"
                                icon={<LocalLanguageRegular />}
                                disabled={isPending}
                                aria-label="Change language"
                                className="shadow-lg"
                            >
                                {currentLanguage?.name || 'Language'}
                            </Button>
                        </Tooltip>
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList className="max-h-96 overflow-y-auto">
                            {LANGS.map((lang) => (
                                <MenuItem
                                    key={lang.code}
                                    onClick={() => handleLocaleChange(lang.code)}
                                    disabled={lang.code === locale}
                                    aria-label={`Switch to ${lang.name}`}
                                    className={lang.code === locale ? 'bg-light-brand font-semibold' : ''}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span>{lang.name}</span>
                                        {lang.code === locale && (
                                            <span className="text-sky-600 ml-2">✓</span>
                                        )}
                                    </div>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>
        )
    }

    // Navbar variant
    return (
        <Menu>
            <MenuTrigger disableButtonEnhancement>
                <Tooltip content="Change language" relationship="label">
                    <Button
                        appearance="transparent"
                        icon={<LocalLanguageRegular className="text-xl text-white" />}
                        disabled={isPending}
                        aria-label="Change language"
                        className="text-white hover:bg-white/10"
                    >
                        <span className="hidden sm:inline text-white">{currentLanguage?.code.toUpperCase()}</span>
                    </Button>
                </Tooltip>
            </MenuTrigger>
            <MenuPopover>
                <MenuList className="max-h-96 overflow-y-auto">
                    {LANGS.map((lang) => (
                        <MenuItem
                            key={lang.code}
                            onClick={() => handleLocaleChange(lang.code)}
                            disabled={lang.code === locale}
                            aria-label={`Switch to ${lang.name}`}
                            className={lang.code === locale ? 'bg-light-brand font-semibold' : ''}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span>{lang.name}</span>
                                <span className="text-xs text-ui-muted ml-3">{lang.code.toUpperCase()}</span>
                                {lang.code === locale && (
                                    <span className="text-sky-600 ml-2">✓</span>
                                )}
                            </div>
                        </MenuItem>
                    ))}
                </MenuList>
            </MenuPopover>
        </Menu>
    )
}
