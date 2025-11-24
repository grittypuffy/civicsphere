"use client"
import { Button } from '@fluentui/react-components'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

type Feature = {
  title: string
  description: string
}

const features: Feature[] = [
  {
    title: 'Community Discussions',
    description:
      'Join local conversations about issues that matter to your neighborhood with verified content.',
  },
  {
    title: 'Clear all your doubts',
    description:
      'Ultimate AI Chatbot which is updated and trained to answer all your queries related to civic issues and services.',
  },
  {
    title: 'Accessible and Inclusive',
    description:
      'Discover local resources and civic opportunities curated for your area in an accessible and inclusive manner.',
  },
]

const cardGradient = 'bg-gradient-to-b from-[#f7fbff] to-white'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-sky-200 to-white px-4 py-16">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col gap-8">
          {/* Top row - SVG and Title section side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* First column - Lottie SVG */}
            <div className="flex justify-center order-1 lg:order-1">
              <div className="w-full max-w-md lg:max-w-lg h-80 sm:h-96 lg:h-112 rounded-lg flex items-center justify-center text-[#0a66c2] font-bold text-xl">
                <DotLottieReact
                  src="https://lottie.host/b3d0750d-41ce-4dd6-ade5-83ceea119a00/kaHmBurgNO.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>

            {/* Second column - Title, description, buttons */}
            <div className="flex flex-col gap-6 lg:gap-8 text-center lg:text-left order-2 lg:order-2">
              <div className="space-y-4 lg:space-y-6">
                {/* Title */}
                <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-ui-heading font-semibold leading-tight">CivicSphere</h1>
                {/* Description */}
                <p className="m-0 text-base sm:text-lg lg:text-xl text-ui-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">A platform for civic engagement and community collaboration.</p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Button
                    as='a'
                    href="/auth?action=signup"
                    size='large'
                    appearance='primary'
                    shape='circular'
                  >
                    Get Started
                  </Button>
                  <Button
                    as='a'
                    href="/auth?action=signin"
                    size='large'
                    shape='circular'
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section - Features */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <article key={i} className={`p-6 lg:p-8 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm ${cardGradient} text-center lg:text-left w-full`}>
                <h3 className="m-0 text-[#0369a1] text-base lg:text-lg xl:text-xl font-semibold mb-3 lg:mb-4">{feature.title}</h3>
                <p className="mt-2 text-sm lg:text-base text-[#274c6f] leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
