import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

import ChatsPage from "@/app/chats";
import CollectionsPage from "@/app/collections";
import CreationPage from "@/app/create";
import SettingsPage from "@/app/settings/settings";
import { AppContext, DialogConfig } from "@/components/AppContext";
import SideBar from "@/components/SideBar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { handleA, handleB, handleC } from "@/lib/cmd";
import { queries } from "@/lib/queries";
import { CardBundle } from "@shared/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function App() {
  const [page, setPage] = useState<string>("chats");
  const [alertConfig, setAlertConfig] = useState<DialogConfig>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [cmdOpen, setCmdOpen] = useState<boolean>(false);
  const [activeChatID, setActiveChatID] = useState<number>();
  const [cardBundles, setCardBundles] = useState<CardBundle[]>([]);

  useEffect(() => {
    setActiveChatToMostRecent();
    syncCardBundles();
  }, []);

  async function setActiveChatToMostRecent() {
    const res = await queries.getMostRecentChat();
    if (res.kind == "ok") {
      setActiveChatID(res.value);
    }
  }

  async function syncCardBundles() {
    const res = await queries.getAllExtantCardBundles();
    if (res.kind == "ok") {
      setCardBundles(res.value);
    } else {
      toast.error("Error fetching card bundles.");
    }
  }

  // Open command dialog with Ctrl + K
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "k" && e.ctrlKey) {
        setCmdOpen(true);
      }
    });
  }, []);

  function createDialog(config: DialogConfig) {
    setAlertConfig(config);
    setDialogOpen(true);
  }

  function createModal(content: React.ReactNode) {
    setModalContent(content);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }

  // Handle zip imports
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    const numFiles = files.length;
    let numValidFiles = 0;

    if (numFiles === 0) return;
    try {
      for (let i = 0; i < numFiles; i++) {
        const file = files[i];

        // FIXME: hacky, use a better method to detect zips
        // Reject files that are not .zip
        if (!file.type.includes("zip")) {
          toast.error(`${file.name} is not a zip file, skipping...`);
          continue;
        }
        // Reject files larger than 50MB
        if (file.size > 5e7) {
          toast.error(`${file.name} is larger than 50MB, skipping...`);
          continue;
        }

        const path = file.path;
        const res = await window.api.blob.cards.importFromZip(path);

        if (res.kind === "err") {
          toast.error(`Error importing ${file.name}`);
          console.error("Error importing cards", res.error);
          continue;
        }
        numValidFiles++;
      }
      if (numValidFiles === 0) {
        return;
      }
      toast.success(`Imported ${numValidFiles} cards.`);
      syncCardBundles();
    } catch (e) {
      console.error("Error importing cards", e);
      toast.error(`Error importing cards.`);
    }
  };

  return (
    <AppContext.Provider
      value={{ createDialog, createModal, closeModal, syncCardBundles, setActiveChatToMostRecent, setActiveChatID }}
    >
      <div
        className="flex h-screen bg-background text-sm text-neutral-100 antialiased lg:text-base"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <SideBar setPage={setPage} page={page} />

        {/* Confirmation Dialog */}
        {alertConfig && (
          <AlertDialog open={dialogOpen}>
            <AlertDialogContent
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDialogOpen(false);
                }
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
                <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    alertConfig.onCancel?.();
                    setDialogOpen(false);
                  }}
                >
                  {alertConfig.cancelLabel || "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    alertConfig.onAction();
                    setDialogOpen(false);
                  }}
                >
                  {alertConfig.actionLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Modal */}
        {modalContent && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="w-fit max-w-none border-none p-0">{modalContent}</DialogContent>
          </Dialog>
        )}

        {/* Development Command Runner */}
        {import.meta.env.DEV && (
          <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Commands">
                <CommandItem
                  onSelect={() => {
                    handleA();
                    setCmdOpen(false);
                  }}
                >
                  Run A
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    handleB();
                    setCmdOpen(false);
                  }}
                >
                  Run B
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    handleC();
                    setCmdOpen(false);
                  }}
                >
                  Run C
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        )}

        <div className="flex h-full w-full overflow-hidden py-4">
          {page === "create" && <CreationPage setPage={setPage} />}

          {page === "chats" && !activeChatID && (
            <div className="flex items-center justify-center w-full h-full text-tx-tertiary">
              <p className="text-xl text-center leading-9 select-none">
                You don't have any chats. <br />
                Start a chat by going to collection -&gt; click on a card -&gt; click the start chat button. <br />
                (づ ◕‿◕ )づ
              </p>
            </div>
          )}

          {page === "chats" && activeChatID && <ChatsPage chatID={activeChatID} />}
          {page === "collections" && <CollectionsPage setPage={setPage} cardBundles={cardBundles} />}
          {page === "settings" && <SettingsPage />}
        </div>
      </div>
    </AppContext.Provider>
  );
}
