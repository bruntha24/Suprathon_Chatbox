import { ArrowLeft, Maximize2, MoreHorizontal, X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
}

const IconButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon transition-colors hover:bg-muted"
  >
    {children}
  </button>
);

const ChatHeader = ({ onClose }: ChatHeaderProps) => (
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-2">
      <IconButton><ArrowLeft size={18} className="text-foreground" /></IconButton>
      <IconButton><Maximize2 size={16} className="text-foreground" /></IconButton>
    </div>
    <div className="flex items-center gap-2">
      <IconButton><MoreHorizontal size={18} className="text-foreground" /></IconButton>
      <IconButton onClick={onClose}><X size={18} className="text-foreground" /></IconButton>
    </div>
  </div>
);

export default ChatHeader;   