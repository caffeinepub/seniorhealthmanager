import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InsuranceInfo {
    primaryCarePhysician: string;
    groupNumber: string;
    medicareId: string;
    emergencyContacts: Array<EmergencyContact>;
    providerName: string;
    policyNumber: string;
}
export interface MedicalHistory {
    surgeries: Array<string>;
    vaccinations: Array<Vaccination>;
    diagnoses: Array<string>;
    medications: Array<Medication>;
    allergies: Array<string>;
}
export interface EmergencyContact {
    name: string;
    phone: string;
}
export interface Vaccination {
    date: bigint;
    name: string;
}
export interface VisionRecord {
    prescription: string;
    leftEyeAcuity: string;
    optometrist: string;
    notes?: string;
    examDate: bigint;
    rightEyeAcuity: string;
}
export interface VitalReading {
    readingType: VitalType;
    value: string;
    note?: string;
    unit: string;
    timestamp: bigint;
}
export interface UserProfile {
    bloodType: BloodType;
    dateOfBirth: bigint;
    name: string;
    primaryLanguage: string;
}
export interface Medication {
    dosage: string;
    name: string;
    frequency: string;
}
export enum BloodType {
    aNegative = "aNegative",
    oPositive = "oPositive",
    abPositive = "abPositive",
    bPositive = "bPositive",
    aPositive = "aPositive",
    oNegative = "oNegative",
    abNegative = "abNegative",
    bNegative = "bNegative"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VitalType {
    weight = "weight",
    bloodGlucose = "bloodGlucose",
    SpO2 = "SpO2",
    temperature = "temperature",
    bloodPressure = "bloodPressure",
    heartRate = "heartRate"
}
export interface backendInterface {
    addVitalReading(reading: VitalReading): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteVitalReading(timestamp: bigint): Promise<void>;
    getAllVitalReadings(user: Principal): Promise<Array<VitalReading>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInsuranceInfo(user: Principal): Promise<InsuranceInfo>;
    getLatestVitalReading(user: Principal, vitalType: VitalType): Promise<VitalReading>;
    getMedicalHistory(user: Principal): Promise<MedicalHistory>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisionRecord(user: Principal): Promise<VisionRecord>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateInsuranceInfo(info: InsuranceInfo): Promise<void>;
    updateMedicalHistory(history: MedicalHistory): Promise<void>;
    updateUserProfile(profile: UserProfile): Promise<void>;
    updateVisionRecord(record: VisionRecord): Promise<void>;
}
