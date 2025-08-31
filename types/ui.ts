export type MessageType = "success" | "error" | "info";

export interface MessageDialogProps {
  open: boolean;
  type?: MessageType;
  title?: string;
  message: string;
  onClose: () => void;
  loading?: boolean;
  loadingMessage?: string;
}
