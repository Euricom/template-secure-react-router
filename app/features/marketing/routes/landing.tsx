import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1">
        <div className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
              <div className="mt-24 sm:mt-32 lg:mt-16">
                <a href="#" className="inline-flex space-x-6">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/10">
                    What's new
                  </span>
                  <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-muted-foreground">
                    <span>Just shipped v1.0</span>
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </span>
                </a>
              </div>
              <h1 className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                A better way to manage your data
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
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
          <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            All-in-one platform
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our platform provides everything you need to manage your data securely and efficiently.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <CheckCircle2 className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link
              to="/privacy"
              className="text-sm leading-6 text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm leading-6 text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-muted-foreground">
              &copy; {new Date().getFullYear()} Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
