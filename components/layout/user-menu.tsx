"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, LogOut, PencilLine, ShieldCheck, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StoredProfile = {
  displayName?: string;
  avatarDataUrl?: string;
};

const PROFILE_KEY_PREFIX = "rehmat:profile:";

function getProfileStorageKey(email: string) {
  return `${PROFILE_KEY_PREFIX}${email.toLowerCase()}`;
}

export function UserMenu({
  name,
  email,
  role
}: {
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
}) {
  const [displayName, setDisplayName] = useState(name);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftAvatarDataUrl, setDraftAvatarDataUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const key = getProfileStorageKey(email);

    try {
      const raw = window.localStorage.getItem(key);

      if (!raw) {
        setDisplayName(name);
        setAvatarDataUrl(null);
        return;
      }

      const parsed = JSON.parse(raw) as StoredProfile;
      setDisplayName(parsed.displayName?.trim() || name);
      setAvatarDataUrl(parsed.avatarDataUrl || null);
    } catch {
      setDisplayName(name);
      setAvatarDataUrl(null);
    }
  }, [email, name]);

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = role === "ADMIN" ? "Administrator" : "Agent";
  const roleAccessLabel = role === "ADMIN" ? "Admin access" : "Agent access";

  const canSave = useMemo(() => {
    const normalizedName = draftName.trim();
    return normalizedName.length >= 2 && normalizedName.length <= 80;
  }, [draftName]);

  function openProfileDialog() {
    setDraftName(displayName);
    setDraftAvatarDataUrl(avatarDataUrl);
    setUploadError(null);
    setIsProfileDialogOpen(true);
  }

  function saveProfile() {
    const normalizedName = draftName.trim();

    if (!normalizedName || normalizedName.length < 2 || normalizedName.length > 80) {
      setUploadError("Name must be between 2 and 80 characters.");
      return;
    }

    const nextProfile: StoredProfile = {
      displayName: normalizedName,
      avatarDataUrl: draftAvatarDataUrl || undefined
    };

    setDisplayName(normalizedName);
    setAvatarDataUrl(draftAvatarDataUrl || null);

    try {
      window.localStorage.setItem(getProfileStorageKey(email), JSON.stringify(nextProfile));
    } catch {
      // If storage is unavailable, keep profile in memory for current session.
    }

    setIsProfileDialogOpen(false);
  }

  function onAvatarFileChange(file: File | null) {
    setUploadError(null);

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setDraftAvatarDataUrl(result);
    };
    reader.onerror = () => {
      setUploadError("Unable to read selected image.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-3 rounded-md px-2" variant="ghost">
            <Avatar className="h-9 w-9 border border-border/70">
              {avatarDataUrl ? <AvatarImage alt={displayName} src={avatarDataUrl} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-xs text-muted-foreground">{roleLabel}</div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="space-y-3 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-border/70">
                {avatarDataUrl ? <AvatarImage alt={displayName} src={avatarDataUrl} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="font-medium leading-none">{displayName}</div>
                <div className="text-xs font-normal text-muted-foreground">{email}</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              {roleAccessLabel}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              openProfileDialog();
            }}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Edit profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog onOpenChange={setIsProfileDialogOpen} open={isProfileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your display name and profile photo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-border/70 p-4">
              <Avatar className="h-16 w-16 border border-border/70">
                {draftAvatarDataUrl ? <AvatarImage alt={draftName || displayName} src={draftAvatarDataUrl} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profile-avatar" className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
                  <Camera className="h-4 w-4" />
                  Upload photo
                </Label>
                <Input
                  accept="image/*"
                  className="hidden"
                  id="profile-avatar"
                  onChange={(event) => onAvatarFileChange(event.target.files?.[0] ?? null)}
                  type="file"
                />
                <Button
                  onClick={() => setDraftAvatarDataUrl(null)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove photo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                maxLength={80}
                onChange={(event) => {
                  setUploadError(null);
                  setDraftName(event.target.value);
                }}
                placeholder="Enter your display name"
                value={draftName}
              />
            </div>

            {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsProfileDialogOpen(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={!canSave} onClick={saveProfile} type="button">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
