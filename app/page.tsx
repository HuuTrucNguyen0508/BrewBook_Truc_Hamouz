import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the main app page - use a valid route
  redirect("/onboarding");
}
