import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  FormGroup,
  Label as FormLabelName,
  Input,
  InputGroup,
  InputGroupText,
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
import { Grid, Segment, Label, List } from "semantic-ui-react";

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
  const [infantHospitalNumber, setInfantHospitalNumber] = useState("");
  const [agectx, setAgeCTX] = useState([]);
  const [ageAtTestList, setAtTestList] = useState([]);
  const [PCRList, setPCRList] = useState([]);

  const [infantArv, setInfantArv] = useState([]);
  //Vital signs clinical decision support
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    bodyWeight: "",
  });
  const [pcrResult, setPcrResult] = useState([]);
  const [hospitalNumStatus, setHospitalNumStatus] = useState(false);
  const [infantInfo, setInfantInfo] = useState({
    ancNo: patientObj?.ancNo,
    dateOfinfantInfo: "",
    firstName: "",
    middleName: "",
    nin: "",
    sex: "",
    surname: "",
    bodyWeight: "",
    uuid: patientObj.ancUuid,
    dateOfDelivery: "",
    infantArvDto: "",
    ctxStatus: "",
    // hospitalNumber: patientObj?.hospitalNumber,
    hospitalNumber: "",
    personUuid: props.patientObj.person_uuid
      ? props.patientObj.person_uuid
      : props.patientObj.personUuid
      ? props.patientObj.personUuid
      : props.patientObj.uuid,
  });
  const [infantPCRTestDto, setInfantPCRTestDto] = useState({
    ageAtTest: "",
    ancNumber: props.patientObj.ancNo,
    dateResultReceivedAtFacility: "",
    dateResultReceivedByCaregiver: "",
    dateSampleCollected: "",
    dateSampleSent: "",
    infantHospitalNumber: infantHospitalNumber,
    results: "",
    testType: "",

  });
  const [infantArvDto, setInfantArvDto] = useState({
    ageAtCtx: "",
    ancNumber: props.patientObj.ancNo,
    arvDeliveryPoint: "",
    infantArvTime: "",
    infantArvType: "",
    infantHospitalNumber: infantHospitalNumber ? infantHospitalNumber : "",
    dateOfCtx: "",
    dateOfArv: "",
  });
  const INFANT_PCR_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INFANT_PCR_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPcrResult(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  // caluculate the PCR
  const calculateAgeInWeek = (dateOfBirth) => {
    // let ex = "2024-01-01";
    let ex = dateOfBirth;
    let splitedInfantDate = ex.split("-");
    let infantYear = Number(splitedInfantDate[0]);
    let infantMonth = Number(splitedInfantDate[1]);
    let infantDate = Number(splitedInfantDate[2]);

    // must be greater than 6 weeks
    let today = moment().format("YYYY-MM-DD");
    let splitedTodayDate = today.split("-");
    let todayYear = Number(splitedTodayDate[0]);
    let todayMonth = Number(splitedTodayDate[1]);
    let todayDate = Number(splitedTodayDate[2]);

    let weekCounts = moment("20240313", "YYYYMMDD").fromNow();

    // compare the year
    if (Number(todayYear) === Number(infantYear)) {
      // compare the month

      if (todayMonth > infantMonth) {
        let monthOld = todayMonth - infantMonth;

        // convert to weeks
        let convertMonthToWeeks = monthOld * 4;
        return convertMonthToWeeks;
      } else if (todayMonth === infantMonth) {
        let dayOld = todayDate - infantDate;
        // convert to weeks
        let calculatingDaysToWeeks = dayOld / 7;
        if (1 > calculatingDaysToWeeks) {
          return 0;
        } else {
          let convertDayToWeeks = calculatingDaysToWeeks;

          return Math.floor(convertDayToWeeks);
        }
      }
    } else if (todayYear > infantYear) {
      let yearOld = todayYear - infantYear;

      let calculateYearInWeeks = yearOld * 52.1429;

      return Math.floor(calculateYearInWeeks);
    }
  };
  const getAgeAtTestMonthList = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/CHILD_TEST_AGE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAtTestList(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleInputChangeInfantPCRTestDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    //console.log(e.target.name)infantPCRTestDto, setInfantPCRTestDto
    setInfantPCRTestDto({
      ...infantPCRTestDto,
      [e.target.name]: e.target.value,
    });
  };
  const handleInputChangeInfantArvDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    //console.log(e.target.name),
    if(e.target.name === "dateOfCtx"){

      let result =calculateAgeAtCTX(e.target.value)

      setInfantArvDto({...infantArvDto,[e.target.name]: e.target.value , ageAtCtx:  result })
  
    }else if(e.target.name === "dateOfArv"){

      let result =calculateArvProphylaxis(e.target.value)

      setInfantArvDto({...infantArvDto,[e.target.name]: e.target.value , infantArvTime:  result })
  
    }else if(e.target.name ===  "infantArvType"){

      setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value });

      setErrors({ ...errors, [e.target.name]: "", dateOfArv: "" });

    }else{
      setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value });

    }
  };

  //This is to get infant hospital numbet when viewing or updating infant
  const INFANT_ARV_PROPHYLAXIS_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INFANT_ARV_PROPHYLAXIS_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setInfantArv(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleInputValueCheckweight = (e) => {
    if (
      e.target.name === "bodyWeight" &&
      (e.target.value < 3 || e.target.value > 150)
    ) {
      const message =
        "Body weight must not be greater than 150 and less than 3";
      setVitalClinicalSupport({ ...vitalClinicalSupport, bodyWeight: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, bodyWeight: "" });
    }
  };

  useEffect(() => {
    getAgeAtTestMonthList();
    INFANT_PCR_RESULT();
    SEX();
    AGE_CTX_INITIATION();
    INFANT_ARV_PROPHYLAXIS_TYPE();
    PCR_SAMPLE_TYPE()
    // console.log(props.activeContent.obj);
    if (props.activeContent && props.activeContent.actionType === "create") {
      infantInfo.dateOfDelivery = props.activeContent.obj;
      let weeks = calculateAgeInWeek(infantInfo.dateOfDelivery);
    //  weeks < 7
      if (weeks < 7) {
        setInfantPCRTestDto({
          ...infantPCRTestDto,
          testType: "First PCR",
        });
        axios
          .get(`${baseUrl}application-codesets/v2/1ST PCR_CHILD_TEST_AGE`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setAtTestList(response.data);
          })
          .catch((error) => {
            //console.log(error);
          });
      }

      if (weeks > 11) {
        setInfantPCRTestDto({
          ...infantPCRTestDto,
          testType: "Second PCR",
        });
        axios
          .get(`${baseUrl}application-codesets/v2/2ND_3RD_PCR_CHILD_TEST_AGE`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setAtTestList(response.data);
          })
          .catch((error) => {
            //console.log(error);
          });
      }
    }
    if (props.activeContent && props.activeContent.id) {
      setInfantInfo({ ...infantInfo, ...props.activeContent.obj });
      setInfantArvDto({
        ...infantArvDto,
        ...props.activeContent.obj.infantArvDto,
      });
      setInfantPCRTestDto({
        ...infantArvDto,
        ...props.activeContent.obj.infantPCRTestDto,
      });
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


  const PCR_SAMPLE_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INFANT_TESTING_PCR`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        let newInfantPcrList =[]
        //console.log(response.data);
         
            response?.data.map((each, index)=>{
              if(each.code === "INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT"){
                newInfantPcrList.push(each)
              }

            })
          

        setPCRList(newInfantPcrList);
      })
      .catch((error) => {
        //console.log(error);
      });
  };


  const calculateAgeAtCTX  =(dateaOfCTX)=>{
    const deliveryDate = moment(infantInfo.dateOfDelivery ? infantInfo.dateOfDelivery : newDateOfDelivery)

    const lastCTX  = moment(dateaOfCTX)

        if(lastCTX.diff(deliveryDate, 'months')  <  2){
            return "AGE_CTX_INITIATION_<_2__MONTHS";        

        }else{

          return "AGE_CTX_INITIATION_≥_2__MONTHS";     
           }

  }

  

  const calculateArvProphylaxis  =(dateaOfCTX)=>{
    const deliveryDate = moment(infantInfo.dateOfDelivery ? infantInfo.dateOfDelivery : newDateOfDelivery)
    const lastCTX  = moment(dateaOfCTX)
        if(lastCTX.diff(deliveryDate, 'hours')  < 72){
            return "Within 72 hour";        
        }else{
          return "After 72 hour";        }
  }





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

      setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value });

    }else  if (e.target.name === "dateOfDelivery" && e.target.value !== "") {
      let weeks = calculateAgeInWeek(e.target.value);

      if (weeks < 7) {
        setInfantPCRTestDto({ ...infantPCRTestDto, testType: "First PCR" });
        axios
          .get(`${baseUrl}application-codesets/v2/1ST PCR_CHILD_TEST_AGE`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setAtTestList(response.data);
          })
          .catch((error) => {
            //console.log(error);
          });
      }
      if (weeks > 11) {
        setInfantPCRTestDto({ ...infantPCRTestDto, testType: "Second PCR" });
        axios
          .get(`${baseUrl}application-codesets/v2/2ND_3RD_PCR_CHILD_TEST_AGE`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setAtTestList(response.data);
          })
          .catch((error) => {
            //console.log(error);
          });
      }
      setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value });

    }else if(e.target.name === "ctxStatus"){
      setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value});
      setInfantArvDto({...infantArvDto, dateOfCtx: "" })
      
      
      setErrors({ ...errors, [e.target.name]: "", dateOfCtx: "" });

    }else{
      setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value });

    }

  };

  const AGE_CTX_INITIATION = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/AGE_CTX_INITIATION`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAgeCTX(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    // temp.firstName = infantInfo.firstName ? "" : "This field is required";
    temp.surname = infantInfo.surname ? "" : "This field is required";
    temp.hospitalNumber = infantInfo.hospitalNumber
      ? ""
      : "This field is required";
    // temp.ageAtTest = infantPCRTestDto.ageAtTest ? "" : "This field is required";
    //temp.dateOfinfantInfo = infantInfo.dateOfinfantInfo ? "" : "This field is required"
    temp.sex = infantInfo.sex ? "" : "This field is required";
    infantInfo.ctxStatus === "YES" && ( temp.dateOfCtx =infantArvDto.dateOfCtx? "" : "This field is required");
    infantArvDto.infantArvType !== "INFANT_ARV_PROPHYLAXIS_TYPE_NONE"  && infantArvDto.infantArvType  && ( temp.dateOfArv = infantArvDto.dateOfArv? "" : "This field is required");

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
      infantInfo.infantArvDto = infantArvDto;
      infantInfo.infantPCRTestDto = infantPCRTestDto;

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
                      <FormLabelName>ANC Number</FormLabelName>
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
                    <FormLabelName>
                      Child’s Hospital ID Number
                      <span style={{ color: "red" }}> *</span>
                    </FormLabelName>
                    <InputGroup>
                      <Input
                        type="text"
                        name="hospitalNumber"
                        id="hospitalNumber"
                        onChange={handleInputChangeinfantInfoDto}
                        value={infantInfo.hospitalNumber}
                        disabled={disabledField}
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
                    <FormLabelName>
                      Date of Delivery <span style={{ color: "red" }}> *</span>
                    </FormLabelName>
                    <InputGroup>
                      <Input
                        type="date"             
                        onKeyPress={(e)=>{e.preventDefault()}}
                        // disabled={true}
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
                        disabled={true}
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
                    <FormLabelName>
                      Infant Given Name
                      {/* <span style={{ color: "red" }}> *</span> */}
                    </FormLabelName>
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
                    {/* {errors.firstName !== "" ? (
                      <span className={classes.error}>{errors.firstName}</span>
                    ) : (
                      ""
                    )} */}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>Infant Surname</FormLabelName>
                    <span style={{ color: "red" }}> *</span>
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
                <div className=" mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>
                      Birth Weight <span style={{ color: "red" }}> *</span>
                    </FormLabelName>
                    <InputGroup>
                      <Input
                        type="number"
                        name="bodyWeight"
                        id="bodyWeight"
                        onChange={handleInputChangeinfantInfoDto}
                        min="1"
                        max="150"
                        onKeyUp={handleInputValueCheckweight}
                        value={infantInfo.bodyWeight}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
                        }}
                        disabled={disabledField}
                      />
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: "#014D88",
                          color: "#fff",
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
                        }}
                      >
                        kg
                      </InputGroupText>
                    </InputGroup>
                    {errors.bodyWeight !== "" ? (
                      <span className={classes.error}>{errors.bodyWeight}</span>
                    ) : (
                      ""
                    )}
                    {vitalClinicalSupport.weight !== "" ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.weight}
                      </span>
                    ) : (
                      ""
                    )}
                    {infantInfo.bodyWeight !== "" &&
                    infantInfo.bodyWeight <= 0 ? (
                      <span className={classes.error}>
                        Invalid Body Weight{" "}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>
                      Sex <span style={{ color: "red" }}> *</span>
                    </FormLabelName>
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
                          <option key={value.id} value={value.code}>
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
              <>
                <Label
                  as="a"
                  color="blue"
                  style={{ width: "106%", height: "35px" }}
                  horizontal
                >
                  <h4 style={{ color: "#fff" }}> Infant ARV & CTX</h4>
                </Label>
                <br />
                <br />
                {/* LAB Screening Form */}
                <div className="row mt-4">
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>CTX </FormLabelName>
                      <Input
                        type="select"
                        name="ctxStatus"
                        id="ctxStatus"
                        value={infantInfo.ctxStatus}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        onChange={handleInputChangeinfantInfoDto}
                        disabled={disabledField}
                      >
                        <option value="">Select </option>
                        <option value="YES">YES </option>
                        <option value="NO">NO </option>
                      </Input>
                      {errors.ctxStatus !== "" ? (
                        <span className={classes.error}>
                          {errors.ctxStatus}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
               { infantInfo.ctxStatus === "YES" &&<div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>Date of CTX initiation</FormLabelName>
                      <Input
                        type="date"                  
                         onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateOfCtx"
                        id="dateOfCtx"
                        value={infantArvDto.dateOfCtx}
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={infantInfo.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      {errors.dateOfCtx !== "" ? (
                        <span className={classes.error}>
                          {errors.dateOfCtx}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>}

                  <div className=" mb-3 col-md-4 ">
                    <FormGroup>
                      <FormLabelName>
                        Age at CTX Initiation(months){" "}
                      </FormLabelName>
                      <Input
                        type="select"
                        name="ageAtCtx"
                        id="ageAtCtx"
                        value={infantArvDto.ageAtCtx}
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="select">Select </option>
                        {agectx.map((value, index) => (
                          <option key={index} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.ageAtCtx !== "" ? (
                        <span className={classes.error}>{errors.ageAtCtx}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>
                        Infant ARV Prophylaxis Type{" "}
                      </FormLabelName>
                      <Input
                        type="select"
                        name="infantArvType"
                        id="infantArvType"
                        value={infantArvDto.infantArvType}
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >

                        <option value="">Select </option>
                        {infantArv.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.infantArvType !== "" ? (
                        <span className={classes.error}>
                          {errors.infantArvType}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  { infantArvDto.infantArvType &&  infantArvDto.infantArvType !== "INFANT_ARV_PROPHYLAXIS_TYPE_NONE"  &&<div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>Date of ARV Prophylaxis</FormLabelName>
                      <Input
                        type="date"                  
                         onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateOfArv"
                        id="dateOfArv"
                        value={infantArvDto.dateOfArv}
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={infantInfo.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      {errors.dateOfArv !== "" ? (
                        <span className={classes.error}>
                          {errors.dateOfArv}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>}

                  <div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName> Timing of ARV Prophylaxis </FormLabelName>
                      <Input
                        type="select"
                        name="infantArvTime"
                        id="infantArvTime"
                        value={infantArvDto.infantArvTime}
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="select">Select </option>
                        <option value="Within 72 hour">Within 72 hour </option>
                        <option value="After 72 hour">After 72 hour </option>
                      </Input>
                      {errors.infantArvTime !== "" ? (
                        <span className={classes.error}>
                          {errors.infantArvTime}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName> Place of Delivery </FormLabelName>
                      <Input
                        type="select"
                        name="arvDeliveryPoint"
                        id="arvDeliveryPoint"
                        value={infantArvDto.arvDeliveryPoint}
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="select">Select </option>
                        <option value="Facility Delivery">
                          Facility Delivery
                        </option>
                        <option value="Delivered outside facility">
                          Delivered outside facility{" "}
                        </option>
                      </Input>
                      {errors.arvDeliveryPoint !== "" ? (
                        <span className={classes.error}>
                          {errors.arvDeliveryPoint}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </div>
              </>
              <>
                <Label
                  as="a"
                  color="black"
                  style={{ width: "106%", height: "35px" }}
                  horizontal
                >
                  <h4 style={{ color: "#fff" }}> Infant PCR/HIV Test </h4>
                </Label>
                <br />
                <br />
                {/* LAB Screening Form */}
                <div className="row mt-3">
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Age at Test(months)</FormLabelName>
                      <Input
                        type="select"
                        name="ageAtTest"
                        id="ageAtTest"
                        value={infantPCRTestDto.ageAtTest}
                        onChange={handleInputChangeInfantPCRTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="select">Select </option>
                        {ageAtTestList.length > 0 &&
                          ageAtTestList.map((value) => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                      </Input>
                      {errors.ageAtTest !== "" ? (
                        <span className={classes.error}>
                          {errors.ageAtTest}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName> Sample Type</FormLabelName>
                      <Input
                        type="select"
                        name="testType"
                        id="testType"
                        value={infantPCRTestDto.testType}
                        onChange={handleInputChangeInfantPCRTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                        // disabled
                      >
                        <option value="">Select </option>

                        {PCRList.length > 0 && PCRList.map((each, index)=>{

                          return <option value={each.code}>{each.display}</option>
                        })}
                       
                      </Input>
                      {errors.testType !== "" ? (
                        <span className={classes.error}>{errors.testType}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Date sample collected</FormLabelName>
                      <Input
                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateSampleCollected"
                        id="dateSampleCollected"
                        value={infantPCRTestDto.dateSampleCollected}
                        onChange={handleInputChangeInfantPCRTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={infantInfo.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      {errors.dateSampleCollected !== "" ? (
                        <span className={classes.error}>
                          {errors.dateSampleCollected}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Date Sample Sent</FormLabelName>
                      <Input
                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateSampleSent"
                        id="dateSampleSent"
                        value={infantPCRTestDto.dateSampleSent}
                        onChange={handleInputChangeInfantPCRTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={infantPCRTestDto.dateSampleCollected}
                        max={infantPCRTestDto.dateResultReceivedAtFacility}
                        // max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      {errors.dateSampleSent !== "" ? (
                        <span className={classes.error}>
                          {errors.dateSampleSent}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Date Result Received</FormLabelName>
                      <Input
                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateResultReceivedAtFacility"
                        id="dateResultReceivedAtFacility"
                        value={infantPCRTestDto.dateResultReceivedAtFacility}
                        onChange={handleInputChangeInfantPCRTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={infantPCRTestDto.dateSampleCollected}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      {errors.dateResultReceivedAtFacility !== "" ? (
                        <span className={classes.error}>
                          {errors.dateResultReceivedAtFacility}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>
                        Date Result Received By Caregiver
                      </FormLabelName>
                      <Input
                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateResultReceivedByCaregiver"
                        id="dateResultReceivedByCaregiver"
                        value={infantPCRTestDto.dateResultReceivedByCaregiver}
                        onChange={handleInputChangeInfantPCRTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={infantPCRTestDto.dateResultReceivedAtFacility}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      {errors.dateResultReceivedByCaregiver !== "" ? (
                        <span className={classes.error}>
                          {errors.dateResultReceivedByCaregiver}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Result *</FormLabelName>
                      <Input
                        type="select"
                        name="results"
                        id="results"
                        value={infantPCRTestDto.results}
                        onChange={handleInputChangeInfantPCRTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="select">Select </option>
                        {pcrResult.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.results !== "" ? (
                        <span className={classes.error}>{errors.results}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </div>
              </>
              {/* Display notification when maternal outcome is IIT and transfer out */}
              {infantPCRTestDto.results !== "" &&
              infantPCRTestDto.results === "INFANT_PCR_RESULT_POSITIVE" ? (
                <h2 style={{ color: "red" }}>Kindly fill ART form</h2>
              ) : (
                ""
              )}
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
