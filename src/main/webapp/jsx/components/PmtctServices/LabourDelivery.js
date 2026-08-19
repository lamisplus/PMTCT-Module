import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  InputGroup,
} from "reactstrap";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import PersonIcon from "@material-ui/icons/Person";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import HealingIcon from "@material-ui/icons/Healing";
import FavoriteIcon from "@material-ui/icons/Favorite";
import EventIcon from "@material-ui/icons/Event";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "./../../../api";
import { Spinner } from "reactstrap";
import moment from "moment";
import { GET_CODESETS_IN_BATCH } from "../../../utils";
import { calculateGestationalAge } from "../../utils";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
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

const sectionContainerStyle = {
  border: "1px solid #e0e0e0",
  borderRadius: "0.35rem",
  padding: "15px 10px",
  backgroundColor: "#f8f9fa",
};

const sectionHeaderStyle = {
  backgroundColor: "transparent",
  color: "#2d3748",
  padding: "8px 12px",
  borderRadius: "0.25rem",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "12px",
};

const sectionIconStyle = {
  fontSize: "16px",
  color: "#014d88",
  marginRight: "6px",
  verticalAlign: "text-bottom",
};

// Maps display text values to codeset codes for records saved from mobile app
const normalizeCodesetValue = (value, codesetList) => {
  if (!value || !codesetList || codesetList.length === 0) return value;
  // Already matches a code — no change needed
  if (codesetList.some((item) => item.code === value)) return value;
  // Try matching by display (case-insensitive)
  const match = codesetList.find(
    (item) =>
      item.display &&
      item.display.toLowerCase().trim() === String(value).toLowerCase().trim()
  );
  return match ? match.code : value;
};

