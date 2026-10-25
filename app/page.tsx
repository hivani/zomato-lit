import { redirect } from "next/navigation";

// The bare domain is what people actually paste and share. There is only one
// restaurant in this app, so send every visitor straight to its page instead
// of showing a placeholder that looks like a broken deployment.
export default function Home() {
  redirect("/restaurant/1");
}
