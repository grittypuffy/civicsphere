'use client'
import { Button } from "@fluentui/react-components";

type Feature = {
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    title: "Title 1",
    description: "Here comes the description of the title 1"
  },
  {
    title: "Title 2",
    description: "Here comes the description of the title 2"
  },
  {
    title: "Title 3",
    description: "Here comes the description of the title 3"
  }
]

export default function Home() {
  return (
    <div className="mx-auto min-h-screen flex flex-col justify-center items-center gap-3 md:gap-5 lg:gap-8">
      <div>
        {/* Placeholder for image or logo */}
      </div>
      <div
        className="flex flex-col items-center gap-3">
        <h1 className="font-bold text-2xl lg:text-4xl">CivicSphere</h1>
        <p className="text-lg lg:text-xl">Welcome to CivicSphere, a platform for civic engagement and community collaboration.</p>
        <div className="flex gap-3">
          <Button appearance="primary" as="a" href="/auth?action=signup">
            Get Started
          </Button>
          <Button appearance="secondary" as="a" href="/auth?action=signin">
            Sign In
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 items-center">
        <div className="flex md:flex-row gap-3 lg:gap-9">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col gap p-3 md:p-5 rounded-xl shadow-xl border border-gray-200">
              <h3 className="font-bold text-lg text-center">{feature.title}</h3>
              <p className="text-sm text-justify">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}
