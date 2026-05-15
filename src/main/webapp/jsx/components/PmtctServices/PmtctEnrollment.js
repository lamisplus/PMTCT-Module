import React, { useState, useEffect, useRef } from "react";
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
import EventNoteIcon from "@material-ui/icons/EventNote";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import ListAltIcon from "@material-ui/icons/ListAlt";
import HealingIcon from "@material-ui/icons/Healing";
import ChildFriendlyIcon from "@material-ui/icons/ChildFriendly";
import FavoriteIcon from "@material-ui/icons/Favorite";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { useHistory, useLocation } from "react-router-dom";
import "react-summernote/dist/react-summernote.css"; // import styles
import { Spinner } from "reactstrap";
import { Message } from "semantic-ui-react";
import { calculateGestationalAge } from "../../utils";
import moment from "moment";
import { GET_CODESETS_IN_BATCH } from "../../../utils";

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

// Maps display text values to codeset codes for records saved from mobile app
const normalizeCodesetValue = (value, codesetList) => {
  if (!value || !codesetList || codesetList.length === 0) return value;
  if (codesetList.some((item) => item.code === value)) return value;
  const match = codesetList.find(
    (item) =>
      item.display &&
      item.display.toLowerCase().trim() === String(value).toLowerCase().trim()
  );
  return match ? match.code : value;
};

