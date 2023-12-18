import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { exit } from "@tauri-apps/api/process";
import { useAppStore } from "../store";
import * as dateFns from "date-fns";
import { shell } from "@tauri-apps/api";
import { saveWindowState, StateFlags } from "tauri-plugin-window-state-api";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { Link } from "@/components/ui/link";
import { usePlatformInfo } from "@/hooks/use-platform-info";
import { UpdateBanner } from "@/components/update-banner";
import type { UpdateStatus } from "@tauri-apps/api/updater";

export const SettingsView = ({
  update,
}: {
  update: { isAvailable: boolean; status: UpdateStatus | null; error: string };
}) => {
  const navigate = useNavigate();
  const { me, setMe } = useAppStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [tokenExpires, setTokenExpires] = useState<string | null>(null);
  const platformInfo = usePlatformInfo();

  useEffect(() => {
    const token = localStorage.getItem("discord_expires_at");
    if (token) {
      setTokenExpires(token);
    }
  }, []);

  return (
    <div className="bg-zinc-900 h-full overflow-auto">
      {update.isAvailable && <UpdateBanner update={update} />}
      <div className="p-4 pt-4 pb-14 overflow-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">Settings</h1>

          <div>
            <label className="block mb-2 text-sm font-medium text-white">Icon size</label>
            <select className="bg-zinc-800 text-white p-2 rounded-md w-full" defaultValue={ localStorage.getItem("icon_size") ?? "base" } onChange={(e) => localStorage.setItem("icon_size", e.target.value)}>
              <option value="xs">Extra Small</option>
              <option value="sm">Small</option>
              <option value="base">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>

          <hr className="border-zinc-800" />

          <div className="">
            {me?.id ? (
              <p className="mb-3 font-bold">
                {me?.global_name} ({me?.id})
              </p>
            ) : (
              <p>Please Login to use Overlayed</p>
            )}

            <div className="pb-4">
              {tokenExpires && (
                <p className="text-sm">
                  <strong>Token Expires</strong> {dateFns.formatDistanceToNow(new Date(tokenExpires))}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {me?.id ? (
                <Dialog
                  onOpenChange={e => {
                    setShowLogoutDialog(e);
                  }}
                  open={showLogoutDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={!me?.id}>
                      Logout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form
                      onSubmit={event => {
                        event.preventDefault();
                        setShowLogoutDialog(false);
                        setMe(null);
                        localStorage.removeItem("discord_access_token");
                        localStorage.removeItem("discord_expires_at");
                        navigate("/");
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle className="text-xl mb-4 text-white">Logout</DialogTitle>
                        <DialogDescription className="text-xl mb-4 text-white">
                          Are you sure you want to log out of Overlayed?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" type="submit">
                          Confirm Logout
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button variant="default">
                  <Link to="/" className="no-underline text-white hover:text-white">
                    Login to Discord
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <hr className="border-zinc-800" />
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-sm">
                <strong>OS</strong> {platformInfo.os} {platformInfo.kernalVersion} {platformInfo.arch}
              </p>
            </div>
            <div>
              <p className="text-sm">
                <strong>Tauri Version</strong> {platformInfo.tauriVersion}
              </p>
            </div>
            <div>
              <p className="text-sm">
                <strong>App Version</strong> {platformInfo.appVersion}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={async () => {
                await invoke("open_devtools");
              }}
            >
              Open Devtools
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                shell.open(platformInfo.configDir);
              }}
            >
              Open Config Dir
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                navigate("/log");
              }}
            >
              Audit log
            </Button>
            <p>
              If you find any issues or bugs please report them on the{" "}
              <Link to="https://github.com/Hacksore/overlayed">github</Link> repo.
            </p>
          </div>

          <hr className="border-zinc-800" />
          <div>
            <Dialog
              onOpenChange={e => {
                setShowQuitDialog(e);
              }}
              open={showQuitDialog}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">Quit Overlayed</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form
                  onSubmit={async event => {
                    event.preventDefault();
                    await saveWindowState(StateFlags.ALL);
                    await exit();
                  }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl mb-4 text-white">Quit Overlayed</DialogTitle>
                    <DialogDescription className="text-xl mb-4 text-white">
                      Are you sure you want to quit the Overlayed app?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" type="submit">
                      Quit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="fixed right-4 bottom-4">
            <Button
              variant="secondary"
              onClick={() => {
                if (!me?.id) return navigate("/");
                navigate("/channel");
              }}
            >
              Exit Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
