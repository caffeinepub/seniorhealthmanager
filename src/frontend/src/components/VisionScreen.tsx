import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { VisionRecord } from "../backend.d";
import { useUpdateVisionRecord, useVisionRecord } from "../hooks/useQueries";
import {
  dateToTimestamp,
  formatDate,
  nowTimestamp,
  timestampToDateStr,
} from "../utils/vitalHelpers";

export function VisionScreen() {
  const { data: vision, isLoading } = useVisionRecord();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-4" data-ocid="vision.loading_state">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Vision</h1>
        {!isEditing && (
          <Button
            variant="outline"
            className="h-11 rounded-xl border-2 font-semibold"
            onClick={() => setIsEditing(true)}
            data-ocid="vision.edit.button"
          >
            <Edit2 size={18} className="mr-2" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <VisionEditForm
          vision={vision}
          onCancel={() => setIsEditing(false)}
          onSave={() => setIsEditing(false)}
        />
      ) : vision ? (
        <VisionDisplay vision={vision} />
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="vision.empty_state"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Eye size={36} className="text-muted-foreground" />
          </div>
          <p className="text-xl font-semibold">No vision record yet</p>
          <p className="text-muted-foreground mt-1 mb-6">
            Add your eye exam results to track your vision
          </p>
          <Button
            className="h-14 px-8 text-lg rounded-xl"
            onClick={() => setIsEditing(true)}
            data-ocid="vision.add.button"
          >
            Add Vision Record
          </Button>
        </div>
      )}
    </div>
  );
}

function VisionDisplay({ vision }: { vision: VisionRecord }) {
  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-display">Latest Eye Exam</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Left Eye" value={vision.leftEyeAcuity || "—"} />
          <InfoField label="Right Eye" value={vision.rightEyeAcuity || "—"} />
        </div>
        <InfoField label="Prescription" value={vision.prescription || "—"} />
        <InfoField label="Optometrist" value={vision.optometrist || "—"} />
        <InfoField
          label="Exam Date"
          value={vision.examDate ? formatDate(vision.examDate) : "—"}
        />
        {vision.notes && <InfoField label="Notes" value={vision.notes} />}
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function VisionEditForm({
  vision,
  onCancel,
  onSave,
}: {
  vision: VisionRecord | null | undefined;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { mutateAsync, isPending } = useUpdateVisionRecord();
  const [form, setForm] = useState<{
    leftEyeAcuity: string;
    rightEyeAcuity: string;
    prescription: string;
    optometrist: string;
    examDate: string;
    notes: string;
  }>({
    leftEyeAcuity: vision?.leftEyeAcuity ?? "",
    rightEyeAcuity: vision?.rightEyeAcuity ?? "",
    prescription: vision?.prescription ?? "",
    optometrist: vision?.optometrist ?? "",
    examDate: vision?.examDate ? timestampToDateStr(vision.examDate) : "",
    notes: vision?.notes ?? "",
  });

  const setField =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({
        leftEyeAcuity: form.leftEyeAcuity,
        rightEyeAcuity: form.rightEyeAcuity,
        prescription: form.prescription,
        optometrist: form.optometrist,
        examDate: form.examDate
          ? dateToTimestamp(form.examDate)
          : nowTimestamp(),
        notes: form.notes || undefined,
      });
      toast.success("Vision record saved!");
      onSave();
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card className="shadow-card border-0">
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Left Eye</Label>
              <Input
                value={form.leftEyeAcuity}
                onChange={setField("leftEyeAcuity")}
                placeholder="e.g. 20/40"
                className="h-12 text-lg rounded-xl"
                data-ocid="vision.left_eye.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Right Eye</Label>
              <Input
                value={form.rightEyeAcuity}
                onChange={setField("rightEyeAcuity")}
                placeholder="e.g. 20/20"
                className="h-12 text-lg rounded-xl"
                data-ocid="vision.right_eye.input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Prescription</Label>
            <Input
              value={form.prescription}
              onChange={setField("prescription")}
              placeholder="e.g. OD: -1.50, OS: -1.75"
              className="h-12 text-lg rounded-xl"
              data-ocid="vision.prescription.input"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Optometrist Name</Label>
            <Input
              value={form.optometrist}
              onChange={setField("optometrist")}
              placeholder="Dr. Sarah Johnson"
              className="h-12 text-lg rounded-xl"
              data-ocid="vision.optometrist.input"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Exam Date</Label>
            <Input
              type="date"
              value={form.examDate}
              onChange={setField("examDate")}
              className="h-12 text-lg rounded-xl"
              data-ocid="vision.exam_date.input"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              value={form.notes}
              onChange={setField("notes")}
              placeholder="Any additional notes..."
              className="text-lg rounded-xl resize-none min-h-[80px]"
              data-ocid="vision.notes.textarea"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-14 text-lg rounded-xl border-2"
          onClick={onCancel}
          data-ocid="vision.edit.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-14 text-lg rounded-xl"
          disabled={isPending}
          data-ocid="vision.edit.save_button"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
            </>
          ) : (
            "Save Record"
          )}
        </Button>
      </div>
    </form>
  );
}