const LabourDelivery = (props) => {
  const patientObj = props.patientObj;
  const classes = useStyles();
  const [delieryMode, setDelieryMode] = useState([]);
  const [placeOfDelivery, setPlaceOfDelivery] = useState([]);
  const [feedingDecision, setfeedingDecision] = useState([]);
  const [maternalOutCome, setmaternalOutCome] = useState([]);
  const [newGa, setNewGa] = useState("");
  const [gaAutoCalculated, setGaAutoCalculated] = useState(false);
  // LMP is never persisted on the delivery record — GA (derived from it) is the field of
  // record, so storing LMP too would be redundant. For L&D entry it's user-typed here; for
  // ANC/Post-partum entry it's fetched read-only from the source record each time.
  const [lmp, setLmp] = useState("");
  const [saving, setSaving] = useState(false);
  const [disabledField, setSisabledField] = useState(false);
  const [errors, setErrors] = useState({});
  const [childStatus, setChildStatus] = useState([]);
  const [disableDeliveryDate, setDisableDeliveryDate] = useState(false);
  const [delivery, setDelivery] = useState({
    // Existing fields
    placeOfDelivery: "",
    artStartedLdWard: "",
    bookingStatus: "",
    childGivenArvWithin72: "",
    childStatus: "",
    dateOfDelivery: "",
    deliveryTime: "",
    episiotomy: "",
    feedingDecision: "",
    gaweeks: "",
    hbstatus: "",
    hcstatus: "",
    hivExposedInfantGivenHbWithin24hrs: "",
    nonHbvExposedInfantGivenHbWithin24hrs: "",
    maternalOutcome: "",
    maternalOutcomeChild: "",
    modeOfDelivery: "",
    modeOfDeliveryOther: "",
    onArt: "",
    referalSource: "",
    romDeliveryInterval: "",
    vaginalTear: "",
    numberOfInfantsAlive: "",
    numberOfInfantsDead: "",
    // NHMIS Labour Details (JSONB)
    labourDetails: {
      decisionSeekingCare: "",
      transportationIn: "",
      transportationInOther: "",
      parity: "",
      partographUsed: "",
      whoTookDelivery: "",
      whoTookDeliveryOther: "",
      nameOfDeliveryAttendant: "",
    },
    // NHMIS Maternal Interventions (JSONB)
    maternalInterventions: {
      receivedOxytocin: "",
      receivedMisoprostol: "",
      maternalComplication: "",
      eclampsiaReceivedMgso4: "",
      motherAdmittedReason: "",
      motherDischarged: "",
      motherReferredOut: "",
      motherReceivedPac: "",
      motherTransportationOut: "",
      mdaConducted: "",
    },
    // NHMIS Baby Info (JSONB)
    babyInfo: {
      aliveOutcomes: [],
      deadOutcomes: [],
      // Legacy flat fields kept for backward compat with old records
      babyAbortion: "",
      babyTimeOfDelivery: "",
      babyPreterm: "",
      babyNotBreathingAtBirth: "",
      babyResuscitated: "",
      babyLiveBirthWeight: "",
      babyStillBirthType: "",
      babyDeadWithin7Days: "",
      babyLiveBirthHivPositive: "",
      sexOfBaby: "",
    },
    // NHMIS Newborn Care (JSONB)
    newbornCare: {
      cordClampedTime: "",
      chxGelApplied: "",
      babyPutToBreast: "",
      temperatureAt1Hour: "",
    },
    // NHMIS Postpartum Info (JSONB)
    postpartumInfo: {
      ebfCounselled: "",
      postpartumFpCounselled: "",
      postpartumFpAccepted: "",
      postpartumFpMethod: "",
    },
    // System fields
    patientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid
      ? props.patientObj.patientUuid
      : props.patientObj.uuid,
    pmtctCycleUuid: props?.selectedCycleId || props?.latestPmtctCycle?.uuid,
    source: "WEB",
  });

  useEffect(() => {
    console.log("LabourDelivery useEffect => activeContent:", JSON.stringify(props.activeContent));
    GET_CODESETS();

    const recordId = props.activeContent?.id;
    const actionType = props.activeContent?.actionType;

    if (recordId && recordId !== "" && actionType !== "create") {
      console.log("LabourDelivery => UPDATE/VIEW mode, calling view-delivery with id:", recordId);
      GetPatientLabourDTO(recordId);
      setSisabledField(actionType === "view");
    } else {
      console.log("LabourDelivery => CREATE mode, calling getDateOfDelivery");
      getDateOfDelivery();
    }

    // ANC/Post-partum entry: LMP already exists on the source record — fetch it read-only
    // rather than asking the user to re-enter it. L&D entry has no such source, so it stays
    // a manual input (see the LMP field below).
    const entryPoint = props.entrypointValue || props.patientObj?.entryPoint;
    if (entryPoint && entryPoint !== "PMTCT_ENTRY_POINT_L&D") {
      fetchLmpFromSource();
    }
  }, [props.patientObj.id, props.activeContent]);

  const fetchLmpFromSource = () => {
    const patientUuid =
      props.patientObj.patient_uuid || props.patientObj.patientUuid || props.patientObj.uuid;
    const pmtctCycleUuid =
      props.selectedCycleId || props.latestPmtctCycle?.uuid || props.patientObj?.pmtctCycleUuid;
    if (!patientUuid || !pmtctCycleUuid) return;
    axios
      .get(
        `${baseUrl}pmtct/anc/lmp-from-person?patientUuid=${patientUuid}&pmtctCycleUuid=${pmtctCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.data) setLmp(response.data);
      })
      .catch((error) => {
        console.error("Error fetching LMP from source record:", error);
      });
  };

  const GetPatientLabourDTO = (id) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-delivery/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data;
        const sanitized = {};
        Object.keys(data).forEach((key) => {
          sanitized[key] = data[key] !== null && data[key] !== undefined ? data[key] : "";
        });

        // Set form state from the fetched record
        setDelivery((prev) => {
          const loadedBabyInfo = { ...prev.babyInfo, ...(data.babyInfo || {}) };

          // Legacy migration: wrap old flat fields into single-element arrays
          if (!loadedBabyInfo.aliveOutcomes || loadedBabyInfo.aliveOutcomes.length === 0) {
            if (loadedBabyInfo.sexOfBaby || loadedBabyInfo.babyTimeOfDelivery || loadedBabyInfo.babyPreterm
              || loadedBabyInfo.babyResuscitated || loadedBabyInfo.babyLiveBirthWeight || loadedBabyInfo.babyLiveBirthHivPositive) {
              loadedBabyInfo.aliveOutcomes = [{
                sexOfBaby: loadedBabyInfo.sexOfBaby || "",
                babyTimeOfDelivery: loadedBabyInfo.babyTimeOfDelivery || "",
                babyPreterm: loadedBabyInfo.babyPreterm || "",
                babyNotBreathingAtBirth: loadedBabyInfo.babyNotBreathingAtBirth || "",
                babyResuscitated: loadedBabyInfo.babyResuscitated || "",
                babyLiveBirthWeight: loadedBabyInfo.babyLiveBirthWeight || "",
                babyLiveBirthHivPositive: loadedBabyInfo.babyLiveBirthHivPositive || "",
              }];
            }
          }
          if (!loadedBabyInfo.deadOutcomes || loadedBabyInfo.deadOutcomes.length === 0) {
            if (loadedBabyInfo.babyAbortion || loadedBabyInfo.babyStillBirthType || loadedBabyInfo.babyDeadWithin7Days) {
              loadedBabyInfo.deadOutcomes = [{
                babyAbortion: loadedBabyInfo.babyAbortion || "",
                babyNotBreathingAtBirth: loadedBabyInfo.babyNotBreathingAtBirth || "",
                babyStillBirthType: loadedBabyInfo.babyStillBirthType || "",
                babyDeadWithin7Days: loadedBabyInfo.babyDeadWithin7Days || "",
              }];
            }
          }

          // Ensure arrays are always present
          if (!loadedBabyInfo.aliveOutcomes) loadedBabyInfo.aliveOutcomes = [];
          if (!loadedBabyInfo.deadOutcomes) loadedBabyInfo.deadOutcomes = [];

          return {
            ...prev,
            ...sanitized,
            labourDetails: { ...prev.labourDetails, ...(data.labourDetails || {}) },
            maternalInterventions: { ...prev.maternalInterventions, ...(data.maternalInterventions || {}) },
            babyInfo: loadedBabyInfo,
            newbornCare: { ...prev.newbornCare, ...(data.newbornCare || {}) },
            postpartumInfo: { ...prev.postpartumInfo, ...(data.postpartumInfo || {}) },
            patientUuid: sanitized.patientUuid || prev.patientUuid,
            pmtctCycleUuid: sanitized.pmtctCycleUuid || prev.pmtctCycleUuid,
            source: sanitized.source || "WEB",
          };
        });

        // Set GA from the record directly; recalculate only if missing
        if (data.gaweeks) {
          setNewGa(data.gaweeks);
          setGaAutoCalculated(true);
        } else if (data.dateOfDelivery) {
          // Only recalculate GA if not stored in the record (silent=true to avoid toast on load)
          getGestationalAge(data.dateOfDelivery, "dateOfDelivery", data.pmtctCycleUuid, true);
        }

        // Legacy records from before LMP stopped being persisted may still carry it under
        // labourDetails — reuse it so editing an old L&D record doesn't show a blank LMP.
        if (data.labourDetails?.lmp) {
          setLmp(data.labourDetails.lmp);
        }
      })
      .catch((error) => {
        console.error("Error fetching delivery record:", error);
      });
  };

  const getDateOfDelivery = () => {
    let pmtctCycleUuid =
      props.selectedCycleId || props.latestPmtctCycle?.uuid || props.patientObj?.pmtctCycleUuid;
    axios
      .get(
        `${baseUrl}pmtct/anc/get-delivery-date/${
          props.patientObj.patient_uuid
            ? props.patientObj.patient_uuid
            : props.patientObj.patientUuid
        }?pmtctCycleUuid=${pmtctCycleUuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data) {
          setDelivery((prev) => ({ ...prev, dateOfDelivery: response.data }));
          getGestationalAge(response.data, "dateOfDelivery");
        }
      })
      .catch((error) => {});
  };

  const GET_CODESETS = () => {
    GET_CODESETS_IN_BATCH(
      "MODE_DELIVERY",
      "FEEDING_DECISION",
      "MATERNAL_OUTCOME",
      "CHILD_STATUS_DELIVERY",
      "PLACE_OF_DELIVERY"
    ).then((response) => {
      setDelieryMode(response.data.MODE_DELIVERY);
      setfeedingDecision(response.data.FEEDING_DECISION);
      setmaternalOutCome(response.data.MATERNAL_OUTCOME);
      setChildStatus(response.data.CHILD_STATUS_DELIVERY);
      setPlaceOfDelivery(response.data.PLACE_OF_DELIVERY);
    });
  };

  // Normalize codeset display values to codes for records saved from mobile app
  const normalizedRecordRef = useRef(null);
  useEffect(() => {
    const recordId = props.activeContent?.id;
    const actionType = props.activeContent?.actionType;
    if (actionType === "create") return;
    if (!recordId || normalizedRecordRef.current === recordId) return;
    if (!delivery.dateOfDelivery) return; // record data not loaded yet
    if (delieryMode.length === 0 || maternalOutCome.length === 0) return; // codesets not loaded yet

    const fieldMappings = [
      { field: "modeOfDelivery", codesets: delieryMode },
      { field: "maternalOutcome", codesets: maternalOutCome },
      { field: "childStatus", codesets: childStatus },
      { field: "placeOfDelivery", codesets: placeOfDelivery },
    ];

    const updates = {};
    let hasChanges = false;
    fieldMappings.forEach(({ field, codesets }) => {
      if (delivery[field] && codesets.length > 0) {
        const normalized = normalizeCodesetValue(delivery[field], codesets);
        if (normalized !== delivery[field]) {
          updates[field] = normalized;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      console.log("Normalizing codeset display values to codes:", updates);
      setDelivery((prev) => ({ ...prev, ...updates }));
    }
    normalizedRecordRef.current = recordId;
  }, [
    delivery.dateOfDelivery,
    delivery.modeOfDelivery,
    delivery.maternalOutcome,
    delieryMode,
    maternalOutCome,
    childStatus,
    placeOfDelivery,
  ]);

  const getGestationalAge = async (value, name, overrideCycleUuid, silent) => {
    const ga = value;
    const pmtctCycleUuid =
      overrideCycleUuid || props.selectedCycleId || props.latestPmtctCycle?.uuid || props.patientObj?.pmtctCycleUuid;

    if (!pmtctCycleUuid) {
      return;
    }

    const response = await axios.get(
      `${baseUrl}pmtct/anc/calculate-ga-from-person?patientUuid=${
        props.patientObj.patient_uuid
          ? props.patientObj.patient_uuid
          : props.patientObj.patientUuid
          ? props.patientObj.patientUuid
          : props.patientObj.uuid
      }&visitDate=${ga}&pmtctCycleUuid=${pmtctCycleUuid}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
      }
    );
    if (response.data > 0) {
      setDelivery((prev) => ({ ...prev, gaweeks: response.data, dateOfDelivery: value }));
      setNewGa(response.data);
      setGaAutoCalculated(true);
    } else {
      setDelivery((prev) => ({ ...prev, dateOfDelivery: value }));
      setGaAutoCalculated(false);
    }
  };

  const isOtherModeOfDelivery = (value) => {
    if (!value) return false;
    if (value === "MODE_DELIVERY_OTHERS" || value === "MODE_DELIVERY_OTHER") return true;
    const match = delieryMode.find((m) => m.code === value);
    return match && match.display && match.display.toLowerCase().includes("other");
  };

  const handleInputChangeDeliveryDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "dateOfDelivery" && e.target.value !== "") {
      const today = moment(new Date()).format("YYYY-MM-DD");
      if (e.target.value > today) {
        toast.error("Date of Delivery cannot be a future date");
        return;
      }
      if (lmp && e.target.value < lmp) {
        toast.error("Date of Delivery cannot be earlier than the Date of LMP");
        return;
      }
      const enrollmentDate = props.patientObj.dateOfEnrollment || "";
      if (enrollmentDate && e.target.value < enrollmentDate) {
        toast.error("Date of Delivery cannot be earlier than the Date of ANC Registration");
        return;
      }
      getGestationalAge(e.target.value, e.target.name);
      // For L&D entry there's no source record for the backend GA lookup to find, so
      // recompute client-side from the already-typed LMP (if any) as well.
      const isLdEntry = (props.entrypointValue || props.patientObj?.entryPoint) === "PMTCT_ENTRY_POINT_L&D";
      if (isLdEntry && lmp) {
        const ga = calculateGestationalAge(e.target.value, lmp);
        if (ga > 0) {
          setNewGa(ga);
          setDelivery({ ...delivery, [e.target.name]: e.target.value, gaweeks: ga });
          return;
        }
      }
      setDelivery({ ...delivery, [e.target.name]: e.target.value });
    } else if (e.target.name === "gaweeks") {
      // Only restrict to digits (max 2, since the valid range 5-45 never exceeds 2 digits) —
      // don't reject the value here or partial input like "4" (on the way to "45") gets
      // blocked. The 5-45 range itself is enforced by validate() on submit.
      const val = e.target.value;
      if (val !== "" && !/^\d{0,2}$/.test(val)) return;
      setNewGa(val);
      setDelivery({ ...delivery, [e.target.name]: val });
    } else if (
      e.target.name === "numberOfInfantsAlive" ||
      e.target.name === "numberOfInfantsDead"
    ) {
      const val = e.target.value;
      if (val !== "" && (parseInt(val) < 0 || parseInt(val) > 10)) return;
      const newDelivery = { ...delivery, [e.target.name]: val };
      setErrors({ ...errors, numberOfInfantsAlive: "" });

      // Resize outcome arrays based on count
      const updatedBabyInfo = { ...newDelivery.babyInfo };
      if (e.target.name === "numberOfInfantsAlive") {
        const count = parseInt(val) || 0;
        const current = updatedBabyInfo.aliveOutcomes || [];
        updatedBabyInfo.aliveOutcomes = Array.from({ length: count }, (_, i) =>
          current[i] || {
            sexOfBaby: "", babyTimeOfDelivery: "", babyPreterm: "",
            babyNotBreathingAtBirth: "", babyResuscitated: "",
            babyLiveBirthWeight: "", babyLiveBirthHivPositive: "",
          }
        );
      }
      if (e.target.name === "numberOfInfantsDead") {
        const count = parseInt(val) || 0;
        const current = updatedBabyInfo.deadOutcomes || [];
        updatedBabyInfo.deadOutcomes = Array.from({ length: count }, (_, i) =>
          current[i] || {
            babyAbortion: "", babyNotBreathingAtBirth: "",
            babyStillBirthType: "", babyDeadWithin7Days: "",
          }
        );
      }
      newDelivery.babyInfo = updatedBabyInfo;

      setDelivery(newDelivery);
    } else if (e.target.name === "modeOfDelivery" && !isOtherModeOfDelivery(e.target.value)) {
      setDelivery({ ...delivery, [e.target.name]: e.target.value, modeOfDeliveryOther: "" });
    } else {
      setDelivery({ ...delivery, [e.target.name]: e.target.value });
    }
  };

  const handleLabourDetailsChange = (e) => {
    const updated = { ...delivery.labourDetails, [e.target.name]: e.target.value };
    if (e.target.name === "transportationIn" && e.target.value !== "Others") {
      updated.transportationInOther = "";
    }
    setDelivery({ ...delivery, labourDetails: updated });
  };

  // LMP lives in its own state (not delivery.labourDetails) since it's never persisted —
  // only used here to auto-calculate GA. Only editable for L&D entry (see field rendering).
  const handleLmpChange = (e) => {
    const value = e.target.value;
    setLmp(value);
    if (value && delivery.dateOfDelivery) {
      const ga = calculateGestationalAge(delivery.dateOfDelivery, value);
      if (ga > 0) {
        setNewGa(ga);
        setDelivery({ ...delivery, gaweeks: ga });
      }
    }
  };

  const handleMaternalInterventionsChange = (e) => {
    setDelivery({
      ...delivery,
      maternalInterventions: { ...delivery.maternalInterventions, [e.target.name]: e.target.value },
    });
  };

  const handleBabyInfoChange = (e) => {
    setDelivery({
      ...delivery,
      babyInfo: { ...delivery.babyInfo, [e.target.name]: e.target.value },
    });
  };

  const handleNewbornCareChange = (e) => {
    setDelivery({
      ...delivery,
      newbornCare: { ...delivery.newbornCare, [e.target.name]: e.target.value },
    });
  };

  const handlePostpartumInfoChange = (e) => {
    setDelivery({
      ...delivery,
      postpartumInfo: { ...delivery.postpartumInfo, [e.target.name]: e.target.value },
    });
  };

  const handleAliveOutcomeChange = (index, e) => {
    const updated = [...(delivery.babyInfo.aliveOutcomes || [])];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setDelivery({
      ...delivery,
      babyInfo: { ...delivery.babyInfo, aliveOutcomes: updated },
    });
  };

  const handleDeadOutcomeChange = (index, e) => {
    const updated = [...(delivery.babyInfo.deadOutcomes || [])];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setDelivery({
      ...delivery,
      babyInfo: { ...delivery.babyInfo, deadOutcomes: updated },
    });
  };

  const validate = () => {
    let temp = { ...errors };
    // artStartedLdWard validation removed — field hidden per feedback F6
    // placeOfDelivery validation removed — field hidden per feedback F3
    // vaginalTear validation removed — field hidden per feedback F5
    // onArt validation removed — field hidden per feedback F6
    temp.modeOfDelivery = delivery.modeOfDelivery
      ? ""
      : "This field is required";
    temp.maternalOutcome = delivery.maternalOutcome
      ? ""
      : "This field is required";
    const isLdEntry = (props.entrypointValue || props.patientObj?.entryPoint) === "PMTCT_ENTRY_POINT_L&D";
    if (isLdEntry) {
      // Optional, not required — L&D-entry clients (often unbooked/emergency deliveries)
      // frequently don't have a known LMP/GA. Still enforce the 5-45 week range if a value
      // is provided, whether typed manually or auto-calculated from the new LMP field.
      if (newGa && (parseInt(newGa) < 5 || parseInt(newGa) > 45)) {
        temp.gaweeks = "Gestational age must be between 5 and 45 weeks";
      } else {
        temp.gaweeks = "";
      }
    } else {
      temp.gaweeks = "";
    }
    // episiotomy validation removed — field hidden per feedback F4
    // deliveryTime validation removed — field hidden per feedback F6
    temp.dateOfDelivery = delivery.dateOfDelivery
      ? ""
      : "This field is required";
    // childStatus validation removed — field hidden
    // childGivenArvWithin72 validation removed — field hidden per feedback F6
    temp.bookingStatus = delivery.bookingStatus
      ? ""
      : "This field is required";
    if (!delivery.numberOfInfantsAlive && delivery.numberOfInfantsAlive !== 0) {
      temp.numberOfInfantsAlive = "This field is required";
    } else if (parseInt(delivery.numberOfInfantsAlive) < 0 || parseInt(delivery.numberOfInfantsAlive) > 10) {
      temp.numberOfInfantsAlive = "Value must be between 0 and 10";
    } else {
      temp.numberOfInfantsAlive = "";
    }
    if (delivery.numberOfInfantsDead === "") {
      temp.numberOfInfantsDead = "This field is required";
    } else if (parseInt(delivery.numberOfInfantsDead) < 0 || parseInt(delivery.numberOfInfantsDead) > 10) {
      temp.numberOfInfantsDead = "Value must be between 0 and 10";
    } else {
      temp.numberOfInfantsDead = "";
    }

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };

  // Create PMTCT cycle (used when LabourDelivery is on the enrollment page)
  const createCycle = async () => {
    const cyclePayload = {
      patientUuid: props.patientObj.patient_uuid
        || props.patientObj.patientUuid
        || props.patientObj.uuid,
      maternalOutcome: "",
      entryPoint: props.entrypointValue || props.patientObj?.entryPoint || "",
      hivStatus: props.patientObj?.dynamicHivStatus || "",
      pregnancyOutcome: "",
      numberOfInfants: 0,
      pmtctStatus: "INACTIVE",
      source: "WEB",
    };

    try {
      const response = await axios.post(
        `${baseUrl}pmtct/anc/pregnancy-cycle`,
        cyclePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response?.data) {
        return { status: true, response: response.data };
      } else {
        toast.error("Failed to create PMTCT cycle: no data returned");
        return { status: false, response: null };
      }
    } catch (e) {
      console.error("Cycle creation error:", e);
      toast.error(
        `${e?.response?.status || ""}: PMTCT cycle not created: ${e?.response?.data || e.message}`
      );
      return { status: false, response: null };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);

      // If on enrollment page, create cycle first
      if (props.onEnrollPatient && !delivery.pmtctCycleUuid) {
        try {
          const cycleResult = await createCycle();
          if (!cycleResult.status) {
            setSaving(false);
            return;
          }
          delivery.pmtctCycleUuid = cycleResult.response.uuid;
        } catch (err) {
          console.error("Cycle creation failed:", err);
          toast.error("Failed to create PMTCT cycle. Please try again.");
          setSaving(false);
          return;
        }
      }

      const isChildAlive = parseInt(delivery.numberOfInfantsAlive) >= 1;

      const defaultRoute = isChildAlive ? "infants" : "recent-history";

      // For L&D entry point on new create, navigate to PMTCT HTS after save
      const isLdEntryPoint =
        props.patientObj?.entryPoint === "PMTCT_ENTRY_POINT_L&D";

      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(
            `${baseUrl}pmtct/anc/update-delivery/${props.activeContent.id}`,
            delivery,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((response) => {
            setSaving(false);
            toast.success("Record updated successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: defaultRoute,
            });
          })
          .catch((error) => {
            setSaving(false);
            toast.error("Something went wrong", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      } else {
        axios
          .post(`${baseUrl}pmtct/anc/pmtct-delivery`, delivery, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            props.patientObj.deliveryStatus = true;
            toast.success("Record save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            // Enrollment page: navigate to patient-history via handleRoute
            if (props.onEnrollPatient && props.handleRoute) {
              const data = {
                ...props.patientObj,
                id: props.patientObj.id,
                pmtctCycleUuid: delivery.pmtctCycleUuid,
                entryPoint: props.entrypointValue || props.patientObj?.entryPoint,
                hospitalNumber: props.patientObj?.identifier?.identifier?.[0]?.value
                  || props.patientObj?.hospitalNumber,
              };
              props.handleRoute(data, { autoOpenRoute: "pmtct-hts" });
            } else if (isLdEntryPoint && props.setPmtctHtsRetestingType) {
              // L&D entry point in PatientDetail: navigate to PMTCT HTS form
              props.setPmtctHtsRetestingType("pmtct-hts");
              props.setActiveContent({
                ...props.activeContent,
                route: "pmtct-hts",
                actionType: "create",
                id: "",
                obj: {},
              });
            } else {
              props.setActiveContent({
                ...props.activeContent,
                route: defaultRoute,
              });
            }
          })
          .catch((error) => {
            setSaving(false);
            toast.error("Something went wrong", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      }
    } else {
      toast.error("All field are required", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
              {/* Card Header */}
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
                }}
              >
                <h5 style={{ color: "#0f172a", fontWeight: "700", marginBottom: "0", fontSize: "15px" }}>
                  Labour and Delivery
                </h5>
              </div>

              {/* === Patient & Booking Information === */}
              <div className="col-md-12 mb-3 mt-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <PersonIcon style={sectionIconStyle} />Patient & Booking Information
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Type of Client <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="bookingStatus"
                            id="bookingStatus"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.bookingStatus}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Booked">Booked</option>
                            <option value="Unbooked">Unbooked</option>
                          </Input>
                        </InputGroup>
                        {errors.bookingStatus !== "" ? (
                          <span className={classes.error}>{errors.bookingStatus}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Decision in Seeking Care</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="decisionSeekingCare"
                            id="decisionSeekingCare"
                            onChange={handleLabourDetailsChange}
                            value={delivery.labourDetails.decisionSeekingCare}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Less than 24 hours">&lt; 24 hours</option>
                            <option value="More than 24 hours">&gt; 24 hours</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Transportation In</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="transportationIn"
                            id="transportationIn"
                            onChange={handleLabourDetailsChange}
                            value={delivery.labourDetails.transportationIn}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Vehicle/Ambulance">Vehicle / Ambulance</option>
                            <option value="Others">Others</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {delivery.labourDetails.transportationIn === "Others" && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Specify</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="transportationInOther"
                              id="transportationInOther"
                              onChange={handleLabourDetailsChange}
                              value={delivery.labourDetails.transportationInOther}
                              disabled={disabledField}
                              placeholder="Specify transportation"
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                    )}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Parity</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="parity"
                            id="parity"
                            onChange={handleLabourDetailsChange}
                            value={delivery.labourDetails.parity}
                            min="0"
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Delivery Details === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <EventIcon style={sectionIconStyle} />Delivery Details
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date of Delivery <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="dateOfDelivery"
                            id="dateOfDelivery"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.dateOfDelivery}
                            min={(() => {
                              const enrollment = props.patientObj.dateOfEnrollment || "";
                              if (enrollment && lmp) return enrollment > lmp ? enrollment : lmp;
                              return enrollment || lmp;
                            })()}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disableDeliveryDate ? disableDeliveryDate : disabledField}
                          />
                        </InputGroup>
                        {errors.dateOfDelivery !== "" ? (
                          <span className={classes.error}>{errors.dateOfDelivery}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {/* LMP shows for every entry point — L&D entry has no prior source record,
                        so it's typed here directly. ANC/Post-partum entry already has an LMP
                        on the source record, so it's auto-filled read-only from there instead
                        of asking the user to re-enter it. Never persisted on the delivery
                        record itself — GA (derived from it) is the field of record. */}
                    {(() => {
                      const entryPoint = props.entrypointValue || props.patientObj?.entryPoint;
                      const isLdEntry = entryPoint === "PMTCT_ENTRY_POINT_L&D";
                      const isPostpartumEntry = entryPoint === "PMTCT_ENTRY_POINT_POST-PARTUM";
                      const sourceLabel = isPostpartumEntry ? "MIP card" : "ANC enrollment";
                      return (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Date of Last Menstrual Period (LMP)</Label>
                            <InputGroup>
                              <Input
                                type="date"
                                onKeyPress={(e) => { e.preventDefault(); }}
                                name="lmp"
                                id="lmp"
                                onChange={handleLmpChange}
                                value={lmp}
                                max={delivery.dateOfDelivery || moment(new Date()).format("YYYY-MM-DD")}
                                disabled={disabledField || !isLdEntry}
                              />
                            </InputGroup>
                            <small style={{ color: "#57606a", marginTop: 4, display: "block" }}>
                              {isLdEntry
                                ? "Auto-calculates Gestational Age below if provided"
                                : `Auto-filled from ${sourceLabel}`}
                            </small>
                          </FormGroup>
                        </div>
                      );
                    })()}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Gestational Age (weeks)
                          {" "}
                          {(() => {
                            const isLdEntry = (props.entrypointValue || props.patientObj?.entryPoint) === "PMTCT_ENTRY_POINT_L&D";
                            return !isLdEntry && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  color: newGa ? "#2e7d32" : "#8c959f",
                                  background: newGa ? "#e8f5e9" : "#f0f0f0",
                                  padding: "2px 7px",
                                  borderRadius: "8px",
                                }}
                              >
                                {newGa ? "Auto-calculated" : "Pending..."}
                              </span>
                            );
                          })()}
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="gaweeks"
                            id="gaweeks"
                            onChange={handleInputChangeDeliveryDto}
                            value={newGa}
                            disabled={
                              disabledField ||
                              !(
                                (props.entrypointValue || props.patientObj?.entryPoint) === "PMTCT_ENTRY_POINT_L&D"
                              )
                            }
                            min="5"
                            max="45"
                          />
                        </InputGroup>
                        {errors.gaweeks !== "" ? (
                          <span className={classes.error}>{errors.gaweeks}</span>
                        ) : (
                          ""
                        )}
                        {(() => {
                          const entryPoint = props.entrypointValue || props.patientObj?.entryPoint;
                          const isLdEntry = entryPoint === "PMTCT_ENTRY_POINT_L&D";
                          return isLdEntry ? (
                            <small style={{ color: "#57606a", marginTop: 4, display: "block" }}>
                              Auto-fills from LMP , or enter manually (5-45 weeks) if known
                            </small>
                          ) : (
                            !newGa && (
                              <small style={{ color: "#57606a", marginTop: 4, display: "block" }}>
                                {entryPoint === "PMTCT_ENTRY_POINT_ANC"
                                  ? "Auto-calculated from LMP (ANC record) and Date of Delivery"
                                  : "Auto-calculated from LMP (MIP card) and Date of Delivery"}
                              </small>
                            )
                          );
                        })()}
                      </FormGroup>
                    </div>
                    {/* ROM Delivery Interval hidden per feedback F2 */}
                    {/* Place of Delivery hidden per feedback F3 */}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Mode of Delivery <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="modeOfDelivery"
                            id="modeOfDelivery"
                            value={delivery.modeOfDelivery}
                            onChange={handleInputChangeDeliveryDto}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {delieryMode.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.modeOfDelivery !== "" ? (
                          <span className={classes.error}>{errors.modeOfDelivery}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {delivery.modeOfDelivery && isOtherModeOfDelivery(delivery.modeOfDelivery) && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Specify</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="modeOfDeliveryOther"
                              id="modeOfDeliveryOther"
                              onChange={handleInputChangeDeliveryDto}
                              value={delivery.modeOfDeliveryOther}
                              disabled={disabledField}
                              placeholder="Specify mode of delivery"
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                    )}
                    {/* Episiotomy hidden per feedback F4 */}
                    {/* Vaginal Tear hidden per feedback F5 */}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Partograph Used?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="partographUsed"
                            id="partographUsed"
                            onChange={handleLabourDetailsChange}
                            value={delivery.labourDetails.partographUsed}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Active Management of 3rd Stage & Complications === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <HealingIcon style={sectionIconStyle} />Active Management of 3rd Stage of Labour & Complication
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Received Oxytocin?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="receivedOxytocin"
                            id="receivedOxytocin"
                            onChange={handleMaternalInterventionsChange}
                            value={delivery.maternalInterventions.receivedOxytocin}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Received Misoprostol?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="receivedMisoprostol"
                            id="receivedMisoprostol"
                            onChange={handleMaternalInterventionsChange}
                            value={delivery.maternalInterventions.receivedMisoprostol}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Maternal Complication</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="maternalComplication"
                            id="maternalComplication"
                            onChange={handleMaternalInterventionsChange}
                            value={delivery.maternalInterventions.maternalComplication}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="APH">APH (Antepartum Haemorrhage)</option>
                            <option value="PPH">PPH (Postpartum Haemorrhage)</option>
                            <option value="RPC">RPC (Retained Products of Conception)</option>
                            <option value="PL">PL (Prolonged Labour)</option>
                            <option value="PET">PET (Pre-Eclampsia)</option>
                            <option value="ET">ET (Eclamptic Toxaemia)</option>
                            <option value="RU">RU (Ruptured Uterus)</option>
                            <option value="SEP">SEP (Sepsis)</option>
                            <option value="OL">OL (Obstructed Labour)</option>
                            <option value="Abt">Abt (Abortion)</option>
                            <option value="None">None</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Admitted with Eclampsia - Received MgSO4?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="eclampsiaReceivedMgso4"
                            id="eclampsiaReceivedMgso4"
                            onChange={handleMaternalInterventionsChange}
                            value={delivery.maternalInterventions.eclampsiaReceivedMgso4}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="N/A">N/A</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === HIV & Treatment Status === (hidden per feedback F6) */}

              {/* === Maternal Outcome === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <FavoriteIcon style={sectionIconStyle} />Maternal Outcome
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Maternal Outcome <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="maternalOutcome"
                            id="maternalOutcome"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.maternalOutcome}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {maternalOutCome
                              .filter((value) =>
                                value.code === "MATERNAL_OUTCOME_ALIVE" ||
                                value.code === "MATERNAL_OUTCOME_DEAD"
                              )
                              .map((value) => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                          </Input>
                        </InputGroup>
                        {errors.maternalOutcome !== "" ? (
                          <span className={classes.error}>{errors.maternalOutcome}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {/* If Alive: show Admitted, Discharged, Referred Out, PAC, Transportation Out */}
                    {(delivery.maternalOutcome === "MATERNAL_OUTCOME_ALIVE" ||
                      delivery.maternalOutcome === "MATERNAL_OUTCOME_ACTIVE_IN_PMTCT") && (
                      <>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Mother Admitted (reason)</Label>
                            <InputGroup>
                              <Input
                                type="text"
                                name="motherAdmittedReason"
                                id="motherAdmittedReason"
                                onChange={handleMaternalInterventionsChange}
                                value={delivery.maternalInterventions.motherAdmittedReason}
                                disabled={disabledField}
                              />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Mother Discharged?</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="motherDischarged"
                                id="motherDischarged"
                                onChange={handleMaternalInterventionsChange}
                                value={delivery.maternalInterventions.motherDischarged}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Mother Referred Out?</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="motherReferredOut"
                                id="motherReferredOut"
                                onChange={handleMaternalInterventionsChange}
                                value={delivery.maternalInterventions.motherReferredOut}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Received Post Abortion Care (PAC)?</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="motherReceivedPac"
                                id="motherReceivedPac"
                                onChange={handleMaternalInterventionsChange}
                                value={delivery.maternalInterventions.motherReceivedPac}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Transportation Out</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="motherTransportationOut"
                                id="motherTransportationOut"
                                onChange={handleMaternalInterventionsChange}
                                value={delivery.maternalInterventions.motherTransportationOut}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Ambulance">Ambulance</option>
                                <option value="Others">Others</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                      </>
                    )}
                    {/* If Dead: show MDA Conducted */}
                    {delivery.maternalOutcome === "MATERNAL_OUTCOME_DEAD" && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>MDA Conducted?</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="mdaConducted"
                                id="mdaConducted"
                                onChange={handleMaternalInterventionsChange}
                                value={delivery.maternalInterventions.mdaConducted}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="N/A">N/A</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                    )}
                  </div>
                  {delivery.maternalOutcome !== "" &&
                  delivery.maternalOutcome !== "MATERNAL_OUTCOME_ACTIVE_IN_PMTCT" &&
                  delivery.maternalOutcome !== "MATERNAL_OUTCOME_ALIVE" ? (
                    <h2 style={{ color: "red" }}>Kindly fill tracking form</h2>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              {/* === Baby Outcome === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <ChildCareIcon style={sectionIconStyle} />Baby Outcome
                  </h6>
                  <div className="row">
                    {/* Child Status — hidden, no longer needed */}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Number of Child Alive <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="numberOfInfantsAlive"
                            id="numberOfInfantsAlive"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.numberOfInfantsAlive}
                            disabled={disabledField}
                            min="0"
                            max="10"
                          />
                        </InputGroup>
                        {errors.numberOfInfantsAlive !== "" ? (
                          <span className={classes.error}>{errors.numberOfInfantsAlive}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Number of Child Dead <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="numberOfInfantsDead"
                            id="numberOfInfantsDead"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.numberOfInfantsDead}
                            disabled={disabledField}
                            min="0"
                            max="10"
                          />
                        </InputGroup>
                        {errors.numberOfInfantsDead !== "" ? (
                          <span className={classes.error}>{errors.numberOfInfantsDead}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </div>

                  {/* Alive child outcome cards */}
                  {parseInt(delivery.numberOfInfantsAlive) >= 1 &&
                    (delivery.babyInfo.aliveOutcomes || []).map((outcome, i) => (
                      <div key={`alive-${i}`} style={{
                        border: "1px solid #b2dfdb",
                        borderRadius: "0.35rem",
                        padding: "12px 10px",
                        marginBottom: "12px",
                        backgroundColor: "#e0f2f1",
                      }}>
                        <h6 style={{ ...sectionHeaderStyle, color: "#00695c", marginBottom: "10px" }}>
                          <ChildCareIcon style={{ ...sectionIconStyle, color: "#00695c" }} />
                          Alive Child #{i + 1}
                        </h6>
                        <div className="row">
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Sex of Baby</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="sexOfBaby"
                                  onChange={(e) => handleAliveOutcomeChange(i, e)}
                                  value={outcome.sexOfBaby || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Time of Delivery</Label>
                              <InputGroup>
                                <Input
                                  type="time"
                                  name="babyTimeOfDelivery"
                                  onChange={(e) => handleAliveOutcomeChange(i, e)}
                                  value={outcome.babyTimeOfDelivery || ""}
                                  disabled={disabledField}
                                />
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Pre-term?</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="babyPreterm"
                                  onChange={(e) => handleAliveOutcomeChange(i, e)}
                                  value={outcome.babyPreterm || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          {/* Not Breathing / Not Crying at Birth — hidden for alive child */}
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Resuscitated with Ambu Bag & Mask?</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="babyResuscitated"
                                  onChange={(e) => handleAliveOutcomeChange(i, e)}
                                  value={outcome.babyResuscitated || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                  <option value="N/A">N/A</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Live Birth Weight</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="babyLiveBirthWeight"
                                  onChange={(e) => handleAliveOutcomeChange(i, e)}
                                  value={outcome.babyLiveBirthWeight || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Less than 2.5kg">&lt; 2.5 kg</option>
                                  <option value="2.5kg or more">&ge; 2.5 kg</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Live Birth by HIV Positive Woman?</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="babyLiveBirthHivPositive"
                                  onChange={(e) => handleAliveOutcomeChange(i, e)}
                                  value={outcome.babyLiveBirthHivPositive || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Dead child outcome cards */}
                  {parseInt(delivery.numberOfInfantsDead) >= 1 &&
                    (delivery.babyInfo.deadOutcomes || []).map((outcome, i) => (
                      <div key={`dead-${i}`} style={{
                        border: "1px solid #ffcdd2",
                        borderRadius: "0.35rem",
                        padding: "12px 10px",
                        marginBottom: "12px",
                        backgroundColor: "#ffebee",
                      }}>
                        <h6 style={{ ...sectionHeaderStyle, color: "#c62828", marginBottom: "10px" }}>
                          <ChildCareIcon style={{ ...sectionIconStyle, color: "#c62828" }} />
                          Dead Child #{i + 1}
                        </h6>
                        <div className="row">
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Abortion Type</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="babyAbortion"
                                  onChange={(e) => handleDeadOutcomeChange(i, e)}
                                  value={outcome.babyAbortion || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="IA">IA (Induced Abortion)</option>
                                  <option value="SA">SA (Spontaneous Abortion)</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Not Breathing / Not Crying at Birth?</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="babyNotBreathingAtBirth"
                                  onChange={(e) => handleDeadOutcomeChange(i, e)}
                                  value={outcome.babyNotBreathingAtBirth || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Still Birth Type</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="babyStillBirthType"
                                  onChange={(e) => handleDeadOutcomeChange(i, e)}
                                  value={outcome.babyStillBirthType || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="FSB">FSB (Fresh Still Birth)</option>
                                  <option value="MSB">MSB (Macerated Still Birth)</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Dead Within 7 Days?</Label>
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="babyDeadWithin7Days"
                                  onChange={(e) => handleDeadOutcomeChange(i, e)}
                                  value={outcome.babyDeadWithin7Days || ""}
                                  disabled={disabledField}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* === Delivery Attendant === (shown only when alive > 0 and alive > dead) */}
              {parseInt(delivery.numberOfInfantsAlive) >= 1 &&
               parseInt(delivery.numberOfInfantsAlive) > (parseInt(delivery.numberOfInfantsDead) || 0) && (
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <AssignmentIcon style={sectionIconStyle} />Delivery Attendant
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Who Took Delivery?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="whoTookDelivery"
                            id="whoTookDelivery"
                            onChange={handleLabourDetailsChange}
                            value={delivery.labourDetails.whoTookDelivery}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Midwife or Nurse">Midwife or Nurse</option>
                            <option value="MLSS-trained CHEW">MLSS-trained CHEW</option>
                            <option value="Others">Others</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {delivery.labourDetails.whoTookDelivery === "Others" && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Specify Other</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="whoTookDeliveryOther"
                              id="whoTookDeliveryOther"
                              onChange={handleLabourDetailsChange}
                              value={delivery.labourDetails.whoTookDeliveryOther}
                              disabled={disabledField}
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                    )}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Name of Person Who Took Delivery</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="nameOfDeliveryAttendant"
                            id="nameOfDeliveryAttendant"
                            onChange={handleLabourDetailsChange}
                            value={delivery.labourDetails.nameOfDeliveryAttendant}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* === Immediate Newborn Care === (shown only when alive > 0 and alive > dead) */}
              {parseInt(delivery.numberOfInfantsAlive) >= 1 &&
               parseInt(delivery.numberOfInfantsAlive) > (parseInt(delivery.numberOfInfantsDead) || 0) && (
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <ChildCareIcon style={sectionIconStyle} />Immediate Newborn Care
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Time Cord Was Clamped</Label>
                        <InputGroup>
                          <Input
                            type="time"
                            name="cordClampedTime"
                            id="cordClampedTime"
                            onChange={handleNewbornCareChange}
                            value={delivery.newbornCare.cordClampedTime}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>4% CHX Gel Applied to Cord at Birth?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="chxGelApplied"
                            id="chxGelApplied"
                            onChange={handleNewbornCareChange}
                            value={delivery.newbornCare.chxGelApplied}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Baby Put to Breast (Skin-to-Skin)</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="babyPutToBreast"
                            id="babyPutToBreast"
                            onChange={handleNewbornCareChange}
                            value={delivery.newbornCare.babyPutToBreast}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Within 1 hour">Within 1 hour</option>
                            <option value="After 1 hour">After 1 hour</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Temperature at 1 Hour</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="temperatureAt1Hour"
                            id="temperatureAt1Hour"
                            onChange={handleNewbornCareChange}
                            value={delivery.newbornCare.temperatureAt1Hour}
                            step="0.1"
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* === Postpartum Counselling & Family Planning === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <AssignmentTurnedInIcon style={sectionIconStyle} />Postpartum Counselling & Family Planning
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Exclusive Breastfeeding Counselled?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="ebfCounselled"
                            id="ebfCounselled"
                            onChange={handlePostpartumInfoChange}
                            value={delivery.postpartumInfo.ebfCounselled}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Postpartum FP Counselled?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="postpartumFpCounselled"
                            id="postpartumFpCounselled"
                            onChange={handlePostpartumInfoChange}
                            value={delivery.postpartumInfo.postpartumFpCounselled}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Postpartum FP Accepted?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="postpartumFpAccepted"
                            id="postpartumFpAccepted"
                            onChange={handlePostpartumInfoChange}
                            value={delivery.postpartumInfo.postpartumFpAccepted}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {delivery.postpartumInfo.postpartumFpAccepted === "Yes" && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>FP Method</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="postpartumFpMethod"
                              id="postpartumFpMethod"
                              onChange={handlePostpartumInfoChange}
                              value={delivery.postpartumInfo.postpartumFpMethod}
                              disabled={disabledField}
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {saving ? <Spinner /> : ""}
            <br />

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              {props.activeContent &&
              props.activeContent.actionType === "update" ? (
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
                    <span style={{ textTransform: "capitalize" }}>Update</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>Updating...</span>
                  )}
                </MatButton>
              ) : props.activeContent?.actionType !== "view" ? (
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
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>Saving...</span>
                  )}
                </MatButton>
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default LabourDelivery;
