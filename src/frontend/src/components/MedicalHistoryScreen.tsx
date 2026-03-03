import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MedicalHistory, Medication, Vaccination } from "../backend.d";
import {
  useMedicalHistory,
  useUpdateMedicalHistory,
} from "../hooks/useQueries";
import {
  dateToTimestamp,
  nowTimestamp,
  timestampToDateStr,
} from "../utils/vitalHelpers";

const EMPTY_HISTORY: MedicalHistory = {
  diagnoses: [],
  surgeries: [],
  allergies: [],
  medications: [],
  vaccinations: [],
};

export function MedicalHistoryScreen() {
  const { data: historyData, isLoading } = useMedicalHistory();
  const { mutateAsync, isPending } = useUpdateMedicalHistory();
  const [history, setHistory] = useState<MedicalHistory>(EMPTY_HISTORY);

  useEffect(() => {
    if (historyData) setHistory(historyData);
  }, [historyData]);

  const saveHistory = async (updated: MedicalHistory) => {
    try {
      await mutateAsync(updated);
      toast.success("Medical history saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-4" data-ocid="history.loading_state">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <ClipboardList size={24} className="text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">Medical History</h1>
      </div>

      <Tabs defaultValue="diagnoses">
        <TabsList className="w-full h-12 rounded-xl p-1 bg-muted overflow-x-auto flex">
          {[
            "diagnoses",
            "medications",
            "allergies",
            "surgeries",
            "vaccinations",
          ].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1 text-sm font-semibold rounded-lg capitalize data-[state=active]:shadow-card"
              data-ocid={`history.${tab}.tab`}
            >
              {tab === "diagnoses"
                ? "Diagnoses"
                : tab === "medications"
                  ? "Meds"
                  : tab === "allergies"
                    ? "Allergies"
                    : tab === "surgeries"
                      ? "Surgeries"
                      : "Vaccines"}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="diagnoses" className="mt-4">
          <SimpleListSection
            title="Diagnoses"
            items={history.diagnoses}
            placeholder="e.g. Type 2 Diabetes"
            onChange={(items) => {
              const updated = { ...history, diagnoses: items };
              setHistory(updated);
            }}
            onSave={() => saveHistory({ ...history })}
            isPending={isPending}
            ocidScope="history.diagnoses"
          />
        </TabsContent>

        <TabsContent value="medications" className="mt-4">
          <MedicationsSection
            medications={history.medications}
            onChange={(meds) => {
              const updated = { ...history, medications: meds };
              setHistory(updated);
            }}
            onSave={() => saveHistory({ ...history })}
            isPending={isPending}
          />
        </TabsContent>

        <TabsContent value="allergies" className="mt-4">
          <SimpleListSection
            title="Allergies"
            items={history.allergies}
            placeholder="e.g. Penicillin"
            onChange={(items) => {
              const updated = { ...history, allergies: items };
              setHistory(updated);
            }}
            onSave={() => saveHistory({ ...history })}
            isPending={isPending}
            ocidScope="history.allergies"
          />
        </TabsContent>

        <TabsContent value="surgeries" className="mt-4">
          <SimpleListSection
            title="Surgeries"
            items={history.surgeries}
            placeholder="e.g. Knee replacement (2018)"
            onChange={(items) => {
              const updated = { ...history, surgeries: items };
              setHistory(updated);
            }}
            onSave={() => saveHistory({ ...history })}
            isPending={isPending}
            ocidScope="history.surgeries"
          />
        </TabsContent>

        <TabsContent value="vaccinations" className="mt-4">
          <VaccinationsSection
            vaccinations={history.vaccinations}
            onChange={(vax) => {
              const updated = { ...history, vaccinations: vax };
              setHistory(updated);
            }}
            onSave={() => saveHistory({ ...history })}
            isPending={isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Simple List Section ─────────────────────────────────────────────────────

function SimpleListSection({
  title,
  items,
  placeholder,
  onChange,
  onSave,
  isPending,
  ocidScope,
}: {
  title: string;
  items: string[];
  placeholder?: string;
  onChange: (items: string[]) => void;
  onSave: () => void;
  isPending: boolean;
  ocidScope: string;
}) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem("");
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder ?? `Add ${title.toLowerCase()}...`}
          className="flex-1 h-12 text-lg rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          data-ocid={`${ocidScope}.input`}
        />
        <Button
          type="button"
          className="h-12 px-4 rounded-xl shrink-0"
          onClick={addItem}
          data-ocid={`${ocidScope}.button`}
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div
          className="text-center py-8 text-muted-foreground"
          data-ocid={`${ocidScope}.empty_state`}
        >
          No {title.toLowerCase()} recorded yet
        </div>
      ) : (
        <Card className="shadow-card border-0">
          <CardContent className="p-0">
            {items.map((item, position) => (
              <div
                key={item}
                className={`flex items-center gap-3 px-4 py-4 ${position > 0 ? "border-t border-border" : ""}`}
                data-ocid={`${ocidScope}.item.${position + 1}`}
              >
                <span className="flex-1 text-lg font-medium">{item}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => removeItem(position)}
                  data-ocid={`${ocidScope}.delete_button.${position + 1}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full h-14 text-lg rounded-xl font-semibold"
        disabled={isPending}
        onClick={onSave}
        data-ocid={`${ocidScope}.save_button`}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
          </>
        ) : (
          `Save ${title}`
        )}
      </Button>
    </div>
  );
}

// ─── Medications Section ─────────────────────────────────────────────────────

function MedicationsSection({
  medications,
  onChange,
  onSave,
  isPending,
}: {
  medications: Medication[];
  onChange: (meds: Medication[]) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "" });

  const addMed = () => {
    if (!newMed.name.trim()) return;
    onChange([...medications, { ...newMed }]);
    setNewMed({ name: "", dosage: "", frequency: "" });
  };

  const removeMed = (index: number) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Add Medication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Medication Name</Label>
            <Input
              value={newMed.name}
              onChange={(e) =>
                setNewMed((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g. Metformin"
              className="h-12 text-lg rounded-xl"
              data-ocid="history.medications.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Dosage</Label>
              <Input
                value={newMed.dosage}
                onChange={(e) =>
                  setNewMed((p) => ({ ...p, dosage: e.target.value }))
                }
                placeholder="500mg"
                className="h-12 text-lg rounded-xl"
                data-ocid="history.medications.dosage_input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Frequency</Label>
              <Input
                value={newMed.frequency}
                onChange={(e) =>
                  setNewMed((p) => ({ ...p, frequency: e.target.value }))
                }
                placeholder="Twice daily"
                className="h-12 text-lg rounded-xl"
                data-ocid="history.medications.frequency_input"
              />
            </div>
          </div>
          <Button
            className="w-full h-12 text-lg rounded-xl"
            onClick={addMed}
            type="button"
            data-ocid="history.medications.button"
          >
            <Plus size={20} className="mr-2" />
            Add Medication
          </Button>
        </CardContent>
      </Card>

      {medications.length === 0 ? (
        <div
          className="text-center py-8 text-muted-foreground"
          data-ocid="history.medications.empty_state"
        >
          No medications recorded yet
        </div>
      ) : (
        <Card className="shadow-card border-0">
          <CardContent className="p-0">
            {medications.map((med, index) => (
              <div
                key={`${med.name}-${index}`}
                className={`px-4 py-4 ${index > 0 ? "border-t border-border" : ""}`}
                data-ocid={`history.medications.item.${index + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold">{med.name}</p>
                    <p className="text-base text-muted-foreground">
                      {med.dosage} · {med.frequency}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-full text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => removeMed(index)}
                    data-ocid={`history.medications.delete_button.${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full h-14 text-lg rounded-xl font-semibold"
        disabled={isPending}
        onClick={onSave}
        data-ocid="history.medications.save_button"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
          </>
        ) : (
          "Save Medications"
        )}
      </Button>
    </div>
  );
}

// ─── Vaccinations Section ─────────────────────────────────────────────────────

function VaccinationsSection({
  vaccinations,
  onChange,
  onSave,
  isPending,
}: {
  vaccinations: Vaccination[];
  onChange: (vax: Vaccination[]) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const [newVax, setNewVax] = useState({ name: "", date: "" });

  const addVax = () => {
    if (!newVax.name.trim()) return;
    onChange([
      ...vaccinations,
      {
        name: newVax.name.trim(),
        date: newVax.date ? dateToTimestamp(newVax.date) : nowTimestamp(),
      },
    ]);
    setNewVax({ name: "", date: "" });
  };

  const removeVax = (index: number) => {
    onChange(vaccinations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">
            Add Vaccination
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Vaccine Name</Label>
            <Input
              value={newVax.name}
              onChange={(e) =>
                setNewVax((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g. Influenza"
              className="h-12 text-lg rounded-xl"
              data-ocid="history.vaccinations.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Date</Label>
            <Input
              type="date"
              value={newVax.date}
              onChange={(e) =>
                setNewVax((p) => ({ ...p, date: e.target.value }))
              }
              className="h-12 text-lg rounded-xl"
              data-ocid="history.vaccinations.date_input"
            />
          </div>
          <Button
            className="w-full h-12 text-lg rounded-xl"
            onClick={addVax}
            type="button"
            data-ocid="history.vaccinations.button"
          >
            <Plus size={20} className="mr-2" />
            Add Vaccination
          </Button>
        </CardContent>
      </Card>

      {vaccinations.length === 0 ? (
        <div
          className="text-center py-8 text-muted-foreground"
          data-ocid="history.vaccinations.empty_state"
        >
          No vaccinations recorded yet
        </div>
      ) : (
        <Card className="shadow-card border-0">
          <CardContent className="p-0">
            {vaccinations.map((vax, index) => (
              <div
                key={`${vax.name}-${index}`}
                className={`flex items-center gap-3 px-4 py-4 ${index > 0 ? "border-t border-border" : ""}`}
                data-ocid={`history.vaccinations.item.${index + 1}`}
              >
                <div className="flex-1">
                  <p className="text-lg font-semibold">{vax.name}</p>
                  {vax.date > 0n && (
                    <p className="text-base text-muted-foreground">
                      {timestampToDateStr(vax.date)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => removeVax(index)}
                  data-ocid={`history.vaccinations.delete_button.${index + 1}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full h-14 text-lg rounded-xl font-semibold"
        disabled={isPending}
        onClick={onSave}
        data-ocid="history.vaccinations.save_button"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
          </>
        ) : (
          "Save Vaccinations"
        )}
      </Button>
    </div>
  );
}
