import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { VitalType } from "../backend.d";
import { useAddVitalReading } from "../hooks/useQueries";
import { VITAL_LABELS, VITAL_UNITS, nowTimestamp } from "../utils/vitalHelpers";

interface AddVitalModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: VitalType;
}

const VITAL_TYPE_OPTIONS = [
  VitalType.bloodPressure,
  VitalType.heartRate,
  VitalType.bloodGlucose,
  VitalType.weight,
  VitalType.temperature,
  VitalType.SpO2,
];

export function AddVitalModal({
  open,
  onClose,
  defaultType,
}: AddVitalModalProps) {
  const [vitalType, setVitalType] = useState<VitalType>(
    defaultType ?? VitalType.bloodPressure,
  );
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const { mutateAsync, isPending } = useAddVitalReading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      toast.error("Please enter a value");
      return;
    }
    try {
      await mutateAsync({
        readingType: vitalType,
        value: value.trim(),
        unit: VITAL_UNITS[vitalType],
        note: note.trim() || undefined,
        timestamp: nowTimestamp(),
      });
      toast.success("Vital reading saved!");
      setValue("");
      setNote("");
      onClose();
    } catch {
      toast.error("Failed to save reading. Please try again.");
    }
  };

  const handleClose = () => {
    setValue("");
    setNote("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-[95vw] rounded-2xl p-6"
        data-ocid="vitals.add_vital.modal"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">
            Add Vital Reading
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="vital-type" className="text-lg font-semibold">
              Type
            </Label>
            <Select
              value={vitalType}
              onValueChange={(v) => setVitalType(v as VitalType)}
            >
              <SelectTrigger
                className="h-14 text-lg rounded-xl"
                data-ocid="vitals.add_vital.select"
                id="vital-type"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VITAL_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type} className="text-lg py-3">
                    {VITAL_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vital-value" className="text-lg font-semibold">
              Value ({VITAL_UNITS[vitalType]})
            </Label>
            <Input
              id="vital-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`e.g. ${vitalType === VitalType.bloodPressure ? "120/80" : "72"}`}
              className="h-14 text-lg rounded-xl"
              data-ocid="vitals.add_vital.input"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vital-note" className="text-lg font-semibold">
              Note{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="vital-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes..."
              className="text-lg rounded-xl min-h-[80px] resize-none"
              data-ocid="vitals.add_vital.textarea"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-14 text-lg rounded-xl border-2"
              onClick={handleClose}
              data-ocid="vitals.add_vital.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 text-lg rounded-xl"
              disabled={isPending}
              data-ocid="vitals.add_vital.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Reading"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
