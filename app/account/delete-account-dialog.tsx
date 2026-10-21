import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  confirmText: string
  onConfirmText: (value: string) => void
  deleting: boolean
  onDelete: () => void
}

export function DeleteAccountDialog({ open, onOpenChange, onCancel, confirmText, onConfirmText, deleting, onDelete }: DeleteAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently removes your account and every itinerary you created. Type <strong>DELETE</strong> to confirm.
          </DialogDescription>
        </DialogHeader>
        <Input value={confirmText} onChange={(e) => onConfirmText(e.target.value)} placeholder="DELETE" disabled={deleting} />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={deleting || confirmText !== "DELETE"}>
            {deleting ? "Deleting..." : "Delete my account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
