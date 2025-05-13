import { Link, Outlet } from "react-router";
import { Button } from "~/components/ui/button";

export default function Onboarding() {
  return (
    <div>
      <h1>Onboarding</h1>
      <Link to="/app/organization/onboarding/create">
        <Button>Create a new organization</Button>
      </Link>

      <Outlet />
    </div>
  );
}
