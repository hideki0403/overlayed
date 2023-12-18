import { User } from "../components/user";
import { useAppStore } from "../store";

export const ChannelView = () => {
  const { users } = useAppStore();

  return (
    <div className="h-4/5">
      <div className="py-2 flex flex-col h-full">
        { localStorage.getItem("show_bottom") === "true" && <div className="flex-grow" /> }
        {Object.entries(users).map(([_, item]) => (
          <User key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
