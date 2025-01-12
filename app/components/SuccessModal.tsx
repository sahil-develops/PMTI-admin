import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  className?: string;
}

export function SuccessModal({ isOpen, message, className }: SuccessModalProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className={cn("max-w-[400px] gap-0", className)}>
        <div className="flex flex-col items-center justify-center p-2">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <AlertDialogHeader className="gap-2">
          <AlertDialogTitle className="text-center">
            Success!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
} 