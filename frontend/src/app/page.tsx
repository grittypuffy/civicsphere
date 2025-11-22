"use client"
import { FluentProvider, Button, Card } from '@fluentui/react-components'

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
    <FluentProvider>
      <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#e6f4ff] via-[#dff3ff] px-4 py-16">
        <Card className="w-full max-w-5xl bg-white rounded-xl shadow-[0_8px_30px_rgba(18,52,94,0.08)] p-7">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-linear-to-br from-[#e6f0fb] to-white flex items-center justify-center text-[#0a66c2] font-bold text-lg shadow-[0_6px_18px_rgba(10,102,194,0.08)]">
                CS
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="m-0 text-2xl text-[#08306c]">CivicSphere</h1>
                <p className="m-0 text-sm text-[#345a8a]">A platform for civic engagement and community collaboration.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button appearance="primary" as="a" href="/auth?action=signup">Get Started</Button>
              <Button appearance="subtle" as="a" href="/auth?action=signin">Sign In</Button>
            </div>
          </div>

          <section className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {features.map((feature, i) => (
                <article key={i} className={`p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm ${cardGradient}`}>
                  <h3 className="m-0 text-blue-600 text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-[#274c6f] leading-6">{feature.description}</p>
                </article>
              ))}
            </div>
          </section>
        </Card>
      </main>
    </FluentProvider>
  )
}
