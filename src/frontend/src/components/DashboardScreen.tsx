import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ClipboardList, Eye, Heart, Plus } from "lucide-react";
import { VitalType } from "../backend.d";
import type { VitalReading } from "../backend.d";
import { useUserProfile } from "../hooks/useQueries";
import { useAllVitalReadings } from "../hooks/useQueries";
import {
  VITAL_BG_COLORS,
  VITAL_COLORS,
  VITAL_LABELS,
  VITAL_UNITS,
  formatDateTime,
} from "../utils/vitalHelpers";

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
  onAddVital: () => void;
}

const VITAL_TYPES = [
  VitalType.bloodPressure,
  VitalType.heartRate,
  VitalType.bloodGlucose,
  VitalType.weight,
  VitalType.temperature,
  VitalType.SpO2,
];

const VITAL_ICONS: Record<VitalType, React.ReactNode> = {
  [VitalType.bloodPressure]: <Heart size={20} />,
  [VitalType.heartRate]: <Activity size={20} />,
  [VitalType.bloodGlucose]: <span className="text-base font-bold">G</span>,
  [VitalType.weight]: <span className="text-base font-bold">W</span>,
  [VitalType.temperature]: <span className="text-base font-bold">T°</span>,
  [VitalType.SpO2]: <span className="text-base font-bold">O₂</span>,
};

export function DashboardScreen({
  onNavigate,
  onAddVital,
}: DashboardScreenProps) {
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: vitals = [], isLoading: vitalsLoading } = useAllVitalReadings();

  const firstName = profile?.name?.split(" ")[0] ?? "";

  // Get latest reading per type
  const latestByType: Partial<Record<VitalType, VitalReading>> = {};
  for (const reading of vitals) {
    const existing = latestByType[reading.readingType];
    if (!existing || reading.timestamp > existing.timestamp) {
      latestByType[reading.readingType] = reading;
    }
  }

  const isProfileIncomplete =
    profile && (!profile.name || !profile.dateOfBirth);

  return (
    <div className="px-4 py-6 space-y-6 animate-slide-up">
      {/* Greeting */}
      <div className="space-y-1">
        {profileLoading ? (
          <Skeleton className="h-10 w-48" />
        ) : (
          <h1 className="text-3xl font-display font-bold text-foreground">
            {firstName ? `Hello, ${firstName}! 👋` : "Hello! 👋"}
          </h1>
        )}
        <p className="text-muted-foreground text-lg">
          How are you feeling today?
        </p>
      </div>

      {/* Complete Profile Prompt */}
      {!profileLoading && isProfileIncomplete && (
        <Card className="bg-primary/10 border-primary/20 shadow-sm">
          <CardContent className="py-4 px-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-lg">📋</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                Complete Your Profile
              </p>
              <p className="text-sm text-muted-foreground">
                Add your personal details to get started
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-primary/30 text-primary"
              onClick={() => onNavigate("profile")}
              data-ocid="dashboard.profile.button"
            >
              Setup
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vital Summary Cards */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-3 text-foreground">
          Latest Readings
        </h2>
        {vitalsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {VITAL_TYPES.map((type) => (
              <Skeleton key={type} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="dashboard.vitals.list"
          >
            {VITAL_TYPES.map((type, index) => {
              const reading = latestByType[type];
              return (
                <Card
                  key={type}
                  className="shadow-card border-0 overflow-hidden cursor-pointer hover:shadow-elevated transition-shadow"
                  style={{ background: VITAL_BG_COLORS[type] }}
                  onClick={() => onNavigate("vitals")}
                  data-ocid={`dashboard.vitals.item.${index + 1}`}
                >
                  <CardContent className="p-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center mb-2 text-white"
                      style={{ background: VITAL_COLORS[type] }}
                    >
                      {VITAL_ICONS[type]}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      {VITAL_LABELS[type]}
                    </p>
                    {reading ? (
                      <>
                        <p className="text-xl font-display font-bold text-foreground leading-tight">
                          {reading.value}
                          <span className="text-sm font-normal ml-1 text-muted-foreground">
                            {VITAL_UNITS[type]}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(reading.timestamp)}
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-medium text-muted-foreground mt-1">
                        No data
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-3 text-foreground">
          Quick Actions
        </h2>
        <div className="space-y-3">
          <Button
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-card"
            onClick={onAddVital}
            data-ocid="dashboard.add_vital.button"
          >
            <Plus size={22} className="mr-2" />
            Add Vital Reading
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-lg font-semibold rounded-xl border-2 border-border"
            onClick={() => onNavigate("vision")}
            data-ocid="dashboard.update_vision.button"
          >
            <Eye size={22} className="mr-2 text-primary" />
            Update Vision Record
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-lg font-semibold rounded-xl border-2 border-border"
            onClick={() => onNavigate("history")}
            data-ocid="dashboard.view_history.button"
          >
            <ClipboardList size={22} className="mr-2 text-primary" />
            View Medical History
          </Button>
        </div>
      </div>
    </div>
  );
}
