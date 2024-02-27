import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { Button } from "semantic-ui-react";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "./../../../../api";
import { useHistory } from "react-router-dom";
import "react-summernote/dist/react-summernote.css"; // import styles
import { Spinner } from "reactstrap";
import moment from "moment";
import { NoStroller } from "@mui/icons-material";

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

const LabourinfantInfo = (props) => {
  const patientObj = props.patientObj;
  //let history = useHistory();
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [disabledField, setDisabledField] = useState(false);
  const [genders, setGenders] = useState([]);
  const [newDateOfDelivery, setNewDateOfDelivery] = useState("");

  const [hospitalNumStatus, setHospitalNumStatus] = useState(false);
  const [infantInfo, setInfantInfo] = useState({
    ancNo: patientObj?.ancNo,
    dateOfinfantInfo: "",
    firstName: "",
    middleName: "",
    nin: "",
    sex: "",
    surname: "",
    uuid: patientObj.ancUuid,
    dateOfDelivery: "",
    // hospitalNumber: patientObj?.hospitalNumber,
    hospitalNumber: "",

    personUuid: props.patientObj.person_uuid
      ? props.patientObj.person_uuid
      : props.patientObj.personUuid
      ? props.patientObj.personUuid
      : props.patientObj.uuid,
  });

  useEffect(() => {
    SEX();
    //console.log(props.activeContent.obj)
    if (props.activeContent && props.activeContent.actionType === "create") {
      infantInfo.dateOfDelivery = props.activeContent.obj;
    }
    if (props.activeContent && props.activeContent.id) {
      setInfantInfo({ ...infantInfo, ...props.activeContent.obj });
      setDisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
      //props.activeContent.obj.hospitalNumber2=props.activeContent.obj.hospitalNumber
    }
  }, [props.patientObj.id, props.activeContent.id]);

  const SEX = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SEX`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setGenders(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleInputChangeinfantInfoDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "hospitalNumber" && e.target.value !== "") {
      async function getHosiptalNumber() {
        const hosiptalNumber = e.target.value;
        const response = await axios.post(
          `${baseUrl}pmtct/anc/exist/infant-hospital-number`,
          hosiptalNumber,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data !== true) {
          setHospitalNumStatus(false);
          errors.hospitalNumber = "";
        } else {
          errors.hospitalNumber = "";
          toast.error("Error! Hosiptal Number already exist");
          setHospitalNumStatus(true);
        }
      }
      getHosiptalNumber();
    }
    setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value });
  };

  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    temp.firstName = infantInfo.firstName ? "" : "This field is required";
    temp.surname = infantInfo.surname ? "" : "This field is required";
    temp.hospitalNumber = infantInfo.hospitalNumber
      ? ""
      : "This field is required";
    //temp.dateOfinfantInfo = infantInfo.dateOfinfantInfo ? "" : "This field is required"
    temp.sex = infantInfo.sex ? "" : "This field is required";
    //temp.bookingStatus = infantInfo.bookingStatus ? "" : "This field is required"
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
            `${baseUrl}pmtct/anc/update-infant/${props.activeContent.id}`,
            infantInfo,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((response) => {
            setSaving(false);
            //props.patientObj.commenced=true
            toast.success("Record save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "infants",
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
          .post(`${baseUrl}pmtct/anc/add-infants`, infantInfo, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            //props.patientObj.commenced=true
            toast.success("Record save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "infants",
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

  const LoadPage = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "infants",
      id: "",
      actionType: "",
    });
  };

  console.log("date Of Delivery", patientObj);
  console.log("date Of Delivery", props.activeContent.obj);

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        className=" float-end  mr-2 mt-2"
        onClick={() => LoadPage()}
        style={{ backgroundColor: "#014d88" }}
        //startIcon={<FaUserPlus size="10"/>}
      >
        <span style={{ textTransform: "capitalize" }}>Back</span>
      </Button>
      <br />
      <br />
      <br />
      <br />
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
              <h2>New Infant Registration</h2>
              <div className="row">
                {patientObj?.ancNo && (
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>ANC Number</Label>
                      <InputGroup>
                        <Input
                          type="text"
                          name="ancNo"
                          id="ancNo"
                          onChange={handleInputChangeinfantInfoDto}
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

                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      Child's Hospital ID Number <span style={{ color: "red" }}> *</span>
                    </Label>
                    <InputGroup>
                      <Input
                        type="text"
                        name="hospitalNumber"
                        id="hospitalNumber"
                        onChange={handleInputChangeinfantInfoDto}
                        value={infantInfo.hospitalNumber}
                        // disabled={true}
                      />
                    </InputGroup>
                    {errors.hospitalNumber !== "" ? (
                      <span className={classes.error}>
                        {errors.hospitalNumber}
                      </span>
                    ) : (
                      ""
                    )}
                    {hospitalNumStatus === true ? (
                      <span className={classes.error}>
                        {"Hospital number already exist"}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      Date of Delivery <span style={{ color: "red" }}> *</span>
                    </Label>
                    <InputGroup>
                      <Input
                        type="date"
                        disabled={true}
                        name="dateOfDelivery"
                        id="dateOfDelivery"
                        onChange={handleInputChangeinfantInfoDto}
                        min={props.patientObj.firstAncDate}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        value={
                          infantInfo.dateOfDelivery
                            ? infantInfo.dateOfDelivery
                            : newDateOfDelivery
                        }
                        // disabled={infantInfo.dateOfDelivery ? true : false}
                      />
                    </InputGroup>
                    {errors.dateOfDelivery !== "" ? (
                      <span className={classes.error}>
                        {errors.dateOfDelivery}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      Infant Given Name <span style={{ color: "red" }}> *</span>
                    </Label>
                    <InputGroup>
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        onChange={handleInputChangeinfantInfoDto}
                        value={infantInfo.firstName}
                        disabled={disabledField}
                      />
                    </InputGroup>
                    {errors.firstName !== "" ? (
                      <span className={classes.error}>{errors.firstName}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>Infant Surname</Label>
                    <InputGroup>
                      <Input
                        type="input"
                        name="surname"
                        id="surname"
                        onChange={handleInputChangeinfantInfoDto}
                        value={infantInfo.surname}
                        disabled={disabledField}
                      ></Input>
                    </InputGroup>
                    {errors.surname !== "" ? (
                      <span className={classes.error}>{errors.surname}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      Sex <span style={{ color: "red" }}> *</span>
                    </Label>
                    <InputGroup>
                      <Input
                        type="select"
                        name="sex"
                        id="sex"
                        onChange={handleInputChangeinfantInfoDto}
                        value={infantInfo.sex}
                        disabled={disabledField}
                      >
                        <option value="">Select </option>

                        {genders.map((value) => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                    </InputGroup>
                    {errors.sex !== "" ? (
                      <span className={classes.error}>{errors.sex}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                {/*  */}
              </div>

              {/* <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >National Identity  Number(NIN)</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="nin"
                                    id="nin"
                                    onChange={handleInputChangeinfantInfoDto}
                                    value={infantInfo.nin} 
                                    disabled={disabledField}
                                />

                            </InputGroup>
                            {errors.nin !=="" ? (
                                    <span className={classes.error}>{errors.nin}</span>
                            ) : "" }
                            </FormGroup>
                    </div> */}
            </div>

            {saving ? <Spinner /> : ""}
            <br />
            {props.activeContent &&
            props.activeContent.actionType === "update" ? (
              <>
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  disabled={saving}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Update</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>
                      Updating
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
                  hidden={disabledField || hospitalNumStatus}
                  className={classes.button}
                  disabled={saving}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>Saving</span>
                  )}
                </MatButton>
              </>
            )}
            <MatButton
              variant="contained"
              className={classes.button}
              startIcon={<CancelIcon />}
              style={{ backgroundColor: "#992E62" }}
              onClick={() => LoadPage()}
            >
              <span style={{ textTransform: "capitalize" }}>Cancel</span>
            </MatButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default LabourinfantInfo;
