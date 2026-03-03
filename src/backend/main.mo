import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type VitalType = {
    #bloodPressure;
    #heartRate;
    #bloodGlucose;
    #weight;
    #temperature;
    #SpO2;
  };

  module VitalType {
    public func compare(v1 : VitalType, v2 : VitalType) : Order.Order {
      switch (v1, v2) {
        case (#bloodPressure, #bloodPressure) { #equal };
        case (#bloodPressure, _) { #less };
        case (#heartRate, #heartRate) { #equal };
        case (#heartRate, #bloodPressure) { #greater };
        case (#heartRate, _) { #less };
        case (#bloodGlucose, #bloodGlucose) { #equal };
        case (#bloodGlucose, #weight or #temperature or #SpO2) { #less };
        case (#bloodGlucose, _) { #greater };
        case (#weight, #weight) { #equal };
        case (#weight, #bloodPressure or #heartRate or #bloodGlucose) { #greater };
        case (#weight, _) { #less };
        case (#temperature, #temperature) { #equal };
        case (#temperature, #SpO2) { #less };
        case (#temperature, _) { #greater };
        case (#SpO2, #SpO2) { #equal };
        case (#SpO2, _) { #greater };
      };
    };
  };

  public type VitalReading = {
    readingType : VitalType;
    value : Text;
    unit : Text;
    note : ?Text;
    timestamp : Int;
  };

  public type VisionRecord = {
    leftEyeAcuity : Text;
    rightEyeAcuity : Text;
    prescription : Text;
    optometrist : Text;
    examDate : Int;
    notes : ?Text;
  };

  public type EmergencyContact = {
    name : Text;
    phone : Text;
  };

  public type InsuranceInfo = {
    medicareId : Text;
    providerName : Text;
    policyNumber : Text;
    groupNumber : Text;
    primaryCarePhysician : Text;
    emergencyContacts : [EmergencyContact];
  };

  public type Medication = {
    name : Text;
    dosage : Text;
    frequency : Text;
  };

  public type Vaccination = {
    name : Text;
    date : Int;
  };

  public type MedicalHistory = {
    diagnoses : [Text];
    surgeries : [Text];
    allergies : [Text];
    medications : [Medication];
    vaccinations : [Vaccination];
  };

  public type BloodType = {
    #aPositive;
    #aNegative;
    #bPositive;
    #bNegative;
    #abPositive;
    #abNegative;
    #oPositive;
    #oNegative;
  };

  public type UserProfile = {
    name : Text;
    dateOfBirth : Int;
    bloodType : BloodType;
    primaryLanguage : Text;
  };

  // Data stores
  let vitalReadings = Map.empty<Principal, [VitalReading]>();
  let visionRecords = Map.empty<Principal, VisionRecord>();
  let insuranceInfo = Map.empty<Principal, InsuranceInfo>();
  let medicalHistory = Map.empty<Principal, MedicalHistory>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func updateUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Vital Signs
  public shared ({ caller }) func addVitalReading(reading : VitalReading) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add vital readings");
    };
    let existing = switch (vitalReadings.get(caller)) {
      case (null) { [] };
      case (?readings) { readings };
    };
    vitalReadings.add(caller, existing.concat([reading]));
  };

  public shared ({ caller }) func deleteVitalReading(timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete vital readings");
    };
    switch (vitalReadings.get(caller)) {
      case (null) { Runtime.trap("No vital readings found") };
      case (?readings) {
        let filtered = readings.filter(func(r) { r.timestamp != timestamp });
        vitalReadings.add(caller, filtered);
      };
    };
  };

  public query ({ caller }) func getLatestVitalReading(user : Principal, vitalType : VitalType) : async VitalReading {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own vital readings");
    };
    switch (vitalReadings.get(user)) {
      case (null) { Runtime.trap("No vital readings found") };
      case (?readings) {
        let filtered = readings.filter(func(r) { r.readingType == vitalType });
        if (filtered.size() == 0) { Runtime.trap("No readings found") };
        filtered[0];
      };
    };
  };

  public query ({ caller }) func getAllVitalReadings(user : Principal) : async [VitalReading] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own vital readings");
    };
    switch (vitalReadings.get(user)) {
      case (null) { [] };
      case (?readings) { readings };
    };
  };

  // Vision Records
  public shared ({ caller }) func updateVisionRecord(record : VisionRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update vision records");
    };
    visionRecords.add(caller, record);
  };

  public query ({ caller }) func getVisionRecord(user : Principal) : async VisionRecord {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own vision records");
    };
    switch (visionRecords.get(user)) {
      case (null) { Runtime.trap("No vision records found") };
      case (?record) { record };
    };
  };

  // Insurance & Medicare Info
  public shared ({ caller }) func updateInsuranceInfo(info : InsuranceInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update insurance info");
    };
    insuranceInfo.add(caller, info);
  };

  public query ({ caller }) func getInsuranceInfo(user : Principal) : async InsuranceInfo {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own insurance info");
    };
    switch (insuranceInfo.get(user)) {
      case (null) { Runtime.trap("No insurance info found") };
      case (?info) { info };
    };
  };

  // Medical History
  public shared ({ caller }) func updateMedicalHistory(history : MedicalHistory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update medical history");
    };
    medicalHistory.add(caller, history);
  };

  public query ({ caller }) func getMedicalHistory(user : Principal) : async MedicalHistory {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own medical history");
    };
    switch (medicalHistory.get(user)) {
      case (null) { Runtime.trap("No medical history found") };
      case (?history) { history };
    };
  };
};
