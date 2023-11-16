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
  const [entryPoint, setEntryPoint] = useState([]);
  //Vital signs clinical decision support
  const entrypointRef = useRef(null);
  const [objValues, setObjValues] = useState({
    ancNo: patientObj.ancNo,
    dateOfViralLoad: "",
    dateOfVisit: "",
    dateOfmeternalOutcome: "",
    dsd: "",
    dsdModel: "",
    dsdOption: "",
    enteryPoint:
      props.patientObj.entryPoint === "619"
        ? "POINT_ENTRY_PMTCT_ANC"
        : props?.patientObj?.entryPoint === "620"
        ? "POINT_ENTRY_PMTCT_L&D"
        : props?.patientObj?.entryPoint === "621"
        ? "POINT_ENTRY_PMTCT_POSTNATAL_WARD"
        : props.patientObj.ancNo
        ? "POINT_ENTRY_PMTCT_ANC"
        : "",
    fpCounseling: "",
    fpMethod: "",
    gaOfViralLoad: "",
    id: "",
    maternalOutcome: "",
    nextAppointmentDate: "",
    personUuid: patientObj.person_uuid,
    resultOfViralLoad: "",
    transferTo: "",
    visitStatus: "",
    timeOfViralLoad: "",
  });
  // const [vital, setVitalSignDto] = useState({
  //   bodyWeight: "",
  //   diastolic: "",
  //   encounterDate: "",
  //   facilityId: 1,
  //   height: "",
  //   personId: props.patientObj.id,
  //   serviceTypeId: 1,
  //   systolic: "",
  //   pulse:"",
  //   temperature:"",
  //   respiratoryRate:""
  // })
  useEffect(() => {
    ///VitalSigns();
    VISIT_STATUS_PMTCT();
    MATERNAL_OUTCOME();
    FAMILY_PLANNING_METHOD();
    POINT_ENTRY_PMTCT();
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      GetVisit(props.activeContent.id);
      setDisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
  }, [props.activeContent]);

  const GetVisit = (id) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-mother-visit/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setObjValues(response.data);
        DsdModelType(response.data.dsdModel);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const VISIT_STATUS_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/VISIT_STATUS_PMTCT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setVisitStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const POINT_ENTRY_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/POINT_ENTRY_PMTCT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setEntryPoint(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const FAMILY_PLANNING_METHOD = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FAMILY_PLANNING_METHOD`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setFp(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const MATERNAL_OUTCOME = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/MATERNAL_OUTCOME`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setMaternalCome(response.data);
      })
      .catch((error) => {
        //console.log(error);
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
        const response = await axios.get(
          `${baseUrl}pmtct/anc/calculate-ga-from-person?personUuid=${
            props.patientObj.person_uuid
              ? props.patientObj.person_uuid
              : props.patientObj.uuid
          }&visitDate=${dateOfViralLoad}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data > 0) {
          objValues.gaOfViralLoad = response.data;
          setObjValues({ ...objValues, [e.target.name]: e.target.value });
        } else {
          //toast.error("Please select a validate date")
          setObjValues({ ...objValues, [e.target.name]: e.target.value });
        }
      }
      getGa();
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
        //console.log(response.data);
        setDsdModelType(response.data);
      })
      .catch((error) => {
        //console.log(error);
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
            `${baseUrl}pmtct/anc/pmtct-visit/${props.activeContent.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } }
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
                    Date of Visit <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  {console.log("visiting patient", props.patientObj)}
                  <Input
                    type="date"
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
                    Point of Entry <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="enteryPoint"
                    id="enteryPoint"
                    value={objValues.enteryPoint}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={true}
                  >
                    {/* <option value="select">Select </option> */}

                    {props?.patientObj?.entryPoint
                      ? entryPoint.map(
                          (value) =>
                            Number(props.patientObj.entryPoint) ===
                              Number(value.id) && (
                              <option
                                key={value.id}
                                value={value.code}
                                ref={entrypointRef}
                              >
                                {value.display}
                              </option>
                            )
                        )
                      : props.patientObj.ancNo && (
                          <option key={619} value={"POINT_ENTRY_PMTCT_ANC"}>
                            ANC
                          </option>
                        )}
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
                    type="text"
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
              {objValues.visitStatus === "VISIT_STATUS_PMTCT_TRANSFER_OUT" && (
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
            <br />
            {props.activeContent && props.activeContent.actionType ? (
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
