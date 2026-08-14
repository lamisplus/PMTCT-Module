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

// Matches HTS-Module's SETTING_PREFIX_MAP abbreviations (FC/CM), just keyed by
// PMTCT's own ENROLLMENT_SETTING_* codeset values instead of HTS_ENTRY_POINT_*.
const SETTING_ABBR_MAP = {
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
      const personUuid =
        props?.patientObj?.person_Uuud ||
        props?.patientObj?.personUuud ||
        props?.patientObj?.patient_uuid ||
        props?.patientObj?.uuid;

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

      // Pre-populate Syphilis/HBV fields from ANC enrollment data (only for ANC entry point).
      // Hepatitis C is intentionally excluded — this form archives it (see submit handler,
      // "Archive Hepatitis C — always null for PMTCT-HTS") and has no input field for it.
      const patientUuid = props?.patientObj?.patientUuid || props?.patientObj?.uuid || props?.patientUuid;
      const pmtctCycleUuid = props?.latestPmtctCycle?.uuid;
      const isAncEntry = props?.entrypointValue === "PMTCT_ENTRY_POINT_ANC";
      if (isAncEntry && patientUuid && pmtctCycleUuid) {
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

  // Recompute the Client Code preview whenever its inputs change (serial number is user-entered)
  useEffect(() => {
    if (
      props?.activeContent?.actionType === "update" ||
      props?.activeContent?.actionType === "view"
    ) {
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
        setPayload({
          dateOfHivTest: response.data.dateOfHivTest,
          testEntryPoint: response.data.testEntryPoint,
          testSetting: response.data.testSetting || "",
          stageOfPregnancy: response.data.stageOfPregnancy || "",
          clientCode: response.data.clientCode || "",
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
      .get(`${baseUrl}application-codesets/v2/ENROLLMENT_SETTING`, {
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

  const HTS_ENTRY_POINT_FACILITY = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FACILITY_HTS_TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data) {
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

  const HTS_ENTRY_POINT_COMMUNITY = () => {
    axios
      .get(
        `${baseUrl}application-codesets/v2/COMMUNITY_HTS_TEST_SETTING
 `,
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

  const getSettingPoint = (testEntryPoint) => {
    if (testEntryPoint.includes("ENROLLMENT_SETTING_COMMUNITY")) {
      HTS_ENTRY_POINT_COMMUNITY();
    } else {
      HTS_ENTRY_POINT_FACILITY();
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
        e.target.value === "ENROLLMENT_SETTING_FACILITY" &&
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
        e.target.value === "ENROLLMENT_SETTING_FACILITY" &&
        props?.entrypointValue === "PMTCT_ENTRY_POINT_L&D"
      ) {
        setPayload((prevPayload) => ({
          ...prevPayload,
          [e.target.name]: e.target.value,
          testSetting: "FACILITY_HTS_TEST_SETTING_L&D",
        }));
        setDisableEntryPoint(true);
      } else if (
        e.target.value === "ENROLLMENT_SETTING_FACILITY" &&
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
      // Clear HBV sub-fields when Known HBV changes
      setPayload((prevPayload) => ({
        ...prevPayload,
        knownHbvPositive: e.target.value,
        hbvTest: "",
        hepatitisB: "",
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
      let response;

      if (isUpdate) {
        // Update existing enrollment
        response = await axios.put(
          `${baseUrl}pmtct/anc/update-pmtct-hts-enrollment/${props.activeContent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Record updated successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        // Create new enrollment
        response = await axios.post(
          `${baseUrl}pmtct/anc/pmtct-hts-enrollment`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Enrollment saved successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
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
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
        { position: toast.POSITION.TOP_RIGHT }
      );
    } finally {
      setSaving(false);
    }
  };

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
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>
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

                  {/* Known HBV = Yes → show HBV Result (Pos/Neg) + Treatment (3 options: Not treated, New on Prophylaxis, Referred) */}
                  {payload.knownHbvPositive === "Yes" && (
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
                {finalResult && (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: finalResult === "Positive" ? "#fff5f5" : "#f0fff4",
                    border: finalResult === "Positive" ? "1px solid #feb2b2" : "1px solid #9ae6b4",
                    borderRadius: "0.35rem",
                    padding: "10px 18px",
                  }}>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#4a5568",
                      marginRight: "10px",
                    }}>
                      HIV Test Result:
                    </span>
                    <LabelRibbon
                      color={finalResult === "Positive" ? "red" : "green"}
                      style={{ margin: "0" }}
                    >
                      {finalResult}
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
