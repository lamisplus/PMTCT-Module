import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { Label as FormLabelName } from "reactstrap";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import PersonIcon from "@material-ui/icons/Person";
import AssignmentIcon from "@material-ui/icons/Assignment";
import HistoryIcon from "@material-ui/icons/History";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import ReplayIcon from "@material-ui/icons/Replay";
import HealingIcon from "@material-ui/icons/Healing";
import PeopleIcon from "@material-ui/icons/People";
import TimelineIcon from "@material-ui/icons/Timeline";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { useHistory, useLocation } from "react-router-dom";
import "react-summernote/dist/react-summernote.css"; // import styles
import { Spinner } from "reactstrap";
import { Message, Label as LabelRibbon } from "semantic-ui-react";
import { calculateGestationalAge } from "../../utils";
import { GET_CODESETS_IN_BATCH } from "../../../utils";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  cardBottom: {
    marginBottom: 20,
  },
  Select: {
    height: 45,
    width: 350,
  },
  button: {
    margin: theme.spacing(1),
  },

  root: {
    flexGrow: 1,
    "& .card-title": {
      color: "#fff",
      fontWeight: "bold",
    },
    "& .form-control": {
      borderRadius: "0.25rem",
      height: "41px",
      borderColor: "#d2d6dc",
    },
    "& .card-header:first-child": {
      borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0",
    },
    "& .dropdown-toggle::after": {
      display: " block !important",
    },
    "& select": {
      "-webkit-appearance": "listbox !important",
    },
    "& p": {
      color: "red",
    },
    "& label": {
      fontSize: "14px",
      color: "#014d88",
      fontWeight: "bold",
    },
  },
  input: {
    display: "none",
  },
  error: {
    color: "#f85032",
    fontSize: "11px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}));

// Matches HTS-Module's SETTING_PREFIX_MAP abbreviations (FC/CM). PMTCT now sources the
// Setting dropdown from the same HTS_ENTRY_POINT codeset HTS itself uses (previously its own,
// different ENROLLMENT_SETTING codeset), so both modules' hts_encounter.setting values line
// up. Old ENROLLMENT_SETTING_* values are kept mapped here too — not because new records ever
// produce them, but because the client code now regenerates on update as well as create (see
// the Recompute Client Code effect below): a pre-existing record saved with the old codeset
// value would otherwise abbreviate differently ("ESF" instead of "FC") the moment it's opened
// for edit, silently changing its client code even if nothing else was touched.
const SETTING_ABBR_MAP = {
  HTS_ENTRY_POINT_FACILITY: "FC",
  HTS_ENTRY_POINT_COMMUNITY: "CM",
  ENROLLMENT_SETTING_FACILITY: "FC",
  ENROLLMENT_SETTING_COMMUNITY: "CM",
};

const toSettingAbbr = (setting) => {
  if (!setting) return "HTS";
  const key = setting.trim();
  if (SETTING_ABBR_MAP[key]) return SETTING_ABBR_MAP[key];
  return key
    .split(/[\s_]+/)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
};

/**
 * Testing point abbreviation — copied 1:1 from HTS-Module's getSubtypeCode()
 * (htsEncounterPayload.js) so PMTCT client codes use the identical abbreviations,
 * since both write into the shared hts_encounter table.
 */
const toTestingPointAbbr = (testSetting) => {
  if (!testSetting) return null;
  if (testSetting.includes("SETTING_STI")) return "STI";
  if (testSetting.includes("EMERGENCY")) return "EME";
  if (testSetting.includes("SETTING_INDEX")) return "IND";
  if (testSetting.includes("INPATIENT") || testSetting.includes("NPATIENT")) return "INP";
  if (testSetting.includes("PMTCT")) return "PMTCT";
  if (testSetting.includes("TB")) return "TB";
  if (testSetting.includes("VCT")) return "VCT";
  if (testSetting.includes("MOBILE")) return "MOB";
  if (testSetting.includes("SETTING_SNS")) return "SNS";
  if (testSetting.includes("SETTING_ANC")) return "ANC";
  if (testSetting.includes("RETESTING")) return "RET";
  if (testSetting.includes("SETTING_L&D")) return "L&D";
  if (testSetting.includes("POST_NATAL_WARD_BREASTFEEDING")) return "PNWB";
  if (testSetting.includes("SETTING_CT")) return "CT";
  if (testSetting.includes("SETTING_FP")) return "FP";
  if (testSetting.includes("BLOOD_BANK")) return "BB";
  if (testSetting.includes("PEDIATRIC")) return "PED";
  if (testSetting.includes("MALNUTRITION")) return "MAL";
  if (testSetting.includes("PREP_TESTING")) return "PrEPT";
  if (testSetting.includes("SPOKE_HEALTH_FACILITY")) return "SPHF";
  if (testSetting.includes("STANDALONE")) return "STAN";
  if (testSetting.includes("CONGREGATIONAL")) return "CON";
  if (testSetting.includes("DELIVERY_HOMES")) return "DEL";
  if (testSetting.includes("TBA_ORTHODOX")) return "TBAO";
  if (testSetting.includes("TBA_RT-HCW")) return "TBAH";
  if (testSetting.includes("SETTING_OVC")) return "OVC";
  if (testSetting.includes("OUTREACH")) return "OUT";
  if (testSetting.includes("OTHER")) return "OTH";
  return null;
};

/**
 * Generates a Client Code in the format:
 *   {SettingAbbr}/{TestingPointAbbr}/{yyyy}/{mm}/{SerialNumber}
 *
 * Example: FC/ANC/2026/07/1714RA
 *
 * SerialNumber is user-entered (see Serial Number field) and checked for
 * uniqueness against the shared HTS client-code-uniqueness API.
 */
const generateClientCode = (setting, testSetting, dateOfVisit, serialNumber) => {
  if (!setting || !serialNumber || !dateOfVisit) return "";

  const abbr = toSettingAbbr(setting);
  const testingPointAbbr = toTestingPointAbbr(testSetting);

  const date = new Date(dateOfVisit);
  if (isNaN(date.getTime())) return "";
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  const segments = testingPointAbbr
    ? [abbr, testingPointAbbr, yyyy, mm, serialNumber]
    : [abbr, yyyy, mm, serialNumber];

  return segments.join("/");
};

// Not in the HIV_EARLY_DETECT_RESULT codeset (base_application_codeset) — added
// as a frontend-only option below instead of writing a new row to that table.
const HIV_EARLY_DETECT_NON_REACTIVE = "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_NON-REACTIVE";

const isSuspectedAcuteInfectionResult = (hivEarlyDetect) =>
  hivEarlyDetect === "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE" ||
  hivEarlyDetect === "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE";

// Mirrors PmtctHtsService.mapPregnancyStatusToHtsCode (Java) exactly — codes match the live
// base_application_codeset PREGNANCY_STATUS rows ("PREGANACY_STATUS_..." spelling included,
// not a typo). Used to live server-side inside buildPmtctObservation(); now that create POSTs
// straight to HTS's /api/v1/hts-encounter, it has to be derived here before the request is
// sent, or HIV Prevention's dashboard silently stops picking up Pregnant/Breastfeeding status
// for PMTCT-authored records again.
const mapPregnancyStatusToHtsCode = (pregnancyStatusAtEntry) => {
  if (!pregnancyStatusAtEntry) return "";
  switch (pregnancyStatusAtEntry.trim().toLowerCase()) {
    case "pregnant": return "PREGANACY_STATUS_PREGNANT";
    case "breastfeeding": return "PREGANACY_STATUS_BREASTFEEDING";
    case "post partum": return "PREGANACY_STATUS_POST_PARTUM";
    case "not pregnant": return "PREGANACY_STATUS_NOT_PREGNANT";
    default: return "";
  }
};

// Mirrors PmtctHtsService.mapToHtsSetting (Java). The Setting dropdown already sources the
// HTS_ENTRY_POINT codeset directly, so payload.testEntryPoint normally already holds a valid
// HTS_ENTRY_POINT_* value for a fresh create — this is a defensive fallback, not the primary
// path, in case that value is ever missing/legacy-shaped.
const mapToHtsEntryPointSetting = (testEntryPoint) => {
  if (!testEntryPoint) return "HTS_ENTRY_POINT_FACILITY";
  return testEntryPoint.toUpperCase().includes("COMMUNITY")
    ? "HTS_ENTRY_POINT_COMMUNITY"
    : "HTS_ENTRY_POINT_FACILITY";
};

// Builds the request body for HTS-Module's POST /api/v1/hts-encounter directly from PMTCT's
// own form payload. Replaces PmtctHtsService.saveToHtsEncounter()/buildPmtctObservation() for
// the create path — every derivation those methods used to do server-side (setting
// normalization, facilitySetting/communityEntryPoint routing, pregnancyStatus mapping,
// suspectedAcuteInfection flag, the dateoffinalHivTestResult date rule, and the "Target
// Detected"/"Target Not Detected" direct-entry resolution added for LV3-1732/item-14) happens
// here now, or it silently stops happening the moment PMTCT create no longer routes through
// that Java code. patientId and facilityId are NOT set here — patientId is resolved on mount
// via GET pmtct/anc/get-person-id (see fetchPersonId), and facilityId is stated to be derived
// on HTS-Module's own backend.
//
// options.dateOfPreviouslyKnown: only meaningful for the checkPriorHtsPositiveRecord scenario.
// HTS's DTO has no field for this yet (raised with their team) — included anyway so it starts
// flowing through automatically the moment they add support, with no further change needed here.
// options.rawObservation: only meaningful for the checkPriorHtsPositiveRecord scenario — the
// adopted record's raw observation JSON, fetched directly from HTS-Module's own GET
// hts-encounter/{id}. Spread in as the base of the request so HTS-only fields PMTCT has no UI
// for (facilityName, completedBy, designation, typeOfSession, syphilisTestResult,
// acceptedIndexTesting, etc.) survive the update unchanged instead of being silently wiped by
// HTS-Module's update(), which rebuilds its observation column from the request body rather than
// merging onto the existing one. Every explicit field below is spread after it, so PMTCT's own
// values always win on overlap.
const buildHtsEncounterRequestPayload = (payload, options = {}) => {
  const { dateOfPreviouslyKnown, rawObservation } = options;
  const isCommunity = (payload.testEntryPoint || "").toUpperCase().includes("COMMUNITY");
  const suspectedAcute = isSuspectedAcuteInfectionResult(payload.hivEarlyDetect);

  let finalHivTestResult = payload.finalResult || "";
  let confirmatoryHivTest = payload.confirmatoryHivTest?.result || "";
  let suspectedAcuteInfectionFlag = suspectedAcute ? "YES_NO_YES" : "YES_NO_NO";
  let dateoffinalHivTestResult = "";

  if (suspectedAcute) {
    // Unresolved by default while suspected-and-not-yet-confirmed — matches the rule that
    // finalHivTestResult/dateoffinalHivTestResult must stay blank in this state.
    finalHivTestResult = "";
    dateoffinalHivTestResult = "";

    if (payload.hivEarlyDetectViralLoad === "Target Detected") {
      finalHivTestResult = "Positive";
      confirmatoryHivTest = "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE";
      suspectedAcuteInfectionFlag = "YES_NO_YES";
      dateoffinalHivTestResult = payload.dateOfHivTest || "";
    } else if (payload.hivEarlyDetectViralLoad === "Target Not Detected") {
      finalHivTestResult = "Negative";
      suspectedAcuteInfectionFlag = "YES_NO_NO";
      dateoffinalHivTestResult = payload.dateOfHivTest || "";
    }
  } else if (finalHivTestResult && payload.dateOfHivTest) {
    dateoffinalHivTestResult = payload.dateOfHivTest;
  } else if (!finalHivTestResult && payload.previouslyKnownHivPositive === "Yes") {
    // Transfer-In (checkTransferInStatus) and On-ART (checkHistoricalHivAndArt) both lock
    // previouslyKnownHivPositive to "Yes" and the form always shows a hardcoded "Positive"
    // Final HIV Result box whenever that's the case, but neither function ever actually sets
    // payload.finalResult — so without this fallback the saved record's finalHivTestResult/
    // confirmatoryHivTest end up blank despite what's displayed on screen. Scenario 1
    // (checkPriorHtsPositiveRecord) already sets a real finalResult from the adopted record,
    // so this branch only ever fires for the two scenarios that don't.
    finalHivTestResult = "Positive";
    confirmatoryHivTest = "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE";
    dateoffinalHivTestResult = payload.dateOfHivTest || "";
  }

  const request = {
    ...(rawObservation || {}),
    dateOfVisit: payload.dateOfHivTest,
    clientCode: payload.clientCode,
    setting: mapToHtsEntryPointSetting(payload.testEntryPoint),
    // Always sent per spec — required for PMTCT-origin attribution and the positive-duplicate
    // exception. True on every save path, including checkPriorHtsPositiveRecord's update of an
    // adopted HTS-module record — see priorHtsPositiveRecordId's comment for why.
    pmtctHts: true,
    source: payload.source || "WEB",
    // HTS's own "modality" field holds the same FACILITY_HTS_TEST_SETTING_*/
    // COMMUNITY_HTS_TEST_SETTING_* codeset PMTCT already captures as testSetting (confirmed
    // against RiskStratification.js's checkPMTCTModality, which checks modality against exactly
    // these values) — without this, PMTCT-authored records have no modality value at all,
    // which is why reports built on observation.modality never showed anything for them.
    modality: payload.testSetting || "",

    pregnancyStatus: mapPregnancyStatusToHtsCode(payload.pregnancyStatusAtEntry),

    typeOfHivTestDone: payload.typeOfHivTest || "",
    hivEarlyDetectResult: payload.hivEarlyDetect || "",
    hivEarlyDetectViralLoad: payload.hivEarlyDetectViralLoad || "",
    initialHivTest: payload.initialHivTest?.result || "",
    confirmatoryHivTest,
    finalHivTestResult,
    suspectedAcuteInfection: suspectedAcuteInfectionFlag,
    syphilisTestResult: payload.syphilis || "",
    dateoffinalHivTestResult,

    // previouslyKnownHivPositive is the other half of the positive-duplicate exception (must
    // contain "yes", case-insensitive, alongside pmtctHts:true) — sourced straight from the
    // form field of the same name, already a plain "Yes"/"No" string.
    previouslyKnownHivPositive: payload.previouslyKnownHivPositive || "",
    // Silently dropped by HTS's DTO until they add support — see this function's top comment.
    ...(dateOfPreviouslyKnown ? { dateOfPreviouslyKnown } : {}),

    pmtctCycleUuid: payload.pmtctCycleUuid || "",
    testingType: payload.testingType || "",
    pmtctTestEntryPoint: payload.pmtctTestEntryPoint || "",
    testEntryPoint: payload.testEntryPoint || "",
    testSetting: payload.testSetting || "",
    stageOfPregnancy: payload.stageOfPregnancy || "",
    pregnancyStatusAtEntry: payload.pregnancyStatusAtEntry || "",
    hospitalNumber: payload.hospitalNumber || "",
    enrolledOnArt: payload.enrolledOnArt || "",
    initiatedOnProphylaxis: payload.initiatedOnProphylaxis || "",
    viralLoadMonitoring: payload.viralLoadMonitoring || "",
    confirmatoryFromSpokes: payload.confirmatoryFromSpokes || "",
    tbScreeningStatus: payload.tbScreeningStatus || "",
    tbReferred: payload.tbReferred || "",
    hepatitisC: payload.hepatitisC || "",

    syphilisInfo: payload.syphilisInfo,
    hbvInfo: payload.hbvInfo,
    partnerInfo: payload.partnerInfo,
  };

  if (isCommunity) {
    request.communityEntryPoint = payload.testSetting || "";
  } else {
    request.facilitySetting = payload.testSetting || "";
  }

  return request;
};

const PmtctHtsForm = (props) => {
  const patientObj = props.patientObj;
  let history = useHistory();
  const isPmtctHts = props.PmtctHtsRetestingType === "pmtct-hts";
  const isRetesting = props.PmtctHtsRetestingType === "retesting";

  // Map old reactive/non-reactive values to Positive/Negative for PMTCT-HTS
  const mapTestResult = (value) => {
    if (!value) return value;
    if (value === "reactive") return "Positive";
    if (value === "non-reactive") return "Negative";
    return value;
  };

  // Confirmatory HIV Test now uses the HIV_CONFIRMATORY_TEST_RESULT codeset (matching
  // the HTS module) instead of plain Positive/Negative — map every prior generation of
  // saved values (reactive/non-reactive, plain Positive/Negative) onto the codeset codes
  // so existing records still show correctly selected in the dropdown.
  const mapConfirmatoryResult = (value) => {
    if (!value) return value;
    const v = value.toLowerCase();
    if (v === "reactive" || v === "positive") return "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE";
    if (v === "non-reactive" || v === "negative") return "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE";
    return value;
  };

  const location = useLocation();
  const locationState = location && location.state ? location.state : null;
  const [regimenType, setRegimenType] = useState([]);
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [serologyFromAnc, setSerologyFromAnc] = useState({ syphilis: false, hepatitisB: false });
  const [entrySetting, setEntrySetting] = useState([]);
  const [testEntryPoint, setTestEntryPoint] = useState([]);
  const [communitySetting, setCommunitySetting] = useState([]);
  const [disableHIVStatus, setDisableHIVStatus] = useState(false);
  const [autoPostPartumTiming, setAutoPostPartumTiming] = useState(false);
  const [disableEntryPoint, setDisableEntryPoint] = useState(false);
  const [clientCodeTaken, setClientCodeTaken] = useState(false);
  // The client code as loaded when editing an existing record — the uniqueness check below
  // otherwise flags a record's own already-saved code as "taken" (it correctly finds a match:
  // itself), which wrongly blocked saving any edit to an existing record. Only a code that
  // differs from this original (i.e. the user changed the Serial Number) is a real conflict.
  const [originalClientCode, setOriginalClientCode] = useState("");

  const [tbStatus, setTbStatus] = useState([]);
  const [artStartTime, setartStartTime] = useState([]);
  const [hbvTreatmentOptions, setHbvTreatmentOptions] = useState([]);
  const [typeOfHivTestOptions, setTypeOfHivTestOptions] = useState([]);
  const [hivEarlyDetectOptions, setHivEarlyDetectOptions] = useState([]);
  const [confirmatoryResultOptions, setConfirmatoryResultOptions] = useState([]);
  const [tbReferralOptions, setTbReferralOptions] = useState([]);
  const [partnerReferredOptions, setPartnerReferredOptions] = useState([]);
  const [viralLoadTimingOptions, setViralLoadTimingOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [entryValueDisplay, setEntryValueDisplay] = useState({});
  const [allNewEntryPoint, setAllNewEntryPoint] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [urinalysisList, setUrinalysisList] = useState([]);
  const [timeHivDiagnosis, setTimeHivDiagnosis] = useState([]);
  const [timeHivInitiation, setTimeHivInitiation] = useState([]);
  const [maxARTDate, setMaxARTDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [minARTDate, setMinARTDate] = useState("");
  const [lastPmtctHtsRecord, setLastPmtctHtsRecord] = useState({
    confirmatoryHivTest: "",
    dateOfHivTest: "",
    testEntryPoint: "",
    testSetting: "",
    initialHivTest: "",
    stageOfPregnancy: "",
    id: "",
  });
  const [pmtctCycleCreated, setPmtctCycleCreated] = useState({
    patientUuid: patientObj.patientUuid ? patientObj.patientUuid : patientObj?.uuid,
    maternalOutcome: "",
    entryPoint: locationState?.entrypointValue || props?.entrypointValue || "",
    hivStatus: patientObj?.dynamicHivStatus || "",
    pregnancyOutcome: "",
    numberOfInfants: 0,
    pmtctStatus: "INACTIVE",
  });
  const [dateOfHivTestExist, setDateOfHivTestExist] = useState(false);
  // Resolved once on mount (see fetchPersonId/useEffect below) instead of at submit time, so
  // it's already available by the time handleSubmit builds the HTS-encounter create payload.
  const [resolvedPersonId, setResolvedPersonId] = useState(null);
  // Locks the Previously Known HIV Positive input once checkTransferInStatus confirms an
  // active HIV Transfer-In record — this is verified fact from another system, not the user's
  // own claim, so it shouldn't be editable back to "No" on this form.
  const [isTransferInPatient, setIsTransferInPatient] = useState(false);
  // Set when checkPriorHtsPositiveRecord finds a pre-existing positive HTS-module record for
  // this patient — holds that record's numeric hts_encounter id. When set, handleSubmit routes
  // to PUT against THIS id, flipping pmtctHts to true so the updated record shows up in PMTCT's
  // own pmtct_hts=true views (Recent Activity in particular) — instead of POSTing a brand-new
  // record and creating a second one for the same client.
  const [priorHtsPositiveRecordId, setPriorHtsPositiveRecordId] = useState(null);
  // Raw observation JSON fetched straight from HTS-Module's own GET hts-encounter/{id} (its own
  // shape, its own field names) for the adopted record — spread into the save payload as-is so
  // HTS-only fields PMTCT has no UI for (facilityName, completedBy, designation, typeOfSession,
  // syphilisTestResult, acceptedIndexTesting, etc.) survive the update instead of being wiped by
  // HTS-Module's update(), which rebuilds its observation column from the request body rather
  // than merging onto the existing one.
  const [priorHtsRawObservation, setPriorHtsRawObservation] = useState(null);
  const [dateOfPreviouslyKnown, setDateOfPreviouslyKnown] = useState("");
  const [initialHtsExistsForCycle, setInitialHtsExistsForCycle] = useState(false);

  const [checkingForTheDate, setCheckingForTheDate] = useState(false);

  const [existingDate, setExistingDate] = useState("");

  const [validateHIVRetest, setValidateHIVRetest] = useState({
    message: "",
    isValid: true,
    showError: false,
  });
  const [validateAncEnrollment, setValidateAncEnrollment] = useState({
    message: "",
    isValid: true,
    showError: false,
  });
  const [finalResult, setFinalResult] = useState("");
  const [resultStatus, setResultStatus] = useState("");
  const [showRetesting, setShowRetesting] = useState(false);

  const [initialHivTest, setInitialHivTest] = useState({
    result: "",
    dateOfTest: "",
  });
  const [confirmatoryHivTest, setConfirmatoryHivTest] = useState({
    result: "",
    dateOfTest: "",
  });
  const [payload, setPayload] = useState({
    dateOfHivTest: "",
    testEntryPoint: "",
    testSetting: "",
    serialNumber: "",
    initialHivTest: "",
    confirmatoryHivTest: "",
    stageOfPregnancy: "",
    clientCode: "",
    hospitalNumber: props?.patientObj?.identifier?.identifier[0]?.value
      ? props?.patientObj?.identifier?.identifier[0]?.value
      : props?.patientObj?.hospitalNumber,
    syphilis: "",
    hepatitisB: "",
    hepatitisC: "",
    testingType:
      props.onEnrollPatient && lastPmtctHtsRecord?.id
        ? "RETESTING"
        : props?.PmtctHtsRetestingType === "pmtct-hts" ? "PMTCT-HTS" : "RETESTING",
    patientUuid: props.patientUuid,
    ancNo: props?.patientObj?.ancNo,
    finalResult: "",
    source: "WEB",
    // PMTCT Register fields
    pregnancyStatusAtEntry: "",
    previouslyKnownHivPositive: "",
    enrolledOnArt: "",
    typeOfHivTest: "",
    hivEarlyDetect: "",
    hivEarlyDetectViralLoad: "",
    initiatedOnProphylaxis: "",
    confirmatoryFromSpokes: "",
    syphilisTreatment: "",
    syphilisDrugName: "",
    knownHbvPositive: "",
    hbvTest: "",
    hepatitisBTreatment: "",
    hbvVlResultDate: "",
    hbvVlResult: "",
    hbvDrugName: "",
    tbScreeningStatus: "",
    tbReferred: "",
    partnerNotificationAgreed: "",
    partnerTestedHiv: "",
    partnerTestedSyphilis: "",
    partnerTestedHbv: "",
    partnerReferredTo: "",
    viralLoadMonitoring: "",
    pmtctTestEntryPoint: props?.entrypointValue === "PMTCT_ENTRY_POINT_ANC"
      ? "ANC"
      : props?.entrypointValue === "PMTCT_ENTRY_POINT_L&D"
      ? "L&D"
      : props?.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"
      ? "BF"
      : "",
  });

  const handleInitialInputChange = (e) => {
    let res = "initial" + e.target.name;

    setErrors((prevErrors) => ({ ...prevErrors, [res]: "" }));

    setInitialHivTest((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    if (e.target.name === "result") {
      if (e.target.value === "Negative") {
        setFinalResult("Negative");
      } else {
        setFinalResult("");
      }
      setConfirmatoryHivTest({ result: "", dateOfTest: "" });
    }
  };

  const handleConfirmatoryInputChange = (e) => {
    let res = "confirmatory" + e.target.name;

    setErrors((prevErrors) => ({ ...prevErrors, [res]: "" }));

    setConfirmatoryHivTest((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (e.target.name === "result") {
      if (e.target.value === "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE") {
        setFinalResult("Positive");
      } else if (e.target.value === "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE") {
        setFinalResult("Negative");
      } else {
        setFinalResult("");
      }
    }
  };

  //get the person last record on PMTCT HTS if exist

  const getLastPmtctHtsRecord = (patientUuid) => {
    const pmtctCycleUuid = props.latestPmtctCycle?.uuid;

    if (pmtctCycleUuid) {
       axios
         .get(
           `${baseUrl}pmtct/anc/get-latest-pmtct-hts-enrollment/${props.patientUuid}?pmtctCycleUuid=${pmtctCycleUuid}`,
           { headers: { Authorization: `Bearer ${token}` } }
         )
         .then((response) => {
           if (response.data) {
             setLastPmtctHtsRecord(response.data);
             // If any HTS record exists for this cycle, the initial has already been created
             if (response?.data?.id) {
               setInitialHtsExistsForCycle(true);
             }
             if (
               props.onEnrollPatient &&
               response?.data?.id &&
               response?.data?.finalResult === "Negative"
             ) {
               toast.info("Last HIV test was " + response?.data?.finalResult, {
                 position: toast.POSITION.TOP_RIGHT,
               });
             }
           }
         })
         .catch((error) => {
           //console.log(error);
         });
    }


  };

  // Resolves HTS's numeric personId on mount, ahead of submit, instead of during handleSubmit —
  // so it's already sitting in state by the time the create payload is built. See
  // PmtctHtsService.getPersonId's comment for why this can't just be read off patientObj.
  const fetchPersonId = (patientUuid) => {
    if (!patientUuid) return;
    axios
      .get(`${baseUrl}pmtct/anc/get-person-id?patientUuid=${patientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response?.data?.personId) {
          setResolvedPersonId(response.data.personId);
        }
      })
      .catch((error) => {
        // Best-effort — handleSubmit still guards against a missing resolvedPersonId.
      });
  };

  // Scenario: this client already has a positive result documented via the standalone HTS
  // module (not through PMTCT). When opening a brand-new PMTCT HTS form for her, that existing
  // record should be adopted — prepopulated here in full, and on save, UPDATED in place
  // (handleSubmit routes to PUT using priorHtsPositiveRecordId) instead of creating a second,
  // duplicate record for the same client. Deliberately a full overwrite of every field it
  // controls (not a "fill only if empty" guard like the other create-mode checks) — this is the
  // single richest, most authoritative source for this exact scenario, so it should win over
  // whatever the other, more speculative auto-population checks may have guessed first.
  const checkPriorHtsPositiveRecord = (patientUuid) => {
    if (!patientUuid) return;
    axios
      .get(`${baseUrl}pmtct/anc/check-prior-hts-positive-record?patientUuid=${patientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (!response?.data?.id) return;
        const data = response.data;
        setPriorHtsPositiveRecordId(data.id);
        setOriginalClientCode(data.clientCode || "");

        // Fetch the record directly from HTS-Module's own GET (its own shape, its own field
        // names) purely to capture the raw observation for save-time passthrough — see
        // priorHtsRawObservation's comment. Best-effort: if this fails, saving still proceeds,
        // just without the HTS-only-field preservation.
        axios
          .get(`${baseUrl}hts-encounter/${data.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((htsResponse) => {
            if (htsResponse?.data?.observation) {
              setPriorHtsRawObservation(htsResponse.data.observation);
            }
          })
          .catch(() => {
            // Best-effort — see comment above.
          });
        // Scenario 1 only — the adopted testSetting can be any code from HTS's full codeset
        // (e.g. "Standalone HTS"), not just PMTCT's own curated allow-list, so fetch the
        // unfiltered options here instead of the default narrow list.
        getSettingPoint(data.testEntryPoint, true);
        const loadedClientCode = data.clientCode || "";
        const derivedSerialNumber = loadedClientCode.includes("/")
          ? loadedClientCode.substring(loadedClientCode.lastIndexOf("/") + 1)
          : "";
        setPayload((prev) => ({
          ...prev,
          dateOfHivTest: data.dateOfHivTest,
          testEntryPoint: mapToHtsEntryPointSetting(data.testEntryPoint),
          testSetting: data.testSetting || "",
          stageOfPregnancy: data.stageOfPregnancy || "",
          clientCode: data.clientCode || "",
          serialNumber: derivedSerialNumber,
          hospitalNumber: data.hospitalNumber || prev.hospitalNumber,
          syphilis: data.syphilisInfo?.testResult || data.syphilis || "",
          hepatitisB: data.hbvInfo?.testResult || data.hepatitisB || "",
          hepatitisC: data.hepatitisC || "",
          testingType: data.testingType || prev.testingType,
          finalResult: data.finalResult || "",
          previouslyKnownHivPositive: "Yes",
          enrolledOnArt: data.enrolledOnArt || prev.enrolledOnArt,
          typeOfHivTest: data.typeOfHivTest || "",
          hivEarlyDetect: data.hivEarlyDetect || "",
          hivEarlyDetectViralLoad: data.hivEarlyDetectViralLoad || "",
          confirmatoryFromSpokes: data.confirmatoryFromSpokes || "",
          initiatedOnProphylaxis: data.initiatedOnProphylaxis || "",
          syphilisTreatment: data.syphilisInfo?.treatment || "",
          syphilisDrugName: data.syphilisInfo?.drugName || "",
          knownHbvPositive: data.hbvInfo?.knownPositive || "",
          hbvTest: data.hbvInfo?.hbvTest || "",
          hepatitisBTreatment: data.hbvInfo?.treatment || "",
          hbvVlResultDate: data.hbvInfo?.vlResultDate || "",
          hbvVlResult: data.hbvInfo?.vlResult || "",
          hbvDrugName: data.hbvInfo?.drugName || "",
          tbScreeningStatus: data.tbScreeningStatus || "",
          tbReferred: data.tbReferred || "",
          partnerNotificationAgreed: data.partnerInfo?.notificationAgreed || "",
          partnerTestedHiv: data.partnerInfo?.testedHiv || "",
          partnerTestedSyphilis: data.partnerInfo?.testedSyphilis || "",
          partnerTestedHbv: data.partnerInfo?.testedHbv || "",
          partnerReferredTo: data.partnerInfo?.referral || "",
          viralLoadMonitoring: data.viralLoadMonitoring || "",
          pmtctTestEntryPoint: data.pmtctTestEntryPoint || prev.pmtctTestEntryPoint,
        }));

        if (data.initialHivTest) setInitialHivTest({ ...data.initialHivTest });
        if (data.confirmatoryHivTest) setConfirmatoryHivTest({ ...data.confirmatoryHivTest });
        if (data.finalResult) setFinalResult(data.finalResult);

        toast.info(
          "This client already has a positive result documented on the HTS module — the form has been prepopulated from that record. Saving will update it, not create a new one.",
          { position: toast.POSITION.TOP_RIGHT }
        );
      })
      .catch((error) => {
        // 204/no record found, or best-effort failure — stay in normal create mode.
      });
  };

  // A documented HIV Transfer-In record means this client was already enrolled in HIV care at
  // another facility before this encounter — i.e. their HIV-positive status was already known,
  // the same concept previouslyKnownHivPositive captures. Checking this on mount (via HTS's own
  // transfer-in-check, the same query their create endpoint uses to 409-block a fresh HTS
  // record for such clients) and auto-setting the field accordingly makes PMTCT's own data more
  // clinically accurate regardless of whether HTS's team ends up exempting pmtctHts:true+
  // previouslyKnownHivPositive from that 409 block — see the "why" thread on this exact case.
  // Unconditionally overrides (and then locks, via isTransferInPatient below) rather than only
  // filling an empty value — this is verified fact from another system, not the user's own
  // claim, so an existing "No" shouldn't be allowed to stand once this comes back true.
  const checkTransferInStatus = (patientUuid) => {
    if (!patientUuid) return;
    axios
      .get(`${baseUrl}hts-encounter/transfer-in-check?personUuid=${patientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response?.data === true) {
          setIsTransferInPatient(true);
          setPayload((prev) => ({ ...prev, previouslyKnownHivPositive: "Yes" }));
          toast.info(
            "This client has a documented HIV Transfer-In record — Previously Known HIV Positive has been set to Yes and locked.",
            { position: toast.POSITION.TOP_RIGHT }
          );
        }
      })
      .catch((error) => {
        // Best-effort — absence of this check must never block filling out the form.
      });
  };



  const getLastPmtctHtsByPersonUuid= () => {
    const pmtctCycleUuid = props.latestPmtctCycle?.uuid;

    if (pmtctCycleUuid) {
      axios
        .get(
          `${baseUrl}pmtct/anc/get-latest-pmtct-hts-enrollment/${props.patientUuid}?pmtctCycleUuid=${pmtctCycleUuid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          if (response.data) {
            setLastPmtctHtsRecord(response.data);
            if (
              props.onEnrollPatient &&
              response?.data?.id &&
              response?.data?.finalResult === "Negative"
            ) {
              toast.info("Last HIV test was " + response?.data?.finalResult, {
                position: toast.POSITION.TOP_RIGHT,
              });
            }
          }
        })
        .catch((error) => {
          //console.log(error);
        });
    }
  };
  function calculateGestationalAge2(dateOfHivTest) {
    let lmpDate = props?.patientObj?.lmp;

    // Parse LMP date
    const lmp = moment(lmpDate, "YYYY-MM-DD");
    const today = moment(dateOfHivTest, "YYYY-MM-DD");

    // Calculate difference in weeks
    const weeks = today.diff(lmp, "weeks");

    return weeks;
  }

  const getFinalResult = () => {
    if (initialHivTest.result === "Negative") {
      setFinalResult("Negative");
    } else if (confirmatoryHivTest.result === "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE") {
      setFinalResult("Positive");
    } else if (confirmatoryHivTest.result === "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE") {
      setFinalResult("Negative");
    }
  };

  const getStageOfPregnancy = (
    testSetting,
    testEntryPoint,
    testEntryPointValue
  ) => {
    setPayload((prevPayload) => {
      // Calculate gestational age using the LATEST dateOfHivTest from state
      const gestationalAge = calculateGestationalAge2(prevPayload.dateOfHivTest);

      // Determine stage of pregnancy based on gestational age
      let stageOfPregnancy = "";

      if (
        props?.patientObj?.ancNo &&
        props?.patientObj?.gaweeks &&
        testSetting.includes("_ANC") &&
        gestationalAge
      ) {
        // Determine trimester based on gestational age
        if (gestationalAge >= 0 && gestationalAge <= 12) {
          stageOfPregnancy = "first trimester";
        } else if (gestationalAge >= 13 && gestationalAge <= 24) {
          stageOfPregnancy = "second trimester";
        } else if (gestationalAge >= 25 && gestationalAge <= 40) {
          stageOfPregnancy = "third trimester";
        }
      }

      return {
        ...prevPayload,
        stageOfPregnancy: stageOfPregnancy,
        testSetting: testSetting,
        [testEntryPoint]: testEntryPointValue,
      };
    });
  };

  // Auto-populate Previously Known HIV+ and Unique ID for new creates
  const checkHistoricalHivAndArt = () => {
    try {
      const patientUuid =
        props?.patientObj?.patient_uuid ||
        props?.patientObj?.patientUuid ||
        props?.patientObj?.uuid;
      // Was previously derived separately via a fallback chain with two typo'd field names
      // (person_Uuud, personUuud) that never matched anything real — on the PMTCT HTS grid,
      // where patientObj only ever has patientUuid (camelCase), that chain fell straight
      // through to bare .uuid, which on that grid is the HTS-encounter record's own uuid, not
      // the patient's. That silently sent the wrong id into the ART lookup below, which then
      // correctly found nothing — the reported "on ART, previously known not auto-populating"
      // bug. personUuid and patientUuid mean the exact same thing here; no reason for them to
      // be derived independently and risk drifting apart again.
      const personUuid = patientUuid;

      if (!patientUuid) return;

      // Get the enrollment/cycle date for date comparison
      const enrollmentDate = props?.patientObj?.dateOfEnrollment
        || props?.latestPmtctCycle?.createdDate
        || null;

      // Check HTS table for documented HIV result (with date for comparison)
      const htsPromise = axios.get(
        `${baseUrl}pmtct/anc/hiv-status-detail?patientUuid=${patientUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => ({ data: { result: "", dateVisit: null } }));

      // Check ART table for enrollment
      const artPromise = axios.get(
        `${baseUrl}pmtct/anc/art/?PatientUuid=${personUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => ({ data: [] }));

      // Check latest HTS record across ALL cycles for serology pre-population
      const serologyPromise = axios.get(
        `${baseUrl}pmtct/anc/get-latest-pmtct-hts-by-person-uuid/${patientUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => ({ data: {} }));

      Promise.all([htsPromise, artPromise, serologyPromise])
        .then(([htsRes, artRes, serologyRes]) => {
          const htsData = htsRes?.data || {};
          const htsResult = typeof htsData.result === "string" ? htsData.result : "";
          const htsDateVisit = htsData.dateVisit || null;

          const artData =
            Array.isArray(artRes?.data) && artRes.data.length > 0
              ? artRes.data[0]
              : null;

          // Date check: only auto-populate from HTS if enrollment date is
          // later than (or same as) the HTS encounter date
          let htsDateIsValid = true;
          if (enrollmentDate && htsDateVisit) {
            const enrollMoment = moment(enrollmentDate);
            const htsMoment = moment(htsDateVisit);
            if (enrollMoment.isValid() && htsMoment.isValid()) {
              htsDateIsValid = enrollMoment.isSameOrAfter(htsMoment, "day");
            }
          }

          const isPositive = htsDateIsValid &&
            htsResult &&
            (htsResult.toUpperCase().includes("POSITIVE") ||
              htsResult.toUpperCase().includes("REACTIVE"));
          const isOnArt = artData && artData.artStartDate != null;

          if (isPositive || isOnArt) {
            setPayload((prev) => {
              // Don't override if user already selected a value
              if (prev.previouslyKnownHivPositive) return prev;
              return {
                ...prev,
                previouslyKnownHivPositive: "Yes",
                enrolledOnArt: isOnArt ? "On ART" : "Not on ART",
                hospitalNumber: (artData && artData.uniqueArtNumber) || prev.hospitalNumber,
              };
            });
            setFinalResult((prev) => prev || "Positive");
          }

          // Pre-populate syphilis/hepatitis from previous cycles if positive
          const prevHts = serologyRes?.data || {};
          if (prevHts.id) {
            const checkPositive = (val) => {
              if (!val) return false;
              const norm = val.trim().toLowerCase();
              return norm.includes("positive") || (norm.includes("reactive") && !norm.includes("non-reactive") && !norm.includes("non reactive"));
            };

            const prevSyphResult = prevHts.syphilisInfo?.testResult || prevHts.syphilis || "";
            const prevHepBResult = prevHts.hbvInfo?.testResult || prevHts.hepatitisB || "";
            const prevHepCResult = prevHts.hepatitisC || "";

            const hasPrevSyph = checkPositive(prevSyphResult);
            const hasPrevHepB = checkPositive(prevHepBResult);
            const hasPrevHepC = checkPositive(prevHepCResult);

            if (hasPrevSyph || hasPrevHepB || hasPrevHepC) {
              setPayload((prev) => {
                const updates = {};
                // Only pre-populate syphilis if positive and not already set
                if (hasPrevSyph && !prev.syphilis) {
                  updates.syphilis = prevSyphResult;
                  if (prevHts.syphilisInfo?.treatment && !prev.syphilisTreatment)
                    updates.syphilisTreatment = prevHts.syphilisInfo.treatment;
                  if (prevHts.syphilisInfo?.drugName && !prev.syphilisDrugName)
                    updates.syphilisDrugName = prevHts.syphilisInfo.drugName;
                }
                // Only pre-populate hepatitis B if positive and not already set
                if (hasPrevHepB && !prev.hepatitisB) {
                  updates.hepatitisB = prevHepBResult;
                  if (prevHts.hbvInfo?.knownPositive && !prev.knownHbvPositive)
                    updates.knownHbvPositive = prevHts.hbvInfo.knownPositive;
                  if (prevHts.hbvInfo?.treatment && !prev.hepatitisBTreatment)
                    updates.hepatitisBTreatment = prevHts.hbvInfo.treatment;
                  if (prevHts.hbvInfo?.drugName && !prev.hbvDrugName)
                    updates.hbvDrugName = prevHts.hbvInfo.drugName;
                }
                // Only pre-populate hepatitis C if positive and not already set
                if (hasPrevHepC && !prev.hepatitisC) {
                  updates.hepatitisC = prevHepCResult;
                }

                if (Object.keys(updates).length === 0) return prev;
                return { ...prev, ...updates };
              });
            }
          }
        })
        .catch(() => {
          // Silently fail — auto-population is best-effort, should not block the form
        });
    } catch (e) {
      // Guard against any unexpected errors during setup
    }
  };

  useEffect(() => {
    POINT_ENTRY_PMTCT();
    GET_CODESETS();
    getLastPmtctHtsRecord();
    fetchPersonId(props.patientUuid);
    // Loads the existing record for edit/view. Previously also required patientObj.id to be
    // truthy, but that field is unreliable depending on how the patient was navigated to (e.g.
    // via the history page) and viewPmtctHtsRecord doesn't even use it — it always reads
    // activeContent.id internally — so that extra condition silently skipped loading the
    // record, leaving the form blank ("documented records not persistent" from history page).
    if (
      props?.activeContent?.id &&
      (props?.activeContent?.actionType === "update" || props?.activeContent?.actionType === "view")
    ) {
      viewPmtctHtsRecord(props?.patientObj?.id);

      getARTStartDate();
      getHIVStatus(
        props?.patientObj?.identifier?.identifier[0]?.value,
        props.patientUuid
      );
    } else if (
      !props?.activeContent?.id ||
      props?.activeContent?.actionType === "create"
    ) {
      // New create — check historical HIV/ART status for auto-population
      checkHistoricalHivAndArt();
      // Create-only: viewPmtctHtsRecord's full-object setPayload on the update/view branch
      // above would otherwise race this (and could silently revert the auto-set back to
      // whatever's on the saved record, or blank, depending on which response lands last).
      checkTransferInStatus(props.patientUuid);
      // PMTCT-HTS only — "adopt a prior positive HTS-module record" doesn't apply to Retesting
      // (isPmtctHts false there): a patient already confirmed positive elsewhere shouldn't be
      // going through an HIV retest. Without this guard, isKnownPositive's isPmtctHts && guard
      // left Test Setting visible + required in Retesting even after previouslyKnownHivPositive
      // was force-set to "Yes", so an adopted testSetting value outside PMTCT's filtered
      // dropdown options rendered as an apparently-blank required field.
      if (isPmtctHts) {
        checkPriorHtsPositiveRecord(props.patientUuid);
      }
      // Auto-populate Status at Entry based on entry point
      if (isPmtctHts) {
        const entryPoint = props?.entrypointValue || "";
        const defaultStatus =
          entryPoint === "PMTCT_ENTRY_POINT_POST-PARTUM"
            ? "Breastfeeding"
            : "Pregnant";
        setPayload((prev) => ({
          ...prev,
          pregnancyStatusAtEntry: prev.pregnancyStatusAtEntry || defaultStatus,
        }));
      }

      // Pre-populate Syphilis/HBV fields from ANC enrollment data — for the ANC entry point,
      // or for any other entry point (e.g. Post-Partum) where the client already has an ANC
      // record/ANC number for this same pregnancy cycle. get-anc-by-person is itself the
      // authoritative "does this client have an ANC record for this cycle" check (404 when
      // none exists), so it's queried unconditionally rather than gated on entry point.
      // Hepatitis C is intentionally excluded — this form archives it (see submit handler,
      // "Archive Hepatitis C — always null for PMTCT-HTS") and has no input field for it.
      const patientUuid = props?.patientObj?.patientUuid || props?.patientObj?.uuid || props?.patientUuid;
      const pmtctCycleUuid = props?.latestPmtctCycle?.uuid;
      if (patientUuid && pmtctCycleUuid) {
        axios
          .get(
            `${baseUrl}pmtct/anc/get-anc-by-person?patientUuid=${patientUuid}&pmtctCycleUuid=${pmtctCycleUuid}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((response) => {
            const hepB = response?.data?.hepatitisBInfo;
            if (hepB && hepB.testedHepatitisB) {
              const result = (hepB.hepatitisB || "").trim();
              if (result.toLowerCase() === "positive") {
                setPayload((prev) => ({
                  ...prev,
                  knownHbvPositive: prev.knownHbvPositive || "Yes",
                  hepatitisB: prev.hepatitisB || "Positive",
                }));
                setSerologyFromAnc((prev) => ({ ...prev, hepatitisB: true }));
              } else if (result.toLowerCase() === "negative") {
                setPayload((prev) => ({
                  ...prev,
                  knownHbvPositive: prev.knownHbvPositive || "No",
                }));
                setSerologyFromAnc((prev) => ({ ...prev, hepatitisB: true }));
              }
            }

            // ANC records Syphilis as Positive/Negative — the HTS form's own
            // Syphilis field uses Reactive/Non-reactive, so map between the two.
            const syph = response?.data?.syphilisInfo;
            if (syph && syph.testedSyphilis === "Yes") {
              const result = (syph.testResultSyphilis || "").trim().toLowerCase();
              if (result === "positive" || result === "negative") {
                setPayload((prev) => ({
                  ...prev,
                  syphilis: prev.syphilis || (result === "positive" ? "Reactive" : "Non-reactive"),
                }));
                setSerologyFromAnc((prev) => ({ ...prev, syphilis: true }));
              }
            }
          })
          .catch(() => {
            // ANC data not available — user fills Syphilis/HBV fields manually
          });
      }
    }
  }, [props?.activeContent]);

  // Recompute the Client Code preview whenever its inputs change (serial number is user-entered).
  // Also regenerates during update — if Setting/Test Setting/Date change on an existing record,
  // the client code must reflect that (e.g. its Community/Facility abbreviation), or the saved
  // code silently goes stale relative to what the record now actually says. Skipped for view
  // (read-only, shouldn't mutate payload at all) and for the prior-HTS-positive-record scenario
  // (checkPriorHtsPositiveRecord) — that record's client code is being kept exactly as HTS
  // originally generated it, not regenerated under PMTCT's own scheme, since it stays HTS's
  // record. When nothing relevant has changed from the loaded record, this recomputes to the
  // same value as originalClientCode, so checkClientCodeUniqueness's existing-code check below
  // still treats it as unchanged.
  useEffect(() => {
    if (props?.activeContent?.actionType === "view" || priorHtsPositiveRecordId) {
      return;
    }
    const { testEntryPoint, testSetting, dateOfHivTest, serialNumber } = payload;
    const code = generateClientCode(testEntryPoint, testSetting, dateOfHivTest, serialNumber);
    setPayload((prev) => (prev.clientCode === code ? prev : { ...prev, clientCode: code }));
  }, [payload.testEntryPoint, payload.testSetting, payload.dateOfHivTest, payload.serialNumber]);

  // Verify Client Code uniqueness via the shared HTS uniqueness API (same table the code lands in)
  const checkClientCodeUniqueness = (code) => {
    if (!code) {
      setClientCodeTaken(false);
      return;
    }
    // Editing an existing record: its own saved code will always "exist" — that's not a
    // conflict unless the user has actually changed the Serial Number away from it.
    if (originalClientCode && code === originalClientCode) {
      setClientCodeTaken(false);
      return;
    }
    axios
      .get(`${baseUrl}hts-client-code/exists?clientCode=${encodeURIComponent(code)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setClientCodeTaken(res.data?.exists === true))
      .catch((err) => console.error("Client code uniqueness check failed:", err));
  };

  useEffect(() => {
    checkClientCodeUniqueness(payload.clientCode);
  }, [payload.clientCode]);

  const handleSerialNumberChange = (e) => {
    setErrors((prevErrors) => ({ ...prevErrors, serialNumber: "" }));
    setPayload((prev) => ({ ...prev, serialNumber: e.target.value }));
  };

  const viewPmtctHtsRecord = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/view-pmtct-hts-enrollment/${props.activeContent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setOriginalClientCode(response.data.clientCode || "");
        // Serial Number isn't stored as its own field — it's the last "/"-separated segment
        // of the generated Client Code (see generateClientCode above). Never derived on load,
        // so the Serial Number input showed blank when editing an existing record.
        const loadedClientCode = response.data.clientCode || "";
        const derivedSerialNumber = loadedClientCode.includes("/")
          ? loadedClientCode.substring(loadedClientCode.lastIndexOf("/") + 1)
          : "";
        setPayload({
          dateOfHivTest: response.data.dateOfHivTest,
          // Normalized to the current HTS_ENTRY_POINT codeset on load — records saved before
          // today's Setting codeset migration hold the old ENROLLMENT_SETTING_*/PMTCT_ANC-style
          // values here, which don't match any option in the Setting dropdown (now sourced
          // exclusively from HTS_ENTRY_POINT), so the field rendered blank even though this
          // data loaded correctly. Normalizing here fixes the display immediately and also
          // self-heals the saved value going forward, since this same field is what gets sent
          // back on the next save (buildHtsEncounterRequestPayload).
          testEntryPoint: mapToHtsEntryPointSetting(response.data.testEntryPoint),
          testSetting: response.data.testSetting || "",
          stageOfPregnancy: response.data.stageOfPregnancy || "",
          clientCode: response.data.clientCode || "",
          serialNumber: derivedSerialNumber,
          hospitalNumber: response.data.hospitalNumber || "",
          syphilis: response.data.syphilisInfo?.testResult || response.data.syphilis || "",
          hepatitisB: response.data.hbvInfo?.testResult || response.data.hepatitisB || "",
          hepatitisC: response.data.hepatitisC || "",
          testingType: response.data.testingType || "",
          patientUuid: props.patientUuid,
          ancNo: response.data.ancNo,
          finalResult: response.data.finalResult || "",
          source: "WEB",
          // PMTCT Register fields
          pregnancyStatusAtEntry: response.data.pregnancyStatusAtEntry || "",
          previouslyKnownHivPositive: response.data.previouslyKnownHivPositive || "",
          enrolledOnArt: response.data.enrolledOnArt || "",
          typeOfHivTest: response.data.typeOfHivTest || "",
          hivEarlyDetect: response.data.hivEarlyDetect || "",
          hivEarlyDetectViralLoad: response.data.hivEarlyDetectViralLoad || "",
          confirmatoryFromSpokes: response.data.confirmatoryFromSpokes || "",
          initiatedOnProphylaxis: response.data.initiatedOnProphylaxis || "",
          // Syphilis — load from JSONB with flat field fallback
          syphilisTreatment: response.data.syphilisInfo?.treatment || "",
          syphilisDrugName: response.data.syphilisInfo?.drugName || "",
          // HBV — load from JSONB with flat field fallback
          knownHbvPositive: response.data.hbvInfo?.knownPositive || "",
          hbvTest: response.data.hbvInfo?.hbvTest || "",
          hepatitisBTreatment: response.data.hbvInfo?.treatment || "",
          hbvVlResultDate: response.data.hbvInfo?.vlResultDate || "",
          hbvVlResult: response.data.hbvInfo?.vlResult || "",
          hbvDrugName: response.data.hbvInfo?.drugName || "",
          tbScreeningStatus: response.data.tbScreeningStatus || "",
          tbReferred: response.data.tbReferred || "",
          // Partner — load from JSONB
          partnerNotificationAgreed: response.data.partnerInfo?.notificationAgreed || "",
          partnerTestedHiv: response.data.partnerInfo?.testedHiv || "",
          partnerTestedSyphilis: response.data.partnerInfo?.testedSyphilis || "",
          partnerTestedHbv: response.data.partnerInfo?.testedHbv || "",
          partnerReferredTo: response.data.partnerInfo?.referral || "",
          viralLoadMonitoring: response.data.viralLoadMonitoring || "",
          pmtctTestEntryPoint: response.data.pmtctTestEntryPoint || "",
          pmtctCycleUuid: response.data.pmtctCycleUuid || props?.selectedCycleId || props?.latestPmtctCycle?.uuid || "",
        });

        if (response.data.initialHivTest) {
          const initialData = { ...response.data.initialHivTest };
          if (isPmtctHts) {
            initialData.result = mapTestResult(initialData.result);
          }
          setInitialHivTest(initialData);
        }
        if (response.data.confirmatoryHivTest) {
          const confirmData = { ...response.data.confirmatoryHivTest };
          confirmData.result = mapConfirmatoryResult(confirmData.result);
          setConfirmatoryHivTest(confirmData);
        }
        // Use DB value if available, otherwise recalculate from test results
        if (response.data.finalResult) {
          setFinalResult(response.data.finalResult);
        } else if (isPmtctHts) {
          // Simplified PMTCT-HTS logic for old records
          const initResult = mapTestResult(response.data.initialHivTest?.result);
          const confResult = mapConfirmatoryResult(response.data.confirmatoryHivTest?.result);
          if (initResult === "Negative") {
            setFinalResult("Negative");
          } else if (confResult === "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE") {
            setFinalResult("Positive");
          } else if (confResult === "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE") {
            setFinalResult("Negative");
          }
        } else {
          // Retesting form: same simplified logic
          const mapResult = (val) => {
            if (val === "reactive" || val === "Positive") return "Positive";
            if (val === "non-reactive" || val === "Negative") return "Negative";
            return val;
          };
          const initR = mapResult(response.data.initialHivTest?.result);
          const confMapped = mapConfirmatoryResult(response.data.confirmatoryHivTest?.result);
          const confR =
            confMapped === "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE" ? "Positive" :
            confMapped === "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE" ? "Negative" :
            response.data.confirmatoryHivTest?.result;

          if (initR === "Negative") setFinalResult("Negative");
          else if (confR === "Positive") setFinalResult("Positive");
          else if (confR === "Negative") setFinalResult("Negative");
        }

        setExistingDate(response.data.dateOfHivTest);
        getSettingPoint(response.data.testEntryPoint);

        if (props.activeContent.actionType === "view") {
          setDisabledField(true);
        } else if (props.activeContent.actionType === "update") {
          setDisabledField(false);
        }
      })
      .catch((error) => {
        toast.error("Could not load HTS record. Please try again.", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      });
  };

  const getARTStartDate = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/art/?PatientUuid=${
          props?.patientObj.person_Uuud
            ? props?.patientObj.person_Uuud
            : props?.patientObj?.personUuud
            ? props?.patientObj?.personUuud
            : props?.patientObj?.patient_uuid
            ? props?.patientObj?.patient_uuid
            : props?.patientObj?.uuid
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data[0] !== null && response?.data[0]?.artStartDate) {
          setPayload((prev) => ({
            ...prev,
            artStartDate: response?.data[0]?.artStartDate,
          }));
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const POINT_ENTRY_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/HTS_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTestEntryPoint(response.data);
        // console.log("deducted", ans);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  // fullList: false (default) keeps the small PMTCT-curated allow-list for regular record
  // creation — a fresh PMTCT test entry should only offer settings relevant to PMTCT's own
  // context (ANC/L&D/Post Natal Ward Breastfeeding). fullList: true is passed only from
  // checkPriorHtsPositiveRecord (Scenario 1 — adopting an existing positive HTS-module record):
  // that value can legitimately be any code from HTS's full codeset (e.g. "Standalone HTS",
  // "Outreach", "Index"), so only in that scenario does the dropdown need every option available
  // to have a matching option instead of rendering as an apparently-blank, unselected dropdown.
  const HTS_ENTRY_POINT_FACILITY = (fullList = false) => {
    axios
      .get(`${baseUrl}application-codesets/v2/FACILITY_HTS_TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data) {
          if (fullList) {
            setCommunitySetting(response.data);
            return;
          }
          const requiredCodes = [
            "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING",
            "FACILITY_HTS_TEST_SETTING_L&D",
            "FACILITY_HTS_TEST_SETTING_ANC",
          ];

          const filteredData = response.data.filter((item) =>
            requiredCodes.includes(item.code)
          );

          setCommunitySetting(filteredData);
        }
      })
      .catch((error) => {
        console.error("Error fetching HTS entry points:", error);
      });
  };

  const HTS_ENTRY_POINT_COMMUNITY = (fullList = false) => {
    axios
      .get(
        `${baseUrl}application-codesets/v2/COMMUNITY_HTS_TEST_SETTING`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {

        if (response.data) {
           let spokeHealthFacility = {
          id: 1877,
          codesetGroup: "FACILITY_HTS_TEST_SETTING",
          language: "en",
          display: "Spoke health facility",
          description: "Spoke facility setting for HIV testing",
          version: "1.0",
          code: "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY",
          archived: false,
          altCode: "PEPFAR_HTS_SETTINGS_PMTCT_(ANC1_ONLY)",
        };

          if (fullList) {
            setCommunitySetting([...response.data, spokeHealthFacility]);
            return;
          }

          const requiredCodes = [
            "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING",
            "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES",
            "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX",
            "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW",
          ];

          const filteredData = response.data.filter((item) =>
            requiredCodes.includes(item.code)
          );


          setCommunitySetting([...filteredData, spokeHealthFacility ]);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  // Substring match (not exact-equal) so this still works for records saved before the
  // Setting dropdown moved from PMTCT's own ENROLLMENT_SETTING_COMMUNITY codeset value to
  // HTS's HTS_ENTRY_POINT_COMMUNITY - both, and any other legacy variant containing
  // "COMMUNITY", resolve correctly without needing to enumerate every historical value.
  const getSettingPoint = (testEntryPoint, fullList = false) => {
    if ((testEntryPoint || "").toUpperCase().includes("COMMUNITY")) {
      HTS_ENTRY_POINT_COMMUNITY(fullList);
    } else {
      HTS_ENTRY_POINT_FACILITY(fullList);
    }
  };

  // BATCH API
  const GET_CODESETS = () => {
    GET_CODESETS_IN_BATCH(
      "TIMING_MOTHERS_ART_INITIATION",
      "TB_STATUS",
      "HBV_TREATMENT_REGIMEN",
      "TYPE_OF_HIV_TEST",
      "HIV_EARLY_DETECT_RESULT",
      "HIV_CONFIRMATORY_TEST_RESULT",
      "TYPE_OF_PMTCT_REFERRAL",
      "PARTNER_REFERRED_PMTCT",
      "VIRAL_LOAD_TIMING_PMTCT"
    ).then((response) => {
      setartStartTime(response.data.TIMING_MOTHERS_ART_INITIATION);
      setTbStatus(response.data.TB_STATUS);
      setHbvTreatmentOptions(response.data.HBV_TREATMENT_REGIMEN);
      setTypeOfHivTestOptions(response.data.TYPE_OF_HIV_TEST || []);
      setHivEarlyDetectOptions(response.data.HIV_EARLY_DETECT_RESULT || []);
      setConfirmatoryResultOptions(response.data.HIV_CONFIRMATORY_TEST_RESULT || []);
      setTbReferralOptions(response.data.TYPE_OF_PMTCT_REFERRAL || []);
      setPartnerReferredOptions(response.data.PARTNER_REFERRED_PMTCT || []);
      setViralLoadTimingOptions(response.data.VIRAL_LOAD_TIMING_PMTCT || []);
    });
  };
  // END OF BATCH API

  const handleInputChange = (e) => {
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));

    if (e.target.name === "testEntryPoint" && e.target.value !== "") {
      getSettingPoint(e.target.value);
      if (
        e.target.value === "HTS_ENTRY_POINT_FACILITY" &&
        props?.patientObj?.ancNo
      ) {
        // setPayload({ ...payload, [e.target.name]: e.target.value,testSetting: "FACILITY_HTS_TEST_SETTING_ANC"  });

        getStageOfPregnancy(
          "FACILITY_HTS_TEST_SETTING_ANC",
          e.target.name,
          e.target.value
        );
        setDisableEntryPoint(true);
      } else if (
        e.target.value === "HTS_ENTRY_POINT_FACILITY" &&
        props?.entrypointValue === "PMTCT_ENTRY_POINT_L&D"
      ) {
        setPayload((prevPayload) => ({
          ...prevPayload,
          [e.target.name]: e.target.value,
          testSetting: "FACILITY_HTS_TEST_SETTING_L&D",
        }));
        setDisableEntryPoint(true);
      } else if (
        e.target.value === "HTS_ENTRY_POINT_FACILITY" &&
        props?.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"
      ) {
        setPayload((prevPayload) => ({
          ...prevPayload,
          [e.target.name]: e.target.value,
          testSetting:
            "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING",
        }));
        setDisableEntryPoint(true);
      } else {
        setPayload((prevPayload) => ({
          ...prevPayload,
          [e.target.name]: e.target.value,
          testSetting: "",
        }));
        setDisableEntryPoint(false);
      }
    } else if (e.target.name === "dateOfHivTest" && e.target.value !== "") {
      checkifDateExist(e.target.value);
    } // else if(e.target.name === "testSetting" && e.target.value !== ""){

    //                 console.log('entered testSetting', e.target.value)

    //         // getStageOfPregnancy(e.target.value)

    //   }
    else if (e.target.name === "typeOfHivTest") {
      // Clear sub-fields when Type of HIV Test changes
      setPayload((prevPayload) => ({
        ...prevPayload,
        typeOfHivTest: e.target.value,
        hivEarlyDetect: "",
        hivEarlyDetectViralLoad: "",
        initiatedOnProphylaxis: "",
      }));
      setInitialHivTest({ result: "", dateOfTest: "" });
      setConfirmatoryHivTest({ result: "", dateOfTest: "" });
      setFinalResult("");
    } else if (e.target.name === "previouslyKnownHivPositive") {
      setPayload((prevPayload) => ({
        ...prevPayload,
        [e.target.name]: e.target.value,
        enrolledOnArt: "",
        typeOfHivTest: "",
        hivEarlyDetect: "",
        hivEarlyDetectViralLoad: "",
        initiatedOnProphylaxis: "",
        // confirmatoryFromSpokes NOT cleared — field stays visible per S/N 8
      }));
      if (e.target.value === "Yes") {
        // Auto-set final result to Positive and clear test fields
        setFinalResult("Positive");
        setInitialHivTest({ result: "", dateOfTest: "" });
        setConfirmatoryHivTest({ result: "", dateOfTest: "" });
      } else {
        // Clear final result so it can be determined by test results
        setFinalResult("");
      }
    } else if (e.target.name === "hivEarlyDetect") {
      // Clear downstream fields when Early Detect result changes
      setPayload((prevPayload) => ({
        ...prevPayload,
        hivEarlyDetect: e.target.value,
        hivEarlyDetectViralLoad: "",
      }));
      setConfirmatoryHivTest({ result: "", dateOfTest: "" });
      // Antigen + Antibody Non-Reactive is a negative HTS result — final result
      // is fixed to Negative rather than waiting on a confirmatory test.
      setFinalResult(e.target.value === HIV_EARLY_DETECT_NON_REACTIVE ? "Negative" : "");
    } else if (e.target.name === "knownHbvPositive") {
      // Clear HBV sub-fields when Known HBV changes. "Yes" already means the result is
      // Positive — the form no longer re-asks for it (see the hidden HBV Test Result block
      // below), so set it here instead of leaving it blank.
      setPayload((prevPayload) => ({
        ...prevPayload,
        knownHbvPositive: e.target.value,
        hbvTest: "",
        hepatitisB: e.target.value === "Yes" ? "Positive" : "",
        hepatitisBTreatment: "",
        hbvDrugName: "",
        hbvVlResultDate: "",
        hbvVlResult: "",
      }));
    } else if (e.target.name === "partnerNotificationAgreed") {
      // Clear partner sub-fields when toggling
      setPayload((prevPayload) => ({
        ...prevPayload,
        partnerNotificationAgreed: e.target.value,
        partnerTestedHiv: "",
        partnerTestedSyphilis: "",
        partnerTestedHbv: "",
        partnerReferredTo: "",
      }));
    } else if (e.target.name === "tbScreeningStatus") {
      // Clear TB Referred when status changes
      setPayload((prevPayload) => ({
        ...prevPayload,
        tbScreeningStatus: e.target.value,
        tbReferred: "",
      }));
    } else if (e.target.name === "hepatitisB") {
      // Clear HBV treatment/VL sub-fields when test result changes
      setPayload((prevPayload) => ({
        ...prevPayload,
        hepatitisB: e.target.value,
        hepatitisBTreatment: "",
        hbvVlResultDate: "",
        hbvVlResult: "",
        hbvDrugName: "",
      }));
    } else if (e.target.name === "syphilis") {
      // Clear syphilis sub-fields when result changes
      setPayload((prevPayload) => ({
        ...prevPayload,
        syphilis: e.target.value,
        syphilisTreatment: "",
        syphilisDrugName: "",
      }));
    } else {
      setPayload((prevPayload) => ({ ...prevPayload, [e.target.name]: e.target.value }));
    }
  };
  const getHIVStatus = (hospitalNumber, uuid) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/hiv-status?hospitalNumber=${hospitalNumber}&patientUuid=${uuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data) {
          setPayload((prev) => ({ ...prev, hivStatus: response.data }));
          setDisableHIVStatus(true);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const checkifDateExist = (dateOfHivTest) => {
    setCheckingForTheDate(true);
    axios
      .get(
        `${baseUrl}pmtct/anc/check-if-date-exist?patientUuid=${props.patientUuid}&dateOfHivTest=${dateOfHivTest}&`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        //
        setDateOfHivTestExist(
          response.data && existingDate !== dateOfHivTest ? true : false
        );
        setCheckingForTheDate(false);
        setInitialHivTest((prev) => ({ ...prev, dateOfTest: dateOfHivTest }));
        setPayload((prevPayload) => ({ ...prevPayload, dateOfHivTest: dateOfHivTest }));
        //dependent  dates
        setConfirmatoryHivTest((prev) => ({ ...prev, dateOfTest: "" }));
        setErrors((prevErrors) => ({
          ...prevErrors,
          dateOfHivTest:
            response.data && existingDate !== dateOfHivTest
              ? "Date already exist"
              : "",
        }));

        if (lastPmtctHtsRecord?.dateOfHivTest !== existingDate) {
          validateHIVRetestDate(dateOfHivTest);
        }
        // Validate ANC enrollment date for retesting
        validateAncEnrollmentDate(dateOfHivTest);
        if (props?.patientObj?.ancNo) {
          calculateStageOfPregnancy(dateOfHivTest);
        }
      })
      .catch((error) => {
        //console.log(error);
        setCheckingForTheDate(false);
      });
  };

  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    const isKnownPositive = isPmtctHts && payload.previouslyKnownHivPositive === "Yes";

    // Only required in the prior-HTS-positive-record scenario (checkPriorHtsPositiveRecord) —
    // the user must supply this date themselves, it's never auto-filled. Bounds enforced here
    // too (not just the input's min/max) since those are browser-level only and can be bypassed.
    if (priorHtsPositiveRecordId) {
      if (!dateOfPreviouslyKnown) {
        temp.dateOfPreviouslyKnown = "This field is required";
      } else if (moment(dateOfPreviouslyKnown).isAfter(moment(), "day")) {
        temp.dateOfPreviouslyKnown = "This date cannot be in the future";
      } else if (
        payload.dateOfHivTest &&
        moment(dateOfPreviouslyKnown).isBefore(moment(payload.dateOfHivTest), "day")
      ) {
        temp.dateOfPreviouslyKnown = `This date cannot be before ${moment(payload.dateOfHivTest).format("DD-MM-YYYY")} (the record's visit date)`;
      } else {
        temp.dateOfPreviouslyKnown = "";
      }
    }

    temp.dateOfHivTest = payload.dateOfHivTest ? "" : "This field is required";

    temp.dateOfHivTest = dateOfHivTestExist
      ? "Date already exist"
      : payload.dateOfHivTest
      ? ""
      : "This field is required";

    // Test Entry Point is always visible and required
    temp.testEntryPoint = payload.testEntryPoint
      ? ""
      : "This field is required";

    // Skip test setting/stage validation when Previously Known HIV+ = Yes
    if (!isKnownPositive) {
      temp.testSetting = payload.testSetting ? "" : "This field is required";

      payload.testSetting !== "" &&
        (payload.testSetting || "").includes("_ANC") &&
        (temp.stageOfPregnancy = payload.stageOfPregnancy
          ? ""
          : "This field is required");

      // Diagnostic testing validation — applies to both PMTCT-HTS and Retesting
      temp.typeOfHivTest = payload.typeOfHivTest ? "" : "This field is required";
      if (payload.typeOfHivTest === "TYPE_OF_HIV_TEST_RAPID_ANTIBODY") {
        temp.initialresult = initialHivTest.result ? "" : "This field is required";
        if (initialHivTest.result === "Positive") {
          temp.confirmatoryresult = confirmatoryHivTest.result
            ? ""
            : "This field is required";
        }
      } else if (payload.typeOfHivTest === "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT") {
        // Require HIV Early Detect Result
        temp.hivEarlyDetect = payload.hivEarlyDetect ? "" : "This field is required";
        // Initiated on Prophylaxis validation removed — field hidden, moved to report
        // If Antibody Reactive Only → Confirmatory required
        if (payload.hivEarlyDetect === "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE") {
          temp.confirmatoryresult = confirmatoryHivTest.result
            ? ""
            : "This field is required";
        }
      }
    }

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };

  function calculateStageOfPregnancy(newTestDate) {
    let gestationalAge = calculateGestationalAge2(newTestDate);
    // Determine trimesters
    const getTrimester = (gestationalAge) => {
      if (gestationalAge >= 0 && gestationalAge <= 12) return "first trimester";
      if (gestationalAge >= 13 && gestationalAge <= 24)
        return "second trimester";
      if (gestationalAge >= 25 && gestationalAge <= 40)
        return "third trimester";
      return "Unknown";
    };

    const lastTrimester = lastPmtctHtsRecord?.stageOfPregnancy;
    const newTrimester = getTrimester(gestationalAge);
    const isSameTrimester = lastTrimester === newTrimester;

    if (isSameTrimester) {
      setValidateHIVRetest({
        message: `Cannot document HIV test. Test is in the same trimester (${newTrimester}).`,
        isValid: false,
        showError: true,
      });
      return;
    }
  }

  function validateHIVRetestDate(newTestDate) {
    let lastTestDate = lastPmtctHtsRecord?.dateOfHivTest;

    // Parse dates using moment
    const newDate = moment(newTestDate);
    const lastDate = moment(lastTestDate);

    // Check if new test is before or same as last test
    if (newDate.isSameOrBefore(lastDate)) {
      setValidateHIVRetest({
        message: `New test date must be after the last test date,  ${lastTestDate}`,
        isValid: false,
        showError: true,
      });
      return;
    }

    // Calculate difference in days
    const daysDifference = newDate.diff(lastDate, "days");
    const isWithinOneMonth = daysDifference < 30;

    if (isWithinOneMonth) {
      setValidateHIVRetest({
        message: `Cannot document HIV test. Test is within 1 month,  (${daysDifference} days) of last test.`,
        isValid: false,
        showError: true,
      });
      return;
    }

    setValidateHIVRetest({
      message: "HIV test date is valid",
      isValid: true,
      showError: false,
    });
  }

  function validateAncEnrollmentDate(newTestDate) {
    const ancEnrollmentDate = props?.patientObj?.dateOfEnrollment;
    const isRetesting = payload.testingType === "RETESTING";
    const hasPreviousRetesting = lastPmtctHtsRecord?.id;

    // Skip validation if no ANC enrollment date
    if (!ancEnrollmentDate) {
      setValidateAncEnrollment({
        message: "",
        isValid: true,
        showError: false,
      });
      return;
    }

    // Parse dates using moment
    const testDate = moment(newTestDate);
    const enrollmentDate = moment(ancEnrollmentDate);

    if (isRetesting) {
      // Retesting: date must be strictly GREATER than ANC enrollment date (not equal)
      if (testDate.isSameOrBefore(enrollmentDate)) {
        setValidateAncEnrollment({
          message: `Retesting date must be after ANC enrollment date (${moment(ancEnrollmentDate).format("YYYY-MM-DD")})`,
          isValid: false,
          showError: true,
        });
        return;
      }

      // Retesting: also validate against previous HTS date (handled by validateHIVRetestDate)
      // But skip the ANC gap check if there's already a previous retesting record
      if (!hasPreviousRetesting) {
        const daysDifference = testDate.diff(enrollmentDate, "days");
        if (daysDifference < 30) {
          setValidateAncEnrollment({
            message: `Cannot document HIV retest. Test date must be at least 1 month (30 days) after ANC enrollment date (${moment(ancEnrollmentDate).format("YYYY-MM-DD")}). Current gap: ${daysDifference} days.`,
            isValid: false,
            showError: true,
          });
          return;
        }
      }
    } else {
      // PMTCT HTS: date must be equal or greater than ANC enrollment date
      if (testDate.isBefore(enrollmentDate)) {
        setValidateAncEnrollment({
          message: `HIV test date cannot be before ANC enrollment date (${moment(ancEnrollmentDate).format("YYYY-MM-DD")})`,
          isValid: false,
          showError: true,
        });
        return;
      }
    }

    // Validation passed
    setValidateAncEnrollment({
      message: "HIV test date is valid",
      isValid: true,
      showError: false,
    });
  }


    const createCycle = async () => {
      // If displayed on Patient Card (not enrollment page), don't create cycle
      if (props.onEnrollPatient) {
              
      let payload2 = {
        patientUuid: props.patientUuid,
        maternalOutcome: "",
        entryPoint: locationState?.entrypointValue || props?.entrypointValue || "",
        hivStatus: payload.finalResult,
        pregnancyOutcome: "",
        numberOfInfants: 0,
        pmtctStatus: "INACTIVE",
        source: "WEB",
      };

      try {
        const response = await axios.post(
          `${baseUrl}pmtct/anc/pregnancy-cycle`,
          payload2,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response?.data) {
          return {
            status: true,
            response: response.data,
          };
        } else {
          toast.error("Failed to create new PMTCT cycle: no data returned");
          return {
            status: false,
            response: null,
          };
        }
      } catch (e) {
        console.log(e);
        toast.error(
          `${e?.response?.status}: New pmtct cycle not created: ${e?.response?.data}`
        );
        return {
          status: false,
          response: null,
        };
      }
      }

  
    };


  /**** Submit Button Processing  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return; // Prevent double submission

    // Client code must not be empty
    if (!payload.clientCode || !payload.clientCode.trim()) {
      toast.error("Client Code is required. Please ensure Setting, Test Setting, Date of HIV Test, and Serial Number are filled.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    if (clientCodeTaken) {
      toast.error("This Client Code already exists. Please change the Serial Number.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    // Prepare payload
    payload.initialHivTest = initialHivTest;
    payload.confirmatoryHivTest = confirmatoryHivTest;
    payload.finalResult = finalResult;

    if (isPmtctHts) {
      // Clean up fields based on Type of HIV Test selection
      if (payload.typeOfHivTest === "TYPE_OF_HIV_TEST_RAPID_ANTIBODY") {
        payload.hivEarlyDetect = "";
        payload.hivEarlyDetectViralLoad = "";
        payload.initiatedOnProphylaxis = "";
      } else if (payload.typeOfHivTest === "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT") {
        // Initial/Confirmatory are only used for Antibody Reactive Only path
        if (payload.hivEarlyDetect !== "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE") {
          payload.initialHivTest = null;
          payload.confirmatoryHivTest = null;
        }
      }

      // If Previously Known HIV+, clear test fields (but keep confirmatoryFromSpokes per S/N 8)
      if (payload.previouslyKnownHivPositive === "Yes") {
        payload.typeOfHivTest = "";
        payload.hivEarlyDetect = "";
        payload.hivEarlyDetectViralLoad = "";
        payload.initiatedOnProphylaxis = "";
        payload.initialHivTest = null;
        payload.confirmatoryHivTest = null;
      }

      // Archive Hepatitis C — always null for PMTCT-HTS
      payload.hepatitisC = "";

      // Assemble JSONB objects for backend
      payload.syphilisInfo = {
        testResult: payload.syphilis || "",
        treatment: payload.syphilisTreatment || "",
        drugName: payload.syphilisDrugName || "",
      };
      payload.hbvInfo = {
        knownPositive: payload.knownHbvPositive || "",
        hbvTest: payload.hbvTest || "",
        testResult: payload.hepatitisB || "",
        treatment: payload.hepatitisBTreatment || "",
        vlResultDate: payload.hbvVlResultDate || "",
        vlResult: payload.hbvVlResult || "",
        drugName: payload.hbvDrugName || "",
      };
      payload.partnerInfo = {
        notificationAgreed: payload.partnerNotificationAgreed || "",
        testedHiv: payload.partnerTestedHiv || "",
        testedSyphilis: payload.partnerTestedSyphilis || "",
        testedHbv: payload.partnerTestedHbv || "",
        referral: payload.partnerReferredTo || "",
      };
    } else {
      // Retesting — clean up fields based on Type of HIV Test (same logic as PMTCT-HTS)
      if (payload.typeOfHivTest === "TYPE_OF_HIV_TEST_RAPID_ANTIBODY") {
        payload.hivEarlyDetect = "";
        payload.hivEarlyDetectViralLoad = "";
        payload.initiatedOnProphylaxis = "";
      } else if (payload.typeOfHivTest === "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT") {
        if (payload.hivEarlyDetect !== "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE") {
          payload.initialHivTest = null;
          payload.confirmatoryHivTest = null;
        }
      }

      // Archive Hepatitis C — always null for Retesting
      payload.hepatitisC = "";

      // Assemble JSONB objects for serology tests
      payload.syphilisInfo = {
        testResult: payload.syphilis || "",
        treatment: payload.syphilisTreatment || "",
        drugName: payload.syphilisDrugName || "",
      };
      payload.hbvInfo = {
        knownPositive: payload.knownHbvPositive || "",
        hbvTest: payload.hbvTest || "",
        testResult: payload.hepatitisB || "",
        treatment: payload.hepatitisBTreatment || "",
        vlResultDate: payload.hbvVlResultDate || "",
        vlResult: payload.hbvVlResult || "",
        drugName: payload.hbvDrugName || "",
      };

      // Assemble Partner Info JSONB (Partner Notification is on both forms)
      payload.partnerInfo = {
        notificationAgreed: payload.partnerNotificationAgreed || "",
        testedHiv: payload.partnerTestedHiv || "",
        testedSyphilis: payload.partnerTestedSyphilis || "",
        testedHbv: payload.partnerTestedHbv || "",
        referral: payload.partnerReferredTo || "",
      };
    }

    // Prevent saving a second initial PMTCT HTS for the same cycle
    const isNewCreate = props.activeContent?.actionType === "create" || !props.activeContent?.id;
    if (isPmtctHts && initialHtsExistsForCycle && isNewCreate) {
      toast.error("An initial PMTCT HTS record already exists for this cycle. Use Retesting instead.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    // Validation checks
    const isFormValid =
      validate() &&
      !checkingForTheDate &&
      validateHIVRetest.isValid &&
      validateAncEnrollment.isValid;

    // Show validation errors if any
    if (!isFormValid) {
      if (!validateHIVRetest.isValid) {
        toast.error(validateHIVRetest.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      if (!validateAncEnrollment.isValid) {
        toast.error(validateAncEnrollment.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      if (!validate()) {
        toast.error("Please fill all required fields", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      return; // Exit early if validation fails
    }

    
    // Create cycle if needed
    if (
      props.onEnrollPatient
    ) {
      const checkIfCycleIsCreated = await createCycle();
      payload.pmtctCycleUuid = checkIfCycleIsCreated?.response?.uuid;

      if (!checkIfCycleIsCreated?.status) {
        toast.error("Failed to create cycle", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return; // Exit if cycle creation fails
      }
    } else {
      // On update, preserve the cycle UUID loaded from the record; fall back to props
      payload.pmtctCycleUuid = payload.pmtctCycleUuid || props?.selectedCycleId || props?.latestPmtctCycle?.uuid;
    }


    // Process the enrollment
    setSaving(true);

    try {
      const isUpdate = props.activeContent?.actionType === "update";
      // Numeric id → post-migration hts_encounter record (HTS's own endpoints apply).
      // Non-numeric id → legacy pre-migration pmtct_hts-table record, which HTS's endpoints
      // have no way to reference at all — keeps using PMTCT's own legacy update path.
      const isLegacyRecordId =
        isUpdate && props.activeContent?.id != null && !/^\d+$/.test(String(props.activeContent.id));
      let response;

      if (priorHtsPositiveRecordId) {
        // Scenario: adopting an existing positive HTS-module record (checkPriorHtsPositiveRecord)
        // — updates that record in place rather than creating a second, duplicate one for the
        // same client. pmtctHts is flipped to true (deliberately, not the default true every
        // other save path already sends unconditionally) so this record starts showing up in
        // PMTCT's own pmtct_hts=true-filtered views — specifically Recent Activity
        // (ANCAcivityTracker.getAllActivities / findByPatientUuidAndCycleUuid) — once it's been
        // updated here. HTS and PMTCT report this client's numbers together, so this does not
        // create a double-count; pmtctCycleUuid is still attached correctly below (unconditional,
        // runs before this branch) so existsInitialHtsForCycle correctly treats this as the
        // patient's initial PMTCT HTS record for her current cycle going forward.
        if (!resolvedPersonId) {
          toast.error(
            "Could not resolve this patient's HTS record id. Please reload the form and try again.",
            { position: toast.POSITION.TOP_RIGHT }
          );
          setSaving(false);
          return;
        }

        const htsEncounterPayload = buildHtsEncounterRequestPayload(payload, {
          dateOfPreviouslyKnown,
          rawObservation: priorHtsRawObservation,
        });
        htsEncounterPayload.patientId = resolvedPersonId;

        response = await axios.put(
          `${baseUrl}hts-encounter/${priorHtsPositiveRecordId}`,
          htsEncounterPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Record updated successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else if (isUpdate && isLegacyRecordId) {
        // Update existing enrollment — legacy pre-migration record only.
        response = await axios.put(
          `${baseUrl}pmtct/anc/update-pmtct-hts-enrollment/${props.activeContent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Record updated successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        // Create OR update of a post-migration record — both now go straight to HTS-Module's
        // own hts-encounter endpoints instead of PMTCT's retired pmtct-hts-enrollment /
        // update-pmtct-hts-enrollment. patientId (HTS's numeric personId, not patientUuid) is
        // resolved on mount into resolvedPersonId (see fetchPersonId), not looked up here.
        // Sent on every request (create AND update) per the "identical body shape to create"
        // instruction — never assumed to already be set on the existing record.
        if (!resolvedPersonId) {
          toast.error(
            "Could not resolve this patient's HTS record id. Please reload the form and try again.",
            { position: toast.POSITION.TOP_RIGHT }
          );
          setSaving(false);
          return;
        }

        // Built fresh from the form's current payload state every time — payload was fully
        // prepopulated from the existing record on load (viewPmtctHtsRecord) for updates, so
        // this always sends the complete current field set rather than only what changed.
        // HTS's own update() replaces the whole observation object rather than merging it, so
        // omitting unchanged fields would silently wipe them from the saved record.
        const htsEncounterPayload = buildHtsEncounterRequestPayload(payload);
        htsEncounterPayload.patientId = resolvedPersonId;
        // facilityId intentionally not set — stated to be derived on HTS-Module's own backend.

        if (isUpdate) {
          response = await axios.put(
            `${baseUrl}hts-encounter/${props.activeContent.id}`,
            htsEncounterPayload,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success("Record updated successfully", {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else {
          response = await axios.post(
            `${baseUrl}hts-encounter`,
            htsEncounterPayload,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success("Enrollment saved successfully", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      }

      // Notify the patient card to refetch the HIV/serology summary right away —
      // don't rely solely on the activeContent route change below, since some
      // saves keep the same route/actionType and would otherwise leave the card stale.
      props.onSaved && props.onSaved();

      // Handle post-submission routing
      // Check if any positive result (HIV, Syphilis, or Hepatitis B) was recorded
      const hasPositiveHiv = finalResult === "Positive";
      const syphVal = (payload.syphilis || "").trim().toLowerCase();
      const hasPositiveSyphilis = syphVal === "reactive" || syphVal === "positive";
      const hepBVal = (payload.hepatitisB || "").trim().toLowerCase();
      const hasPositiveHepatitis = hepBVal === "positive" || hepBVal === "reactive";
      const shouldOpenMip = hasPositiveHiv || hasPositiveSyphilis || hasPositiveHepatitis;

      if (!isUpdate && props.handleRoute && props.onEnrollPatient) {
        const data = {
          ...props?.patientObj,
          id: props?.patientObj.id,
          entryPoint: props.entrypointValue,
          hospitalNumber: props?.patientObj?.identifier?.identifier[0]?.value,
          fullName: props?.patientObj?.surname,
          age: props?.patientAge,
          hivStatus: props?.patientObj?.dynamicHivStatus,
          ancNo: props?.patientObj?.ancNo,
          patientUuid: props.patientUuid,
        };
        // Positive HIV, Syphilis, or Hepatitis → auto-open MIP enrollment form
        if (shouldOpenMip) {
          props.handleRoute(data, { autoOpenRoute: "anc-pnc" });
        } else {
          props.handleRoute(data);
        }
      } else {
        // Positive HIV, Syphilis, or Hepatitis → navigate to MIP enrollment form
        if (shouldOpenMip && !isUpdate) {
          props.setActiveContent({
            ...props.activeContent,
            route: "anc-pnc",
            actionType: "create",
            id: "",
            obj: {},
          });
        } else {
          props.setActiveContent({
            ...props.activeContent,
            route: "recent-history",
          });
        }
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      // Always shown verbatim, not rewritten/hardcoded on this side — so if the backend's
      // wording for any rejection (transfer-in, duplicate-positive, 90-day spacing, etc.)
      // changes later, it reflects here automatically with no frontend change needed.
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
        { position: toast.POSITION.TOP_RIGHT }
      );
    } finally {
      setSaving(false);
    }
  };

  // LV3-1732: Early Detect Antigen-Reactive / Antigen+Antibody-Reactive with no final result
  // yet resolved — the "still Suspected Acute HIV Infection" state.
  const isUnresolvedSuspectedAcuteInfection =
    (payload.hivEarlyDetect === "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE" ||
      payload.hivEarlyDetect === "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE") &&
    !finalResult;

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
              <div
                className="card-header mb-3"
                style={{
                  background: "#fff",
                  borderRadius: "0",
                  padding: "14px 20px",
                  marginTop: "-20px",
                  border: "none",
                  borderBottom: "2px solid #e2e8f0",
                  boxShadow: "none",
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
                }}
              >
                <h5 style={{ color: "#0f172a", fontWeight: "700", marginBottom: "0", fontSize: "15px" }}>
                  {payload.testingType === "PMTCT-HTS"
                    ? "PMTCT HTS"
                    : "Retesting"}
                </h5>
                {props?.entrypointValue && (
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}>
                    Entry Point:{" "}
                    <b style={{ color: "#0f172a" }}>
                      {props.entrypointValue === "PMTCT_ENTRY_POINT_ANC"
                        ? "ANC"
                        : props.entrypointValue === "PMTCT_ENTRY_POINT_L&D"
                        ? "L&D"
                        : props.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"
                        ? "BF"
                        : props.entrypointValue}
                    </b>
                  </span>
                )}
              </div>

              {/* === Patient Information (bordered container) === */}
              <div className="col-md-12 mb-3 mt-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <PersonIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Patient Information
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date of HIV Test <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="dateOfHivTest"
                            id="dateOfHivTest"
                            onChange={handleInputChange}
                            value={payload.dateOfHivTest}
                            min={
                              patientObj.ancNo ? props?.patientObj?.dateOfEnrollment : ""
                            }
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.dateOfHivTest !== "" ? (
                          <span className={classes.error}>{errors.dateOfHivTest}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {props?.patientObj?.ancNo && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>
                            ANC No <span style={{ color: "red" }}> *</span>
                          </Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="ancNo"
                              id="ancNo"
                              value={payload.ancNo}
                              disabled
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                    )}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Serial Number <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="serialNumber"
                            id="serialNumber"
                            placeholder="e.g. 1714RA"
                            value={payload.serialNumber || ""}
                            onChange={handleSerialNumberChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.serialNumber !== "" ? (
                          <span className={classes.error}>{errors.serialNumber}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Client Code <span style={{ color: "red" }}> *</span>
                        </Label>
                        <div style={{ position: "relative" }}>
                          <Input
                            type="text"
                            name="clientCode"
                            id="clientCode"
                            value={payload.clientCode || ""}
                            readOnly
                            disabled
                            style={{
                              fontFamily: "monospace",
                              letterSpacing: "0.04em",
                              paddingRight: "110px",
                              backgroundColor: "#e9ecef",
                              borderColor: clientCodeTaken ? "#f85032" : "#d2d6dc",
                              height: "41px",
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              color: clientCodeTaken ? "#c62828" : payload.clientCode ? "#2e7d32" : "#8c959f",
                              background: clientCodeTaken ? "#fdecea" : payload.clientCode ? "#e8f5e9" : "#f0f0f0",
                              padding: "2px 7px",
                              borderRadius: "8px",
                              pointerEvents: "none",
                            }}
                          >
                            {clientCodeTaken ? "Already used" : payload.clientCode ? "Auto-generated" : "Pending..."}
                          </span>
                        </div>
                        {!payload.clientCode && (
                          <small style={{ color: "#57606a", marginTop: 4, display: "block" }}>
                            Fill in Setting, Test Setting, Date of HIV Test, and Serial Number to generate
                          </small>
                        )}
                        {clientCodeTaken && (
                          <small style={{ color: "#c62828", marginTop: 4, display: "block" }}>
                            This client code already exists. Change the Serial Number.
                          </small>
                        )}
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Test Details (bordered container) === */}
              <div className="col-md-12 mb-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <AssignmentIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Test Details
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Setting <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="testEntryPoint"
                            id="testEntryPoint"
                            onChange={handleInputChange}
                            value={payload.testEntryPoint}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {testEntryPoint.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.testEntryPoint !== "" ? (
                          <span className={classes.error}>{errors.testEntryPoint}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {/* Hide Test Setting when Previously Known HIV+ (S/N 7) */}
                    {!(isPmtctHts && payload.previouslyKnownHivPositive === "Yes") && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>
                            {(payload.testEntryPoint || "").includes("COMMUNITY") ? "Community Setting" : "Facility Setting"} <span style={{ color: "red" }}> *</span>
                          </Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="testSetting"
                              id="testSetting"
                              onChange={handleInputChange}
                              value={payload.testSetting}
                              disabled={
                                disableEntryPoint ? disableEntryPoint : disabledField
                              }
                            >
                              <option value="">Select</option>
                              {communitySetting.map((value) => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                            </Input>
                          </InputGroup>
                          {errors.testSetting !== "" ? (
                            <span className={classes.error}>{errors.testSetting}</span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                    {!(isPmtctHts && payload.previouslyKnownHivPositive === "Yes") && (payload.testSetting || "").includes("_ANC") && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>
                              Stage of Pregnancy
                              <span style={{ color: "red" }}>*</span>{" "}
                            </Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="stageOfPregnancy"
                                id="stageOfPregnancy"
                                onChange={handleInputChange}
                                value={payload.stageOfPregnancy}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="first trimester">First trimester</option>
                                <option value="second trimester">Second trimester</option>
                                <option value="third trimester">Third trimester</option>
                              </Input>
                            </InputGroup>
                            {errors.stageOfPregnancy !== "" ? (
                              <span className={classes.error}>{errors.stageOfPregnancy}</span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}
                      {/* Status at Entry (PMTCT-HTS only) */}
                      {isPmtctHts && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Status at Entry</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="pregnancyStatusAtEntry"
                                id="pregnancyStatusAtEntry"
                                onChange={handleInputChange}
                                value={payload.pregnancyStatusAtEntry}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Pregnant">Pregnant</option>
                                <option value="Breastfeeding">Breastfeeding</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              {/* === HIV History (bordered container, PMTCT-HTS only) === */}
              {isPmtctHts && (
                <div className="col-md-12 mb-3">
                  <div style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "0.35rem",
                    padding: "15px 10px",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                      <HistoryIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />HIV History
                    </h6>
                    <div className="row">
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Previously Known HIV Positive</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="previouslyKnownHivPositive"
                              id="previouslyKnownHivPositive"
                              onChange={handleInputChange}
                              value={payload.previouslyKnownHivPositive}
                              disabled={disabledField || isTransferInPatient || !!priorHtsPositiveRecordId}
                            >
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </Input>
                          </InputGroup>
                          {isTransferInPatient && (
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>
                              Locked — documented HIV Transfer-In record on file.
                            </span>
                          )}
                          {!isTransferInPatient && !!priorHtsPositiveRecordId && (
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>
                              Locked — positive result already documented on the HTS module.
                            </span>
                          )}
                        </FormGroup>
                      </div>
                      {/* Only shown when adopting an existing positive HTS-module record — the
                          user must manually enter the date they're documenting this on PMTCT,
                          which is a different date from when the HTS-module record was itself
                          created (see priorHtsPositiveRecordId). Saved into observation once
                          HTS-Module's team adds support for it on their end (see
                          dateOfPreviouslyKnown in buildHtsEncounterRequestPayload). */}
                      {!!priorHtsPositiveRecordId && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>
                              Date of Previously Known <span style={{ color: "red" }}> *</span>
                            </Label>
                            <InputGroup>
                              <Input
                                type="date"
                                name="dateOfPreviouslyKnown"
                                id="dateOfPreviouslyKnown"
                                onChange={(e) => setDateOfPreviouslyKnown(e.target.value)}
                                value={dateOfPreviouslyKnown}
                                disabled={disabledField}
                                // Can't be documented before the adopted record's own visit date
                                // (payload.dateOfHivTest is that record's date_of_visit, loaded
                                // by checkPriorHtsPositiveRecord), and can't be in the future.
                                min={payload.dateOfHivTest || undefined}
                                max={moment().format("YYYY-MM-DD")}
                              />
                            </InputGroup>
                            {errors.dateOfPreviouslyKnown ? (
                              <span className={classes.error}>{errors.dateOfPreviouslyKnown}</span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}
                      {payload.previouslyKnownHivPositive === "Yes" && (
                        <>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Client enrolled?</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="enrolledOnArt"
                                  id="enrolledOnArt"
                                  onChange={handleInputChange}
                                  value={payload.enrolledOnArt}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="On ART">On ART</option>
                                  <option value="Not on ART">Not on ART</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Final HIV Result</Label>
                              <Input
                                type="text"
                                value="Positive"
                                disabled
                                style={{ backgroundColor: "#fff5f5", color: "#dc2626", fontWeight: "bold" }}
                              />
                            </FormGroup>
                          </div>
                        </>
                      )}
                      {/* Confirmatory Test: Positives from Spokes — hidden, moved to report */}
                    </div>
                  </div>
                </div>
              )}

              {/* === Diagnostic Testing (bordered container, PMTCT-HTS only) === */}
              {payload.previouslyKnownHivPositive !== "Yes" && (
                <div className="col-md-12 mb-3">
                  <div style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "0.35rem",
                    padding: "15px 10px",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                      <LocalHospitalIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />{isPmtctHts ? "Diagnostic Testing" : "HIV Maternal Re-testing"}
                    </h6>
                    <div className="row">

                  {/* Type of HIV Test */}
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Type of HIV Test <span style={{ color: "red" }}> *</span></Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="typeOfHivTest"
                          id="typeOfHivTest"
                          onChange={handleInputChange}
                          value={payload.typeOfHivTest}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {typeOfHivTestOptions.map((value) => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                      </InputGroup>
                    </FormGroup>
                  </div>

                  {/* === HIV Early Detect Test Flow === */}
                  {payload.typeOfHivTest === "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT" && (
                    <>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>HIV Early Detect Result <span style={{ color: "red" }}> *</span></Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="hivEarlyDetect"
                              id="hivEarlyDetect"
                              onChange={handleInputChange}
                              value={payload.hivEarlyDetect}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              {hivEarlyDetectOptions.map((value) => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                            </Input>
                          </InputGroup>
                          {errors.hivEarlyDetect !== "" ? (
                            <span className={classes.error}>
                              {errors.hivEarlyDetect}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>

                      {/* Suspected Acute HIV Infection indication */}
                      {(payload.hivEarlyDetect === "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE" || payload.hivEarlyDetect === "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE") && (
                        <>
                          <div className="form-group mb-3 col-md-12">
                            <Message warning>
                              <b>Suspected Acute HIV Infection</b>
                            </Message>
                          </div>

                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Viral Load</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="hivEarlyDetectViralLoad"
                                  id="hivEarlyDetectViralLoad"
                                  onChange={handleInputChange}
                                  value={payload.hivEarlyDetectViralLoad}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Target Detected">Target Detected</option>
                                  <option value="Target Not Detected">Target Not Detected</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                        </>
                      )}

                      {/* Antibody Reactive Only → Confirmatory Test */}
                      {payload.hivEarlyDetect === "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE" && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>
                              Confirmatory HIV Test Result{" "}
                              <span style={{ color: "red" }}> *</span>
                            </Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="result"
                                id="result"
                                onChange={handleConfirmatoryInputChange}
                                value={confirmatoryHivTest.result}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                {confirmatoryResultOptions.map((value) => (
                                  <option key={value.id} value={value.code}>
                                    {value.display}
                                  </option>
                                ))}
                              </Input>
                            </InputGroup>
                            {errors.confirmatoryresult !== "" ? (
                              <span className={classes.error}>
                                {errors.confirmatoryresult}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}

                      {/* Initiated on Prophylaxis — hidden, moved to report */}
                    </>
                  )}

                  {/* === Rapid Antibody Test Flow === */}
                  {payload.typeOfHivTest === "TYPE_OF_HIV_TEST_RAPID_ANTIBODY" && (
                    <>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>
                            HIV Test Result
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="result"
                              id="result"
                              onChange={handleInitialInputChange}
                              value={initialHivTest.result}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option  value="Positive">Positive</option>
                              <option value="Negative">Negative</option>
                            </Input>
                          </InputGroup>
                          {errors.initialresult !== "" ? (
                            <span className={classes.error}>
                              {errors.initialresult}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>

                      {initialHivTest.result === "Positive" && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>
                              Confirmatory HIV Test{" "}
                              <span style={{ color: "red" }}> *</span>
                            </Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="result"
                                id="confirmatory_result"
                                onChange={handleConfirmatoryInputChange}
                                value={confirmatoryHivTest.result}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                {confirmatoryResultOptions.map((value) => (
                                  <option key={value.id} value={value.code}>
                                    {value.display}
                                  </option>
                                ))}
                              </Input>
                            </InputGroup>
                            {errors.confirmatoryresult !== "" ? (
                              <span className={classes.error}>
                                {errors.confirmatoryresult}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}
                    </>
                  )}
                    </div>
                  </div>
                </div>
              )}

              {/* Old simple retesting section removed — retesting now uses the full Diagnostic Testing flow above */}

              {/* === OTHER SEROLOGY TESTS (shown on BOTH PMTCT-HTS and Retesting) === */}
              {(isPmtctHts || isRetesting) && (
                <>
                  <div className="col-md-12 mb-2 mt-3">
                    <h6 style={{ color: "#014d88", fontWeight: "bold", fontSize: "15px" }}>
                      Other Serology Tests
                    </h6>
                    <hr style={{ color: "#014d88", opacity: "0.3" }} />
                  </div>

                  {/* === Syphilis (bordered container) === */}
                  <div className="col-md-12 mb-3">
                    <div style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "0.35rem",
                      padding: "15px 10px",
                      backgroundColor: "#f8f9fa"
                    }}>
                      <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                        <HealingIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Syphilis
                      </h6>
                      <div className="row">
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Syphilis Test Result</Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="syphilis"
                          id="syphilis"
                          onChange={handleInputChange}
                          value={payload.syphilis}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="Reactive">Reactive</option>
                          <option value="Non-reactive">Non-reactive</option>
                        </Input>
                      </InputGroup>
                      {serologyFromAnc.syphilis && (
                        <small style={{ color: "#57606a", marginTop: 4, display: "block" }}>
                          Pre-filled from ANC — editable
                        </small>
                      )}
                    </FormGroup>
                  </div>

                  {payload.syphilis === "Reactive" && (
                    <>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Syphilis Treatment/Referral</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="syphilisTreatment"
                              id="syphilisTreatment"
                              onChange={handleInputChange}
                              value={payload.syphilisTreatment}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Not Treated">Not Treated</option>
                              <option value="Treated">Treated</option>
                              <option value="Referred">Referred</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>

                      {payload.syphilisTreatment === "Treated" && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Name of Syphilis Drug</Label>
                            <InputGroup>
                              <Input
                                type="text"
                                name="syphilisDrugName"
                                id="syphilisDrugName"
                                onChange={handleInputChange}
                                value={payload.syphilisDrugName}
                                disabled={disabledField}
                                placeholder="Enter drug name"
                              />
                            </InputGroup>
                          </FormGroup>
                        </div>
                      )}
                    </>
                  )}
                      </div>
                    </div>
                  </div>

                  {/* === Hepatitis B (bordered container) === */}
                  <div className="col-md-12 mb-3">
                    <div style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "0.35rem",
                      padding: "15px 10px",
                      backgroundColor: "#f8f9fa"
                    }}>
                      <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                        <HealingIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Hepatitis B
                      </h6>
                      <div className="row">
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Known HBV Positive</Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="knownHbvPositive"
                          id="knownHbvPositive"
                          onChange={handleInputChange}
                          value={payload.knownHbvPositive}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Input>
                      </InputGroup>
                      {serologyFromAnc.hepatitisB && (
                        <small style={{ color: "#57606a", marginTop: 4, display: "block" }}>
                          Pre-filled from ANC — editable
                        </small>
                      )}
                    </FormGroup>
                  </div>

                  {/* Known HBV = Yes → result is already implied Positive (set on selection
                      above, not re-asked here) — go straight to Treatment (3 options: Not
                      treated, New on Prophylaxis, Referred) */}
                  {payload.knownHbvPositive === "Yes" && (
                    <>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>HBV Treatment/Referral</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="hepatitisBTreatment"
                              id="hepatitisBTreatment"
                              onChange={handleInputChange}
                              value={payload.hepatitisBTreatment}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Not treated">Not treated</option>
                              <option value="New on Prophylaxis">New on Prophylaxis</option>
                              <option value="Referred">Referred</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>
                    </>
                  )}

                  {/* Known HBV = No → show HBV Test (Yes/No), then Treatment if tested */}
                  {payload.knownHbvPositive === "No" && (
                    <>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>HBV Test</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="hbvTest"
                              id="hbvTest"
                              onChange={handleInputChange}
                              value={payload.hbvTest}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>
                      {payload.hbvTest === "Yes" && (
                        <>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>HBV Test Result</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="hepatitisB"
                                  id="hepatitisB"
                                  onChange={handleInputChange}
                                  value={payload.hepatitisB}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Positive">Positive</option>
                                  <option value="Negative">Negative</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>HBV Treatment/Referral</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="hepatitisBTreatment"
                                  id="hepatitisBTreatment"
                                  onChange={handleInputChange}
                                  value={payload.hepatitisBTreatment}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Not treated">Not treated</option>
                                  <option value="Prior on HBV treatment">Prior on HBV treatment</option>
                                  <option value="New on Prophylaxis">New on Prophylaxis</option>
                                  <option value="Referred">Referred</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* HBV VL fields — show when Known HBV = Yes (S/N 22) */}
                  {payload.knownHbvPositive === "Yes" && (
                    <>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>HBV Viral Load Result Received Date</Label>
                          <Input
                            type="date"
                            name="hbvVlResultDate"
                            id="hbvVlResultDate"
                            onChange={handleInputChange}
                            value={payload.hbvVlResultDate}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>HBV Viral Load Result (cp/ml)</Label>
                          <InputGroup>
                            <Input
                              type="number"
                              name="hbvVlResult"
                              id="hbvVlResult"
                              onChange={handleInputChange}
                              value={payload.hbvVlResult}
                              disabled={disabledField}
                              min="0"
                              placeholder="Enter VL result"
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Name of HBV Drug</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="hbvDrugName"
                              id="hbvDrugName"
                              onChange={handleInputChange}
                              value={payload.hbvDrugName}
                              disabled={disabledField}
                              placeholder="Enter drug name"
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                    </>
                  )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === TB (bordered container) — Shown on BOTH PMTCT-HTS and Retesting === */}
              <div className="col-md-12 mb-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <LocalHospitalIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />TB
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>TB Screening Status</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="tbScreeningStatus"
                            id="tbScreeningStatus"
                            onChange={handleInputChange}
                            value={payload.tbScreeningStatus}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {tbStatus.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {payload.tbScreeningStatus === "TB_STATUS_PRESUMPTIVE_TB" && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Referred for Evaluation</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="tbReferred"
                              id="tbReferred"
                              onChange={handleInputChange}
                              value={payload.tbReferred}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              {tbReferralOptions.map((value) => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* === Partner Notification (bordered container) — Shown on BOTH PMTCT-HTS and Retesting === */}
                  <div className="col-md-12 mb-3">
                    <div style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "0.35rem",
                      padding: "15px 10px",
                      backgroundColor: "#f8f9fa"
                    }}>
                      <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                        <PeopleIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Partner Notification Services
                      </h6>
                      <div className="row">
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Agreed to Partner Notification</Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="partnerNotificationAgreed"
                          id="partnerNotificationAgreed"
                          onChange={handleInputChange}
                          value={payload.partnerNotificationAgreed}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Input>
                      </InputGroup>
                    </FormGroup>
                  </div>

                  {/* Partner sub-fields only shown when Agreed = Yes */}
                  {payload.partnerNotificationAgreed === "Yes" && (
                    <>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Partner Tested — HIV</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="partnerTestedHiv"
                              id="partnerTestedHiv"
                              onChange={handleInputChange}
                              value={payload.partnerTestedHiv}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Positive">Positive</option>
                              <option value="Negative">Negative</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Partner Tested — Syphilis</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="partnerTestedSyphilis"
                              id="partnerTestedSyphilis"
                              onChange={handleInputChange}
                              value={payload.partnerTestedSyphilis}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Positive">Positive</option>
                              <option value="Negative">Negative</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Partner Tested — Hep B</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="partnerTestedHbv"
                              id="partnerTestedHbv"
                              onChange={handleInputChange}
                              value={payload.partnerTestedHbv}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Positive">Positive</option>
                              <option value="Negative">Negative</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Partner Referred to</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="partnerReferredTo"
                              id="partnerReferredTo"
                              onChange={handleInputChange}
                              value={payload.partnerReferredTo}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              {partnerReferredOptions
                                .filter((value) => {
                                  // ART option only available when partner is HIV Positive
                                  if ((value.code || "").toUpperCase().includes("_ART") && payload.partnerTestedHiv !== "Positive") {
                                    return false;
                                  }
                                  return true;
                                })
                                .map((value) => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>
                    </>
                  )}
                      </div>
                    </div>
                  </div>

              {/* Viral Load Monitoring — Display if Previously Known or HIV Positive */}
              {(payload.previouslyKnownHivPositive === "Yes" ||
                finalResult === "Positive") && (
                <div className="col-md-12 mb-3">
                  <div style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "0.35rem",
                    padding: "15px 10px",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <h6 style={{ backgroundColor: "transparent", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                      <TimelineIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Viral Load Monitoring
                    </h6>
                    <div className="row">
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Viral Load</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="viralLoadMonitoring"
                              id="viralLoadMonitoring"
                              onChange={handleInputChange}
                              value={payload.viralLoadMonitoring}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              {viralLoadTimingOptions.map((value) => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {saving ? <Spinner /> : ""}
            <br />

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              <div>
                {/* LV3-1732: while the client is in the unresolved Suspected Acute HIV
                    Infection state (Early Detect Antigen-Reactive, no final result yet), the
                    label reads "Early Detect Test Result" with the Suspected Acute indication
                    shown instead of a Positive/Negative value — the ribbon only becomes the
                    normal "HIV Test Result" once a genuine confirmatory/final result exists. */}
                {(finalResult || isUnresolvedSuspectedAcuteInfection) && (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: isUnresolvedSuspectedAcuteInfection ? "#fffbeb"
                      : finalResult === "Positive" ? "#fff5f5" : "#f0fff4",
                    border: isUnresolvedSuspectedAcuteInfection ? "1px solid #fbd38d"
                      : finalResult === "Positive" ? "1px solid #feb2b2" : "1px solid #9ae6b4",
                    borderRadius: "0.35rem",
                    padding: "10px 18px",
                  }}>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#4a5568",
                      marginRight: "10px",
                    }}>
                      {isUnresolvedSuspectedAcuteInfection ? "Early Detect Test Result:" : "HIV Test Result:"}
                    </span>
                    <LabelRibbon
                      color={isUnresolvedSuspectedAcuteInfection ? "yellow" : finalResult === "Positive" ? "red" : "green"}
                      style={{ margin: "0" }}
                    >
                      {isUnresolvedSuspectedAcuteInfection ? "Suspected Acute HIV Infection" : finalResult}
                    </LabelRibbon>
                  </div>
                )}
              </div>

              <div>
                {props.activeContent &&
                props.activeContent.actionType === "update" ? (
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    style={{ backgroundColor: "#014d88" }}
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {!saving ? (
                      <span style={{ textTransform: "capitalize" }}>
                        Update
                      </span>
                    ) : (
                      <span style={{ textTransform: "capitalize" }}>
                        Updating...
                      </span>
                    )}
                  </MatButton>
                ) : props.activeContent.actionType !== "view" ? (
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    style={{ backgroundColor: "#014d88" }}
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {!saving ? (
                      <span style={{ textTransform: "capitalize" }}>
                        Save
                      </span>
                    ) : (
                      <span style={{ textTransform: "capitalize" }}>
                        Saving...
                      </span>
                    )}
                  </MatButton>
                ) : null}
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PmtctHtsForm;
