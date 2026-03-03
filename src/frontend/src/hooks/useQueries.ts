import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InsuranceInfo,
  MedicalHistory,
  UserProfile,
  VisionRecord,
  VitalReading,
  VitalType,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── User Profile ───────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ─── Vital Readings ──────────────────────────────────────────────────────────

export function useAllVitalReadings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<VitalReading[]>({
    queryKey: ["vitalReadings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getAllVitalReadings(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddVitalReading() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reading: VitalReading) => {
      if (!actor) throw new Error("Not connected");
      await actor.addVitalReading(reading);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vitalReadings"] });
    },
  });
}

export function useDeleteVitalReading() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (timestamp: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteVitalReading(timestamp);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vitalReadings"] });
    },
  });
}

export function useLatestVitalReading(vitalType: VitalType) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<VitalReading | null>({
    queryKey: ["latestVital", vitalType, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        return await actor.getLatestVitalReading(
          identity.getPrincipal(),
          vitalType,
        );
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ─── Vision Record ───────────────────────────────────────────────────────────

export function useVisionRecord() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<VisionRecord | null>({
    queryKey: ["visionRecord", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        return await actor.getVisionRecord(identity.getPrincipal());
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateVisionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: VisionRecord) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateVisionRecord(record);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["visionRecord"] });
    },
  });
}

// ─── Insurance Info ──────────────────────────────────────────────────────────

export function useInsuranceInfo() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<InsuranceInfo | null>({
    queryKey: ["insuranceInfo", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        return await actor.getInsuranceInfo(identity.getPrincipal());
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateInsuranceInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (info: InsuranceInfo) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateInsuranceInfo(info);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["insuranceInfo"] });
    },
  });
}

// ─── Medical History ─────────────────────────────────────────────────────────

export function useMedicalHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<MedicalHistory | null>({
    queryKey: ["medicalHistory", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        return await actor.getMedicalHistory(identity.getPrincipal());
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateMedicalHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (history: MedicalHistory) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateMedicalHistory(history);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
    },
  });
}
