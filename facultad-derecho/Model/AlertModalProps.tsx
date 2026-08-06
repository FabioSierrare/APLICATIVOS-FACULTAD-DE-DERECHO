export type AlertType = "info" | "success" | "warning" | "error";

export interface AlertModalProps {
  isOpen?: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  type?: AlertType;
  onAccept?: () => void;
}
