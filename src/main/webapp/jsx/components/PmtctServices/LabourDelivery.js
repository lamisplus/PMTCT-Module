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

import { toast } from "react-toastify";
import { url as baseUrl, token } from "./../../../api";
import { useHistory } from "react-router-dom";
import "react-summernote/dist/react-summernote.css"; // import styles
import { Spinner } from "reactstrap";
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

const LabourDelivery = (props) => {
  const patientObj = props.patientObj;
  //let history = useHistory();
  const classes = useStyles();
  const [delieryMode, setDelieryMode] = useState([]);
  const [placeOfDelivery, setPlaceOfDelivery] = useState([]);
  const [feedingDecision, setfeedingDecision] = useState([]);
  const [maternalOutCome, setmaternalOutCome] = useState([]);
  const [saving, setSaving] = useState(false);
  const [disabledField, setSisabledField] = useState(false);
  const [errors, setErrors] = useState({});
  const [childStatus, setChildStatus] = useState([]);
  const [bookingStatus, setBookingStatus] = useState([]);
  const [romdelivery, setRomdelivery] = useState([]);
  const [timehiv, setTimehiv] = useState([]);
  const [delivery, setDelivery] = useState({
    placeOfDelivery: "",
    ancNo: patientObj.ancNo,
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
    maternalOutcome: "",
    maternalOutcomeChild: "",
    modeOfDelivery: "",
    onArt: "",
    referalSource: "",
    romDeliveryInterval: "",
    vaginalTear: "",
    numberOfInfantsAlive: "",
    numberOfInfantsDead: "",
    personUuid: props.patientObj.person_uuid
      ? props.patientObj.person_uuid
      : props.patientObj.personUuid
      ? props.patientObj.personUuid
      : props.patientObj.uuid,
  });
  useEffect(() => {
    MODE_DELIVERY();
    FEEDING_DECISION();
    MATERNAL_OUTCOME();
    CHILD_STATUS_DELIVERY();
    BOOKING_STATUS();
    ROM_DELIVERY_INTERVAL();
    TIME_HIV_DIAGNOSIS();
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      GetPatientLabourDTO(props.activeContent.id);
      setSisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
  }, [props.patientObj.id, props.activeContent]);

  const GetPatientLabourDTO = (id) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-delivery/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data.find((x)=> x.id===id));
        setDelivery(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //Get list
  const BOOKING_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/BOOKING STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setBookingStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const getPlaceOfDelivery = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/BOOKING STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setPlaceOfDelivery(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const TIME_HIV_DIAGNOSIS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TIME_HIV_DIAGNOSIS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setTimehiv(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const ROM_DELIVERY_INTERVAL = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/ROM_DELIVERY_INTERVAL`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setRomdelivery(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const MODE_DELIVERY = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/MODE_DELIVERY`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setDelieryMode(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const CHILD_STATUS_DELIVERY = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/CHILD_STATUS_DELIVERY`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setChildStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const FEEDING_DECISION = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FEEDING DECISION`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setfeedingDecision(response.data);
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
        setmaternalOutCome(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleInputChangeDeliveryDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "dateOfDelivery" && e.target.value !== "") {
      async function getGa() {
        const ga = e.target.value;
        const response = await axios.get(
          `${baseUrl}pmtct/anc/calculate-ga-from-person?personUuid=${
            props.patientObj.person_uuid
              ? props.patientObj.person_uuid
              : props.patientObj.personUuid
              ? props.patientObj.personUuid
              : props.patientObj.uuid
          }&visitDate=${ga}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data > 0) {
          delivery.gaweeks = response.data;
          setDelivery({ ...delivery, [e.target.name]: e.target.value });
        } else {
          toast.error("Please select a validate date");
          setDelivery({ ...delivery, [e.target.name]: e.target.value });
        }
      }
      getGa();
    }
    setDelivery({ ...delivery, [e.target.name]: e.target.value });
  };

  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    temp.artStartedLdWard = delivery.artStartedLdWard
      ? ""
      : "This field is required";
    //temp.referalSource = delivery.referalSource ? "" : "This field is required"
    temp.romDeliveryInterval = delivery.romDeliveryInterval
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
    temp.hivExposedInfantGivenHbWithin24hrs =
      delivery.hivExposedInfantGivenHbWithin24hrs
        ? ""
        : "This field is required";
    temp.hcstatus = delivery.hcstatus ? "" : "This field is required";
    temp.hbstatus = delivery.hbstatus ? "" : "This field is required";
    temp.gaweeks = delivery.gaweeks ? "" : "This field is required";
    temp.feedingDecision = delivery.feedingDecision
      ? ""
      : "This field is required";
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
    delivery.maternalOutcomeChild !== "" &&
      (temp.numberOfInfantsAlive = delivery.numberOfInfantsAlive
        ? ""
        : "This field is required");
    delivery.maternalOutcomeChild !== "" &&
      (temp.numberOfInfantsDead = delivery.numberOfInfantsDead
        ? ""
        : "This field is required");

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
      if (props.activeContent && props.activeContent.actionType) {
        //Perform operation for updation action
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
        //perform opertaio for save action
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
              route: "recent-history",
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
          {console.log(patientObj)}
          <form>
            <div className="row">
              <h2>Labour and Delivery</h2>
              {props.patientObj.ancNo && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>ANC ID</Label>
                    <InputGroup>
                      <Input
                        type="text"
                        name="ancNo"
                        id="ancNo"
                        onChange={handleInputChangeDeliveryDto}
                        value={delivery.ancNo}
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
                      <option value="">Select </option>

                      {bookingStatus.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.bookingStatus !== "" ? (
                    <span className={classes.error}>
                      {errors.bookingStatus}
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
                      name="dateOfDelivery"
                      id="dateOfDelivery"
                      onChange={handleInputChangeDeliveryDto}
                      value={delivery.dateOfDelivery}
                      min={props.patientObj.firstAncDate}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
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
                    Gestational Age (weeks){" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="number"
                      name="gaweeks"
                      id="gaweeks"
                      onChange={handleInputChangeDeliveryDto}
                      value={delivery.gaweeks}
                      disabled
                      min="0"
                    />
                  </InputGroup>
                  {errors.gaweeks !== "" ? (
                    <span className={classes.error}>{errors.gaweeks}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    ROM Delivery Interval{" "}
                    <span style={{ color: "red" }}> *</span>{" "}
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="romDeliveryInterval"
                      id="romDeliveryInterval"
                      onChange={handleInputChangeDeliveryDto}
                      value={delivery.romDeliveryInterval}
                      disabled={disabledField}
                    >
                      <option value="">Select </option>

                      {romdelivery.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.romDeliveryInterval !== "" ? (
                    <span className={classes.error}>
                      {errors.romDeliveryInterval}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Place of delivery <span style={{ color: "red" }}> *</span>
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
                      <option value="">Select </option>

                      {placeOfDelivery.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.bookingStatus !== "" ? (
                    <span className={classes.error}>
                      {errors.bookingStatus}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Mode of Delivery <span style={{ color: "red" }}> *</span>
                  </Label>

                  <Input
                    type="select"
                    name="modeOfDelivery"
                    id="modeOfDelivery"
                    value={delivery.modeOfDelivery}
                    onChange={handleInputChangeDeliveryDto}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>

                    {delieryMode.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.modeOfDelivery !== "" ? (
                    <span className={classes.error}>
                      {errors.modeOfDelivery}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
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
                    </Input>
                  </InputGroup>
                  {errors.episiotomy !== "" ? (
                    <span className={classes.error}>{errors.episiotomy}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
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
                    </Input>
                  </InputGroup>
                  {errors.vaginalTear !== "" ? (
                    <span className={classes.error}>{errors.vaginalTear}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Feeding decision <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="feedingDecision"
                      id="feedingDecision"
                      onChange={handleInputChangeDeliveryDto}
                      value={delivery.feedingDecision}
                      disabled={disabledField}
                    >
                      <option value="">Select </option>

                      {feedingDecision.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.feedingDecision !== "" ? (
                    <span className={classes.error}>
                      {errors.feedingDecision}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Child given ARV within 72 hrs{" "}
                    <span style={{ color: "red" }}> *</span>
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
                    <span className={classes.error}>
                      {errors.childGivenArvWithin72}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
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
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    HIV exposed infant given Hep B within 24 hrs of birth{" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
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
                  {errors.hivExposedInfantGivenHbWithin24hrs !== "" ? (
                    <span className={classes.error}>
                      {errors.hivExposedInfantGivenHbWithin24hrs}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
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

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    ART started in L&D ward{" "}
                    <span style={{ color: "red" }}> *</span>
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
                    <span className={classes.error}>
                      {errors.artStartedLdWard}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Hepatitis B Status <span style={{ color: "red" }}> *</span>
                  </Label>
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
                  {errors.hbstatus !== "" ? (
                    <span className={classes.error}>{errors.hbstatus}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Hepatitis C Status <span style={{ color: "red" }}> *</span>
                  </Label>
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
                  {errors.hcstatus !== "" ? (
                    <span className={classes.error}>{errors.hcstatus}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <h3>Maternal Outcome</h3>
              <div className="form-group mb-3 col-md-6">
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
                      <option value="">Select </option>
                      {maternalOutCome.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.maternalOutcome !== "" ? (
                    <span className={classes.error}>
                      {errors.maternalOutcome}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Child status <span style={{ color: "red" }}> *</span>
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
                      <option value="">Select </option>
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
              {delivery.childStatus === "CHILD_STATUS_DELIVERY_ALIVE" && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Number of Child Alive{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <InputGroup>
                        <Input
                          type="Number"
                          name="numberOfInfantsAlive"
                          id="numberOfInfantsAlive"
                          onChange={handleInputChangeDeliveryDto}
                          value={delivery.numberOfInfantsAlive}
                          disabled={disabledField}
                          min="0"
                        />
                      </InputGroup>
                      {errors.numberOfInfantsAlive !== "" ? (
                        <span className={classes.error}>
                          {errors.numberOfInfantsAlive}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Number of Child Dead{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <InputGroup>
                        <Input
                          type="Number"
                          name="numberOfInfantsDead"
                          id="numberOfInfantsDead"
                          onChange={handleInputChangeDeliveryDto}
                          value={delivery.numberOfInfantsDead}
                          disabled={disabledField}
                          min="0"
                        />
                      </InputGroup>
                      {errors.numberOfInfantsDead !== "" ? (
                        <span className={classes.error}>
                          {errors.numberOfInfantsDead}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}
            </div>
            {/* Display notification when maternal outcome is IIT and transfer out */}
            {
                (delivery.maternalOutcome !=="" && delivery.maternalOutcome !== "MATERNAL_OUTCOME_ACTIVE_IN_PMTCT")  && (delivery.maternalOutcome!=="" &&  delivery.maternalOutcome !== "MATERNAL_OUTCOME_ALIVE") ? (
                    <h2 style={{color:"red"}}>Kindly fill tracking form</h2>
                ) : ""
            }
            
            {saving ? <Spinner /> : ""}
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
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default LabourDelivery;
