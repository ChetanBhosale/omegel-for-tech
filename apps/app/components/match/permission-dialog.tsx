"use client";

import { VideoOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassButton } from "@/components/ui/glass-button";
import { useWebRTC } from "@/context/webrtc-context";

export function PermissionDialog() {
  const { mediaPermission, permissionBlocked, requestMedia } = useWebRTC();

  const open = mediaPermission === "denied";

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-md text-center"
      >
        <DialogHeader className="items-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <VideoOff className="size-7" />
          </div>
          <DialogTitle className="text-lg">
            Turn on your camera & microphone
          </DialogTitle>
          <DialogDescription className="text-center">
            OmegleForTech is video-first. Please allow camera and microphone
            access so your match can see and hear you — nobody likes getting
            creeped out by a blank screen.
          </DialogDescription>
        </DialogHeader>

        {permissionBlocked ? (
          <div className="mt-2 rounded-lg bg-muted/50 p-3 text-left text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">
              Access is blocked. To re-enable:
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>
                Click the camera/lock icon in your browser&apos;s address bar.
              </li>
              <li>
                Set Camera and Microphone to{" "}
                <span className="text-foreground">Allow</span>.
              </li>
              <li>Press Try again below.</li>
            </ol>
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Click below and choose <span className="text-foreground">Allow</span>{" "}
            when your browser asks for permission.
          </p>
        )}

        <GlassButton size="lg" onClick={requestMedia} className="mt-2 w-full">
          {permissionBlocked ? "Try again" : "Allow camera & mic"}
        </GlassButton>
      </DialogContent>
    </Dialog>
  );
}
