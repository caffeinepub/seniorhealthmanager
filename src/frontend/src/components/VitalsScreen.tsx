import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Heart, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { VitalType } from "../backend.d";
import type { VitalReading } from "../backend.d";
import {
  useAllVitalReadings,
  useDeleteVitalReading,
} from "../hooks/useQueries";
import {
  VITAL_BG_COLORS,
  VITAL_COLORS,
  VITAL_LABELS,
  VITAL_UNITS,
  formatDateTime,
} from "../utils/vitalHelpers";
import { AddVitalModal } from "./AddVitalModal";

const FILTER_OPTIONS: Array<{ label: string; value: VitalType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Blood Pressure", value: VitalType.bloodPressure },
  { label: "Heart Rate", value: VitalType.heartRate },
  { label: "Glucose", value: VitalType.bloodGlucose },
  { label: "Weight", value: VitalType.weight },
  { label: "Temp", value: VitalType.temperature },
  { label: "SpO2", value: VitalType.SpO2 },
];

const VITAL_ICONS: Record<VitalType, React.ReactNode> = {
  [VitalType.bloodPressure]: <Heart size={18} />,
  [VitalType.heartRate]: <Activity size={18} />,
  [VitalType.bloodGlucose]: <span className="text-sm font-bold">G</span>,
  [VitalType.weight]: <span className="text-sm font-bold">W</span>,
  [VitalType.temperature]: <span className="text-sm font-bold">T°</span>,
  [VitalType.SpO2]: <span className="text-sm font-bold">O₂</span>,
};

export function VitalsScreen() {
  const [filter, setFilter] = useState<VitalType | "all">("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const { data: vitals = [], isLoading } = useAllVitalReadings();
  const { mutateAsync: deleteReading, isPending: isDeleting } =
    useDeleteVitalReading();

  const filtered = vitals
    .filter((v) => filter === "all" || v.readingType === filter)
    .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteReading(deleteTarget);
      toast.success("Reading deleted");
    } catch {
      toast.error("Failed to delete reading");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="px-4 py-6 space-y-5 animate-slide-up">
      <h1 className="text-3xl font-display font-bold">Vital Signs</h1>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {FILTER_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-base font-semibold transition-colors ${
              filter === opt.value
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-muted text-muted-foreground"
            }`}
            data-ocid="vitals.filter.tab"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Readings List */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="vitals.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="vitals.empty_state"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart size={36} className="text-muted-foreground" />
          </div>
          <p className="text-xl font-semibold text-foreground">
            No readings yet
          </p>
          <p className="text-muted-foreground mt-1">
            Tap the + button to add your first reading
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="vitals.readings.list">
          {filtered.map((reading, index) => (
            <VitalReadingCard
              key={`${reading.readingType}-${reading.timestamp}`}
              reading={reading}
              index={index + 1}
              onDelete={() => setDeleteTarget(reading.timestamp)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        className="fixed bottom-24 right-4 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center text-3xl font-light z-30 transition-transform active:scale-95"
        onClick={() => setAddModalOpen(true)}
        data-ocid="vitals.add_vital.button"
        style={{
          maxWidth: "calc(430px - 2rem)",
          right: "max(1rem, calc(50vw - 215px + 1rem))",
        }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Add Modal */}
      <AddVitalModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {/* Delete Confirm */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="max-w-[95vw] rounded-2xl"
          data-ocid="vitals.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-display font-bold">
              Delete Reading?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              This reading will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel
              className="flex-1 h-12 text-lg rounded-xl"
              data-ocid="vitals.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 h-12 text-lg rounded-xl bg-destructive text-destructive-foreground"
              onClick={handleDelete}
              disabled={isDeleting}
              data-ocid="vitals.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function VitalReadingCard({
  reading,
  index,
  onDelete,
}: {
  reading: VitalReading;
  index: number;
  onDelete: () => void;
}) {
  return (
    <Card
      className="shadow-card border-0 overflow-hidden"
      data-ocid={`vitals.readings.item.${index}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: VITAL_COLORS[reading.readingType] }}
          >
            {VITAL_ICONS[reading.readingType]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {VITAL_LABELS[reading.readingType]}
            </p>
            <p className="text-xl font-display font-bold text-foreground">
              {reading.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {VITAL_UNITS[reading.readingType]}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(reading.timestamp)}
            </p>
            {reading.note && (
              <p className="text-sm text-muted-foreground mt-1 truncate italic">
                {reading.note}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-full text-destructive hover:bg-destructive/10 shrink-0"
            onClick={onDelete}
            data-ocid={`vitals.readings.delete_button.${index}`}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
