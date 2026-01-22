import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Segment,
  Label,
  Icon,
  List,
  Button,
  Card,
  Feed,
} from "semantic-ui-react";
// Page titie
import { FormGroup, Label as FormLabelName, Input } from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
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
    "& > *": {
      margin: theme.spacing(1),
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

const ClinicVisit = (props) => {
  let patientObj = props.patientObj ? props.patientObj : {};
  const [errors, setErrors] = useState({});
  const [disabledField, setDisabledField] = useState(false);

  // Disable the initial visit date field if patient already has enrollment date
  const [isInitialVisitDisabled, setIsInitialVisitDisabled] = useState(
    patientObj?.pmtctEnrollmentDate ||
      patientObj?.pmtctEnrollmentRespondDto?.pmtctEnrollmentDate
      ? true
      : false,
  );
  let temp = { ...errors };
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  //const [clinicalStage, setClinicalStage] = useState([]);
  const [dsdModelType, setDsdModelType] = useState([]);
  // const [currentVitalSigns, setcurrentVitalSigns] = useState({})
  // const [showCurrentVitalSigns, setShowCurrentVitalSigns] = useState(false)
  const [visitStatus, setVisitStatus] = useState([]);
  const [maternalCome, setMaternalCome] = useState([]);
  const [fp, setFp] = useState([]);
  const [disableDeliveryDate, setDisableDeliveryDate] = useState(false);

  const [entryPoint, setEntryPoint] = useState([]);
  //Vital signs clinical decision support
  const entrypointRef = useRef(null);
  const [objValues, setObjValues] = useState({
    ancNo: patientObj.ancNo,
    dateOfViralLoad: "",
    dateOfInitialVisit: patientObj?.pmtctEnrollmentDate
      ? patientObj.pmtctEnrollmentDate
      : patientObj?.pmtctEnrollmentRespondDto?.pmtctEnrollmentDate
        ? patientObj?.pmtctEnrollmentRespondDto.pmtctEnrollmentDate
        : "",
    dateOfVisit: "",
    dateOfmeternalOutcome: "",
    dateOfDelivery: "",
    dsd: "",
    dsdModel: "",
    dsdOption: "",
    enteryPoint:
      props.patientObj.entryPoint === "619"
        ? "POINT_ENTRY_PMTCT_ANC"
        : "POINT_ENTRY_PMTCT",
    fpCounseling: "",
    fpMethod: "",
    gaOfViralLoad: "",
    id: "",
    maternalOutcome: "",
    nextAppointmentDate: "",
    personUuid: patientObj.person_uuid
      ? patientObj.person_uuid
      : patientObj.personUuid,
    resultOfViralLoad: "",
    transferTo: "",
    visitStatus: "",
    timeOfViralLoad: "",
    pmtctCycleId: props?.latestPmtctCycle?.id,
    source: "WEB",
  });
  const [entryValueDisplay, setEntryValueDisplay] = useState({});

  const getDateOfDelivery = () => {
    const pmtctCycleId =
      props.latestPmtctCycle?.id || props.patientObj?.pmtctCycleId;

    axios
      .get(
        `${baseUrl}pmtct/anc/get-delivery-date/${
          props.patientObj.person_uuid
            ? props.patientObj.person_uuid
            : props.patientObj.personUuid
        }?pmtctCycleId=${pmtctCycleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then((response) => {
        if (response.data) {
          setDisableDeliveryDate(true);
          setObjValues({ ...objValues, dateOfDelivery: response.data });
        }

        setDisableDeliveryDate(false);
        setObjValues({ ...objValues, dateOfDelivery: response.data });
      })
      .catch((error) => {
      });
  };

  const getInitialVisitDate = () => {
    const pmtctCycleId =
      props.latestPmtctCycle?.id || props.patientObj?.pmtctCycleId;
    const personUuid = props.patientObj.person_uuid
      ? props.patientObj.person_uuid
      : props.patientObj.personUuid;

    if (!pmtctCycleId || !personUuid) {
      return;
    }

    axios
      .get(
        `${baseUrl}pmtct/anc/get-initial-visit-date/${personUuid}?pmtctCycleId=${pmtctCycleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then((response) => {
        if (response.data) {
          setObjValues((prevValues) => ({
            ...prevValues,
            dateOfInitialVisit: response.data,
          }));
          setIsInitialVisitDisabled(true);
        }
      })
      .catch((error) => {
      });
  };

  // BATCH API
  const GET_CODESETS = () => {
    GET_CODESETS_IN_BATCH(
      "VISIT_STATUS_PMTCT",
      "MATERNAL_OUTCOME",
      "FAMILY_PLANNING_METHOD",
      "PMTCT_ENTRY_POINT",
    ).then((response) => {
      setVisitStatus(response.data.VISIT_STATUS_PMTCT);

      setMaternalCome(response.data.MATERNAL_OUTCOME);
      setFp(response.data.FAMILY_PLANNING_METHOD);
      setEntryPoint(response.data.PMTCT_ENTRY_POINT);
    });
  };

  const getPatientEntryType = (id) => {
    entryPoint.map((each, i) => {
      if (Number(each.id) === Number(props.patientObj.entryPoint)) {
        setEntryValueDisplay(each);
      }
    });
  };

  useEffect(() => {
    GET_CODESETS();

    getDateOfDelivery();
    getInitialVisitDate();

    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null &&
      props.activeContent.activeTab === "home" &&
      props.activeContent.actionType !== "create"
    ) {
      GetVisit(props.activeContent.id);
      setDisabledField(
        props.activeContent.actionType === "view" ? true : false,
      );
    }
  }, [props.activeContent]);

  useEffect(() => {
    getPatientEntryType();
  }, []);

  const GetVisit = (id) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-mother-visit/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setObjValues({
          ...response.data,
          pmtctCycleId:
            response.data.pmtctCycleId || props?.latestPmtctCycle?.id,
        });
        DsdModelType(response.data.dsdModel);
      })
      .catch((error) => {
      });
  };

  const handleInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (e.target.name === "dsdModel") {
      DsdModelType(e.target.value);
    }
    if (e.target.name === "dateOfViralLoad" && e.target.value !== "") {
      async function getGa() {
        const dateOfViralLoad = e.target.value;
        //?ancNo=001&visitDate=2023-02-01
        const pmtctCycleId =
          props.latestPmtctCycle?.id || props.patientObj?.pmtctCycleId;

        if (!pmtctCycleId) {
          console.error(
            "pmtctCycleId is required for gestational age calculation",
          );
          return;
        }

        const response = await axios.get(
          `${baseUrl}pmtct/anc/calculate-ga-from-person?personUuid=${
            props.patientObj.person_uuid
              ? props.patientObj.person_uuid
              : props.patientObj.personUuid
          }&visitDate=${dateOfViralLoad}&pmtctCycleId=${pmtctCycleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          },
        );
        if (response.data > 0) {
          objValues.gaOfViralLoad = response.data;
          setObjValues({ ...objValues, [e.target.name]: e.target.value });
        } else {
          //toast.error("Please select a valid date")
          setObjValues({ ...objValues, [e.target.name]: e.target.value });
        }
      }
      getGa();

      // get the value of the viral load according to the viral load date
      async function getViralLoadValue() {
        const dateOfViralLoad = e.target.value;
        //?ancNo=001&visitDate=2023-02-01
        const response = await axios.get(
          `${baseUrl}pmtct/anc/vl-result/?PersonUuid=${
            props.patientObj.person_uuid
              ? props.patientObj.person_uuid
              : props.patientObj.personUuid
          }&dateResultReceived=${dateOfViralLoad}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.length > 0 && response.data[0]) {
          setObjValues({
            ...objValues,
            resultOfViralLoad: response.data[0].currentViralLoad,
          });
        }
        // else {
        //   setObjValues({ ...objValues, [e.target.name]: e.target.value });
        // }
      }
      getViralLoadValue();

      //
    }
    if (e.target.name === "fpCounseling" && e.target.value === "No") {
      objValues.fpMethod = "";
      setObjValues({ ...objValues, ["fpMethod"]: "" });
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
    if (e.target.name === "dsd" && e.target.value !== "Yes") {
      objValues.dsdModel = "";
      objValues.dsdOption = "";
      setObjValues({ ...objValues, ["dsdModel"]: "" });
      setObjValues({ ...objValues, ["dsdOption"]: "" });
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    } //objValues.visitStatus==='VISIT_STATUS_PMTCT_TRANSFER_OUT'
    if (
      e.target.name === "visitStatus" &&
      e.target.value !== "VISIT_STATUS_PMTCT_TRANSFER_OUT"
    ) {
      objValues.transferTo = "";
      setObjValues({ ...objValues, ["transferTo"]: "" });
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  function DsdModelType(dsdmodel) {
    const dsd =
      dsdmodel === "Facility" ? "DSD_MODEL_FACILITY" : "DSD_MODEL_COMMUNITY";
    axios
      .get(`${baseUrl}application-codesets/v2/${dsd}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setDsdModelType(response.data);
      })
      .catch((error) => {
      });
  }

  //Validations of the forms
  const validate = () => {
    temp.visitStatus = objValues.visitStatus ? "" : "This field is required";
    temp.dateOfVisit = objValues.dateOfVisit ? "" : "This field is required";
    temp.dsd = objValues.dsd ? "" : "This field is required";
    temp.enteryPoint = objValues.enteryPoint ? "" : "This field is required";
    temp.fpCounseling = objValues.fpCounseling ? "" : "This field is required";
    //temp.fpMethod = objValues.fpMethod ? "" : "This field is required"
    temp.dateOfmeternalOutcome = objValues.dateOfmeternalOutcome
      ? ""
      : "This field is required";
    temp.maternalOutcome = objValues.maternalOutcome
      ? ""
      : "This field is required";
    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(
            `${baseUrl}pmtct/anc/update-mother-visit/${props.activeContent.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          .then((response) => {
            setSaving(false);
            toast.success("Clinic Visit save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch((error) => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong, please try again";
              toast.error(errorMessage, {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            } else {
              toast.error("Something went wrong. Please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      } else {
        axios
          .post(`${baseUrl}pmtct/anc/pmtct-visit`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            toast.success("Clinic Visit save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch((error) => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong, please try again";
              toast.error(errorMessage, {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            } else {
              toast.error("Something went wrong. Please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      }
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-8 ">
          <h2>Mother Follow-up Visit</h2>
        </div>
      </div>
      <Grid>
        <Grid.Column>
          <Segment>
            <Label
              as="a"
              color="blue"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}>VITAL SIGNS</h4>
            </Label>
            <br />
            <br />
            <div className="row">
              <div className="form-group mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName>
                    Date of Initial Visit{" "}
                    <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="date"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    name="dateOfInitialVisit"
                    id="dateOfInitialVisit"
                    value={objValues.dateOfInitialVisit}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChange}
                    min={patientObj.pmtctEnrollmentDate}
                    disabled={isInitialVisitDisabled}
                  />
                  {/* {errors.dateOfInitialVisit !== "" ? (
                    <span className={classes.error}>{errors.dateOfInitialVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName>
                    Date of Visit <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="date"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    name="dateOfVisit"
                    id="dateOfVisit"
                    value={objValues.dateOfVisit}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChange}
                    min={props.patientObj.firstAncDate}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                    disabled={disabledField}
                  />
                  {errors.dateOfVisit !== "" ? (
                    <span className={classes.error}>{errors.dateOfVisit}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName>
                    Point of Entry<span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="enteryPoint"
                    id="enteryPoint"
                    value={props.patientObj.entryPoint}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={true}
                  >
                    {/* <option value="select">Select </option> */}

                    {entryPoint.map((each, i) => {
                      return (
                        <option key={i} value={each.code}>
                          {each.display}
                        </option>
                      );
                    })}
                  </Input>
                  {errors.enteryPoint !== "" ? (
                    <span className={classes.error}>{errors.enteryPoint}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName>
                    FP Counselling <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="fpCounseling"
                    id="fpCounseling"
                    value={objValues.fpCounseling}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="Yes">YES </option>
                    <option value="No">NO </option>
                  </Input>
                  {errors.fpCounseling !== "" ? (
                    <span className={classes.error}>{errors.fpCounseling}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {objValues.fpCounseling === "Yes" && (
                <div className=" mb-3 col-md-3">
                  <FormGroup>
                    <FormLabelName>FP Method </FormLabelName>
                    <Input
                      type="select"
                      name="fpMethod"
                      id="fpMethod"
                      value={objValues.fpMethod}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value="select">Select </option>
                      {fp.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                    {errors.fpMethod !== "" ? (
                      <span className={classes.error}>{errors.fpMethod}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
              {props.patientObj.entryPoint !== "PMTCT_ENTRY_POINT_ANC" && (
                <div className="mb-3 col-md-3">
                  <FormGroup>
                    <FormLabelName>
                      Date of Delivery <span style={{ color: "red" }}> *</span>
                    </FormLabelName>

                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="dateOfDelivery"
                      id="dateOfDelivery"
                      onChange={handleInputChange}
                      value={objValues.dateOfDelivery}
                      min={props.patientObj.firstAncDate}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={
                        disableDeliveryDate
                          ? disableDeliveryDate
                          : disabledField
                      }
                    />

                    {errors.dateOfDelivery !== "" ? (
                      <span className={classes.error}>
                        {errors.dateOfDelivery}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
            </div>
            <br />
            <Label
              as="a"
              color="teal"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}> VIRAL LOAD </h4>
            </Label>
            <br />
            <br />
            {/* TB Screening Form */}
            <div className="row">
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName>Viral Load Collection Date </FormLabelName>
                  <Input
                    type="date"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    name="dateOfViralLoad"
                    id="dateOfViralLoad"
                    value={objValues.dateOfViralLoad}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    min={props.patientObj.firstAncDate}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.dateOfViralLoad !== "" ? (
                    <span className={classes.error}>
                      {errors.dateOfViralLoad}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName>GA at VL Collection </FormLabelName>
                  <Input
                    type="number"
                    name="gaOfViralLoad"
                    id="gaOfViralLoad"
                    value={objValues.gaOfViralLoad}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    min={props.patientObj.firstAncDate}
                    disabled={disabledField === false ? true : disabledField}
                  />
                  {errors.gaOfViralLoad !== "" ? (
                    <span className={classes.error}>
                      {errors.gaOfViralLoad}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName>Result </FormLabelName>
                  <Input
                    type="number"
                    name="resultOfViralLoad"
                    id="resultOfViralLoad"
                    value={objValues.resultOfViralLoad}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  />
                  {errors.resultOfViralLoad !== "" ? (
                    <span className={classes.error}>
                      {errors.resultOfViralLoad}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
            </div>
            <br />

            <br />
            <Label
              as="a"
              color="black"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}> DSD MODEL & OUTCOME</h4>
            </Label>
            <br />
            <br />
            {/*  */}
            <div className="row">
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName>
                    DSD <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="dsd"
                    id="dsd"
                    value={objValues.dsd}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="Yes">YES </option>
                    <option value="No">NO </option>
                  </Input>
                  {errors.dsd !== "" ? (
                    <span className={classes.error}>{errors.dsd}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {objValues.dsd === "Yes" && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>DSD Model</FormLabelName>
                      <Input
                        type="select"
                        name="dsdModel"
                        id="dsdModel"
                        value={objValues.dsdModel}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select </option>
                        <option value="Facility">Facility </option>
                        <option value="Community">Community </option>
                      </Input>
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>DSD Model Type</FormLabelName>
                      <Input
                        type="select"
                        name="dsdOption"
                        id="dsdOption"
                        value={objValues.dsdOption}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select </option>
                        {dsdModelType.map((value) => (
                          <option key={value.code} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </div>
                </>
              )}
              <div className="form-group mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName>
                    Maternal Outcome <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="maternalOutcome"
                    id="maternalOutcome"
                    value={objValues.maternalOutcome}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {maternalCome.map((value) => (
                      <option key={value.code} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName>
                    Date of Outcome <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="date"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    name="dateOfmeternalOutcome"
                    id="dateOfmeternalOutcome"
                    value={objValues.dateOfmeternalOutcome}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    min={props.patientObj.firstAncDate}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.dateOfmeternalOutcome !== "" ? (
                    <span className={classes.error}>
                      {errors.dateOfmeternalOutcome}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName>
                    Client Visit Status <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="visitStatus"
                    id="visitStatus"
                    value={objValues.visitStatus}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {visitStatus.map((value) => (
                      <option key={value.code} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.visitStatus !== "" ? (
                    <span className={classes.error}>{errors.visitStatus}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {objValues.visitStatus ===
                "VISIT_STATUS_PMTCT_TRANSITIONED_TO_ART_CLINIC" && (
                <div className="form-group mb-3 col-md-3">
                  <FormGroup>
                    <FormLabelName>Name of ART Facility </FormLabelName>
                    <Input
                      type="text"
                      name="transferTo"
                      id="transferTo"
                      value={objValues.transferTo}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    />
                    {errors.transferTo !== "" ? (
                      <span className={classes.error}>{errors.transferTo}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
            </div>
            {/* Display notification when maternal outcome is IIT and transfer out */}
            {objValues.maternalOutcome !== "" &&
            objValues.maternalOutcome !== "MATERNAL_OUTCOME_ACTIVE_IN_PMTCT" &&
            objValues.maternalOutcome !== "" &&
            objValues.maternalOutcome !== "MATERNAL_OUTCOME_ALIVE" ? (
              <h2 style={{ color: "red" }}>Kindly fill tracking form</h2>
            ) : (
              ""
            )}

            <br />
            {props.activeContent &&
            props.activeContent.actionType === "update" ? (
              <>
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  hidden={disabledField}
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Update</span>
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
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>
                      Saving...
                    </span>
                  )}
                </MatButton>
              </>
            )}
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default ClinicVisit;
