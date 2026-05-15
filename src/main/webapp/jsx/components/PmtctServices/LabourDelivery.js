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
  const [saving, setSaving] = useState(false);
  const [disabledField, setSisabledField] = useState(false);
  const [errors, setErrors] = useState({});
  const [childStatus, setChildStatus] = useState([]);
  const [bookingStatus, setBookingStatus] = useState([]);
  const [romdelivery, setRomdelivery] = useState([]);
  const [disableDeliveryDate, setDisableDeliveryDate] = useState(false);
  const [timehiv, setTimehiv] = useState([]);

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
  }, [props.patientObj.id, props.activeContent]);

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
        setDelivery((prev) => ({
          ...prev,
          ...sanitized,
          labourDetails: { ...prev.labourDetails, ...(data.labourDetails || {}) },
          maternalInterventions: { ...prev.maternalInterventions, ...(data.maternalInterventions || {}) },
          babyInfo: { ...prev.babyInfo, ...(data.babyInfo || {}) },
          newbornCare: { ...prev.newbornCare, ...(data.newbornCare || {}) },
          postpartumInfo: { ...prev.postpartumInfo, ...(data.postpartumInfo || {}) },
          patientUuid: sanitized.patientUuid || prev.patientUuid,
          pmtctCycleUuid: sanitized.pmtctCycleUuid || prev.pmtctCycleUuid,
          source: sanitized.source || "WEB",
        }));

        // Set GA from the record directly; recalculate only if missing
        if (data.gaweeks) {
          setNewGa(data.gaweeks);
        } else if (data.dateOfDelivery) {
          // Only recalculate GA if not stored in the record (silent=true to avoid toast on load)
          getGestationalAge(data.dateOfDelivery, "dateOfDelivery", data.pmtctCycleUuid, true);
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
      "FEEDING DECISION",
      "MATERNAL_OUTCOME",
      "CHILD_STATUS_DELIVERY",
      "BOOKING STATUS",
      "ROM_DELIVERY_INTERVAL",
      "TIME_HIV_DIAGNOSIS_PMTCT",
      "PLACE_OF_DELIVERY"
    ).then((response) => {
      setDelieryMode(response.data.MODE_DELIVERY);
      setfeedingDecision(response.data["FEEDING DECISION"]);
      setmaternalOutCome(response.data.MATERNAL_OUTCOME);
      setChildStatus(response.data.CHILD_STATUS_DELIVERY);
      setBookingStatus(response.data["BOOKING STATUS"]);
      setRomdelivery(response.data.ROM_DELIVERY_INTERVAL);
      setTimehiv(response.data.TIME_HIV_DIAGNOSIS_PMTCT);
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
      { field: "bookingStatus", codesets: bookingStatus },
      { field: "romDeliveryInterval", codesets: romdelivery },
      { field: "deliveryTime", codesets: timehiv },
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
    bookingStatus,
    romdelivery,
    timehiv,
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
    } else {
      setDelivery((prev) => ({ ...prev, dateOfDelivery: value }));
      if (!silent) {
        toast.error("Please select a valid date");
      }
    }
  };

  const handleInputChangeDeliveryDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "dateOfDelivery" && e.target.value !== "") {
      getGestationalAge(e.target.value, e.target.name);
      setDelivery({ ...delivery, [e.target.name]: e.target.value });
    } else if (e.target.name === "childStatus") {
      setDelivery({
        ...delivery,
        [e.target.name]: e.target.value,
        numberOfInfantsAlive: "",
        numberOfInfantsDead: "",
      });
      setErrors({
        ...errors,
        numberOfInfantsDead: "",
        numberOfInfantsAlive: "",
      });
    } else if (e.target.name === "gaweeks") {
      const val = e.target.value;
      if (val !== "" && (parseInt(val) < 0 || parseInt(val) > 45)) return;
      setNewGa(val);
      setDelivery({ ...delivery, [e.target.name]: val });
    } else if (
      e.target.name === "numberOfInfantsAlive" ||
      e.target.name === "numberOfInfantsDead"
    ) {
      const val = e.target.value;
      if (val !== "" && (parseInt(val) < 0 || parseInt(val) > 10)) return;
      const newDelivery = { ...delivery, [e.target.name]: val };
      if (
        newDelivery.childStatus &&
        newDelivery.childStatus !== "CHILD_STATUS_DELIVERY_STILL_BIRTH" &&
        newDelivery.numberOfInfantsAlive !== "" &&
        newDelivery.numberOfInfantsDead !== ""
      ) {
        const aliveCount = parseInt(newDelivery.numberOfInfantsAlive);
        const deadCount = parseInt(newDelivery.numberOfInfantsDead);
        if (aliveCount <= deadCount) {
          setErrors({
            ...errors,
            numberOfInfantsAlive:
              "Number of Child Alive must be greater than Number of Child Dead",
          });
        } else {
          setErrors({ ...errors, numberOfInfantsAlive: "" });
        }
      }
      setDelivery(newDelivery);
    } else {
      setDelivery({ ...delivery, [e.target.name]: e.target.value });
    }
  };

  const handleLabourDetailsChange = (e) => {
    setDelivery({
      ...delivery,
      labourDetails: { ...delivery.labourDetails, [e.target.name]: e.target.value },
    });
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

  const validate = () => {
    let temp = { ...errors };
    temp.artStartedLdWard = delivery.artStartedLdWard
      ? ""
      : "This field is required";
    temp.placeOfDelivery = delivery.placeOfDelivery
      ? ""
      : "This field is required";
    temp.vaginalTear = delivery.vaginalTear ? "" : "This field is required";
    temp.onArt = delivery.onArt ? "" : "This field is required";
    temp.modeOfDelivery = delivery.modeOfDelivery
      ? ""
      : "This field is required";
    temp.maternalOutcome = delivery.maternalOutcome
      ? ""
      : "This field is required";
    if (!newGa) {
      temp.gaweeks = "This field is required";
    } else if (parseInt(newGa) < 0 || parseInt(newGa) > 45) {
      temp.gaweeks = "Gestational age must be between 0 and 45 weeks";
    } else {
      temp.gaweeks = "";
    }
    temp.episiotomy = delivery.episiotomy ? "" : "This field is required";
    temp.deliveryTime = delivery.deliveryTime ? "" : "This field is required";
    temp.dateOfDelivery = delivery.dateOfDelivery
      ? ""
      : "This field is required";
    temp.childStatus = delivery.childStatus ? "" : "This field is required";
    temp.childGivenArvWithin72 = delivery.childGivenArvWithin72
      ? ""
      : "This field is required";
    temp.bookingStatus = delivery.bookingStatus ? "" : "This field is required";
    if (delivery.childStatus !== "" && delivery.childStatus !== "CHILD_STATUS_DELIVERY_STILL_BIRTH") {
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
    }

    if (
      delivery.childStatus &&
      delivery.childStatus !== "CHILD_STATUS_DELIVERY_STILL_BIRTH" &&
      delivery.numberOfInfantsAlive !== "" &&
      delivery.numberOfInfantsDead !== ""
    ) {
      const aliveCount = parseInt(delivery.numberOfInfantsAlive);
      const deadCount = parseInt(delivery.numberOfInfantsDead);
      if (aliveCount <= deadCount) {
        temp.numberOfInfantsAlive =
          "Number of Child Alive must be greater than Number of Child Dead";
      }
    }

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);

      const isChildAlive =
        delivery.childStatus &&
        delivery.childStatus !== "CHILD_STATUS_DELIVERY_STILL_BIRTH" &&
        parseInt(delivery.numberOfInfantsAlive) >
          parseInt(delivery.numberOfInfantsDead);

      const targetRoute = isChildAlive ? "infants" : "recent-history";

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
              route: targetRoute,
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
            props.setActiveContent({
              ...props.activeContent,
              route: targetRoute,
            });
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
                        <Label>
                          Booking Status <span style={{ color: "red" }}> *</span>
                        </Label>
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
                            {bookingStatus.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
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
                            min={props.patientObj.dateOfEnrollment}
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
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Gestational Age (weeks) <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="gaweeks"
                            id="gaweeks"
                            onChange={handleInputChangeDeliveryDto}
                            value={newGa}
                            disabled
                            min="0"
                            max="45"
                          />
                        </InputGroup>
                        {errors.gaweeks !== "" ? (
                          <span className={classes.error}>{errors.gaweeks}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>ROM Delivery Interval</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="romDeliveryInterval"
                            id="romDeliveryInterval"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.romDeliveryInterval}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {romdelivery.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Place of Delivery <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="placeOfDelivery"
                            id="placeOfDelivery"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.placeOfDelivery}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {placeOfDelivery.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.placeOfDelivery !== "" ? (
                          <span className={classes.error}>{errors.placeOfDelivery}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
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
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Episiotomy <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="episiotomy"
                            id="episiotomy"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.episiotomy}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Unknown">Unknown</option>
                          </Input>
                        </InputGroup>
                        {errors.episiotomy !== "" ? (
                          <span className={classes.error}>{errors.episiotomy}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Vaginal Tear <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="vaginalTear"
                            id="vaginalTear"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.vaginalTear}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Unknown">Unknown</option>
                          </Input>
                        </InputGroup>
                        {errors.vaginalTear !== "" ? (
                          <span className={classes.error}>{errors.vaginalTear}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
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
                    <HealingIcon style={sectionIconStyle} />Active Management of 3rd Stage & Complications
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
                        <Label>Eclampsia - Received MgSO4?</Label>
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

              {/* === HIV & Treatment Status === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <LocalHospitalIcon style={sectionIconStyle} />HIV & Treatment Status
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          On ART? <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="onArt"
                            id="onArt"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.onArt}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.onArt !== "" ? (
                          <span className={classes.error}>{errors.onArt}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Time of HIV Diagnosis <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="deliveryTime"
                            id="deliveryTime"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.deliveryTime}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {timehiv.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.deliveryTime !== "" ? (
                          <span className={classes.error}>{errors.deliveryTime}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          ART Started in L&D Ward <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="artStartedLdWard"
                            id="artStartedLdWard"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.artStartedLdWard}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.artStartedLdWard !== "" ? (
                          <span className={classes.error}>{errors.artStartedLdWard}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Hepatitis B Status</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hbstatus"
                            id="hbstatus"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.hbstatus}
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
                        <Label>Hepatitis C Status</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hcstatus"
                            id="hcstatus"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.hcstatus}
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
                        <Label>
                          Child Given ARV Within 72 hrs <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="childGivenArvWithin72"
                            id="childGivenArvWithin72"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.childGivenArvWithin72}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.childGivenArvWithin72 !== "" ? (
                          <span className={classes.error}>{errors.childGivenArvWithin72}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>HBV Exposed Infant Given Hep B Ig Within 24 hrs</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hivExposedInfantGivenHbWithin24hrs"
                            id="hivExposedInfantGivenHbWithin24hrs"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.hivExposedInfantGivenHbWithin24hrs}
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
                        <Label>
                          Non HBV Exposed Infant Given HBV Vaccine Within 24 hrs
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="nonHbvExposedInfantGivenHbWithin24hrs"
                            id="nonHbvExposedInfantGivenHbWithin24hrs"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.nonHbvExposedInfantGivenHbWithin24hrs}
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
                            {maternalOutCome.map((value) => (
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
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>MDA Conducted? (if dead)</Label>
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
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Child Status <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="childStatus"
                            id="childStatus"
                            onChange={handleInputChangeDeliveryDto}
                            value={delivery.childStatus}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {childStatus.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.childStatus !== "" ? (
                          <span className={classes.error}>{errors.childStatus}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Abortion Type</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="babyAbortion"
                            id="babyAbortion"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyAbortion}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="IA">IA (Induced Abortion)</option>
                            <option value="SA">SA (Spontaneous Abortion)</option>
                            <option value="N/A">N/A</option>
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
                            id="babyTimeOfDelivery"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyTimeOfDelivery}
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
                            id="babyPreterm"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyPreterm}
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
                        <Label>Not Breathing / Not Crying at Birth?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="babyNotBreathingAtBirth"
                            id="babyNotBreathingAtBirth"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyNotBreathingAtBirth}
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
                        <Label>Resuscitated with Ambu Bag & Mask?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="babyResuscitated"
                            id="babyResuscitated"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyResuscitated}
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
                            id="babyLiveBirthWeight"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyLiveBirthWeight}
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
                        <Label>Still Birth Type</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="babyStillBirthType"
                            id="babyStillBirthType"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyStillBirthType}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="FSB">FSB (Fresh Still Birth)</option>
                            <option value="MSB">MSB (Macerated Still Birth)</option>
                            <option value="N/A">N/A</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Baby Dead Within 7 Days?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="babyDeadWithin7Days"
                            id="babyDeadWithin7Days"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyDeadWithin7Days}
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
                        <Label>Live Birth by HIV Positive Woman?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="babyLiveBirthHivPositive"
                            id="babyLiveBirthHivPositive"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.babyLiveBirthHivPositive}
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
                        <Label>Sex of Baby</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="sexOfBaby"
                            id="sexOfBaby"
                            onChange={handleBabyInfoChange}
                            value={delivery.babyInfo.sexOfBaby}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {(delivery.childStatus
                      ? delivery.childStatus !== "CHILD_STATUS_DELIVERY_STILL_BIRTH"
                      : props?.activeContent?.actionType !== "create") && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* === Delivery Attendant === */}
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

              {/* === Immediate Newborn Care === */}
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
