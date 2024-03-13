import { cn } from "@/lib/utils";
interface Props {
  id: string;
  name: string;
  avatar: string;
  msg: string;
  className?: string;
  [x: string]: any;
}

export default function ChatCard({ id, name, avatar, msg, className, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        "group flex h-[70px] w-full cursor-pointer items-center space-x-3 rounded-md p-1 transition duration-150 ease-out hover:bg-accent",
        className
      )}
    >
      <img className="size-12 shrink-0 rounded-full object-cover object-top" src={avatar} alt="avatar" />
      <div className="flex h-full max-w-full flex-col justify-center text-gray-400 group-hover:text-gray-100">
        <h3 className="line-clamp-1 font-[550]">{name}</h3>
        <p className="line-clamp-1 text-[15px] font-[430]">{msg}</p>
      </div>
    </div>
  );
}