const AncPnc = (props) => {
  const patientObj = props.patientObj;
  let history = useHistory();

  const location = useLocation();
  const locationState = location && location.state ? location.state : null;
  const [regimenType, setRegimenType] = useState([]);
  const classes = useStyles();
  const [disabledField, setSisabledField] = useState(false);
  const [entryPoint, setentryPoint] = useState([]);
  const [entryPointValue, setentryPointValue] = useState("");
  const [timeMotherArt, setTimeMotherArt] = useState([]);
  const [disableHIVStatus, setDisableHIVStatus] = useState(false);
  const [autoPostPartumTiming, setAutoPostPartumTiming] = useState(false);

  const [tbStatus, setTbStatus] = useState([]);
  const [artStartTime, setartStartTime] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [entryValueDisplay, setEntryValueDisplay] = useState({});
  const [allNewEntryPoint, setAllNewEntryPoint] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [urinalysisList, setUrinalysisList] = useState([]);
  const [timeHivDiagnosis, setTimeHivDiagnosis] = useState([]);
  const [timeHivInitiation, setTimeHivInitiation] = useState([]);
  const [deliveryModeList, setDeliveryModeList] = useState([]);
  const [artUniqueNumber, setArtUniqueNumber] = useState("");
  const [maxARTDate, setMaxARTDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [minARTDate, setMinARTDate] = useState("");
  const [minPmtctEnrollmentDate, setMinPmtctEnrollmentDate] = useState(null);
  const [minDeliveryDate, setMinDeliveryDate] = useState(null);
  const [parityFromAnc, setParityFromAnc] = useState(null);

  // Get canProceedWithEnrollment from props (controlled by parent)
  const canProceedWithEnrollment = props.canProceedWithEnrollment ?? true;

  // Extract hivStatus calculation outside
  const getInitialHivStatus = () => {
    const statusMap = {
      reactive: "Positive",
      "non-reactive": "Negative",
      Positive: "Positive",
      Negative: "Negative",
    };
    return (
      statusMap[props.lastestConfirmatoryTest] ||
      patientObj?.hivStatus ||
      patientObj?.staticHivStatus ||
      props?.patientObj?.dynamicHivStatus ||
      ""
    );
  };

  const [enroll, setEnrollDto] = useState({
    hepatitisB: patientObj.hepatitisB || patientObj.hbvDetails?.testResult || "",
    urinalysis: patientObj.urinalysis || "",
    ancNo: patientObj.ancNo || "",
    pmtctEnrollmentDate: "",
    dateOfDelivery: "",
    expectedDeliveryDate: "",
    modeOfDelivery: patientObj.modeOfDelivery || "",
    modeOfDeliveryOther: patientObj.modeOfDeliveryOther || "",
    entryPoint: entryValueDisplay?.id,
    ga: "",
    gravida: props.patientObj.gravida,
    artStartDate: "",
    artStartTime: patientObj.artStartTime || "",
    id: "",
    timeOfHivDiagnosis: "",
    tbStatus: "",
    hivStatus: getInitialHivStatus(),
    lmp: props?.patientObj?.lmp || "",
    gaweeks: "",
    pmtctType: entryValueDisplay.display,
    // Syphilis details (MIP Card 9a-9c) - stored as JSONB
    syphilisDetails: patientObj.syphilisDetails || {
      testResult: "",
      treatment: "",
      drugName: "",
    },
    // HBV details (MIP Card 10b-10e) - stored as JSONB
    hbvDetails: patientObj.hbvDetails || {
      testResult: "",
      vlResultDate: "",
      vlResult: "",
      treatmentType: "",
      drugName: "",
    },
  });
  const [infantMotherArtDto, setInfantMotherArtDto] = useState({
    ancNumber: props.patientObj.ancNo,
    motherArtInitiationTime: "",
    motherArtRegimen: "",
    regimenTypeId: props?.patientObj?.regimenTypeId
      ? props?.patientObj?.regimenTypeId
      : "",
    regimenId: props?.patientObj?.regimenId ? props?.patientObj?.regimenId : "",
  });
  const RegimenType = (id) => {
    if (!id) return;
    axios
      .get(`${baseUrl}hiv/regimen/types/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setRegimenType(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const handleInputChangeInfantMotherArtDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    //console.log(e.target.name),
    setInfantMotherArtDto({
      ...infantMotherArtDto,
      [e.target.name]: e.target.value,
    });
  };
  const handleSelecteRegimen = (e) => {
    let regimenID = e.target.value;
    //regimenTypeId regimenId
    setInfantMotherArtDto({
      ...infantMotherArtDto,
      regimenTypeId: regimenID,
    });
    RegimenType(regimenID);
    //setErrors({...temp, [e.target.name]:""})
  };

  //GET AdultRegimenLine
  const AdultRegimenLine = () => {
    axios
      .get(`${baseUrl}hiv/regimen/arv/adult`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const artRegimen = response.data.filter(
          (x) => x.id === 1 || x.id === 2 || x.id === 14
        );
        setAdultRegimenLine(artRegimen);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const getPatientEntryType = (id) => {
    if (locationState.entrypointValue) {
      allNewEntryPoint.map((each, i) => {
        if (each.code === locationState.entrypointValue) {
          setEntryValueDisplay(each);
        }
      });
    } else if (props.entrypointValue) {
      props.allEntryPoint.map((each, i) => {
        if (each.code === props.entrypointValue) {
          setEntryValueDisplay(each);
        }
      });
    } else if (enroll.entryPoint) {
      // Fallback for view/update: match entry point from loaded enrollment data
      const entryCode = mapEntryPointToCode(enroll.entryPoint);
      allNewEntryPoint.forEach((each) => {
        if (each.code === entryCode) {
          setEntryValueDisplay(each);
        }
      });
    }
  };

  const createCycle = async () => {
    if (props.onEnrollPatient) {
      let payload2 = {
        patientUuid: patientObj.patientUuid ? patientObj.patientUuid : patientObj?.uuid,
        maternalOutcome: "",
        entryPoint: locationState.entrypointValue,
        hivStatus: patientObj?.dynamicHivStatus,
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
        
        (e);
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

  const checkPMTCTValidationDates = async (patientUuid) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/check-pmtct-validation-dates?patientUuid=${patientUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        if (
          response.data.hasPreviousEnrollment &&
          response.data.previousEnrollmentDate
        ) {
          setMinPmtctEnrollmentDate(response.data.previousEnrollmentDate);
        }
        if (
          response.data.hasPreviousDelivery &&
          response.data.previousDeliveryDate
        ) {
          setMinDeliveryDate(response.data.previousDeliveryDate);
        }
      }
    } catch (error) {
      console.log("Error checking PMTCT validation dates:", error);
    }
  };

  const getHistoricalHivStatus = async (patientUuid) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/get-historical-hiv-status`,
        {
          params: { patientUuid },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data === "POSITIVE") {
        // Auto-populate HIV status field
        setEnrollDto((prev) => ({
          ...prev,
          hivStatus: "Positive",
        }));
        toast.info(
          "Patient has a previous HIV positive record. HIV status auto-populated.",
          {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          }
        );
      }
    } catch (error) {
      console.log("Error fetching historical HIV status:", error);
    }
  };

  // Auto-populate serology fields from latest PMTCT HTS record
  const autoPopulateSerologyFromHts = async (patientUuid, pmtctCycleUuid) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/get-latest-pmtct-hts-enrollment/${patientUuid}?pmtctCycleUuid=${pmtctCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        const htsData = response.data;
        const updates = {};
        // Map syphilis from HTS to enrollment syphilisDetails
        if (htsData.syphilis) {
          const mapped = htsData.syphilis === "reactive" ? "Positive"
            : htsData.syphilis === "non-reactive" ? "Negative"
            : htsData.syphilis;
          updates.syphilisDetails = { ...enroll.syphilisDetails, testResult: mapped };
        }
        // Map full syphilis JSONB from HTS if available
        if (htsData.syphilisInfo) {
          updates.syphilisDetails = {
            testResult: htsData.syphilisInfo.testResult || updates.syphilisDetails?.testResult || "",
            treatment: htsData.syphilisInfo.treatment || "",
            drugName: htsData.syphilisInfo.drugName || "",
          };
        }
        // Map hepatitisB from HTS to enrollment
        let mappedHbv = "";
        if (htsData.hepatitisB) {
          mappedHbv = htsData.hepatitisB === "reactive" ? "Positive"
            : htsData.hepatitisB === "non-reactive" ? "Negative"
            : htsData.hepatitisB;
          updates.hepatitisB = mappedHbv;
        }
        // Map full HBV JSONB from HTS if available, always include testResult
        if (htsData.hbvInfo || mappedHbv) {
          updates.hbvDetails = {
            testResult: mappedHbv || "",
            vlResultDate: htsData.hbvInfo?.vlResultDate || "",
            vlResult: htsData.hbvInfo?.vlResult || "",
            treatmentType: htsData.hbvInfo?.treatmentType || htsData.hbvInfo?.treatment || "",
            drugName: htsData.hbvInfo?.drugName || "",
          };
        }
        if (Object.keys(updates).length > 0) {
          setEnrollDto((prev) => ({ ...prev, ...updates }));
          toast.info("Serology fields auto-populated from PMTCT HTS record.", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          });
        }
      }
    } catch (error) {
      // No HTS record found — try ANC fallback
      try {
        const ancResponse = await axios.get(
          `${baseUrl}pmtct/anc/get-anc-by-person?patientUuid=${patientUuid}&pmtctCycleUuid=${pmtctCycleUuid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (ancResponse.data) {
          const ancData = ancResponse.data;
          const updates = {};
          if (ancData.testResultSyphilis) {
            const mapped = ancData.testResultSyphilis === "reactive" ? "Positive"
              : ancData.testResultSyphilis === "non-reactive" ? "Negative"
              : ancData.testResultSyphilis;
            updates.syphilisDetails = { ...enroll.syphilisDetails, testResult: mapped };
          }
          if (ancData.hepatitisB) {
            const mapped = ancData.hepatitisB === "reactive" ? "Positive"
              : ancData.hepatitisB === "non-reactive" ? "Negative"
              : ancData.hepatitisB;
            updates.hepatitisB = mapped;
            updates.hbvDetails = { ...enroll.hbvDetails, testResult: mapped };
          }
          if (Object.keys(updates).length > 0) {
            setEnrollDto((prev) => ({ ...prev, ...updates }));
            toast.info("Serology fields auto-populated from ANC record.", {
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 3000,
            });
          }
        }
      } catch (ancError) {
        // No ANC record found either — fields remain blank for manual entry
      }
    }
  };

  // Auto-populate delivery from L&D form
  const autoPopulateDeliveryFromLD = async (patientUuid, pmtctCycleUuid) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/view-delivery-with-uuid/${patientUuid}/${pmtctCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        const deliveryData = response.data;
        const updates = {};
        if (deliveryData.dateOfDelivery) {
          updates.dateOfDelivery = deliveryData.dateOfDelivery;
        }
        if (deliveryData.modeOfDelivery) {
          updates.modeOfDelivery = deliveryData.modeOfDelivery;
        }
        if (Object.keys(updates).length > 0) {
          setEnrollDto((prev) => ({ ...prev, ...updates }));
          toast.info("Delivery fields auto-populated from Labour & Delivery record.", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          });
        }
      }
    } catch (error) {
      // No L&D record found — fields remain blank for manual entry
    }
  };

  const fetchParityFromAnc = async (patientUuid, pmtctCycleUuid) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/get-anc-by-person?patientUuid=${patientUuid}&pmtctCycleUuid=${pmtctCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.parity != null) {
        setParityFromAnc(response.data.parity);
      }
    } catch (error) {
      // No ANC record — parity validation skipped
    }
  };

  // Extract ART unique number from patient identifier
  const getArtUniqueNumber = () => {
    try {
      const identifierObj = patientObj?.identifier;
      if (identifierObj && identifierObj.identifier && Array.isArray(identifierObj.identifier)) {
        const artId = identifierObj.identifier.find(
          (id) => id.type === "UniqueId" || id.type === "HivUniqueId" || id.type === "ARTNumber"
        );
        if (artId && artId.value) {
          setArtUniqueNumber(artId.value);
        }
      }
    } catch (error) {
      // Could not extract ART number
    }
  };

  useEffect(() => {
    GET_CODESETS();
    checkTimingOfART(0);
    AdultRegimenLine();
    if (props?.patientObj.id) {
      getARTStartDate();
      // getHIVStatus(props?.patientObj?.identifier?.identifier[0]?.value,  props?.patientObj.uuid);
    }

    // Check validation dates for PMTCT enrollment and delivery
    const patientUuid =
      props?.patientObj?.uuid ||
      props?.patientObj?.patient_uuid ||
      locationState?.patientObj?.uuid ||
      locationState?.patientObj?.patient_uuid;
    if (patientUuid) {
      checkPMTCTValidationDates(patientUuid);
      getHistoricalHivStatus(patientUuid);
      getArtUniqueNumber();
    }
    console.log("PmtctEnrollment useEffect => activeContent:", JSON.stringify(props.activeContent));
    const pmtctRecordId = props.activeContent?.id;
    const pmtctActionType = props.activeContent?.actionType;
    if (pmtctRecordId && pmtctRecordId !== "" && pmtctActionType !== "create") {
      console.log("PmtctEnrollment => UPDATE/VIEW mode, fetching record:", pmtctRecordId);
      GetPatientPMTCT(pmtctRecordId);
      setSisabledField(pmtctActionType === "view");
    }
    if (!props.activeContent.id && props.htsHivStatus) {
      let result = getInitialHivStatus();
      setEnrollDto({
        ...enroll,
        hivStatus: result ? result : props.htsHivStatus,
      });
    }
    const resolvedPatientUuid =
      props?.patientObj?.patient_uuid ||
      locationState?.patientObj?.patient_uuid ||
      props?.patientObj?.patientUuid ||
      locationState?.patientObj?.patientUuid ||
      props?.patientObj?.uuid ||
      locationState?.patientObj?.uuid;
    if (resolvedPatientUuid) {
      setEnrollDto({
        ...enroll,
        patientUuid: resolvedPatientUuid,
      });
    }

    if (props.showLastHivTestMessage) {
      toast.info("Last HIV test was Positive", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
    // Fetch parity for gravida validation (both create and edit modes)
    if (patientUuid && props?.latestPmtctCycle?.uuid) {
      fetchParityFromAnc(patientUuid, props.latestPmtctCycle.uuid);
    }
    // Auto-populate serology from HTS on create mode only
    if (!props.activeContent.id && patientUuid && props?.latestPmtctCycle?.uuid) {
      autoPopulateSerologyFromHts(patientUuid, props.latestPmtctCycle.uuid);
      autoPopulateDeliveryFromLD(patientUuid, props.latestPmtctCycle.uuid);
    }
  }, []);

  useEffect(() => {
    // if (props?.allEntryPoint) {
    getPatientEntryType();
    // }
  }, [allNewEntryPoint, enroll.entryPoint]);

  useEffect(() => {
    if (props.getPMTCTInfo && canProceedWithEnrollment) {
      props.getPMTCTInfo(enroll);
    }
  }, [enroll, canProceedWithEnrollment]);

  useEffect(() => {
   
    if (props.lastestConfirmatoryTest) {
      setEnrollDto({ ...enroll, hivStatus: getInitialHivStatus() });
    }
  }, [props.lastestConfirmatoryTest]);

  // Normalize codeset display values to codes for records saved from mobile app
  const normalizedRecordRef = useRef(null);
  useEffect(() => {
    const recordId = props.activeContent?.id;
    const actionType = props.activeContent?.actionType;
    if (actionType === "create") return;
    if (!recordId || normalizedRecordRef.current === recordId) return;
    if (!enroll.pmtctEnrollmentDate) return; // record data not loaded yet
    if (artStartTime.length === 0 && tbStatus.length === 0) return; // codesets not loaded yet

    const fieldMappings = [
      { field: "artStartTime", codesets: artStartTime },
      { field: "timeOfHivDiagnosis", codesets: timeHivDiagnosis },
      { field: "tbStatus", codesets: tbStatus },
      { field: "urinalysis", codesets: urinalysisList },
      { field: "modeOfDelivery", codesets: deliveryModeList },
    ];

    const updates = {};
    let hasChanges = false;
    fieldMappings.forEach(({ field, codesets }) => {
      if (enroll[field] && codesets.length > 0) {
        const normalized = normalizeCodesetValue(enroll[field], codesets);
        if (normalized !== enroll[field]) {
          updates[field] = normalized;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      console.log("PmtctEnrollment: Normalizing codeset display values to codes:", updates);
      setEnrollDto((prev) => ({ ...prev, ...updates }));
    }
    normalizedRecordRef.current = recordId;
  }, [
    enroll.pmtctEnrollmentDate,
    enroll.artStartTime,
    enroll.tbStatus,
    artStartTime,
    timeHivDiagnosis,
    tbStatus,
    urinalysisList,
    deliveryModeList,
  ]);

  const calculateExpectedDate = (lmp) => {
    let LastPeriod = moment(lmp);
    let expectedDeliveryDate = LastPeriod.add(40, "weeks");
    // enroll.expectedDeliveryDate = expectedDeliveryDate.format('YYYY-MM-DD')

    // console.log("EED Calculation",LastPeriod, expectedDeliveryDate, expectedDeliveryDate.format('YYYY-MM-DD') )
    return expectedDeliveryDate.format("YYYY-MM-DD");
  };

  const isHivStatusDisabled = () => {
    return (
      disableHIVStatus ||
      props.lastestConfirmatoryTest ||
      patientObj?.ancNo ||
      props?.patientObj?.dynamicHivStatus
    );
  };

  // BATCH API
  const GET_CODESETS = () => {
    GET_CODESETS_IN_BATCH(
      "TIMING_MOTHERS_ART_INITIATION",
      "PMTCT_URINALYSIS_RESULT",
      "PERIOD_DIAGNOSED_HIV",
      "PMTCT_ENTRY_POINT",
      "POINT_ENTRY_PMTCT",
      "TIMING_MOTHERS_ART_INITIATION",
      "TB_STATUS",
      "MODE_DELIVERY"
    ).then((response) => {
      setTimeHivInitiation(response.data.TIMING_MOTHERS_ART_INITIATION);
      setUrinalysisList(response.data.PMTCT_URINALYSIS_RESULT);
      setTimeHivDiagnosis(response.data.PERIOD_DIAGNOSED_HIV);
      setAllNewEntryPoint(response.data.PMTCT_ENTRY_POINT);
      setartStartTime(response.data.TIMING_MOTHERS_ART_INITIATION);
      setTbStatus(response.data.TB_STATUS);
      setDeliveryModeList(response.data.MODE_DELIVERY || []);
    });
  };
  //END OF BATCH API

  // Map short entry point values back to codeset codes for dropdown matching
  const mapEntryPointToCode = (ep) => {
    if (!ep) return "";
    const mapping = {
      "ANC": "PMTCT_ENTRY_POINT_ANC",
      "L&D": "PMTCT_ENTRY_POINT_L&D",
      "Post-partum": "PMTCT_ENTRY_POINT_POST-PARTUM",
    };
    // If already a codeset code, return as-is
    if (ep.startsWith("PMTCT_ENTRY_POINT_")) return ep;
    return mapping[ep] || ep;
  };

  const GetPatientPMTCT = (id) => {
    console.log("GetPatientPMTCT => calling view-pmtct-enrollment with id:", id);
    axios
      .get(
        `${baseUrl}pmtct/anc/view-pmtct-enrollment/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        console.log("GetPatientPMTCT => response:", response.data);
        const data = response.data;
        // Strip null/undefined values so they don't overwrite existing form defaults
        const sanitized = {};
        Object.keys(data).forEach((key) => {
          if (data[key] !== null && data[key] !== undefined) {
            sanitized[key] = data[key];
          }
        });
        // Map entryPoint back to codeset code so the dropdown renders correctly
        if (sanitized.entryPoint) {
          sanitized.entryPoint = mapEntryPointToCode(sanitized.entryPoint);
        }
        // Populate hepatitisB from hbvDetails.testResult so the dropdown shows the saved value
        const hepatitisB = sanitized.hbvDetails?.testResult || sanitized.hepatitisB || enroll.hepatitisB || "";
        setEnrollDto({ ...enroll, ...sanitized, hepatitisB });
        // Set entryValueDisplay so the "Point of Entry" label renders correctly
        if (sanitized.entryPoint && allNewEntryPoint.length > 0) {
          const matchedEntry = allNewEntryPoint.find(
            (ep) => ep.code === sanitized.entryPoint
          );
          if (matchedEntry) {
            setEntryValueDisplay(matchedEntry);
          }
        }
        if (sanitized.entryPoint === "PMTCT_ENTRY_POINT_ANC" || entryValueDisplay.code === "PMTCT_ENTRY_POINT_ANC") {
          calculateExpectedDate(data.lmp);
        }
        setInfantMotherArtDto({
          ...infantMotherArtDto,
          regimenTypeId: data.regimenTypeId,
          regimenId: data.regimenId,
          motherArtInitiationTime: data.motherArtInitiationTime,
        });
        RegimenType(data.regimenTypeId);
      })
      .catch((error) => {
        console.error("GetPatientPMTCT => error:", error);
      });
  };

  //   public int calculateGaFromPmtct(String patientUuid, LocalDate visitDate) {
  //     LocalDate lmp = getLMPFromPMTCT(patientUuid);
  //     int ga = (int) ChronoUnit.WEEKS.between(lmp, visitDate);
  //     if (ga < 0) ga = 0;
  //     return ga;
  // }

  const updateMaxARTDate = (action) => {
    if (action === "pp" || action === "ld") {
      let MAT = enroll.pmtctEnrollmentDate ? enroll.pmtctEnrollmentDate : "";
      setMinARTDate(MAT);
    } else if (action === "prior") {
      let MAT = "";
      setMinARTDate(MAT);
    } else if (action === "ga") {
      let MAT = enroll.lmp ? enroll.lmp : "";

      setMinARTDate(MAT);
    }
  };
  const checkTimingOfART = (ga) => {
    setAutoPostPartumTiming(true);
    let GA = parseInt(ga);

    if (
      locationState.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM" ||
      props.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"
    ) {
      enroll.artStartTime =
        "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)";
      updateMaxARTDate("pp");
    } else if (
      locationState.entrypointValue === "PMTCT_ENTRY_POINT_L&D" ||
      props.entrypointValue === "PMTCT_ENTRY_POINT_L&D"
    ) {
      enroll.artStartTime =
        "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AT_L&D";
      updateMaxARTDate("pp");
    } else {
      if (GA < 36) {
        enroll.artStartTime =
          "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_<_36_WEEKS_GESTATION_PERIOD";
        updateMaxARTDate("ga");
      } else if (GA >= 36) {
        updateMaxARTDate("ga");

        enroll.artStartTime =
          "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_>_36_WEEKS_GESTATION_PERIOD";
      } else {
        updateMaxARTDate("prior");
      }
    }

    // if(locationState.entrypointValue  === "PMTCT_ENTRY_POINT_POST-PARTUM" || props.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"){
    //   setAutoPostPartumTiming(true)
    // setEnrollDto({...enroll, artStartTime: "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)"})
    // }
  };

  const calculateGaFromPmtct = (deliveryDate) => {
    // substract lmp - delivery date
    let LastPeriod = enroll.lmp;

    let lmp = moment(enroll.lmp);

    if (LastPeriod) {
      let dateOfDelivery = moment(deliveryDate);
      return dateOfDelivery.diff(lmp, "weeks");
    } else {
      return 0;
    }
  };
  const getARTStartDate = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/art/?PersonUuid=${
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
        const artData = response.data[0];
        if (artData) {
          if (artData.artStartDate) {
            setEnrollDto((prev) => ({
              ...prev,
              artStartDate: artData.artStartDate,
            }));
          }
          if (artData.regimenTypeId) {
            setInfantMotherArtDto((prev) => {
              const updates = {};
              if (!prev.regimenTypeId) {
                updates.regimenTypeId = String(artData.regimenTypeId);
              }
              if (!prev.regimenId && artData.regimenId) {
                updates.regimenId = String(artData.regimenId);
              }
              if (Object.keys(updates).length > 0) {
                return { ...prev, ...updates };
              }
              return prev;
            });
            RegimenType(artData.regimenTypeId);
          }
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const handleSyphilisDetailsChange = (e) => {
    const updated = { ...enroll.syphilisDetails, [e.target.name]: e.target.value };
    // Clear dependent fields when testResult changes to Negative
    if (e.target.name === "testResult" && e.target.value === "Negative") {
      updated.treatment = "";
      updated.drugName = "";
    }
    // Clear drugName when treatment changes to No
    if (e.target.name === "treatment" && e.target.value === "No") {
      updated.drugName = "";
    }
    setEnrollDto({ ...enroll, syphilisDetails: updated });
  };

  const handleHbvDetailsChange = (e) => {
    setEnrollDto({
      ...enroll,
      hbvDetails: { ...enroll.hbvDetails, [e.target.name]: e.target.value },
    });
  };

  const handleInputChangeEnrollmentDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });

    setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
    // Sync hepatitisB into hbvDetails.testResult so backend persists it
    if (e.target.name === "hepatitisB") {
      setEnrollDto((prev) => ({
        ...prev,
        hepatitisB: e.target.value,
        hbvDetails: { ...prev.hbvDetails, testResult: e.target.value },
      }));
    }
    // Clear modeOfDeliveryOther when modeOfDelivery changes away from Others
    if (e.target.name === "modeOfDelivery" && e.target.value !== "MODE_DELIVERY_OTHERS") {
      setEnrollDto({ ...enroll, [e.target.name]: e.target.value, modeOfDeliveryOther: "" });
    }
    // artStartTime
    if (e.target.name === "artStartTime" && e.target.value !== "") {
      setEnrollDto({ ...enroll, [e.target.name]: e.target.value });

      setInfantMotherArtDto({
        ...infantMotherArtDto,
        motherArtInitiationTime: e.target.value,
      });

      if (
        e.target.value ===
          "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)" ||
        e.target.value === "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AT_L&D"
      ) {
        updateMaxARTDate("pp");
      } else if (
        e.target.value ===
          "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_>_36_WEEKS_GESTATION_PERIOD" ||
        e.target.value ===
          "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_<_36_WEEKS_GESTATION_PERIOD"
      ) {
        updateMaxARTDate("ga");
      } else {
        updateMaxARTDate("prior");
      }
    } else if (e.target.name === "hivStatus") {
      if (e.target.value !== "Positive") {
        toast.error("Cannot enroll negative client on PMTCT");
      }
    } else if (e.target.name === "lmp" && e.target.value !== "") {
      let response = calculateGestationalAge(
        enroll.pmtctEnrollmentDate,
        e.target.value
      );

      if (response > 0) {
        enroll.gaweeks = response;
        let EDD = calculateExpectedDate(e.target.value);
        setEnrollDto({
          ...enroll,
          [e.target.name]: e.target.value,
          dateOfDelivery: "",
          expectedDeliveryDate: EDD,
        });
      } else {
        // enroll.gaweeks = response;
        toast.error("Please select a valid date");
        setEnrollDto({ ...enroll, [e.target.name]: "", dateOfDelivery: "" });
      }

      // }
      // getGa();
    } else if (
      e.target.name === "pmtctEnrollmentDate" &&
      e.target.value !== "" &&
      enroll.lmp !== ""
    ) {
      let response = calculateGestationalAge(e.target.value, enroll.lmp);
      if (response > 0) {
        checkTimingOfART(response);

        enroll.gaweeks = response;
      } else {
        // enroll.gaweeks = response;
        toast.error("Please select a valid date");
        // setEnrollDto({ ...enroll, [e.target.name]: e.target.value  });
      }
      let EDD = calculateExpectedDate(enroll.lmp);
      setEnrollDto({
        ...enroll,
        [e.target.name]: e.target.value,
        expectedDeliveryDate: EDD,
      });
    } else if (e.target.name === "dateOfDelivery" && e.target.value !== "") {
      let Ga = calculateGaFromPmtct(e.target.value);

      if (Ga > 0) {
        enroll.gaweeks = Ga;
        setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
      } else {
        enroll.gaweeks = Ga;
        toast.error("Please select a valid date");
        setEnrollDto({
          ...enroll,
          [e.target.name]: e.target.value,
          gaweeks: "",
        });
      }
    } else {
      setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
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
          setEnrollDto({ ...enroll, hivStatus: response.data });
          setDisableHIVStatus(true);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    temp.pmtctEnrollmentDate = enroll.pmtctEnrollmentDate
      ? ""
      : "This field is required";
    temp.gravida = enroll.gravida ? "" : "This field is required";
    if (!temp.gravida && parityFromAnc !== null && parseInt(enroll.gravida) < parseInt(parityFromAnc)) {
      temp.gravida = "Gravida should not be less than Parity";
    }
    temp.timeOfHivDiagnosis = enroll.timeOfHivDiagnosis
      ? ""
      : "This field is required";
    // GA validation: must be between 4 and 45 weeks
    if (!enroll.gaweeks) {
      temp.gaweeks = "This field is required";
    } else if (parseInt(enroll.gaweeks) < 4 || parseInt(enroll.gaweeks) > 45) {
      temp.gaweeks = "Gestational age must be between 4 and 45 weeks";
    } else {
      temp.gaweeks = "";
    }

    // ART Start Date and Timing — conditional: required unless Period of HIV Diagnosis is HIV Negative
    if (enroll.timeOfHivDiagnosis === "PERIOD_DIAGNOSED_HIV_HIV_NEGATIVE") {
      temp.artStartDate = "";
      temp.artStartTime = "";
    } else {
      temp.artStartDate = enroll.artStartDate ? "" : "This field is required";
      temp.artStartTime = enroll.artStartTime ? "" : "This field is required";
    }

    temp.hivStatus = enroll.hivStatus ? "" : "This field is required";
    temp.syphilisTestResult = enroll.syphilisDetails?.testResult ? "" : "This field is required";
    temp.hepatitisB = enroll.hepatitisB ? "" : "This field is required";

    // Accept all positive HIV status variants (Positive, Known Positive, HIV_STATUS_POSITIVE, etc.)
    const hivNormalized = (enroll.hivStatus || "").toString().toUpperCase();
    temp.hivStatus =
      hivNormalized.includes("POSITIVE")
        ? ""
        : "Cannot enroll negative client on PMTCT";

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure hepatitisB test result is synced into hbvDetails before submit
    enroll.hbvDetails = { ...enroll.hbvDetails, testResult: enroll.hepatitisB };
    enroll.motherArtInitiationTime = infantMotherArtDto.motherArtInitiationTime;
    enroll.regimenTypeId = infantMotherArtDto.regimenTypeId;
    enroll.regimenId = infantMotherArtDto.regimenId;
    enroll.ga = enroll.gaweeks;

    let pmtctCycleUuid;
    // Create cycle if needed
    if (props.onEnrollPatient) {
      const checkIfCycleIsCreated = await createCycle();
      enroll.pmtctCycleUuid = checkIfCycleIsCreated?.response?.uuid;
      pmtctCycleUuid = checkIfCycleIsCreated?.response?.uuid;

      if (!checkIfCycleIsCreated?.status) {
        toast.error("Failed to create cycle", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return; // Exit if cycle creation fails
      }
    } else {
      enroll.pmtctCycleUuid = props?.latestPmtctCycle?.uuid;
    }

    if (validate()) {
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType === "update") {
        //Perform operation for update action
        axios
          .put(
            `${baseUrl}pmtct/anc/update-pmtct-enrollment/${props.activeContent.id}`,
            { ...enroll, source: enroll.source || "WEB" },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((response) => {
            setSaving(false);
            //props.patientObj.commenced=true
            toast.success("Record updated successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch((error) => {
            setSaving(false);
            toast.error("Something went wrong", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      } else {
        //perform operation for save action
        let payload = {
          
          ...enroll,
          entryPoint: locationState.entrypointValue
            ? locationState.entrypointValue
            : props.entrypointValue,
          patientUuid:
            props.patientObj.patient_uuid
              || props.patientObj.patientUuid
              || props.patientObj.uuid
              || (locationState && locationState.patientObj
                ? (locationState.patientObj.patientUuid || locationState.patientObj.uuid)
                : undefined),
          pmtctCycleUuid: pmtctCycleUuid || props?.latestPmtctCycle?.uuid,
          source: "WEB",
        };

        axios
          .post(`${baseUrl}pmtct/anc/pmtct-enrollment`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            props.patientObj.pmtctRegStatus = true;
            toast.success("Enrollment save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            if (props.handleRoute) {
              props.handleRoute(response.data);
            } else {
              props.setActiveContent({
                ...props.activeContent,
                route: "recent-history",
              });
            }
          })
          .catch((error) => {
            console.log(error);
            setSaving(false);
            toast.error("Something went wrong", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      }
    }
  };

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row ">
              <div
                className="card-header mb-3 "
                style={{
                  backgroundColor: "#ffffff",
                  color: "#1a202c",
                  fontWeight: "bolder",
                  borderRadius: "0.2rem",
                  marginTop: "-20px",
                  borderLeft: "4px solid #014d88",
                  borderBottom: "2px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <h5 className="card-title" style={{ color: "#014d88", fontWeight: "700", marginBottom: "4px" }}>
                  Mother Infant Pair Card
                </h5>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ color: "#718096", fontSize: "13px", fontWeight: "500" }}>
                    Mother's Clinical Information
                  </span>
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#e8f0fe",
                    color: "#014d88",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: "1px solid #ccdcf0"
                  }}>
                    Point of Entry: <strong>{entryValueDisplay.display}</strong>
                  </span>
                </div>
              </div>

              {/* === Enrollment Details (bordered container) === */}
              <div className="col-md-12 mb-3 mt-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "#f0f4f8", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <EventNoteIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Enrollment Details
                  </h6>
                  <div className="row">
                    {patientObj.ancNo && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>ANC ID</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="ancNo"
                              id="ancNo"
                              onChange={handleInputChangeEnrollmentDto}
                              value={patientObj.ancNo}
                              disabled
                            />
                          </InputGroup>
                          {errors.ancNo !== "" ? (
                            <span className={classes.error}>{errors.ancNo}</span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                    {artUniqueNumber && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Unique ART Number</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="artUniqueNumber"
                              id="artUniqueNumber"
                              value={artUniqueNumber}
                              disabled
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                    )}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date of Enrollment into PMTCT <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="pmtctEnrollmentDate"
                            id="pmtctEnrollmentDate"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.pmtctEnrollmentDate}
                            min={
                              minPmtctEnrollmentDate
                                ? minPmtctEnrollmentDate
                                : patientObj.ancNo
                                  ? props.patientObj.dateOfEnrollment
                                  : props?.newRegDate
                                    ? props?.newRegDate
                                    : ""
                            }
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.pmtctEnrollmentDate !== "" ? (
                          <span className={classes.error}>{errors.pmtctEnrollmentDate}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date Of Last Menstrual Period
                          <span style={{ color: "red" }}>*</span>{" "}
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="lmp"
                            id="lmp"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.lmp}
                            max={
                              enroll.pmtctEnrollmentDate
                                ? enroll.pmtctEnrollmentDate
                                : moment(new Date()).format("YYYY-MM-DD")
                            }
                            min={moment().subtract(294, "days").format("YYYY-MM-DD")}
                            disabled={disabledField || props?.ancEntryType}
                          />
                        </InputGroup>
                        {errors.lmp !== "" ? (
                          <span className={classes.error}>{errors.lmp}</span>
                        ) : (
                          ""
                        )}
                        {enroll.gaweeks === 0 ? (
                          <span className={classes.error}>Invalid date </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Gestational Age (Weeks){" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="gaweeks"
                            id="gaweeks"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.gaweeks}
                            disabled
                          />
                        </InputGroup>
                        {errors.gaweeks !== "" ? (
                          <span className={classes.error}>{errors.gaweeks}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === ART Information (bordered container) === */}
              <div className="col-md-12 mb-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "#f0f4f8", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <LocalHospitalIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />ART Information
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Gravida <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="gravida"
                            id="gravida"
                            min="1"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.gravida}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.gravida !== "" ? (
                          <span className={classes.error}>{errors.gravida}</span>
                        ) : (
                          ""
                        )}
                        {parityFromAnc !== null && enroll.gravida &&
                          parseInt(enroll.gravida) < parseInt(parityFromAnc) && (
                          <span className={classes.error}>Gravida should not be less than Parity</span>
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Timing of ART Initiation{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="artStartTime"
                            id="artStartTime"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.artStartTime}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {artStartTime.map((value, index) => (
                              <option key={index} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.artStartTime !== "" ? (
                          <span className={classes.error}>{errors.artStartTime}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Art Start Date <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="artStartDate"
                            id="artStartDate"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.artStartDate}
                            max={maxARTDate}
                            min={minARTDate}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.artStartDate !== "" ? (
                          <span className={classes.error}>{errors.artStartDate}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Period of HIV Diagnosis{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="timeOfHivDiagnosis"
                            id="timeOfHivDiagnosis"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.timeOfHivDiagnosis}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {timeHivDiagnosis.map((value, index) => (
                              <option key={index} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.timeOfHivDiagnosis !== "" ? (
                          <span className={classes.error}>{errors.timeOfHivDiagnosis}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>TB Status</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="tbStatus"
                            id="tbStatus"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.tbStatus}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {tbStatus.map((value, index) => (
                              <option key={index} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Urinalysis</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="urinalysis"
                            id="urinalysis"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.urinalysis}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {urinalysisList.map((value, index) => (
                              <option key={index} value={value.code}>
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

              {/* === Regimen (bordered container) === */}
              <div className="col-md-12 mb-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "#f0f4f8", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <ListAltIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Regimen
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>Original Regimen Line </FormLabelName>
                        <InputGroup>
                          <Input
                            type="select"
                            name="regimenTypeId"
                            id="regimenTypeId"
                            value={infantMotherArtDto.regimenTypeId}
                            onChange={handleSelecteRegimen}
                            required
                            style={{
                              border: "1px solid #d2d6dc",
                              borderRadius: "0.25rem",
                            }}
                            disabled={disabledField}
                          >
                            <option value=""> Select</option>
                            {adultRegimenLine.map((value) => (
                              <option key={value.id} value={value.id}>
                                {value.description}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.regimenTypeId !== "" ? (
                          <span className={classes.error}>{errors.regimenTypeId}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>Original Regimen </FormLabelName>
                        <Input
                          type="select"
                          name="regimenId"
                          id="regimenId"
                          value={infantMotherArtDto.regimenId}
                          onChange={handleInputChangeInfantMotherArtDto}
                          style={{
                            border: "1px solid #d2d6dc",
                            borderRadius: "0.25rem",
                          }}
                          disabled={disabledField}
                        >
                          <option value=""> Select</option>
                          {regimenType.map((value) => (
                            <option key={value.id} value={value.code}>
                              {value.description}
                            </option>
                          ))}
                        </Input>
                        {errors.regimenId !== "" ? (
                          <span className={classes.error}>{errors.regimenId}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Syphilis (bordered container) === */}
              <div className="col-md-12 mb-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "#f0f4f8", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <HealingIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Syphilis
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Syphilis Testing <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="testResult"
                            id="syphilisTestResult"
                            onChange={handleSyphilisDetailsChange}
                            value={enroll.syphilisDetails?.testResult || ""}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                          </Input>
                        </InputGroup>
                        {errors.syphilisTestResult !== "" ? (
                          <span className={classes.error}>{errors.syphilisTestResult}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {enroll.syphilisDetails?.testResult === "Positive" && (
                    <>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Syphilis Treatment</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="treatment"
                            id="syphilisTreatment"
                            onChange={handleSyphilisDetailsChange}
                            value={enroll.syphilisDetails?.treatment || ""}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {enroll.syphilisDetails?.treatment === "Yes" && (
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Syphilis Drug Name</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="drugName"
                            id="syphilisDrugName"
                            onChange={handleSyphilisDetailsChange}
                            value={enroll.syphilisDetails?.drugName || ""}
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
                  <h6 style={{ backgroundColor: "#f0f4f8", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <HealingIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Hepatitis B
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>HBV Testing Result <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hepatitisB"
                            id="hepatitisB"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.hepatitisB}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                          </Input>
                        </InputGroup>
                        {errors.hepatitisB !== "" ? (
                          <span className={classes.error}>{errors.hepatitisB}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    {enroll.hepatitisB === "Positive" && (
                      <>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>HBV VL Result Date</Label>
                            <InputGroup>
                              <Input
                                type="date"
                                onKeyPress={(e) => { e.preventDefault(); }}
                                name="vlResultDate"
                                id="vlResultDate"
                                onChange={handleHbvDetailsChange}
                                value={enroll.hbvDetails?.vlResultDate || ""}
                                max={moment(new Date()).format("YYYY-MM-DD")}
                                disabled={disabledField}
                              />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>HBV VL Result (Cp/ml)</Label>
                            <InputGroup>
                              <Input
                                type="number"
                                name="vlResult"
                                id="vlResult"
                                onChange={handleHbvDetailsChange}
                                value={enroll.hbvDetails?.vlResult || ""}
                                disabled={disabledField}
                                placeholder="Enter result in Cp/ml"
                              />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>HBV Treatment/Prophylaxis</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="treatmentType"
                                id="treatmentType"
                                onChange={handleHbvDetailsChange}
                                value={enroll.hbvDetails?.treatmentType || ""}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="None">None</option>
                                <option value="Treatment">Treatment</option>
                                <option value="Prophylaxis">Prophylaxis</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        {(enroll.hbvDetails?.treatmentType === "Treatment" || enroll.hbvDetails?.treatmentType === "Prophylaxis") && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>HBV Drug Name</Label>
                            <InputGroup>
                              <Input
                                type="text"
                                name="drugName"
                                id="drugName"
                                onChange={handleHbvDetailsChange}
                                value={enroll.hbvDetails?.drugName || ""}
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

              {/* === Delivery Information (bordered container) === */}
              <div className="col-md-12 mb-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "#f0f4f8", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <ChildFriendlyIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />Delivery Information
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Expected Date of Delivery</Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="expectedDeliveryDate"
                            id="expectedDeliveryDate"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.expectedDeliveryDate}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            min={
                              props?.ancEntryType
                                ? props?.patientObj?.lmp
                                : enroll.lmp
                            }
                            disabled={true}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Date of Delivery</Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="dateOfDelivery"
                            id="dateOfDelivery"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.dateOfDelivery}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            min={
                              [minDeliveryDate, enroll.pmtctEnrollmentDate, enroll.lmp, props?.patientObj?.dateOfEnrollment]
                                .filter(Boolean)
                                .sort()
                                .pop() || ""
                            }
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {enroll.gaweeks === 0 && enroll.lmp === "" ? (
                          <span className={classes.error}>
                            Last menstrual period date is empty{" "}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Mode of Delivery</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="modeOfDelivery"
                            id="modeOfDelivery"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.modeOfDelivery}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {deliveryModeList.map((value, index) => (
                              <option key={index} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {enroll.modeOfDelivery && enroll.modeOfDelivery === "MODE_DELIVERY_OTHERS" && (
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Specify</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="modeOfDeliveryOther"
                            id="modeOfDeliveryOther"
                            onChange={handleInputChangeEnrollmentDto}
                            value={enroll.modeOfDeliveryOther}
                            disabled={disabledField}
                            placeholder="Specify mode of delivery"
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    )}
                  </div>
                </div>
              </div>

              {/* === HIV Status (bordered container) === */}
              <div className="col-md-12 mb-3">
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.35rem",
                  padding: "15px 10px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h6 style={{ backgroundColor: "#f0f4f8", color: "#2d3748", padding: "8px 12px", borderRadius: "0.25rem", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                    <FavoriteIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />HIV Status
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          HIV Status <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hivStatus"
                            id="hivStatus"
                            value={enroll.hivStatus}
                            onChange={handleInputChangeEnrollmentDto}
                            disabled={true}
                          >
                            <option value="">Select</option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                          </Input>
                        </InputGroup>
                        {errors.hivStatus && (
                          <span className={classes.error}>{errors.hivStatus}</span>
                        )}
                        {enroll.hivStatus === "Positive" && (
                          <div className="mt-3">
                            <h3 style={{ color: "red" }}>Kindly refer for ART</h3>
                          </div>
                        )}
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div></div>
            {saving ? <Spinner /> : ""}
            <br />
            {props.hideUpdateButton &&
              props.activeContent?.actionType !== "view" && (
                <>
                  {props.activeContent &&
                  props.activeContent.actionType === "update" ? (
                    <>
                      <MatButton
                        type="submit"
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
                    </>
                  ) : (
                    <>
                      <MatButton
                        type="submit"
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
                    </>
                  )}
                </>
              )}

            {(props.activeContent?.actionType === "view" ||
              props.activeContent?.actionType === "update") && (
              <MatButton
                type="button"
                variant="contained"
                className={classes.button}
                startIcon={<CancelIcon />}
                style={{ backgroundColor: "#992E62", color: "#fff" }}
                onClick={() =>
                  props.setActiveContent({
                    ...props.activeContent,
                    route: "recent-history",
                    actionType: "",
                    id: "",
                  })
                }
              >
                <span style={{ textTransform: "capitalize" }}>Back</span>
              </MatButton>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AncPnc;
