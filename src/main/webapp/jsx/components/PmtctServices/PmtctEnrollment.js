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
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { useHistory, useLocation } from "react-router-dom";
import "react-summernote/dist/react-summernote.css"; // import styles
import { Spinner } from "reactstrap";
import { Message } from "semantic-ui-react";
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

const AncPnc = (props) => {
  const patientObj = props.patientObj;
  let history = useHistory();

  const location = useLocation();
  const locationState = location && location.state ? location.state : null;
  console.log(locationState);
  const [regimenType, setRegimenType] = useState([]);
  const classes = useStyles();
  const [disabledField, setSisabledField] = useState(false);
  const [entryPoint, setentryPoint] = useState([]);
  const [entryPointValue, setentryPointValue] = useState("");
  const [timeMotherArt, setTimeMotherArt] = useState([]);

  const [tbStatus, setTbStatus] = useState([]);
  const [artStartTime, setartStartTime] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [entryValueDisplay, setEntryValueDisplay] = useState({});
  const [allNewEntryPoint, setAllNewEntryPoint] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [urinalysisList, setUrinalysisList] = useState([]);

  const [enroll, setEnrollDto] = useState({
    hepatitisB: patientObj.hepatitisB ? patientObj.hepatitisB : "",
    urinalysis: patientObj.urinalysis ? patientObj.urinalysis : "",
    ancNo: patientObj.ancNo ? patientObj.ancNo : "",
    pmtctEnrollmentDate: "",
    entryPoint: entryValueDisplay?.id,
    ga: props.patientObj.gaweeks,
    gravida: props.patientObj.gravida,
    artStartDate: "",
    artStartTime: patientObj.artStartTime ? patientObj.artStartTime : "",
    id: "",
    tbStatus: "",
    hivStatus: patientObj.hivStatus
      ? patientObj.hivStatus
      : patientObj.staticHivStatus
      ? patientObj.staticHivStatus
      : "",
    lmp: props?.patientObj?.lmp ? props?.patientObj?.lmp : "",
    gaweeks: props?.patientObj?.gaweeks ? props?.patientObj?.gaweeks : "",

    // personUuid:
    //   locationState && locationState.patientObj
    //     ? locationState.patientObj.uuid
    //     : null,
    pmtctType: entryValueDisplay.display,
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
  console.log("props", props?.patientObj);
  const RegimenType = (id) => {
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
  console.log(props.allEntryPoint);
  const TIMING_MOTHERS_ART_INITIATION = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TIMING_MOTHERS_ART_INITIATION`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTimeMotherArt(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const GET_URINALYSIS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PMTCT_URINALYSIS_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUrinalysisList(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
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
  const NEW_POINT_ENTRY_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PMTCT_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAllNewEntryPoint(response.data);
        console.log(response.data);
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
    } else {
    }
  };
  useEffect(() => {
    GET_URINALYSIS();
    AdultRegimenLine();
    TIMING_MOTHERS_ART_INITIATION();
    NEW_POINT_ENTRY_PMTCT();
    POINT_ENTRY_PMTCT();
    TIME_ART_INITIATION_PMTCT();
    TB_STATUS();

    if (props?.patientObj.id) {
      getARTStartDate();
    }
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      GetPatientPMTCT(props.activeContent.id);
      setSisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
    if (
      props?.patientObj?.person_uuid ||
      locationState?.patientObj?.person_uuid
    ) {
      console.log("props.patientObj.person_uuid", props.patientObj.person_uuid);
      console.log(
        "locationState.patientObj.person_uuid",
        locationState.patientObj.person_uuidd
      );

      setEnrollDto({
        ...enroll,
        personUuid: locationState.patientObj.person_uuid,
      });
    } else if (props?.patientObj?.uuid || locationState?.patientObj?.uuid) {
      setEnrollDto({
        ...enroll,
        personUuid: locationState.patientObj.uuid,
      });
    }
    // else {
    //   setEnrollDto({
    //     ...enroll,
    //     personDto:
    //       locationState && locationState.patientObj
    //         ? locationState.patientObj
    //         : null,
    //   });
    // }

    // setEnrollDto(
    //   patientObj.hivStatus
    //     ? patientObj.hivStatus
    //     : patientObj.staticHivStatus
    //     ? patientObj.staticHivStatus
    //     : ""
    // );
  }, []);

  useEffect(() => {
    // if (props?.allEntryPoint) {
    getPatientEntryType();
    // }
  }, [allNewEntryPoint]);

  console.log(entryValueDisplay);
  useEffect(() => {
    if (props.getPMTCTInfo) {
      props.getPMTCTInfo(enroll);
    }
  }, [enroll]);
  console.log(
    "uuid",
    props?.patientObj,
    locationState?.patientObj?.person_uuid
  );

  const GetPatientPMTCT = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/view-pmtct-enrollment/${props.activeContent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        console.log("testing", response.data);
        setEnrollDto({ ...enroll, ...response.data });
        setInfantMotherArtDto({
          ...infantMotherArtDto,
          regimenTypeId: response.data.regimenTypeId,
          regimenId: response.data.regimenId,
          motherArtInitiationTime: response.data.motherArtInitiationTime,
        });
        RegimenType(response.data.regimenTypeId);
        //regimenTypeId
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const getARTStartDate = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/art/?PersonUuid=${
          props?.patientObj.person_Uuud
            ? props?.patientObj.person_Uuud
            : props?.patientObj?.personUuud
            ? props?.patientObj?.personUuud
            : props?.patientObj?.person_uuid
            ? props?.patientObj?.person_uuid
            : props?.patientObj?.uuid
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data[0] !== null && response?.data[0]?.artStartDate) {
          setEnrollDto({
            ...enroll,
            artStartDate: response?.data[0]?.artStartDate,
          });
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const POINT_ENTRY_PMTCT = () => {
    console.log("former", enroll);

    axios
      .get(`${baseUrl}application-codesets/v2/POINT_ENTRY_PMTCT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setentryPoint(response.data);
        console.log(response.data);
        // console.log("deducted", ans);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const TIME_ART_INITIATION_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TIMING_MOTHERS_ART_INITIATION`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setartStartTime(response.data);
      })
      .catch((error) => {});
  };
  const TB_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TB_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTbStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleInputChangeEnrollmentDto = (e) => {
    setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
    console.log("payload", enroll);
    // artStartTime
    if (e.target.name === "artStartTime" && e.target.value !== "") {
      setInfantMotherArtDto({
        ...infantMotherArtDto,
        motherArtInitiationTime: e.target.value,
      });
    }
    if (e.target.name === "lmp" && e.target.value !== "") {
      console.log("calculate ", e.target.name, e.target.value);

      async function getGa() {
        const ga = e.target.value;
        const response = await axios.get(
          `${baseUrl}pmtct/anc/calculate-ga/${ga}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data > 0) {
          enroll.gaweeks = response.data;
          setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
        } else {
          enroll.gaweeks = response.data;
          toast.error("Please select a validate date");
          setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
        }
      }
      getGa();
    }
  };

  console.log(props.patientObj);
  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    temp.pmtctEnrollmentDate = enroll.pmtctEnrollmentDate
      ? ""
      : "This field is required";
    //temp.entryPoint = enroll.entryPoint ? "" : "This field is required"
    //temp.ga = enroll.ga ? "" : "This field is required"
    // temp.gravida = enroll.gravida ? "" : "This field is required"
    temp.pmtctEnrollmentDate = enroll.pmtctEnrollmentDate
      ? ""
      : "This field is required";
    temp.artStartDate = enroll.artStartDate ? "" : "This field is required";
    temp.artStartTime = enroll.artStartTime ? "" : "This field is required";
    temp.tbStatus = enroll.tbStatus ? "" : "This field is required";
    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    enroll.motherArtInitiationTime = infantMotherArtDto.motherArtInitiationTime;
    enroll.regimenTypeId = infantMotherArtDto.regimenTypeId;
    enroll.regimenId = infantMotherArtDto.regimenId;

    if (validate()) {
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType) {
        //Perform operation for update action
        axios
          .put(
            `${baseUrl}pmtct/anc/update-pmtct-enrollment/${props.activeContent.id}`,
            enroll,
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
          personUuid:
            locationState && locationState.patientObj
              ? locationState.patientObj.uuid
              : props.patientObj.uuid,
          personUuid: props.patientObj.person_uuid
            ? props.patientObj.person_uuid
            : locationState.patientObj.uuid,
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
                  backgroundColor: "#014d88",
                  color: "#fff",
                  fontWeight: "bolder",
                  borderRadius: "0.2rem",
                  marginTop: "-20px",
                }}
              >
                <h5 className="card-title" style={{ color: "#fff" }}>
                  PMTCT Enrollment
                </h5>
              </div>

              <h3 className="mb-3">
                <span>Point of Entry: </span>
                {/* 
                {locationState.postValue}
                <span>
                  {` ${
                    locationState?.subPostValue
                      ? locationState?.subPostValue
                      : ""
                  }`}
                </span> */}

                {entryValueDisplay.display}
              </h3>

              {console.log()}
              {props?.ancEntryType && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>
                      ANC ID
                      {/* <span style={{ color:"red"}}> *</span> */}
                    </Label>
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
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Date of Enrollment <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="date"
                      name="pmtctEnrollmentDate"
                      id="pmtctEnrollmentDate"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.pmtctEnrollmentDate}
                      min={props.patientObj.firstAncDate}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
                    />
                  </InputGroup>
                  {errors.pmtctEnrollmentDate !== "" ? (
                    <span className={classes.error}>
                      {errors.pmtctEnrollmentDate}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {
                // !props?.ancEntryType &&
                true && (
                  <>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date Of Last Menstrual Period
                          <span style={{ color: "red" }}>*</span>{" "}
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            name="lmp"
                            id="lmp"
                            onChange={handleInputChangeEnrollmentDto}
                            value={
                              props?.ancEntryType
                                ? props?.patientObj?.lmp
                                : enroll.lmp
                            }
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={props?.ancEntryType}
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
                            value={
                              props?.ancEntryType
                                ? props?.patientObj?.gaweeks
                                : enroll.gaweeks
                            }
                            disabled
                          />
                        </InputGroup>
                        {errors.gaweeks !== "" ? (
                          <span className={classes.error}>
                            {errors.gaweeks}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </>
                )
              }

              {/* <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Point of Entry <span style={{ color:"red"}}> *</span></Label>
                        <InputGroup> 
                            <Input 
                                type="select"
                                name="entryPoint"
                                id="entryPoint"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.entryPoint} 
                                disabled={disabledField}
                            >
                                <option value="">Select</option>
                                {entryPoint.map((value, index) => (
                                    <option key={index} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                            </Input>

                        </InputGroup>
                        {errors.entryPoint !=="" ? (
                                <span className={classes.error}>{errors.entryPoint}</span>
                        ) : "" }
                        </FormGroup>
                    </div>  */}

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
                      name="artStartDate"
                      id="artStartDate"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.artStartDate}
                      max={moment(new Date()).format("YYYY-MM-DD")}
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
              {/* <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName>
                    Timing of mother's ART Initiation{" "}
                  </FormLabelName>
                  <Input
                    type="select"
                    name="motherArtInitiationTime"
                    id="motherArtInitiationTime"
                    value={infantMotherArtDto.motherArtInitiationTime}
                    onChange={handleInputChangeInfantMotherArtDto}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="select">Select </option>
                    {timeMotherArt.map((value, index) => (
                      <option key={index} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.motherArtInitiationTime !== "" ? (
                    <span className={classes.error}>
                      {errors.motherArtInitiationTime}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div> */}

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
                        border: "1px solid #014D88",
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
                    <span className={classes.error}>
                      {errors.regimenTypeId}
                    </span>
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
                      border: "1px solid #014D88",
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

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    TB Status <span style={{ color: "red" }}> *</span>
                  </Label>
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
                  {errors.tbStatus !== "" ? (
                    <span className={classes.error}>{errors.tbStatus}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Hepatitis B Status
                    {/* <span style={{ color: "red" }}> *</span> */}
                  </Label>
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
                  {/* {errors.hbstatus !== "" ? (
                    <span className={classes.error}>{errors.hbstatus}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Urinalysis
                    {/* <span style={{ color: "red" }}> *</span> */}
                  </Label>
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
                      {urinalysisList.length > 0 &&
                        urinalysisList.map((each) => {
                          return (
                            <option value={each.code} key={each.id}>
                              {each.display}
                            </option>
                          );
                        })}
                    </Input>
                  </InputGroup>
                  {/* {errors.hbstatus !== "" ? (
                    <span className={classes.error}>{errors.hbstatus}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>

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
                      disabled={
                        patientObj.hivStatus
                          ? true
                          : patientObj.staticHivStatus
                          ? true
                          : false
                      }
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.hivStatus}
                    >
                      <option value="">Select</option>
                      <option value="Positive">Positive</option>
                      <option value="Negative">Negative</option>
                      <option value="Unknown">Unknown</option>
                    </Input>
                  </InputGroup>
                  {errors.hivStatus !== "" ? (
                    <span className={classes.error}>{errors.hivStatus}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
            </div>
            <div>
              {" "}
              <>
                {/* <Label
                  as="a"
                  color="teal"
                  style={{ width: "106%", height: "35px" }}
                  ribbon
                >
                  <h4 style={{ color: "#fff" }}> Mother's ART </h4>
                </Label>
                <br />
                <br /> */}
                {/* <div className="row">
                </div> */}
              </>
            </div>
            {saving ? <Spinner /> : ""}
            <br />

            {props.hideUpdateButton && (
              <>
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
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AncPnc;
