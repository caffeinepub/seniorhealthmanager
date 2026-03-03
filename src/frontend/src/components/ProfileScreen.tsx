import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BloodType } from "../backend.d";
import type { UserProfile } from "../backend.d";
import { useSaveUserProfile, useUserProfile } from "../hooks/useQueries";
import { dateToTimestamp, timestampToDateStr } from "../utils/vitalHelpers";

const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  [BloodType.aPositive]: "A+",
  [BloodType.aNegative]: "A−",
  [BloodType.bPositive]: "B+",
  [BloodType.bNegative]: "B−",
  [BloodType.abPositive]: "AB+",
  [BloodType.abNegative]: "AB−",
  [BloodType.oPositive]: "O+",
  [BloodType.oNegative]: "O−",
};

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Mandarin",
  "Cantonese",
  "Tagalog",
  "Vietnamese",
  "Arabic",
  "Korean",
  "Portuguese",
  "Other",
];

const EMPTY_PROFILE: {
  name: string;
  dateOfBirth: string;
  bloodType: BloodType | "";
  primaryLanguage: string;
} = {
  name: "",
  dateOfBirth: "",
  bloodType: "",
  primaryLanguage: "English",
};

interface ProfileScreenProps {
  onBack?: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { data: profile, isLoading } = useUserProfile();
  const { mutateAsync, isPending } = useSaveUserProfile();
  const [form, setForm] = useState(EMPTY_PROFILE);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        dateOfBirth: profile.dateOfBirth
          ? timestampToDateStr(profile.dateOfBirth)
          : "",
        bloodType: profile.bloodType as BloodType,
        primaryLanguage: profile.primaryLanguage,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.bloodType) {
      toast.error("Please select your blood type");
      return;
    }
    try {
      const profileData: UserProfile = {
        name: form.name.trim(),
        dateOfBirth: form.dateOfBirth
          ? dateToTimestamp(form.dateOfBirth)
          : BigInt(0),
        bloodType: form.bloodType as BloodType,
        primaryLanguage: form.primaryLanguage,
      };
      await mutateAsync(profileData);
      toast.success("Profile saved!");
      onBack?.();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-4" data-ocid="profile.loading_state">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={30} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground">Personal health information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-display">
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-base font-semibold">
                Full Name
              </Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Margaret Johnson"
                className="h-12 text-lg rounded-xl"
                data-ocid="profile.name.input"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-dob" className="text-base font-semibold">
                Date of Birth
              </Label>
              <Input
                id="profile-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dateOfBirth: e.target.value }))
                }
                className="h-12 text-lg rounded-xl"
                data-ocid="profile.dob.input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Blood Type</Label>
              <Select
                value={form.bloodType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, bloodType: v as BloodType }))
                }
              >
                <SelectTrigger
                  className="h-12 text-lg rounded-xl"
                  data-ocid="profile.blood_type.select"
                >
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BloodType).map((bt) => (
                    <SelectItem key={bt} value={bt} className="text-lg py-3">
                      {BLOOD_TYPE_LABELS[bt]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Primary Language
              </Label>
              <Select
                value={form.primaryLanguage}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, primaryLanguage: v }))
                }
              >
                <SelectTrigger
                  className="h-12 text-lg rounded-xl"
                  data-ocid="profile.language.select"
                >
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang}
                      value={lang}
                      className="text-lg py-3"
                    >
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full h-14 text-lg rounded-xl font-semibold"
          disabled={isPending}
          data-ocid="profile.save.button"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </form>
    </div>
  );
}
