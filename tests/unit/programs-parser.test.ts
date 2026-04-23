import { describe, expect, it } from "vitest";

import { extractProgramRecords, toProgramPersistence, validateUniqueIds } from "@/lib/programs/parser";

const sampleRecord = {
  Id: "program-1",
  University_Name__c: "Bahçeşehir",
  Program_Degree__c: "Master",
  Program_Name__c: "Data Science",
  University_Name__cn: null,
  Program_Name__cn: null,
  Alternative_Program_Name__c: "علوم البيانات",
  CurrencyType__c: "USD",
  Tuition_Fee__c: "12000",
  Discounted_Tuition_Fee__c: "9000",
  Cash_Payment_Fee__c: "8500",
  Prep_School_Fee__c: "1500",
  Deposit_Price__c: "500",
  Language__c: "English",
  Campus__c: "Bahçeşehir",
  Quota_Full__c: false,
  Program__c: "ref-1",
  Term_Settings__c: null,
  Semester__c: "Fall",
  University_Id__c: "uni-1",
  Academic_Year__c: "2026-2027",
  unilogo: null
};

describe("program parser", () => {
  it("extracts records from the Salesforce wrapper", () => {
    const payload = {
      totalSize: 1,
      done: true,
      records: [sampleRecord]
    };

    expect(extractProgramRecords(payload)).toHaveLength(1);
  });

  it("normalizes persistence fields for search and filters", () => {
    const program = toProgramPersistence(sampleRecord);

    expect(program.discountedTuitionFee).toBe(9000);
    expect(program.universityKey).toBe("bahcesehir");
    expect(program.campusKey).toBe("bahcesehir");
    expect(program.searchText).toContain("data science");
    expect(program.searchText).toContain("علوم البيانات");
  });

  it("flags duplicate Id values", () => {
    const validation = validateUniqueIds([sampleRecord, { ...sampleRecord }]);

    expect(validation.ok).toBe(false);
    expect(validation.duplicates).toEqual(["program-1"]);
  });
});
