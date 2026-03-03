import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InsuranceInfo } from "../backend.d";
import { useInsuranceInfo, useUpdateInsuranceInfo } from "../hooks/useQueries";

type ContactWithId = { id: string; name: string; phone: string };

let _contactIdCounter = 0;
function newContactId() {
  _contactIdCounter += 1;
  return `c${_contactIdCounter}`;
}

const EMPTY_INSURANCE = {
  medicareId: "",
  providerName: "",
  policyNumber: "",
  groupNumber: "",
  primaryCarePhysician: "",
  contacts: [] as ContactWithId[],
};

export function InsuranceScreen() {
  const { data: insuranceData, isLoading } = useInsuranceInfo();
  const { mutateAsync, isPending } = useUpdateInsuranceInfo();
  const [form, setForm] = useState(EMPTY_INSURANCE);

  useEffect(() => {
    if (insuranceData) {
      setForm({
        medicareId: insuranceData.medicareId,
        providerName: insuranceData.providerName,
        policyNumber: insuranceData.policyNumber,
        groupNumber: insuranceData.groupNumber,
        primaryCarePhysician: insuranceData.primaryCarePhysician,
        contacts: insuranceData.emergencyContacts.map((c) => ({
          id: newContactId(),
          name: c.name,
          phone: c.phone,
        })),
      });
    }
  }, [insuranceData]);

  const setField =
    (field: keyof Omit<typeof form, "contacts">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const addContact = () => {
    setForm((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { id: newContactId(), name: "", phone: "" }],
    }));
  };

  const removeContact = (id: string) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== id),
    }));
  };

  const updateContact = (
    id: string,
    field: "name" | "phone",
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) =>
        c.id === id ? { ...c, [field]: value } : c,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const info: InsuranceInfo = {
      medicareId: form.medicareId,
      providerName: form.providerName,
      policyNumber: form.policyNumber,
      groupNumber: form.groupNumber,
      primaryCarePhysician: form.primaryCarePhysician,
      emergencyContacts: form.contacts.map(({ name, phone }) => ({
        name,
        phone,
      })),
    };
    try {
      await mutateAsync(info);
      toast.success("Insurance information saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-4" data-ocid="insurance.loading_state">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield size={24} className="text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">Insurance</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Medicare & Insurance */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-display">
              Medicare & Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              label="Medicare ID"
              value={form.medicareId}
              onChange={setField("medicareId")}
              placeholder="1EG4-TE5-MK72"
              ocid="insurance.medicare_id.input"
            />
            <FormField
              label="Insurance Provider"
              value={form.providerName}
              onChange={setField("providerName")}
              placeholder="Blue Cross Blue Shield"
              ocid="insurance.provider.input"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Policy Number"
                value={form.policyNumber}
                onChange={setField("policyNumber")}
                placeholder="POL-12345"
                ocid="insurance.policy_number.input"
              />
              <FormField
                label="Group Number"
                value={form.groupNumber}
                onChange={setField("groupNumber")}
                placeholder="GRP-6789"
                ocid="insurance.group_number.input"
              />
            </div>
            <FormField
              label="Primary Care Physician"
              value={form.primaryCarePhysician}
              onChange={setField("primaryCarePhysician")}
              placeholder="Dr. James Wilson"
              ocid="insurance.physician.input"
            />
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-display">
                Emergency Contacts
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-2 font-semibold"
                onClick={addContact}
                data-ocid="insurance.emergency_contacts.button"
              >
                <Plus size={18} className="mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.contacts.length === 0 ? (
              <p
                className="text-muted-foreground text-center py-4"
                data-ocid="insurance.emergency_contacts.empty_state"
              >
                No emergency contacts added yet
              </p>
            ) : (
              form.contacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className="p-4 rounded-xl bg-muted/50 space-y-3"
                  data-ocid={`insurance.emergency_contacts.item.${index + 1}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-muted-foreground">
                      Contact {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-10 h-10 rounded-full text-destructive hover:bg-destructive/10"
                      onClick={() => removeContact(contact.id)}
                      data-ocid={`insurance.emergency_contacts.delete_button.${index + 1}`}
                    >
                      <Trash2 size={17} />
                    </Button>
                  </div>
                  <Input
                    value={contact.name}
                    onChange={(e) =>
                      updateContact(contact.id, "name", e.target.value)
                    }
                    placeholder="Full Name"
                    className="h-12 text-lg rounded-xl"
                    data-ocid="insurance.contact_name.input"
                  />
                  <Input
                    value={contact.phone}
                    onChange={(e) =>
                      updateContact(contact.id, "phone", e.target.value)
                    }
                    placeholder="Phone Number"
                    type="tel"
                    className="h-12 text-lg rounded-xl"
                    data-ocid="insurance.contact_phone.input"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full h-14 text-lg rounded-xl font-semibold"
          disabled={isPending}
          data-ocid="insurance.save.button"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
            </>
          ) : (
            "Save Information"
          )}
        </Button>
      </form>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  ocid,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  ocid: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">{label}</Label>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 text-lg rounded-xl"
        data-ocid={ocid}
      />
    </div>
  );
}
