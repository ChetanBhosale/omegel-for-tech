import { WebRTCProvider } from "@/context/webrtc-context";
import { RequireAuth } from "@/components/require-auth";

function MatchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <WebRTCProvider>{children}</WebRTCProvider>
    </RequireAuth>
  );
}

export default MatchLayout;
