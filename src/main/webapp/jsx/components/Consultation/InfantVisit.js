import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, List } from "semantic-ui-react";
// Page titie
import {
  FormGroup,
  Label as FormLabelName,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
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
  //console.log(patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate)
  const [errors, setErrors] = useState({});
  const [infantHospitalNumber, setInfantHospitalNumber] = useState();
  let temp = { ...errors };
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [infants, setInfants] = useState([]);
  const [formFilter, setFormFilter] = useState({
    infantArv: false,
    motherArt: false,
    outCome: false,
  });
  const [visitDateStatus, setVisitDateStatus] = useState(false);

  const [ageAtTestList, setAtTestList] = useState([]);
  const [genders, setGenders] = useState([]);
  const [timingOfArtInitiation, setTimingOfArtInitiation] = useState([]);
  const [childStatus, setChildStatus] = useState([]);
  const [timeMotherArt, setTimeMotherArt] = useState([]);
  const [regimenType, setRegimenType] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [choosenInfant, setChoosenInfant] = useState({});
  const [infantArv, setInfantArv] = useState([]);
  const [agectx, setAgeCTX] = useState([]);
  const [pcrResult, setPcrResult] = useState([]);
  const [infantOutcome, setInfantOutcome] = useState([]);
  const [disabledField, setDisabledField] = useState(false);
  const [objValues, setObjValues] = useState({
    infantVisitRequestDto: "",
    // infantArvDto: "",
    // infantMotherArtDto: "",
    // infantPCRTestDto: "",
  });
  const [timingProphylaxisList, setTimingProphylaxisList] = useState([]);
  const [weeksValues, setWeeksValue] = useState(0);
  const [referToART, setReferToART] = useState(false);

  const [infantVisitRequestDto, setInfantVisitRequestDto] = useState({
    // ageAtCtx: "",
    personUuid: props.patientObj.person_uuid
      ? props.patientObj.person_uuid
      : props.patientObj.personUuid
      ? props.patientObj.personUuid
      : "",
    ancNumber: props.patientObj.ancNo,
    bodyWeight: "",
    breastFeeding: "",
    // ctxStatus: "",
    infantHospitalNumber: "",
    visitDate: "",
    visitStatus: "",
    infantOutcomeAt18Months: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
  });
  const [infantArvDto, setInfantArvDto] = useState({
    ageAtCtx: "",
    ancNumber: props.patientObj.ancNo,
    arvDeliveryPoint: "",
    infantArvTime: "",
    infantArvType: "",
    infantHospitalNumber: "",
    timingOfAvrWithin72Hours: "",
    timingOfAvrAfter72Hours: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
  });
  const [infantMotherArtDto, setInfantMotherArtDto] = useState({
    ancNumber: props.patientObj.ancNo,
    motherArtInitiationTime: "",
    // motherArtRegimen: "",
    regimenTypeId: "",
    regimenId: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
  });

  const [infantPCRTestDto, setInfantPCRTestDto] = useState({
    ageAtTest: "",
    ancNumber: props.patientObj.ancNo,
    dateResultReceivedAtFacility: "",
    dateResultReceivedByCaregiver: "",
    dateSampleCollected: "",
    dateSampleSent: "",
    infantHospitalNumber: "",
    results: "",
    testType: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
  });

  const [infantRapidTestDTO, setInfantRapidTestDTO] = useState({
    rapidTestType: "",
    ageAtTest: "",
    dateOfTest: "",
    result: "",
    ancNumber: props.patientObj.ancNo,
    uniqueUuid: "",
    uuid: "",
  });

  //Vital signs clinical decision support
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    bodyWeight: "",
  });

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

  const calculateAgeAtTestMonth = (weeks) => {
    if (weeks < 7) {
      // setInfantPCRTestDto({ ...infantPCRTestDto, testType: "First PCR" });
      axios
        .get(`${baseUrl}application-codesets/v2/1ST PCR_CHILD_TEST_AGE`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAtTestList(response.data);
        })
        .catch((error) => {});
    }
    if (weeks > 11) {
      // setInfantPCRTestDto({ ...infantPCRTestDto, testType: "Second PCR" });
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
  };
  const filterOutTheChosenChildForView = (child) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/get-infant-by-mother-person-uuid/${
          props.patientObj.person_uuid
            ? props.patientObj.person_uuid
            : props.patientObj.personUuid
            ? props.patientObj.personUuid
            : props.patientObj.uuid
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      .then((response) => {
        let resultInfo = response.data.filter((each) => {
          return each.hospitalNumber.toString() === child.toString();
        });

        let weeks = calculateAgeInWeek(resultInfo[0].dateOfDelivery);

        calculateAgeAtTestMonth(weeks);
        setChoosenInfant(resultInfo[0]);
      })

      .catch((error) => {
        //console.log(error);
      });
  };
  useEffect(() => {
    SEX();
    InfantInfo();
    TIME_ART_INITIATION_PMTCT();
    CHILD_FOLLOW_UP_VISIT_STATUS();
    TIMING_MOTHERS_ART_INITIATION();
    AdultRegimenLine();
    AGE_CTX_INITIATION();
    INFANT_ARV_PROPHYLAXIS_TYPE();
    INFANT_PCR_RESULT();
    INFANT_OUTCOME_AT_18_MONTHS();
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null &&
      props.activeContent.activeTab === "child"
    ) {
      GetVisit(props.activeContent.id);
      setDisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
  }, [props.patientObj.hospitalNumber, props.activeContent]);
  //GEt visit information
  const GetVisit = (id) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-infantvisit/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        getTypeOfTimingOfARV(response.data.infantArvDto.arvDeliveryPoint);
        filterOutTheChosenChildForView(
          response.data.infantVisitRequestDto.infantHospitalNumber
        );
        console.log("view infant visit", response.data);
        setObjValues(response.data);
        setInfantVisitRequestDto({ ...response.data.infantVisitRequestDto });
        setInfantArvDto({ ...response.data.infantArvDto });
        setInfantMotherArtDto({ ...response.data.infantMotherArtDto });
        setInfantPCRTestDto({ ...response.data.infantPCRTestDto });
        setInfantRapidTestDTO({ ...response.data.infantRapidAntiBodyTestDto });
        GetInfantDetail2({ ...response.data.infantVisitRequestDto });
        RegimenType(response.data.infantMotherArtDto.regimenTypeId);
        getTimingARVType(response.data.infantArvDto.arvDeliveryPoint);

        if (
          response.data.infantPCRTestDto.results ===
            "INFANT_PCR_RESULT_POSITIVE" ||
          response.data.infantRapidTestDTO.result ===
            "INFANT_PCR_RESULT_POSITIVE"
        ) {
          setReferToART(true);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //This is to get infant hospital numbet when viewing or updating infant
  const GetInfantDetail2 = (obj) => {
    setInfantHospitalNumber(obj.infantHospitalNumber);
    const InfantVisit = () => {
      //setLoading(true)
      axios
        .get(
          `${baseUrl}pmtct/anc/get-form-filter/${obj.infantHospitalNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          infantVisitRequestDto.infantHospitalNumber = obj.infantHospitalNumber;
          setFormFilter(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    };
    InfantVisit();
  };
  ///GET LIST OF Infants
  const InfantInfo = () => {
    axios
      .get(
        `${baseUrl}pmtct/anc/get-infant-by-mother-person-uuid/${
          props.patientObj.person_uuid
            ? props.patientObj.person_uuid
            : props.patientObj.personUuid
            ? props.patientObj.personUuid
            : props.patientObj.uuid
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      .then((response) => {
        //setLoading(false)
        setInfants(response.data);
      })

      .catch((error) => {
        //console.log(error);
      });
    // }
  };
  const TIME_ART_INITIATION_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TIME_ART_INITIATION_PMTCT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTimingOfArtInitiation(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const INFANT_OUTCOME_AT_18_MONTHS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INFANT_OUTCOME_AT_18_MONTHS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setInfantOutcome(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
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
  const CHILD_FOLLOW_UP_VISIT_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/CHILD_FOLLOW_UP_VISIT_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setChildStatus(response.data);
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
  const handleInputChangeInfantVisitRequestDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name)
    if (e.target.name === "visitDate" && e.target.value !== "") {
      async function checkForVisitDate() {
        const ga = e.target.value;
        const response = await axios.get(
          `${baseUrl}pmtct/anc/is-infant-visit-date-exists?hospitalNumber=${infantHospitalNumber}&visitDate=${e.target.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data) {
          errors.visitDate = "";
          toast.error("Visit Date already exist");

          setVisitDateStatus(true);
        } else {
          setVisitDateStatus(false);
        }
      }

      async function getGa() {
        const ga = e.target.value;
        const response = await axios.get(
          `${baseUrl}pmtct/anc/calculate-ga3?hospitalNumber=${infantHospitalNumber}&visitDate=${ga}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data >= 0) {
          infantPCRTestDto.ageAtTest = response.data;
          setInfantVisitRequestDto({
            ...infantVisitRequestDto,
            [e.target.name]: e.target.value,
          });
        }
      }
      getGa();
      checkForVisitDate();
    }
    setInfantVisitRequestDto({
      ...infantVisitRequestDto,
      [e.target.name]: e.target.value,
    });
  };

  const getTimingARVType = (value) => {
    if (value === "Within 72 hour") {
      axios
        .get(
          `${baseUrl}application-codesets/v2/TIMING_PROPHYLAXIS_WITHIN_72HRS`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setTimingProphylaxisList(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    } else if (value === "After 72 hour") {
      axios
        .get(
          `${baseUrl}application-codesets/v2/TIMING_PROPHYLAXIS_After_72HRS`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setTimingProphylaxisList(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    } else if (e.target.value === "") {
      // set the rr to empty string
    }
  };
  const handleInputChangeInfantArvDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name),
    setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value });

    if (e.target.name === "arvDeliveryPoint") {
      getTimingARVType(e.target.value);
    }
  };

  const handleInputChangeInfantMotherArtDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name),
    setInfantMotherArtDto({
      ...infantMotherArtDto,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputChangeRapidTestDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name),
    setInfantRapidTestDTO({
      ...infantRapidTestDTO,
      [e.target.name]: e.target.value,
    });
  };
  const handleInputChangeInfantPCRTestDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name)infantPCRTestDto, setInfantPCRTestDto
    setInfantPCRTestDto({
      ...infantPCRTestDto,
      [e.target.name]: e.target.value,
    });
  };

  //Validations of the forms
  const validate = () => {
    temp.visitDate = infantVisitRequestDto.visitDate
      ? ""
      : "This field is required";
    temp.bodyWeight = infantVisitRequestDto.bodyWeight
      ? ""
      : "This field is required";
    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x === "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      objValues.infantArvDto = infantArvDto;
      objValues.infantArvDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantMotherArtDto = infantMotherArtDto;
      objValues.infantMotherArtDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantPCRTestDto = infantPCRTestDto;
      objValues.infantPCRTestDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantPCRTestDto.infantHospitalNumber =
        infantArvDto.infantHospitalNumber;

      objValues.infantRapidAntiBodyTestDto = infantRapidTestDTO;
      objValues.infantVisitRequestDto = infantVisitRequestDto;

      console.log(objValues);
      if (props.activeContent && props.activeContent.actionType) {
        //Perform operation for updation action
        //`${baseUrl}pmtct/anc/update-infant-visit/${props.activeContent.id}`,

        axios
          .put(`${baseUrl}pmtct/anc/update-infant-visit`, objValues, {
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
      } else {
        axios
          .post(`${baseUrl}pmtct/anc/infant-visit-consolidated`, objValues, {
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

  const getTypeOfTimingOfARV = (type) => {
    if (type === "Within 72 hour") {
      axios
        .get(
          `${baseUrl}application-codesets/v2/TIMING_PROPHYLAXIS_After_72HRS`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setTimingProphylaxisList(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    } else if (type === "After 72 hour") {
      axios
        .get(
          `${baseUrl}application-codesets/v2/TIMING_PROPHYLAXIS_WITHIN_72HRS`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setTimingProphylaxisList(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    }
  };
  const handleSelecteRegimen = (e) => {
    let regimenID = e.target.value;
    //regimenTypeId regimenId
    setInfantMotherArtDto({ ...infantMotherArtDto, regimenTypeId: regimenID });
    RegimenType(regimenID);
    //setErrors({...temp, [e.target.name]:""})
  };
  //Get list of RegimenLine
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
  function GetInfantDetail(obj) {
    setChoosenInfant(obj);

    let weeks = calculateAgeInWeek(obj.dateOfDelivery);
    setWeeksValue(weeks);

    calculateAgeAtTestMonth(weeks);
    if (obj?.infantPCRTestDto?.results === "INFANT_PCR_RESULT_POSITIVE") {
      setInfantPCRTestDto({
        ...infantPCRTestDto,
        testType: "Confirmatory PCR",
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
    // setInfantVisitRequestDto({
    //   ...infantVisitRequestDto,
    //   bodyWeight: obj.bodyWeight,
    // });
    setInfantHospitalNumber(obj.hospitalNumber);

    const InfantVisit = () => {
      //setLoading(true)
      axios
        .get(`${baseUrl}pmtct/anc/get-form-filter/${obj.hospitalNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          infantVisitRequestDto.infantHospitalNumber = obj.hospitalNumber;
          infantArvDto.infantHospitalNumber = obj.hospitalNumber;
          infantPCRTestDto.infantHospitalNumber = obj.hospitalNumber;

          setFormFilter(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    };
    InfantVisit();
  }
  return (
    <div>
      <h2>Clinic Follow-up Visit</h2>
      <Grid columns="equal">
        <Grid.Column>
          <Segment>
            <Label as="a" color="blue" ribbon>
              Infant's
            </Label>
            <br />
            <List celled>
              <List.Item>
                Given Name
                <span className="float-end">
                  <b>Hospital Number</b>
                </span>
              </List.Item>
            </List>

            {infants &&
              infants.map((row) => (
                <List celled>
                  <List.Item
                    onClick={() => GetInfantDetail(row)}
                    style={{ cursor: "pointer" }}
                  >
                    <Label as="a" color="blue">
                      {row.firstName}
                    </Label>
                    <Label as="a" color="teal" className="float-end" tag>
                      {row.hospitalNumber}
                    </Label>
                  </List.Item>
                </List>
              ))}
          </Segment>
        </Grid.Column>
        <Grid.Column width={12}>
          <Segment>
            <Label
              as="a"
              color="blue"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}>
                Infant Clinic Visit -{" "}
                {infantVisitRequestDto &&
                infantVisitRequestDto.infantHospitalNumber
                  ? infantVisitRequestDto.infantHospitalNumber
                  : " "}
              </h4>
            </Label>
            <br />
            <br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Date of Visit <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="date"
                    name="visitDate"
                    id="visitDate"
                    value={infantVisitRequestDto.visitDate}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    // min={props.patientObj.firstAncDate}
                    min={choosenInfant.dateOfDelivery}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                    required
                    disabled={disabledField}
                  />
                  {errors.visitDate !== "" ? (
                    <span className={classes.error}>{errors.visitDate}</span>
                  ) : (
                    ""
                  )}
                  {visitDateStatus === true ? (
                    <span className={classes.error}>
                      {"Visit Date already exist"}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Date of Birth <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={choosenInfant.dateOfDelivery}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                    required
                  />
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Infant Hospital Number{" "}
                    <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="text"
                    name="infantHospitalNumber"
                    id="infantHospitalNumber"
                    value={infantVisitRequestDto.infantHospitalNumber}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                  />
                  {errors.infantHospitalNumber !== "" ? (
                    <span className={classes.error}>
                      {errors.infantHospitalNumber}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Surname
                    <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="text"
                    name="surname"
                    id="surname"
                    value={choosenInfant.surname}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                  />
                </FormGroup>
              </div>
              {choosenInfant.firstName && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>
                      Firstname
                      <span style={{ color: "red" }}> *</span>
                    </FormLabelName>
                    <Input
                      type="text"
                      name="surname"
                      id="surname"
                      value={choosenInfant.firstName}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      onChange={handleInputChangeInfantVisitRequestDto}
                      disabled
                    />
                  </FormGroup>
                </div>
              )}
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
                      onChange={handleInputChangeInfantVisitRequestDto}
                      value={choosenInfant.sex}
                      disabled
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

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Mother ANC number
                    {/* <span style={{ color: "red" }}> *</span> */}
                  </FormLabelName>
                  <Input
                    type="text"
                    name="ancNumber"
                    id="ancNumber"
                    value={props.patientObj.ancNo}
                    // value={infantVisitRequestDto.ancNumber}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                  />
                  {errors.ancNumber !== "" ? (
                    <span className={classes.error}>{errors.ancNumber}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Body Weight <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <InputGroup>
                    <Input
                      type="number"
                      name="bodyWeight"
                      id="bodyWeight"
                      onChange={handleInputChangeInfantVisitRequestDto}
                      min="1"
                      max="150"
                      onKeyUp={handleInputValueCheckweight}
                      value={infantVisitRequestDto.bodyWeight}
                      // value={infantVisitRequestDto.bodyWeight}

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
                  {infantVisitRequestDto.bodyWeight !== "" &&
                  infantVisitRequestDto.bodyWeight <= 0 ? (
                    <span className={classes.error}>Invalid Body Weight </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Breast Feeding ?</FormLabelName>
                  <Input
                    type="select"
                    name="breastFeeding"
                    id="breastFeeding"
                    value={infantVisitRequestDto.breastFeeding}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                  </Input>
                  {errors.breastFeeding !== "" ? (
                    <span className={classes.error}>
                      {errors.breastFeeding}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {/* uncomment after when you are done  */}
              {/* <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>CTX </FormLabelName>
                  <Input
                    type="select"
                    name="ctxStatus"
                    id="ctxStatus"
                    value={infantVisitRequestDto.ctxStatus}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                  </Input>
                  {errors.ctxStatus !== "" ? (
                    <span className={classes.error}>{errors.ctxStatus}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div> */}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Visit Status</FormLabelName>
                  <Input
                    type="select"
                    name="visitStatus"
                    id="visitStatus"
                    value={infantVisitRequestDto.visitStatus}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {childStatus.map((value, index) => (
                      <option key={index} value={value.code}>
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
              {formFilter && formFilter.outCome === true && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>Infant outcome at 18 months</FormLabelName>
                    <Input
                      type="select"
                      name="infantOutcomeAt18Months"
                      id="infantOutcomeAt18Months"
                      value={infantVisitRequestDto.infantOutcomeAt18Months}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      onChange={handleInputChangeInfantVisitRequestDto}
                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      {infantOutcome.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                    {errors.infantOutcomeAt18Months !== "" ? (
                      <span className={classes.error}>
                        {errors.infantOutcomeAt18Months}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
            </div>

            <br />
            {/* {formFilter && formFilter.motherArt === false && ( */}
            <>
              <Label
                as="a"
                color="teal"
                style={{ width: "106%", height: "35px" }}
                ribbon
              >
                <h4 style={{ color: "#fff" }}> Mother's ART </h4>
              </Label>
              <br />
              <br />
              <div className="row">
                <div className=" mb-3 col-md-4">
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
                </div>

                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Original Regimen Line </FormLabelName>
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
                        <option key={value.id} value={value.id}>
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
            </>
            {/* )} */}
            <br />
            {/* {formFilter && formFilter.infantArv === false && ( */}
            <>
              <Label
                as="a"
                color="blue"
                style={{ width: "106%", height: "35px" }}
                ribbon
              >
                <h4 style={{ color: "#fff" }}> Infant ARV & CTX</h4>
              </Label>
              <br />
              <br />
              <div className="row">
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Infant ARV Type </FormLabelName>
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
                      <option value="select">Select </option>
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
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName> Timing of ARV Prophylaxis </FormLabelName>
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
                      <option value="">Select </option>
                      <option value="Within 72 hour">Within 72 hour </option>
                      <option value="After 72 hour">After 72 hour </option>
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
                {infantArvDto.arvDeliveryPoint && (
                  <div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>
                        {" "}
                        {infantArvDto.arvDeliveryPoint === "Within 72 hour"
                          ? "Timing Of ARV Prophylaxhis Withn 72 hrs"
                          : "Timing Of ARV Prophylaxhis After 72 hrs"}
                      </FormLabelName>
                      <Input
                        type="select"
                        name={
                          infantArvDto.arvDeliveryPoint === "Within 72 hour"
                            ? "timingOfAvrWithin72Hours"
                            : "timingOfAvrAfter72Hours"
                        }
                        id={
                          infantArvDto.arvDeliveryPoint === "Within 72 hour"
                            ? "timingOfAvrWithin72Hours"
                            : "timingOfAvrAfter72Hours"
                        }
                        value={
                          infantArvDto.arvDeliveryPoint === "Within 72 hour"
                            ? infantArvDto.timingOfAvrWithin72Hours
                            : infantArvDto.timingOfAvrAfter72Hours
                        }
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="select">Select </option>

                        {timingProphylaxisList.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
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
                )}

                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Age at CTX Initiation </FormLabelName>
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
                    <FormLabelName> Place of Delivery </FormLabelName>
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
                      <option value="Facility Delivery">
                        Facility Delivery
                      </option>
                      <option value="Delivered outside facility">
                        Delivered outside facility{" "}
                      </option>
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
              </div>
            </>
            {/* )} */}
            <br />
            <Label
              as="a"
              color="black"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}>
                {" "}
                Infant PCR/HIV test {infantPCRTestDto.testType}{" "}
              </h4>
            </Label>
            <br />
            <br />
            {/* LAB Screening Form */}
            <div className="row">
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName> PCR testing Type</FormLabelName>
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
                  >
                    <option value="">Select </option>
                    <option value="First PCR">First PCR</option>
                    <option value="Second PCR">Second PCR</option>
                    <option value="Confirmatory PCR">Confirmatory PCR</option>
                    {/* <option value="First Rapid Antibody">
                      First Rapid Antibody{" "}
                    </option>
                    <option value="Second Rapid Antibody ">
                      Second Rapid Antibody{" "}
                    </option> */}
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
                    <span className={classes.error}>{errors.ageAtTest}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Date sample collected</FormLabelName>
                  <Input
                    type="date"
                    name="dateSampleCollected"
                    id="dateSampleCollected"
                    value={infantPCRTestDto.dateSampleCollected}
                    onChange={handleInputChangeInfantPCRTestDto}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    min={choosenInfant.dateOfDelivery}
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
              {weeksValues < 7 &&
                choosenInfant?.infantPCRTestDto?.results !==
                  "INFANT_PCR_RESULT_POSITIVE" && (
                  <>
                    <div className=" mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Date Sample Sent</FormLabelName>
                        <Input
                          type="date"
                          name="dateSampleSent"
                          id="dateSampleSent"
                          value={infantPCRTestDto.dateSampleSent}
                          onChange={handleInputChangeInfantPCRTestDto}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          min={infantPCRTestDto.dateSampleCollected}
                          max={moment(new Date()).format("YYYY-MM-DD")}
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
                        <FormLabelName>
                          Date Result Received at Facility
                        </FormLabelName>
                        <Input
                          type="date"
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
                          Date Caregiver Given Result
                        </FormLabelName>
                        <Input
                          type="date"
                          name="dateResultReceivedByCaregiver"
                          id="dateResultReceivedByCaregiver"
                          value={infantPCRTestDto.dateResultReceivedByCaregiver}
                          onChange={handleInputChangeInfantPCRTestDto}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          min={infantPCRTestDto.dateSampleCollected}
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
                  </>
                )}
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Result</FormLabelName>
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

              {/* Display notification when maternal outcome is IIT and transfer out */}
              {infantPCRTestDto.results !== "" &&
              infantPCRTestDto.results === "INFANT_PCR_RESULT_POSITIVE" ? (
                <h2 style={{ color: "red" }}>Kindly fill ART form</h2>
              ) : (
                ""
              )}
            </div>
            <br />
            <br />
            <br />
            {true && (
              <>
                <Label
                  as="a"
                  color="teal"
                  style={{ width: "106%", height: "35px" }}
                  ribbon
                >
                  <h4 style={{ color: "#fff" }}> Rapid Antibody Test</h4>
                </Label>
                <br />
                <br />
                {/* Infant testing  Form */}
                <div className="row">
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Infant Test (Rapid Test)</FormLabelName>
                      <Input
                        type="select"
                        name="rapidTestType"
                        id="rapidTestType"
                        value={infantRapidTestDTO.rapidTestType}
                        onChange={handleInputChangeRapidTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select </option>
                        <option value="First Rapid Antibody">
                          First Rapid Antibody
                        </option>
                        <option value="Second Rapid Antibody">
                          Second Rapid Antibody
                        </option>
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
                      <FormLabelName>Age at Test(months)</FormLabelName>
                      <Input
                        type="select"
                        name="ageAtTest"
                        id="ageAtTest"
                        value={infantRapidTestDTO.ageAtTest}
                        onChange={handleInputChangeRapidTestDto}
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
                      <FormLabelName>Date OF Test</FormLabelName>
                      <Input
                        type="date"
                        name="dateOfTest"
                        id="dateOfTest"
                        value={infantRapidTestDTO.dateOfTest}
                        onChange={handleInputChangeRapidTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={choosenInfant.dateOfDelivery}
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
                      <FormLabelName>Result *</FormLabelName>
                      <Input
                        type="select"
                        name="result"
                        id="result"
                        value={infantRapidTestDTO.result}
                        onChange={handleInputChangeRapidTestDto}
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
                      {errors.result !== "" ? (
                        <span className={classes.error}>{errors.result}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  {/* Display notification when maternal outcome is IIT and transfer out */}
                  {infantRapidTestDTO.result !== "" &&
                  infantRapidTestDTO.result === "INFANT_PCR_RESULT_POSITIVE" ? (
                    <h2 style={{ color: "red" }}>Kindly fill ART form</h2>
                  ) : (
                    ""
                  )}
                </div>
              </>
            )}
            <br />


            {infantVisitRequestDto &&
            infantVisitRequestDto.infantHospitalNumber ? (
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
            ) : (
              ""
            )}
          </Segment>
        </Grid.Column>
      </Grid>
      {/* <AddVitals toggle={AddVitalToggle} showModal={addVitalModal} /> */}
    </div>
  );
};

export default ClinicVisit;
