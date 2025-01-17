import { PaperAirplaneIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { CardData, PersonaData } from "@shared/types";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import Typing from "./Typing";

interface ChatBarProps {
  chatID: number;
  personaData: PersonaData;
  cardData: CardData;
  isTyping: boolean;
  userInput: string;
  setUserInput: (input: string) => void;
  handleSendMessage: () => void;
  className?: string;
}

export default function ChatBar({
  chatID,
  personaData,
  cardData,
  isTyping,
  userInput,
  setUserInput,
  handleSendMessage,
  className,
  ...rest
}: ChatBarProps) {
  // Dynamically expand the text area to fit the user's input
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea == null) {
      return;
    }
    textarea.style.height = "24px";
    textarea.style.height = textarea.scrollHeight + "px";
  }, [userInput]);

  return (
    <div className={className}>
      <div className="flex h-fit w-fit items-center ">
        <Typing className="mb-1 ml-4 mt-1" name="Saku" typing={isTyping} />
      </div>
      <div className="flex min-h-fit w-full shrink-0 space-x-2 overflow-auto rounded-3xl bg-input-primary p-4">
        <button className="flex size-7 items-center justify-center">
          <PlusCircleIcon
            className="size-7 transition duration-150 ease-out hover:brightness-90 fill-action-secondary"
            onClick={() => {
              toast("Coming in a future update!");
            }}
          />
        </button>
        {/* Textarea wrapper */}
        <textarea
          onInput={(e) => setUserInput(e.currentTarget.value)}
          ref={textAreaRef}
          maxLength={1024}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (userInput.length != 0) {
                handleSendMessage();
              }
              // Prevent inserting a new line on pressing enter
              e.preventDefault();
            }
          }}
          value={userInput}
          placeholder={`Message @Saku`}
          className="scroll-secondary text-tx-primary h-6 max-h-64 w-full resize-none overflow-y-auto bg-inherit px-2 leading-6
            placeholder:select-none focus:outline-none"
        />
        {/* Send button */}
        <button
          onClick={() => {
            if (userInput.length != 0) {
              handleSendMessage();
            }
          }}
          className="h-fit w-fit "
        >
          <PaperAirplaneIcon className="size-7 fill-action-secondary transition duration-150 ease-out hover:brightness-90" />
        </button>
      </div>
    </div>
  );
}
