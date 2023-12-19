import type { OverlayedUser } from "../types";
import { HeadphonesOff } from "./icons/headphones-off";
import { MicOff } from "./icons/mic-off";

export const User = ({ item }: { item: OverlayedUser }) => {
  const { id, selfMuted, selfDeafened, talking, avatarHash } = item;

  const avatarUrl = avatarHash ? `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.jpg` : "/img/default.png";

  const lowOpacityClass = localStorage.getItem("low_opacity") === "true" ? talking ? "" : "opacity-50" : "";
  const talkingClass = talking && localStorage.getItem("disable_circle") !== "true" ? "" : "outline-0";
  const mutedClass = selfMuted ? "text-zinc-400" : "";
  const mutedAndDeafened = selfMuted && selfDeafened;
  const avatarClass = selfMuted || selfDeafened ? "text-red-500" : "";

  const transition = "transition-all ease-in-out duration-75";

  return (
    <div className={`flex flex-wrap py-1 p-2 items-center text-${ localStorage.getItem("icon_size") ?? "base" } ${lowOpacityClass} ${transition}`}>
      <div className={`pointer-events-none relative rounded-full mr-2 ${avatarClass}`}>
        <img
          onError={e => {
            // @ts-ignore
            e.target.onerror = null;
            // @ts-ignore
            e.target.src = "/img/default.png";
          }}
          src={avatarUrl}
          alt="avatar"
          className={`rounded-full w-8 h-8 outline outline-green-500 outline-2 outline-offset-[-2px] ${talkingClass} ${transition}`}
        />

        <div className="absolute flex md:hidden left-[10px] bottom-[-4px] bg-black rounded-full text-red-500">
          {mutedAndDeafened && <HeadphonesOff />}
          {selfMuted && !selfDeafened && <MicOff />}
        </div>
      </div>

      <div
        className={`max-w-[calc(100%_-_50px)] md:flex hidden pointer-events-none items-center rounded-md bg-zinc-800 ${mutedClass} p-1 pl-2 pr-2`}
      >
        <span className="truncate text-ellipsis">{item.username}</span>
        <div className="flex">
          {selfMuted && <MicOff />}
          {selfDeafened && <HeadphonesOff />}
        </div>
      </div>
    </div>
  );
};
