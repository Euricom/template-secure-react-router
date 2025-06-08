import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function meta() {
  return [
    { title: "Welcome to Our App" },
    {
      name: "description",
      content: "A modern application with secure authentication and user management",
    },
  ];
}

const features = [
  {
    title: "Secure Authentication",
    description: "Industry-standard security with email verification and password protection",
  },
  {
    title: "User Management",
    description: "Easy user management with profile customization and settings",
  },
  {
    title: "Modern UI",
    description: "Beautiful and responsive design that works on all devices",
  },
  {
    title: "Real-time Updates",
    description: "Instant updates and notifications for a seamless experience",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex-1">
        <div className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
              <div className="mt-24 sm:mt-32 lg:mt-16">
                <a href="/" className="inline-flex space-x-6" aria-label="What's new">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-sm leading-6 ring-1 ring-primary/10 ring-inset">
                    What's new
                  </span>
                  <span className="inline-flex items-center space-x-2 font-medium text-muted-foreground text-sm leading-6">
                    <span>Just shipped v1.0</span>
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </span>
                </a>
              </div>
              <h1 className="mt-10 font-bold text-4xl text-foreground tracking-tight sm:text-6xl">
                A better way to manage your data
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-8">
                Experience the future of data management with our secure, scalable, and
                user-friendly platform.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Button asChild size="lg">
                  <Link to="/signup">Get started</Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="font-semibold text-base text-primary leading-7">Everything you need</h2>
          <p className="mt-2 font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
            All-in-one platform
          </p>
          <p className="mt-6 text-lg text-muted-foreground leading-8">
            Our platform provides everything you need to manage your data securely and efficiently.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col">
                <dt className="flex items-center gap-x-3 font-semibold text-base text-foreground leading-7">
                  <CheckCircle2 className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base text-muted-foreground leading-7">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 border-border/40 border-t">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link
              to="/privacy"
              className="text-muted-foreground text-sm leading-6 hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground text-sm leading-6 hover:text-foreground"
            >
              Terms
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-muted-foreground text-xs leading-5">
              &copy; {new Date().getFullYear()} Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
