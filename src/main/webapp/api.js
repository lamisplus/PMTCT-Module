 export const token = new URLSearchParams(window.location.search).get("jwt");
 export const url = "/api/v1/";
// export const url = "http://localhost:8383/api/v1/";
// export const token =
//   "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzE5Mjk2MTUwfQ.CZQV_5kqs9lzdjFO2vTQjY-6bOAP9X3dNGo1WyizXP6kjL0QIl7GwYKrBi0yv59wmYMvccaCIgCOldxTYeI2hQ";

let swagger = {
  infantArvDto: {
    ageAtCtx: "AGE_CTX_INITIATION_<2_MONTHS",
    ancNumber: "ANC002",
    arvDeliveryPoint: "After 72 hour",
    infantArvTime: "Delivered outside facility",
    infantArvType: "INFANT_ARV_PROPHYLAXIS_TYPE_OTHER_(SPECIFY)",
    infantHospitalNumber: "101",
    timingOfAvrAfter72Hours: "",
    timingOfAvrWithin72Hours:
      "TIMING_PROPHYLAXIS_AFTER_72HRS_FACILITY_DELIVERY",
    visitDate: "2024-06-19",
    uuid: "",
  },
  infantMotherArtDto: {
    ancNumber: "ANC002",
    motherArtInitiationTime:
      "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)",
    regimenId: "9",
    regimenTypeId: "1",
    visitDate: "2024-06-19",
  },
  infantPCRTestDto: {
    ageAtTest: "CHILD_TEST_AGE_2-12_MONTHS",
    ancNumber: "ANC002",
    dateResultReceivedAtFacility: "",
    dateResultReceivedByCaregiver: "",
    dateSampleCollected: "2024-06-19",
    dateSampleSent: "",
    infantHospitalNumber: "101",
    results: "INFANT_PCR_RESULT_NEGATIVE",
    testType: "Confirmatory PCR",
    visitDate: "2024-06-19",
    visitDate: "2024-06-19",
    uuid: "",
  },
  infantRapidAntiBodyTestDto: {
    ageAtTest: "CHILD_TEST_AGE_>72_HRS_-_<_2_MONTHS",
    ancNumber: "ANC002",
    dateOfTest: "2024-06-19",
    rapidTestType: "Second Rapid Antibody",
    result: "INFANT_PCR_RESULT_NEGATIVE",
  },
  infantVisitRequestDto: {
    ancNumber: "ANC002",
    bodyWeight: "43",
    breastFeeding: "43",
    infantHospitalNumber: "101",
    infantOutcomeAt18Months: "gra",
    personUuid: "6fb234c6-f9bc-4b3e-930c-df8b13584af9",
    visitDate: "2024-06-19",
    visitStatus: "CHILD_FOLLOW_UP_VISIT_STATUS_DEAD",
  },
};
let fed = {
  infantArvDto: {
    ageAtCtx: "AGE_CTX_INITIATION_<_2__MONTHS",
    ancNumber: "ANC002",
    arvDeliveryPoint: "After 72 hour",
    infantArvTime: "Delivered outside facility",
    infantArvType: "INFANT_ARV_PROPHYLAXIS_TYPE_OTHER_(SPECIFY)",
    infantHospitalNumber: "101",
    timingOfAvrWithin72Hours: "",
    timingOfAvrAfter72Hours: "TIMING_PROPHYLAXIS_AFTER_72HRS_FACILITY_DELIVERY",
    visitDate: "2024-06-19",
  },
  infantMotherArtDto: {
    ancNumber: "ANC002",
    motherArtInitiationTime:
      "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)",
    regimenTypeId: "1",
    regimenId: "9",
    visitDate: "2024-06-19",
  },
  infantPCRTestDto: {
    ageAtTest: "CHILD_TEST_AGE_2-12_MONTHS",
    ancNumber: "ANC002",
    dateResultReceivedAtFacility: "",
    dateResultReceivedByCaregiver: "",
    dateSampleCollected: "2024-06-19",
    dateSampleSent: "",
    infantHospitalNumber: "101",
    results: "INFANT_PCR_RESULT_NEGATIVE",
    testType: "Confirmatory PCR",
    visitDate: "2024-06-19",
  },
  infantRapidAntiBodyTestDto: {
    rapidTestType: "Second Rapid Antibody",
    ancNumber: "ANC002",
    ageAtTest: "CHILD_TEST_AGE_>72_HRS_-_<_2_MONTHS",
    dateOfTest: "2024-06-19",
    result: "INFANT_PCR_RESULT_NEGATIVE",
  },
  infantVisitRequestDto: {
    personUuid: "6fb234c6-f9bc-4b3e-930c-df8b13584af9",
    ancNumber: "ANC002",
    bodyWeight: "43",
    breastFeeding: "NO",
    infantHospitalNumber: "101",
    visitDate: "2024-06-19",
    visitStatus: "CHILD_FOLLOW_UP_VISIT_STATUS_DEAD",
    infantOutcomeAt18Months: "",
  },
};

