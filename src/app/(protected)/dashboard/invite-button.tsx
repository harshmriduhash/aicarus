"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useProject from "@/hooks/use-project";
import { Copy } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = React.useState(false);
  const [origin, setOrigin] = React.useState("");

  // not using window directly in the Input since window is not available in SSR when the component is rendered for the first time.
  // so, using useEffect ensures that the value is set only after the component is mounted.
  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <>
      <Dialog modal={true}>
        <DialogTrigger asChild>
          <Button size="sm">Invite Members</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team members</DialogTitle>
            <DialogDescription>
              Ask them to copy and paste this link
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={`${origin}/join/${projectId}`}
                readOnly
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={() => {
                navigator.clipboard.writeText(`${origin}/join/${projectId}`);
                toast.success("Link copied to clipboard");
              }}
            >
              <span className="sr-only">Copy</span>
              <Copy />
            </Button>
          </div>

          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InviteButton;
