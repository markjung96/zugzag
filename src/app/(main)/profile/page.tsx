import type { Metadata } from "next";
import { ProfileContent } from "./profile-content";

export const metadata: Metadata = {
  title: "내 프로필 | ZUGZAG",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileContent />;
}
