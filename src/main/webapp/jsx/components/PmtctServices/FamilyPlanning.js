import React, { useState, useEffect } from "react";
import { Card, CardBody, FormGroup, Label, Input, InputGroup } from "reactstrap";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import PersonIcon from "@material-ui/icons/Person";
import AssignmentIcon from "@material-ui/icons/Assignment";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import HealingIcon from "@material-ui/icons/Healing";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "./../../../api";
import { Spinner } from "reactstrap";
import moment from "moment";
import { GET_CODESETS_IN_BATCH } from "../../../utils";

const useStyles = makeStyles((theme) => ({
  card: { margin: theme.spacing(20), display: "flex", flexDirection: "column", alignItems: "center" },
  submit: { margin: theme.spacing(3, 0, 2) },
  error: { color: "red", fontSize: "12px" },
}));

const sectionHeaderStyle = {
  backgroundColor: "transparent",
  color: "#2d3748",
  padding: "8px 12px",
  borderRadius: "0.25rem",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "12px",
};
const sectionIconStyle = { fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" };
const sectionBoxStyle = {
  border: "1px solid #e0e0e0",
  borderRadius: "0.35rem",
  padding: "15px 10px",
  backgroundColor: "#f8f9fa",
  marginBottom: "15px",
};

const FamilyPlanning = (props) => {
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [hasActiveEnrollment, setHasActiveEnrollment] = useState(true);

  const patientObj = props.patientObj || {};
  const patientUuid = patientObj.patient_uuid || patientObj.patientUuid || patientObj.uuid;
  const pmtctCycleUuid = props.selectedCycleId || props.latestPmtctCycle?.uuid || patientObj.pmtctCycleUuid;

  const [payload, setPayload] = useState({
    uuid: "",
    visitDate: "",
    weight: "",
    bloodPressure: "",
    parity: "",
    counselledOnFp: "",
    counselledOnPpfp: "",
    firstTimeModernFpUser: "",
    emergencyContraception: false,
    typeOfFpClient: "",
    sourceOfReferral: "",
  });

  const [methodsProvided, setMethodsProvided] = useState([]);
  const [referredOut, setReferredOut] = useState([]);

  const [oralPillsData, setOralPillsData] = useState({ nameOfPill: "", clientStatus: "", quantity: "" });
  const [injectableData, setInjectableData] = useState({ nameOfInjectable: "", route: "", quantity: "", clientStatus: "" });
  const [iudData, setIudData] = useState({ typeOfIud: "", action: "", clientStatus: "" });
  const [condomData, setCondomData] = useState({ typeOfCondom: "", clientStatus: "", quantity: "" });
  const [implantData, setImplantData] = useState({ typeOfImplant: "", action: "", clientStatus: "" });
  const [sterilizationData, setSterilizationData] = useState({ sex: "" });
  const [naturalMethodsData, setNaturalMethodsData] = useState({ clientStatus: "", method: "", othersSpecify: "" });

  const [errors, setErrors] = useState({});

  const [codesets, setCodesets] = useState({
    FP_METHOD_PROVIDED: [],
    FP_TYPE_OF_CLIENT: [],
    FP_SOURCE_OF_REFERRAL: [],
    FP_CLIENT_STATUS: [],
    FP_NAME_OF_INJECTABLE: [],
    FP_INJECTABLE_ROUTE: [],
    FP_TYPE_OF_IUD: [],
    FP_ACTION: [],
    FP_TYPE_OF_CONDOM: [],
    FP_TYPE_OF_IMPLANT: [],
    FP_STERILIZATION_SEX: [],
    FP_NATURAL_METHOD: [],
    FP_NATURAL_METHOD_OTHERS: [],
    FP_REFERRED_OUT: [],
  });

  useEffect(() => {
    GET_CODESETS_IN_BATCH(
      "FP_METHOD_PROVIDED",
      "FP_TYPE_OF_CLIENT",
      "FP_SOURCE_OF_REFERRAL",
      "FP_CLIENT_STATUS",
      "FP_NAME_OF_INJECTABLE",
      "FP_INJECTABLE_ROUTE",
      "FP_TYPE_OF_IUD",
      "FP_ACTION",
      "FP_TYPE_OF_CONDOM",
      "FP_TYPE_OF_IMPLANT",
      "FP_STERILIZATION_SEX",
      "FP_NATURAL_METHOD",
      "FP_NATURAL_METHOD_OTHERS",
      "FP_REFERRED_OUT"
    ).then((response) => {
      if (response?.data) setCodesets((prev) => ({ ...prev, ...response.data }));
    });
  }, []);

  // Acceptance criteria: "prevent creation of an FP encounter for a client with no PMTCT/HTS
  // enrolment" — checked once on mount, blocks the whole form (not just submit) if absent.
  useEffect(() => {
    if (!patientUuid) return;
    axios
      .get(`${baseUrl}pmtct/anc/has-active-pmtct-enrollment/${patientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setHasActiveEnrollment(response.data === true);
        setEnrollmentChecked(true);
      })
      .catch(() => {
        // Best-effort — if the check itself fails, don't block a legitimate client from
        // being served; the backend still enforces the same gate on save.
        setHasActiveEnrollment(true);
        setEnrollmentChecked(true);
      });
  }, [patientUuid]);

  // View/update: load the existing record
  useEffect(() => {
    if (props.activeContent?.actionType === "update" || props.activeContent?.actionType === "view") {
      const id = props.activeContent?.id;
      if (!id) return;
      axios
        .get(`${baseUrl}pmtct/anc/family-planning-visit/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const data = response.data || {};
          setPayload({
            uuid: data.uuid || "",
            visitDate: data.visitDate || "",
            weight: data.weight ?? "",
            bloodPressure: data.bloodPressure || "",
            parity: data.parity ?? "",
            counselledOnFp: data.counselledOnFp || "",
            counselledOnPpfp: data.counselledOnPpfp || "",
            firstTimeModernFpUser: data.firstTimeModernFpUser || "",
            emergencyContraception: !!data.emergencyContraception,
            typeOfFpClient: data.typeOfFpClient || "",
            sourceOfReferral: data.sourceOfReferral || "",
          });
          try {
            setMethodsProvided(data.methodsProvided ? JSON.parse(data.methodsProvided) : []);
          } catch (e) {
            setMethodsProvided([]);
          }
          try {
            setReferredOut(data.referredOut ? JSON.parse(data.referredOut) : []);
          } catch (e) {
            setReferredOut([]);
          }
          if (data.oralPillsData) setOralPillsData(data.oralPillsData);
          if (data.injectableData) setInjectableData(data.injectableData);
          if (data.iudData) setIudData(data.iudData);
          if (data.condomData) setCondomData(data.condomData);
          if (data.implantData) setImplantData(data.implantData);
          if (data.sterilizationData) setSterilizationData(data.sterilizationData);
          if (data.naturalMethodsData) setNaturalMethodsData(data.naturalMethodsData);
        })
        .catch(() => {
          toast.error("Could not load this Family Planning record.", { position: toast.POSITION.TOP_RIGHT });
        });
    }
  }, [props.activeContent]);

  const disabledField = props.activeContent?.actionType === "view";

  const toggleInArray = (arr, setArr, code) => {
    setArr(arr.includes(code) ? arr.filter((c) => c !== code) : [...arr, code]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const temp = {};
    temp.visitDate = payload.visitDate ? "" : "This field is required";
    if (payload.visitDate && moment(payload.visitDate).isAfter(moment(), "day")) {
      temp.visitDate = "Encounter Date cannot be in the future";
    }

    if (methodsProvided.includes("FP_METHOD_ORAL_PILLS")) {
      temp.nameOfPill = oralPillsData.nameOfPill ? "" : "This field is required";
      temp.oralPillsClientStatus = oralPillsData.clientStatus ? "" : "This field is required";
      temp.oralPillsQuantity = oralPillsData.quantity ? "" : "This field is required";
    }
    if (methodsProvided.includes("FP_METHOD_INJECTABLE")) {
      temp.nameOfInjectable = injectableData.nameOfInjectable ? "" : "This field is required";
      if (injectableData.nameOfInjectable === "FP_NAME_OF_INJECTABLE_DMPA_IM") {
        temp.injectableRoute = injectableData.route ? "" : "This field is required";
        if (injectableData.route === "FP_INJECTABLE_ROUTE_SELF_INJECTION") {
          temp.injectableQuantity = injectableData.quantity ? "" : "This field is required";
        }
      }
      temp.injectableClientStatus = injectableData.clientStatus ? "" : "This field is required";
    }
    if (methodsProvided.includes("FP_METHOD_IUD")) {
      temp.typeOfIud = iudData.typeOfIud ? "" : "This field is required";
      temp.iudAction = iudData.action ? "" : "This field is required";
      if (iudData.action === "FP_ACTION_IN") {
        temp.iudClientStatus = iudData.clientStatus ? "" : "This field is required";
      }
    }
    if (methodsProvided.includes("FP_METHOD_CONDOMS")) {
      temp.typeOfCondom = condomData.typeOfCondom ? "" : "This field is required";
      temp.condomClientStatus = condomData.clientStatus ? "" : "This field is required";
      temp.condomQuantity = condomData.quantity ? "" : "This field is required";
    }
    if (methodsProvided.includes("FP_METHOD_IMPLANTS")) {
      temp.typeOfImplant = implantData.typeOfImplant ? "" : "This field is required";
      temp.implantAction = implantData.action ? "" : "This field is required";
      if (implantData.action === "FP_ACTION_IN") {
        temp.implantClientStatus = implantData.clientStatus ? "" : "This field is required";
      }
    }
    if (methodsProvided.includes("FP_METHOD_VOLUNTARY_STERILIZATION")) {
      temp.sterilizationSex = sterilizationData.sex ? "" : "This field is required";
    }
    if (methodsProvided.includes("FP_METHOD_NATURAL_METHODS")) {
      temp.naturalMethodClientStatus = naturalMethodsData.clientStatus ? "" : "This field is required";
      temp.naturalMethod = naturalMethodsData.method ? "" : "This field is required";
      if (naturalMethodsData.method === "FP_NATURAL_METHOD_OTHERS") {
        temp.naturalMethodOthersSpecify = naturalMethodsData.othersSpecify ? "" : "This field is required";
      }
    }

    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const requestPayload = {
      uuid: payload.uuid || undefined,
      patientUuid,
      pmtctCycleUuid,
      visitDate: payload.visitDate,
      weight: payload.weight || null,
      bloodPressure: payload.bloodPressure || null,
      parity: payload.parity || null,
      counselledOnFp: payload.counselledOnFp,
      counselledOnPpfp: payload.counselledOnPpfp,
      firstTimeModernFpUser: payload.firstTimeModernFpUser,
      emergencyContraception: payload.emergencyContraception,
      typeOfFpClient: payload.typeOfFpClient,
      sourceOfReferral: payload.sourceOfReferral,
      methodsProvided: JSON.stringify(methodsProvided),
      referredOut: JSON.stringify(referredOut),
      oralPillsData: methodsProvided.includes("FP_METHOD_ORAL_PILLS") ? oralPillsData : null,
      injectableData: methodsProvided.includes("FP_METHOD_INJECTABLE") ? injectableData : null,
      iudData: methodsProvided.includes("FP_METHOD_IUD") ? iudData : null,
      condomData: methodsProvided.includes("FP_METHOD_CONDOMS") ? condomData : null,
      implantData: methodsProvided.includes("FP_METHOD_IMPLANTS") ? implantData : null,
      sterilizationData: methodsProvided.includes("FP_METHOD_VOLUNTARY_STERILIZATION") ? sterilizationData : null,
      naturalMethodsData: methodsProvided.includes("FP_METHOD_NATURAL_METHODS") ? naturalMethodsData : null,
      source: "Web",
    };

    const isUpdate = props.activeContent?.actionType === "update";
    const request = isUpdate
      ? axios.put(`${baseUrl}pmtct/anc/update-family-planning-visit/${props.activeContent.id}`, requestPayload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      : axios.post(`${baseUrl}pmtct/anc/family-planning-visit`, requestPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });

    request
      .then(() => {
        setSaving(false);
        toast.success("Family Planning record saved successfully", { position: toast.POSITION.BOTTOM_CENTER });
        props.setActiveContent({ ...props.activeContent, route: "recent-history", actionType: "create", id: "", obj: {} });
      })
      .catch((error) => {
        setSaving(false);
        const message = error?.response?.data?.apierror?.message || error?.response?.data?.message || "Something went wrong";
        toast.error(message, { position: toast.POSITION.BOTTOM_CENTER });
      });
  };

  const handleCancel = () => {
    props.setActiveContent({ ...props.activeContent, route: "recent-history", actionType: "create", id: "", obj: {} });
  };

  const codesetOptions = (group) =>
    (codesets[group] || []).map((item) => (
      <option key={item.id} value={item.code}>
        {item.display}
      </option>
    ));

  if (patientUuid && enrollmentChecked && !hasActiveEnrollment) {
    return (
      <Card>
        <CardBody>
          <div style={{ padding: "20px", textAlign: "center", color: "#92400e", background: "#fffbeb", borderRadius: "8px" }}>
            This client has no active PMTCT/HTS enrolment. A Family Planning encounter cannot be
            created until the client is enrolled.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <Card className={classes.card}>
        <CardBody>
          <form onSubmit={handleSubmit}>
            {/* Header (Read-only) */}
            <div style={sectionBoxStyle}>
              <h6 style={sectionHeaderStyle}>
                <PersonIcon style={sectionIconStyle} />
                Client Demography
              </h6>
              <div className="row">
                <div className="form-group mb-2 col-md-3">
                  <Label>Name</Label>
                  <Input disabled value={patientObj.fullName || patientObj.name || ""} />
                </div>
                <div className="form-group mb-2 col-md-3">
                  <Label>Hospital Number</Label>
                  <Input disabled value={patientObj.hospitalNumber || patientObj?.identifier?.identifier?.[0]?.value || ""} />
                </div>
                <div className="form-group mb-2 col-md-3">
                  <Label>ANC No</Label>
                  <Input disabled value={patientObj.ancNo || ""} />
                </div>
                <div className="form-group mb-2 col-md-3">
                  <Label>Sex</Label>
                  <Input disabled value={patientObj.sex || "Female"} />
                </div>
                <div className="form-group mb-2 col-md-3">
                  <Label>Date of Birth</Label>
                  <Input disabled value={patientObj.dateOfBirth || ""} />
                </div>
                <div className="form-group mb-2 col-md-3">
                  <Label>Address/Telephone</Label>
                  <Input disabled value={patientObj.address || patientObj.telephone || ""} />
                </div>
              </div>
            </div>

            {/* Clinical Data */}
            <div style={sectionBoxStyle}>
              <h6 style={sectionHeaderStyle}>
                <AssignmentIcon style={sectionIconStyle} />
                Clinical Data
              </h6>
              <div className="row">
                <div className="form-group mb-3 col-md-3">
                  <Label>
                    Encounter Date <span style={{ color: "red" }}>*</span>
                  </Label>
                  <Input
                    type="date"
                    name="visitDate"
                    value={payload.visitDate}
                    onChange={handleChange}
                    disabled={disabledField}
                    max={moment().format("YYYY-MM-DD")}
                  />
                  {errors.visitDate ? <span className={classes.error}>{errors.visitDate}</span> : ""}
                </div>
                <div className="form-group mb-3 col-md-3">
                  <Label>Weight (kg)</Label>
                  <Input type="number" name="weight" value={payload.weight} onChange={handleChange} disabled={disabledField} />
                </div>
                <div className="form-group mb-3 col-md-3">
                  <Label>Blood Pressure</Label>
                  <Input name="bloodPressure" placeholder="e.g. 120/80" value={payload.bloodPressure} onChange={handleChange} disabled={disabledField} />
                </div>
                <div className="form-group mb-3 col-md-3">
                  <Label>Parity</Label>
                  <Input type="number" name="parity" value={payload.parity} onChange={handleChange} disabled={disabledField} />
                </div>
              </div>
            </div>

            {/* Counselling & Client Categorization */}
            <div style={sectionBoxStyle}>
              <h6 style={sectionHeaderStyle}>
                <AssignmentTurnedInIcon style={sectionIconStyle} />
                Counselling & Client Categorization
              </h6>
              <div className="row">
                <div className="form-group mb-3 col-md-3">
                  <Label>Counselled on FP</Label>
                  <Input type="select" name="counselledOnFp" value={payload.counselledOnFp} onChange={handleChange} disabled={disabledField}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Input>
                </div>
                <div className="form-group mb-3 col-md-3">
                  <Label>Counselled on PPFP</Label>
                  <Input type="select" name="counselledOnPpfp" value={payload.counselledOnPpfp} onChange={handleChange} disabled={disabledField}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Input>
                </div>
                <div className="form-group mb-3 col-md-3">
                  <Label>First Time Modern FP User</Label>
                  <Input type="select" name="firstTimeModernFpUser" value={payload.firstTimeModernFpUser} onChange={handleChange} disabled={disabledField}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Input>
                </div>
                <div className="form-group mb-3 col-md-3">
                  <Label>Type of FP Client</Label>
                  <Input type="select" name="typeOfFpClient" value={payload.typeOfFpClient} onChange={handleChange} disabled={disabledField}>
                    <option value="">Select</option>
                    {codesetOptions("FP_TYPE_OF_CLIENT")}
                  </Input>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <Label>Source of Referral</Label>
                  <Input type="select" name="sourceOfReferral" value={payload.sourceOfReferral} onChange={handleChange} disabled={disabledField}>
                    <option value="">Select</option>
                    {codesetOptions("FP_SOURCE_OF_REFERRAL")}
                  </Input>
                </div>
                <div className="form-group mb-3 col-md-3" style={{ display: "flex", alignItems: "center", marginTop: "22px" }}>
                  <Input
                    type="checkbox"
                    id="emergencyContraception"
                    checked={payload.emergencyContraception}
                    onChange={(e) => setPayload((prev) => ({ ...prev, emergencyContraception: e.target.checked }))}
                    disabled={disabledField}
                    style={{ marginRight: "8px", position: "static" }}
                  />
                  <Label for="emergencyContraception" style={{ marginBottom: 0 }}>
                    Emergency Contraception
                  </Label>
                </div>
              </div>
            </div>

            {/* Family Planning Method Provided */}
            <div style={sectionBoxStyle}>
              <h6 style={sectionHeaderStyle}>
                <HealingIcon style={sectionIconStyle} />
                Family Planning Method Provided
              </h6>
              <div className="row">
                {(codesets.FP_METHOD_PROVIDED || []).map((item) => (
                  <div key={item.id} className="form-group mb-2 col-md-3" style={{ display: "flex", alignItems: "center" }}>
                    <Input
                      type="checkbox"
                      id={`method-${item.code}`}
                      checked={methodsProvided.includes(item.code)}
                      onChange={() => toggleInArray(methodsProvided, setMethodsProvided, item.code)}
                      disabled={disabledField}
                      style={{ marginRight: "8px", position: "static" }}
                    />
                    <Label for={`method-${item.code}`} style={{ marginBottom: 0 }}>
                      {item.display}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Oral Pills */}
              {methodsProvided.includes("FP_METHOD_ORAL_PILLS") && (
                <div className="row" style={{ borderTop: "1px dashed #ccc", marginTop: "10px", paddingTop: "10px" }}>
                  <div className="col-md-12">
                    <strong>Oral Pills</strong>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Name of Pill</Label>
                    <Input
                      value={oralPillsData.nameOfPill}
                      onChange={(e) => setOralPillsData((prev) => ({ ...prev, nameOfPill: e.target.value }))}
                      disabled={disabledField}
                    />
                    {errors.nameOfPill ? <span className={classes.error}>{errors.nameOfPill}</span> : ""}
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Client Status</Label>
                    <Input
                      type="select"
                      value={oralPillsData.clientStatus}
                      onChange={(e) => setOralPillsData((prev) => ({ ...prev, clientStatus: e.target.value }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_CLIENT_STATUS")}
                    </Input>
                    {errors.oralPillsClientStatus ? <span className={classes.error}>{errors.oralPillsClientStatus}</span> : ""}
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Quantity (Number of Cycles)</Label>
                    <Input
                      type="number"
                      value={oralPillsData.quantity}
                      onChange={(e) => setOralPillsData((prev) => ({ ...prev, quantity: e.target.value }))}
                      disabled={disabledField}
                    />
                    {errors.oralPillsQuantity ? <span className={classes.error}>{errors.oralPillsQuantity}</span> : ""}
                  </div>
                </div>
              )}

              {/* Injectable */}
              {methodsProvided.includes("FP_METHOD_INJECTABLE") && (
                <div className="row" style={{ borderTop: "1px dashed #ccc", marginTop: "10px", paddingTop: "10px" }}>
                  <div className="col-md-12">
                    <strong>Injectable</strong>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Name of Injectable</Label>
                    <Input
                      type="select"
                      value={injectableData.nameOfInjectable}
                      onChange={(e) => setInjectableData((prev) => ({ ...prev, nameOfInjectable: e.target.value, route: "", quantity: "" }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_NAME_OF_INJECTABLE")}
                    </Input>
                    {errors.nameOfInjectable ? <span className={classes.error}>{errors.nameOfInjectable}</span> : ""}
                  </div>
                  {injectableData.nameOfInjectable === "FP_NAME_OF_INJECTABLE_DMPA_IM" && (
                    <div className="form-group mb-3 col-md-4">
                      <Label>Route</Label>
                      <Input
                        type="select"
                        value={injectableData.route}
                        onChange={(e) => setInjectableData((prev) => ({ ...prev, route: e.target.value, quantity: "" }))}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {codesetOptions("FP_INJECTABLE_ROUTE")}
                      </Input>
                      {errors.injectableRoute ? <span className={classes.error}>{errors.injectableRoute}</span> : ""}
                    </div>
                  )}
                  {injectableData.route === "FP_INJECTABLE_ROUTE_SELF_INJECTION" && (
                    <div className="form-group mb-3 col-md-4">
                      <Label>Quantity (Uniject)</Label>
                      <Input
                        type="number"
                        value={injectableData.quantity}
                        onChange={(e) => setInjectableData((prev) => ({ ...prev, quantity: e.target.value }))}
                        disabled={disabledField}
                      />
                      {errors.injectableQuantity ? <span className={classes.error}>{errors.injectableQuantity}</span> : ""}
                    </div>
                  )}
                  <div className="form-group mb-3 col-md-4">
                    <Label>Client Status</Label>
                    <Input
                      type="select"
                      value={injectableData.clientStatus}
                      onChange={(e) => setInjectableData((prev) => ({ ...prev, clientStatus: e.target.value }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_CLIENT_STATUS")}
                    </Input>
                    {errors.injectableClientStatus ? <span className={classes.error}>{errors.injectableClientStatus}</span> : ""}
                  </div>
                </div>
              )}

              {/* IUD */}
              {methodsProvided.includes("FP_METHOD_IUD") && (
                <div className="row" style={{ borderTop: "1px dashed #ccc", marginTop: "10px", paddingTop: "10px" }}>
                  <div className="col-md-12">
                    <strong>IUD</strong>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Type of IUD</Label>
                    <Input
                      type="select"
                      value={iudData.typeOfIud}
                      onChange={(e) => setIudData((prev) => ({ ...prev, typeOfIud: e.target.value }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_TYPE_OF_IUD")}
                    </Input>
                    {errors.typeOfIud ? <span className={classes.error}>{errors.typeOfIud}</span> : ""}
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Action</Label>
                    <Input
                      type="select"
                      value={iudData.action}
                      onChange={(e) => setIudData((prev) => ({ ...prev, action: e.target.value, clientStatus: "" }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_ACTION")}
                    </Input>
                    {errors.iudAction ? <span className={classes.error}>{errors.iudAction}</span> : ""}
                  </div>
                  {iudData.action === "FP_ACTION_IN" && (
                    <div className="form-group mb-3 col-md-4">
                      <Label>Client Status</Label>
                      <Input
                        type="select"
                        value={iudData.clientStatus}
                        onChange={(e) => setIudData((prev) => ({ ...prev, clientStatus: e.target.value }))}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {codesetOptions("FP_CLIENT_STATUS")}
                      </Input>
                      {errors.iudClientStatus ? <span className={classes.error}>{errors.iudClientStatus}</span> : ""}
                    </div>
                  )}
                </div>
              )}

              {/* Condoms */}
              {methodsProvided.includes("FP_METHOD_CONDOMS") && (
                <div className="row" style={{ borderTop: "1px dashed #ccc", marginTop: "10px", paddingTop: "10px" }}>
                  <div className="col-md-12">
                    <strong>Condoms</strong>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Type of Condom</Label>
                    <Input
                      type="select"
                      value={condomData.typeOfCondom}
                      onChange={(e) => setCondomData((prev) => ({ ...prev, typeOfCondom: e.target.value }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_TYPE_OF_CONDOM")}
                    </Input>
                    {errors.typeOfCondom ? <span className={classes.error}>{errors.typeOfCondom}</span> : ""}
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Client Status</Label>
                    <Input
                      type="select"
                      value={condomData.clientStatus}
                      onChange={(e) => setCondomData((prev) => ({ ...prev, clientStatus: e.target.value }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_CLIENT_STATUS")}
                    </Input>
                    {errors.condomClientStatus ? <span className={classes.error}>{errors.condomClientStatus}</span> : ""}
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Quantity (Number of Pieces)</Label>
                    <Input
                      type="number"
                      value={condomData.quantity}
                      onChange={(e) => setCondomData((prev) => ({ ...prev, quantity: e.target.value }))}
                      disabled={disabledField}
                    />
                    {errors.condomQuantity ? <span className={classes.error}>{errors.condomQuantity}</span> : ""}
                  </div>
                </div>
              )}

              {/* Implants */}
              {methodsProvided.includes("FP_METHOD_IMPLANTS") && (
                <div className="row" style={{ borderTop: "1px dashed #ccc", marginTop: "10px", paddingTop: "10px" }}>
                  <div className="col-md-12">
                    <strong>Implants</strong>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Type of Implant</Label>
                    <Input
                      type="select"
                      value={implantData.typeOfImplant}
                      onChange={(e) => setImplantData((prev) => ({ ...prev, typeOfImplant: e.target.value }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_TYPE_OF_IMPLANT")}
                    </Input>
                    {errors.typeOfImplant ? <span className={classes.error}>{errors.typeOfImplant}</span> : ""}
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Action</Label>
                    <Input
                      type="select"
                      value={implantData.action}
                      onChange={(e) => setImplantData((prev) => ({ ...prev, action: e.target.value, clientStatus: "" }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_ACTION")}
                    </Input>
                    {errors.implantAction ? <span className={classes.error}>{errors.implantAction}</span> : ""}
                  </div>
                  {implantData.action === "FP_ACTION_IN" && (
                    <div className="form-group mb-3 col-md-4">
                      <Label>Client Status</Label>
                      <Input
                        type="select"
                        value={implantData.clientStatus}
                        onChange={(e) => setImplantData((prev) => ({ ...prev, clientStatus: e.target.value }))}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {codesetOptions("FP_CLIENT_STATUS")}
                      </Input>
                      {errors.implantClientStatus ? <span className={classes.error}>{errors.implantClientStatus}</span> : ""}
                    </div>
                  )}
                </div>
              )}

              {/* Voluntary Sterilization */}
              {methodsProvided.includes("FP_METHOD_VOLUNTARY_STERILIZATION") && (
                <div className="row" style={{ borderTop: "1px dashed #ccc", marginTop: "10px", paddingTop: "10px" }}>
                  <div className="col-md-12">
                    <strong>Voluntary Sterilization</strong>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Voluntary Sterilization</Label>
                    <Input
                      type="select"
                      value={sterilizationData.sex}
                      onChange={(e) => setSterilizationData({ sex: e.target.value })}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_STERILIZATION_SEX")}
                    </Input>
                    {errors.sterilizationSex ? <span className={classes.error}>{errors.sterilizationSex}</span> : ""}
                  </div>
                </div>
              )}

              {/* Natural Methods */}
              {methodsProvided.includes("FP_METHOD_NATURAL_METHODS") && (
                <div className="row" style={{ borderTop: "1px dashed #ccc", marginTop: "10px", paddingTop: "10px" }}>
                  <div className="col-md-12">
                    <strong>Natural Methods</strong>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Client Status</Label>
                    <Input
                      type="select"
                      value={naturalMethodsData.clientStatus}
                      onChange={(e) => setNaturalMethodsData((prev) => ({ ...prev, clientStatus: e.target.value }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_CLIENT_STATUS")}
                    </Input>
                    {errors.naturalMethodClientStatus ? <span className={classes.error}>{errors.naturalMethodClientStatus}</span> : ""}
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <Label>Method</Label>
                    <Input
                      type="select"
                      value={naturalMethodsData.method}
                      onChange={(e) => setNaturalMethodsData((prev) => ({ ...prev, method: e.target.value, othersSpecify: "" }))}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {codesetOptions("FP_NATURAL_METHOD")}
                    </Input>
                    {errors.naturalMethod ? <span className={classes.error}>{errors.naturalMethod}</span> : ""}
                  </div>
                  {naturalMethodsData.method === "FP_NATURAL_METHOD_OTHERS" && (
                    <div className="form-group mb-3 col-md-4">
                      <Label>Specify</Label>
                      <Input
                        type="select"
                        value={naturalMethodsData.othersSpecify}
                        onChange={(e) => setNaturalMethodsData((prev) => ({ ...prev, othersSpecify: e.target.value }))}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {codesetOptions("FP_NATURAL_METHOD_OTHERS")}
                      </Input>
                      {errors.naturalMethodOthersSpecify ? (
                        <span className={classes.error}>{errors.naturalMethodOthersSpecify}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Referral Out */}
            <div style={sectionBoxStyle}>
              <h6 style={sectionHeaderStyle}>
                <AssignmentIcon style={sectionIconStyle} />
                Referral Out
              </h6>
              <div className="row">
                {(codesets.FP_REFERRED_OUT || []).map((item) => (
                  <div key={item.id} className="form-group mb-2 col-md-2" style={{ display: "flex", alignItems: "center" }}>
                    <Input
                      type="checkbox"
                      id={`referred-${item.code}`}
                      checked={referredOut.includes(item.code)}
                      onChange={() => toggleInArray(referredOut, setReferredOut, item.code)}
                      disabled={disabledField}
                      style={{ marginRight: "8px", position: "static" }}
                    />
                    <Label for={`referred-${item.code}`} style={{ marginBottom: 0 }}>
                      {item.display}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {!disabledField && (
              <div style={{ textAlign: "right" }}>
                <MatButton
                  variant="contained"
                  color="default"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  style={{ marginRight: "10px" }}
                  disabled={saving}
                >
                  Cancel
                </MatButton>
                <MatButton variant="contained" color="primary" startIcon={<SaveIcon />} type="submit" disabled={saving}>
                  {saving ? <Spinner size="sm" /> : "Save"}
                </MatButton>
              </div>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default FamilyPlanning;
