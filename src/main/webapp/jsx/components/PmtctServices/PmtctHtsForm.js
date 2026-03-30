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
import { Message, Label as LabelRibbon } from "semantic-ui-react";
import { calculateGestationalAge } from "../../utils";
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

const PmtctHtsForm = (props) => {
  const patientObj = props.patientObj;
  let history = useHistory();

  const location = useLocation();
  const locationState = location && location.state ? location.state : null;
  const [regimenType, setRegimenType] = useState([]);
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [entrySetting, setEntrySetting] = useState([]);
  const [testEntryPoint, setTestEntryPoint] = useState([]);
  const [communitySetting, setCommunitySetting] = useState([]);
  const [disableHIVStatus, setDisableHIVStatus] = useState(false);
  const [autoPostPartumTiming, setAutoPostPartumTiming] = useState(false);
  const [disableEntryPoint, setDisableEntryPoint] = useState(false);

  const [tbStatus, setTbStatus] = useState([]);
  const [artStartTime, setartStartTime] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [entryValueDisplay, setEntryValueDisplay] = useState({});
  const [allNewEntryPoint, setAllNewEntryPoint] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [urinalysisList, setUrinalysisList] = useState([]);
  const [timeHivDiagnosis, setTimeHivDiagnosis] = useState([]);
  const [timeHivInitiation, setTimeHivInitiation] = useState([]);
  const [maxARTDate, setMaxARTDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [minARTDate, setMinARTDate] = useState("");
  const [lastPmtctHtsRecord, setLastPmtctHtsRecord] = useState({
    confirmatoryHivTest: "",
    dateOfHivTest: "",
    testEntryPoint: "",
    testSetting: "",
    initialHivTest: "",
    stageOfPregnancy: "",
    id: "",
  });
  const [pmtctCycleCreated, setPmtctCycleCreated] = useState({
    personUuid: patientObj.personUuid ? patientObj.personUuid : patientObj?.uuid,
    maternalOutcome: "",
    entryPoint: locationState.entrypointValue,
    hivStatus: patientObj?.dynamicHivStatus || "",
    pregnancyOutcome: "",
    numberOfInfants: 0,
    pmtctStatus: "INACTIVE",
  });
  const [dateOfHivTestExist, setDateOfHivTestExist] = useState(false);

  const [checkingForTheDate, setCheckingForTheDate] = useState(false);

  const [existingDate, setExistingDate] = useState("");

  const [validateHIVRetest, setValidateHIVRetest] = useState({
    message: "",
    isValid: true,
    showError: false,
  });
  const [validateAncEnrollment, setValidateAncEnrollment] = useState({
    message: "",
    isValid: true,
    showError: false,
  });
  const [finalResult, setFinalResult] = useState("");
  const [resultStatus, setResultStatus] = useState("");
  const [showRetesting, setShowRetesting] = useState(false);

  const [initialHivTest, setInitialHivTest] = useState({
    result: "",
    dateOfTest: "",
  });
  const [confirmatoryHivTest, setConfirmatoryHivTest] = useState({
    result: "",
    dateOfTest: "",
  });
  const [tieBreaker, setTieBreaker] = useState({ result: "", dateOfTest: "" });
  const [retesting, setRetesting] = useState({ result: "", dateOfTest: "" });
  const [confirmatoryTest2, setConfirmatoryTest2] = useState({
    result: "",
    dateOfTest: "",
  });
  const [tieBreaker2, setTieBreaker2] = useState({
    result: "",
    dateOfTest: "",
  });

  const [payload, setPayload] = useState({
    dateOfHivTest: "",
    testEntryPoint: "",
    testSetting: "",
    initialHivTest: "",
    confirmatoryHivTest: "",
    tieBreaker: "",
    retesting: "",
    confirmatoryTest2: "",
    tieBreaker2: "",
    stageOfPregnancy: "",
    hospitalNumber: props?.patientObj?.identifier?.identifier[0]?.value
      ? props?.patientObj?.identifier?.identifier[0]?.value
      : props?.patientObj?.hospitalNumber,
    syphilis: "",
    hepatitisB: "",
    hepatitisC: "",
    testingType:
      props.onEnrollPatient && lastPmtctHtsRecord?.id
        ? "RETESTING"
        : props?.PmtctHtsRetestingType.toUpperCase(),
    personUuid: props.personUuid,
    ancNo: props?.patientObj?.ancNo,
    finalResult: "",
    source: "WEB",
  });

  const handleInitialInputChange = (e) => {
    let res = "initial" + e.target.name;

    setErrors((prevErrors) => ({ ...prevErrors, [res]: "" }));

    setInitialHivTest((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    if (e.target.name === "result") {
      if (e.target.value === "non-reactive") {
        setFinalResult("Negative");
      } else {
        setFinalResult("");
      }

      setConfirmatoryHivTest({ result: "", dateOfTest: "" });
      setTieBreaker({ result: "", dateOfTest: "" });
      setRetesting({ result: "", dateOfTest: "" });
      setConfirmatoryTest2({ result: "", dateOfTest: "" });
      setTieBreaker2({ result: "", dateOfTest: "" });
    }
  };

  const handleConfirmatoryInputChange = (e) => {
    let res = "confirmatory" + e.target.name;

    setErrors((prevErrors) => ({ ...prevErrors, [res]: "" }));

    setConfirmatoryHivTest((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (e.target.name === "result") {
      setTieBreaker({ result: "", dateOfTest: "" });
      setRetesting({ result: "", dateOfTest: "" });
      setConfirmatoryTest2({ result: "", dateOfTest: "" });
      setTieBreaker2({ result: "", dateOfTest: "" });

      setFinalResult("");
    }
  };

  const handleTieBreakerInputChange = (e) => {
    let res = "tiebreaker" + e.target.name;

    setErrors((prevErrors) => ({ ...prevErrors, [res]: "" }));

    setTieBreaker((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    if (e.target.name === "result") {
      if (e.target.value === "non-reactive") {
        setFinalResult("Negative");
      } else {
        setFinalResult("");
      }

      setRetesting({ result: "", dateOfTest: "" });
      setConfirmatoryTest2({ result: "", dateOfTest: "" });
      setTieBreaker2({ result: "", dateOfTest: "" });
    }
  };

  const handleRetestingInputChange = (e) => {
    let res = "retesting" + e.target.name;

    setErrors((prevErrors) => ({ ...prevErrors, [res]: "" }));

    setRetesting((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    if (e.target.name === "result") {
      if (e.target.value === "non-reactive") {
        setFinalResult("Negative");
      } else {
        setFinalResult("");
      }

      setConfirmatoryTest2({ result: "", dateOfTest: "" });
      setTieBreaker2({ result: "", dateOfTest: "" });
    }
  };

  const handleConfirmatory2InputChange = (e) => {
    let res = "confirmatoryTest2" + e.target.name;

    setErrors((prevErrors) => ({ ...prevErrors, [res]: "" }));

    setConfirmatoryTest2((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (e.target.name === "result") {
      if (e.target.value === "reactive") {
        setFinalResult("Positive");
      } else {
        setFinalResult("");
      }

      setTieBreaker2({ result: "", dateOfTest: "" });
    }
  };

  const handleTieBreaker2InputChange = (e) => {
    let res = "tieBreaker2" + e.target.name;

    setErrors((prevErrors) => ({ ...prevErrors, [res]: "" }));

    setTieBreaker2((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    if (e.target.name === "result") {
      if (e.target.value === "reactive") {
        setFinalResult("Positive");
      } else if (e.target.value === "non-reactive") {
        setFinalResult("Negative");
      }
    }
  };
  //get the person last record on PMTCT HTS if exist

  const getLastPmtctHtsRecord = (personUuid) => {
    const pmtctCycleId = props.latestPmtctCycle?.id;

    if (pmtctCycleId) {
       axios
         .get(
           `${baseUrl}pmtct/anc/get-latest-pmtct-hts-enrollment/${props.personUuid}?pmtctCycleId=${pmtctCycleId}`,
           { headers: { Authorization: `Bearer ${token}` } }
         )
         .then((response) => {
           if (response.data) {
             setLastPmtctHtsRecord(response.data);
             if (
               props.onEnrollPatient &&
               response?.data?.id &&
               response?.data?.finalResult === "Negative"
             ) {
               toast.info("Last HIV test was " + response?.data?.finalResult, {
                 position: toast.POSITION.TOP_RIGHT,
               });
             }
           }
         })
         .catch((error) => {
           //console.log(error);
         });
    }

  
  };



  const getLastPmtctHtsByPersonUuid= () => {
    const pmtctCycleId = props.latestPmtctCycle?.id;

    if (pmtctCycleId) {
      axios
        .get(
          `${baseUrl}pmtct/anc/get-latest-pmtct-hts-enrollment/${props.personUuid}?pmtctCycleId=${pmtctCycleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          if (response.data) {
            setLastPmtctHtsRecord(response.data);
            if (
              props.onEnrollPatient &&
              response?.data?.id &&
              response?.data?.finalResult === "Negative"
            ) {
              toast.info("Last HIV test was " + response?.data?.finalResult, {
                position: toast.POSITION.TOP_RIGHT,
              });
            }
          }
        })
        .catch((error) => {
          //console.log(error);
        });
    }
  };
  function calculateGestationalAge2(dateOfHivTest) {
    let lmpDate = props?.patientObj?.lmp;

    // Parse LMP date
    const lmp = moment(lmpDate, "YYYY-MM-DD");
    const today = moment(dateOfHivTest, "YYYY-MM-DD");

    // Calculate difference in weeks
    const weeks = today.diff(lmp, "weeks");

    return weeks;
  }

  const getFinalResult = () => {
    if (initialHivTest.result === "non-reactive") {
      setFinalResult("Negative");
    } else if (retesting.result === "non-reactive") {
      setFinalResult("Negative");
    } else if (tieBreaker.result === "non-reactive") {
      setFinalResult("Negative");
    } else if (confirmatoryTest2.result === "reactive") {
      setFinalResult("Positive");
    } else if (tieBreaker2.result === "reactive") {
      setFinalResult("Positive");
    } else if (tieBreaker2.result === "non-reactive") {
      setFinalResult("Negative");
    }
  };

  const getStageOfPregnancy = (
    testSetting,
    testEntryPoint,
    testEntryPointValue
  ) => {
    setPayload((prevPayload) => {
      // Calculate gestational age using the LATEST dateOfHivTest from state
      const gestationalAge = calculateGestationalAge2(prevPayload.dateOfHivTest);

      // Determine stage of pregnancy based on gestational age
      let stageOfPregnancy = "";

      if (
        props?.patientObj?.ancNo &&
        props?.patientObj?.gaweeks &&
        testSetting.includes("_ANC") &&
        gestationalAge
      ) {
        // Determine trimester based on gestational age
        if (gestationalAge >= 0 && gestationalAge <= 12) {
          stageOfPregnancy = "first trimester";
        } else if (gestationalAge >= 13 && gestationalAge <= 24) {
          stageOfPregnancy = "second trimester";
        } else if (gestationalAge >= 25 && gestationalAge <= 40) {
          stageOfPregnancy = "third trimester";
        }
      }

      return {
        ...prevPayload,
        stageOfPregnancy: stageOfPregnancy,
        testSetting: testSetting,
        [testEntryPoint]: testEntryPointValue,
      };
    });
  };

  useEffect(() => {
    POINT_ENTRY_PMTCT();
    TIME_ART_INITIATION_PMTCT();
    TB_STATUS();
    getLastPmtctHtsRecord();
    if (
      props?.patientObj?.id &&
      props?.activeContent?.id &&
      props?.activeContent?.actionType !== "create"
    ) {
      viewPmtctHtsRecord(props?.patientObj?.id);

      getARTStartDate();
      getHIVStatus(
        props?.patientObj?.identifier?.identifier[0]?.value,
        props.personUuid
      );
    }
  }, [props?.activeContent]);

  const viewPmtctHtsRecord = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/view-pmtct-hts-enrollment/${props.activeContent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setPayload({
          dateOfHivTest: response.data.dateOfHivTest,
          testEntryPoint: response.data.testEntryPoint,
          testSetting: response.data.testSetting,
          stageOfPregnancy: response.data.stageOfPregnancy,
          hospitalNumber: response.data.hospitalNumber,
          syphilis: response.data.syphilis,
          hepatitisB: response.data.hepatitisB,
          hepatitisC: response.data.hepatitisC,
          testingType: response.data.testingType,
          personUuid: props.personUuid,
          ancNo: response.data.ancNo,
          finalResult: response.data.finalResult || "",
          source: "WEB",
        });

        if (response.data.initialHivTest) {
          setInitialHivTest(response.data.initialHivTest);
        }
        if (response.data.confirmatoryHivTest) {
          setConfirmatoryHivTest(response.data.confirmatoryHivTest);
        }
        if (response.data.tieBreaker) {
          setTieBreaker(response.data.tieBreaker);
        }
        if (response.data.retesting) {
          setRetesting(response.data.retesting);
        }

        if (response.data.confirmatoryTest2) {
          setConfirmatoryTest2(response.data.confirmatoryTest2);
        }
        if (response.data.tieBreaker2) {
          setTieBreaker2(response.data.tieBreaker2);
        }

        // Use DB value if available, otherwise recalculate from test results
        if (response.data.finalResult) {
          setFinalResult(response.data.finalResult);
        } else if (response.data.initialHivTest?.result === "non-reactive") {
          setFinalResult("Negative");
        } else if (response.data.retesting?.result === "non-reactive") {
          setFinalResult("Negative");
        } else if (response.data.tieBreaker?.result === "non-reactive") {
          setFinalResult("Negative");
        } else if (response.data.confirmatoryTest2?.result === "reactive") {
          setFinalResult("Positive");
        } else if (response.data.tieBreaker2?.result === "reactive") {
          setFinalResult("Positive");
        } else if (response.data.tieBreaker2?.result === "non-reactive") {
          setFinalResult("Negative");
        }

        setExistingDate(response.data.dateOfHivTest);
        getSettingPoint(response.data.testEntryPoint);

        if (props.activeContent.actionType === "view") {
          setDisabledField(true);
        } else if (props.activeContent.actionType === "update") {
          setDisabledField(false);
        }
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
    axios
      .get(`${baseUrl}application-codesets/v2/ENROLLMENT_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTestEntryPoint(response.data);
        // console.log("deducted", ans);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const HTS_ENTRY_POINT_FACILITY = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FACILITY_HTS_TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data) {
          const requiredCodes = [
            "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING",
            "FACILITY_HTS_TEST_SETTING_L&D",
            "FACILITY_HTS_TEST_SETTING_ANC",
          ];

          const filteredData = response.data.filter((item) =>
            requiredCodes.includes(item.code)
          );

          setCommunitySetting(filteredData);
        }
      })
      .catch((error) => {
        console.error("Error fetching HTS entry points:", error);
      });
  };

  const HTS_ENTRY_POINT_COMMUNITY = () => {
    axios
      .get(
        `${baseUrl}application-codesets/v2/COMMUNITY_HTS_TEST_SETTING
 `,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {

        if (response.data) {       
           let spokeHealthFacility = {
          id: 1877,
          codesetGroup: "FACILITY_HTS_TEST_SETTING",
          language: "en",
          display: "Spoke health facility",
          description: "Spoke facility setting for HIV testing",
          version: "1.0",
          code: "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY",
          archived: 0,
          altCode: "PEPFAR_HTS_SETTINGS_PMTCT_(ANC1_ONLY)",
        };



          const requiredCodes = [
            "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING",
            "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES",
            "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX",
            "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW",
          ];

          const filteredData = response.data.filter((item) =>
            requiredCodes.includes(item.code)
          );


          setCommunitySetting([...filteredData, spokeHealthFacility ]);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const getSettingPoint = (testEntryPoint) => {
    if (testEntryPoint.includes("ENROLLMENT_SETTING_COMMUNITY")) {
      HTS_ENTRY_POINT_COMMUNITY();
    } else {
      HTS_ENTRY_POINT_FACILITY();
    }
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

  const handleInputChange = (e) => {
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));

    if (e.target.name === "testEntryPoint" && e.target.value !== "") {
      getSettingPoint(e.target.value);
      if (
        e.target.value === "ENROLLMENT_SETTING_FACILITY" &&
        props?.patientObj?.ancNo
      ) {
        // setPayload({ ...payload, [e.target.name]: e.target.value,testSetting: "FACILITY_HTS_TEST_SETTING_ANC"  });

        getStageOfPregnancy(
          "FACILITY_HTS_TEST_SETTING_ANC",
          e.target.name,
          e.target.value
        );
        setDisableEntryPoint(true);
      } else if (
        e.target.value === "ENROLLMENT_SETTING_FACILITY" &&
        props?.entrypointValue === "PMTCT_ENTRY_POINT_L&D"
      ) {
        setPayload((prevPayload) => ({
          ...prevPayload,
          [e.target.name]: e.target.value,
          testSetting: "FACILITY_HTS_TEST_SETTING_L&D",
        }));
        setDisableEntryPoint(true);
      } else if (
        e.target.value === "ENROLLMENT_SETTING_FACILITY" &&
        props?.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"
      ) {
        setPayload((prevPayload) => ({
          ...prevPayload,
          [e.target.name]: e.target.value,
          testSetting:
            "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING",
        }));
        setDisableEntryPoint(true);
      } else {
        setPayload((prevPayload) => ({
          ...prevPayload,
          [e.target.name]: e.target.value,
          testSetting: "",
        }));
        setDisableEntryPoint(false);
      }
    } else if (e.target.name === "dateOfHivTest" && e.target.value !== "") {
      checkifDateExist(e.target.value);
    } // else if(e.target.name === "testSetting" && e.target.value !== ""){

    //                 console.log('entered testSetting', e.target.value)

    //         // getStageOfPregnancy(e.target.value)

    //   }
    else {
      setPayload((prevPayload) => ({ ...prevPayload, [e.target.name]: e.target.value }));
    }
  };
  const getHIVStatus = (hospitalNumber, uuid) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/hiv-status?hospitalNumber=${hospitalNumber}&personUuid=${uuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data) {
          setEnrollDto({ ...enroll, hivStatus: response.data });
          setDisableHIVStatus(true);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const checkifDateExist = (dateOfHivTest) => {
    setCheckingForTheDate(true);
    axios
      .get(
        `${baseUrl}pmtct/anc/check-if-date-exist?personUuid=${props.personUuid}&dateOfHivTest=${dateOfHivTest}&`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        //
        setDateOfHivTestExist(
          response.data && existingDate !== dateOfHivTest ? true : false
        );
        setCheckingForTheDate(false);
        setInitialHivTest((prev) => ({ ...prev, dateOfTest: dateOfHivTest }));
        setPayload((prevPayload) => ({ ...prevPayload, dateOfHivTest: dateOfHivTest }));
        //dependent  dates
        setConfirmatoryHivTest((prev) => ({ ...prev, dateOfTest: "" }));
        setTieBreaker((prev) => ({ ...prev, dateOfTest: "" }));
        setRetesting((prev) => ({ ...prev, dateOfTest: "" }));
        setConfirmatoryTest2((prev) => ({ ...prev, dateOfTest: "" }));
        setTieBreaker2((prev) => ({ ...prev, dateOfTest: "" }));
        setErrors((prevErrors) => ({
          ...prevErrors,
          dateOfHivTest:
            response.data && existingDate !== dateOfHivTest
              ? "Date already exist"
              : "",
        }));

        if (lastPmtctHtsRecord?.dateOfHivTest !== existingDate) {
          validateHIVRetestDate(dateOfHivTest);
        }
        // Validate ANC enrollment date for retesting
        validateAncEnrollmentDate(dateOfHivTest);
        if (props?.patientObj?.ancNo) {
          calculateStageOfPregnancy(dateOfHivTest);
        }
      })
      .catch((error) => {
        //console.log(error);
        setCheckingForTheDate(false);
      });
  };

  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    temp.dateOfHivTest = payload.dateOfHivTest ? "" : "This field is required";
    // dateOfHivTestExist

    temp.dateOfHivTest = dateOfHivTestExist
      ? "Date already exist"
      : payload.dateOfHivTest
      ? ""
      : "This field is required";

    temp.testEntryPoint = payload.testEntryPoint
      ? ""
      : "This field is required";

    temp.testSetting = payload.testSetting ? "" : "This field is required";

    temp.initialHivTest = payload.initialHivTest
      ? ""
      : "This field is required";

    payload.testSetting !== "" &&
      payload.testSetting === "PMTCT_ENTRY_POINT_ANC" &&
      (temp.stageOfPregnancy = payload.stageOfPregnancy
        ? ""
        : "This field is required");

    // temp.initialdateOfTest =initialHivTest.dateOfTest ?  "" : "This field is required"
    temp.initialresult = initialHivTest.result ? "" : "This field is required";

    //
    initialHivTest.result !== "" &&
      initialHivTest.result === "reactive" &&
      (temp.confirmatorydateOfTest = confirmatoryHivTest.dateOfTest
        ? ""
        : "This field is required");
    //
    initialHivTest.result !== "" &&
      initialHivTest.result === "reactive" &&
      (temp.confirmatoryresult = confirmatoryHivTest.result
        ? ""
        : "This field is required");
    //

    confirmatoryHivTest.result !== "" &&
      confirmatoryHivTest.result === "reactive" &&
      (temp.retestingdateOfTest = retesting.dateOfTest
        ? ""
        : "This field is required");

    //

    confirmatoryHivTest.result !== "" &&
      confirmatoryHivTest.result === "reactive" &&
      (temp.retestingresult = retesting.result ? "" : "This field is required");

    //

    confirmatoryHivTest.result !== "" &&
      confirmatoryHivTest.result === "non-reactive" &&
      (temp.tieBreakerdateOfTest = tieBreaker.dateOfTest
        ? ""
        : "This field is required");

    //

    confirmatoryHivTest.result !== "" &&
      confirmatoryHivTest.result === "non-reactive" &&
      (temp.tieBreakerresult = tieBreaker.result
        ? ""
        : "This field is required");

    //
    retesting.result !== "" &&
      retesting.result === "reactive" &&
      (temp.confirmatoryTest2result = confirmatoryTest2.result
        ? ""
        : "This field is required");

    //
    retesting.result !== "" &&
      retesting.result === "reactive" &&
      (temp.confirmatoryTest2dateOfTest = confirmatoryTest2.dateOfTest
        ? ""
        : "This field is required");

    //
    tieBreaker.result !== "" &&
      tieBreaker.result === "reactive" &&
      (temp.retestingdateOfTest = retesting.dateOfTest
        ? ""
        : "This field is required");

    //
    tieBreaker.result !== "" &&
      tieBreaker.result === "reactive" &&
      (temp.retestingresult = retesting.result ? "" : "This field is required");

    //
    confirmatoryTest2.result !== "" &&
      confirmatoryTest2.result === "non-reactive" &&
      (temp.tieBreaker2result = tieBreaker2.result
        ? ""
        : "This field is required");

    //
    confirmatoryTest2.result !== "" &&
      confirmatoryTest2.result === "non-reactive" &&
      (temp.tieBreaker2dateOfTest = tieBreaker2.dateOfTest
        ? ""
        : "This field is required");

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };

  function calculateStageOfPregnancy(newTestDate) {
    let gestationalAge = calculateGestationalAge2(newTestDate);
    // Determine trimesters
    const getTrimester = (gestationalAge) => {
      if (gestationalAge >= 0 && gestationalAge <= 12) return "first trimester";
      if (gestationalAge >= 13 && gestationalAge <= 24)
        return "second trimester";
      if (gestationalAge >= 25 && gestationalAge <= 40)
        return "third trimester";
      return "Unknown";
    };

    const lastTrimester = lastPmtctHtsRecord?.stageOfPregnancy;
    const newTrimester = getTrimester(gestationalAge);
    const isSameTrimester = lastTrimester === newTrimester;

    if (isSameTrimester) {
      setValidateHIVRetest({
        message: `Cannot document HIV test. Test is in the same trimester (${newTrimester}).`,
        isValid: false,
        showError: true,
      });
      return;
    }
  }

  function validateHIVRetestDate(newTestDate) {
    let lastTestDate = lastPmtctHtsRecord?.dateOfHivTest;

    // Parse dates using moment
    const newDate = moment(newTestDate);
    const lastDate = moment(lastTestDate);

    // Check if new test is before or same as last test
    if (newDate.isSameOrBefore(lastDate)) {
      setValidateHIVRetest({
        message: `New test date must be after the last test date,  ${lastTestDate}`,
        isValid: false,
        showError: true,
      });
      return;
    }

    // Calculate difference in days
    const daysDifference = newDate.diff(lastDate, "days");
    const isWithinOneMonth = daysDifference < 30;

    if (isWithinOneMonth) {
      setValidateHIVRetest({
        message: `Cannot document HIV test. Test is within 1 month,  (${daysDifference} days) of last test.`,
        isValid: false,
        showError: true,
      });
      return;
    }

    setValidateHIVRetest({
      message: "HIV test date is valid",
      isValid: true,
      showError: false,
    });
  }

  function validateAncEnrollmentDate(newTestDate) {
    // Only validate if patient has ANC record and test type is RETESTING
    const ancEnrollmentDate = props?.patientObj?.firstAncDate;
    const isRetesting = payload.testingType === "RETESTING";
    const hasPreviousRetesting = lastPmtctHtsRecord?.id;

    // Skip validation if not retesting or no ANC enrollment date
    if (!isRetesting || !ancEnrollmentDate) {
      setValidateAncEnrollment({
        message: "",
        isValid: true,
        showError: false,
      });
      return;
    }

    // If patient has previous retesting documented, skip this validation
    // The validateHIVRetestDate function will handle the validation against last test date
    if (hasPreviousRetesting) {
      setValidateAncEnrollment({
        message: "",
        isValid: true,
        showError: false,
      });
      return;
    }

    // Only validate against ANC enrollment date if NO previous retesting exists
    // Parse dates using moment
    const testDate = moment(newTestDate);
    const enrollmentDate = moment(ancEnrollmentDate);

    // Check if test date is before ANC enrollment
    if (testDate.isBefore(enrollmentDate)) {
      setValidateAncEnrollment({
        message: `HIV test date cannot be before ANC enrollment date (${moment(ancEnrollmentDate).format("YYYY-MM-DD")})`,
        isValid: false,
        showError: true,
      });
      return;
    }

    // Calculate difference in days
    const daysDifference = testDate.diff(enrollmentDate, "days");
    const isWithinOneMonth = daysDifference < 30;

    if (isWithinOneMonth) {
      setValidateAncEnrollment({
        message: `Cannot document HIV test. Test date must be at least 1 month (30 days) after ANC enrollment date (${moment(ancEnrollmentDate).format("YYYY-MM-DD")}). Current gap: ${daysDifference} days.`,
        isValid: false,
        showError: true,
      });
      return;
    }

    // Validation passed
    setValidateAncEnrollment({
      message: "HIV test date is valid",
      isValid: true,
      showError: false,
    });
  }


    const createCycle = async () => {
      // If displayed on Patient Card (not enrollment page), don't create cycle
      if (props.onEnrollPatient) {
              
      let payload2 = {
        personUuid: props.personUuid,
        maternalOutcome: "",
        entryPoint: locationState.entrypointValue,
        hivStatus: payload.finalResult,
        pregnancyOutcome: "",
        numberOfInfants: 0,
        pmtctStatus: "INACTIVE",
        source: "WEB",
      };

      try {
        const response = await axios.post(
          `${baseUrl}pmtct/anc/pregnancy-cycle`,
          payload2,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response?.data) {
          return {
            status: true,
            response: response.data,
          };
        } else {
          toast.error("Failed to create new PMTCT cycle: no data returned");
          return {
            status: false,
            response: null,
          };
        }
      } catch (e) {
        console.log(e);
        toast.error(
          `${e?.response?.status}: New pmtct cycle not created: ${e?.response?.data}`
        );
        return {
          status: false,
          response: null,
        };
      }
      }

  
    };


  /**** Submit Button Processing  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return; // Prevent double submission

    // Prepare payload
    payload.initialHivTest = initialHivTest;
    payload.confirmatoryHivTest = confirmatoryHivTest;
    payload.tieBreaker = tieBreaker;
    payload.retesting = retesting;
    payload.confirmatoryTest2 = confirmatoryTest2;
    payload.tieBreaker2 = tieBreaker2;
    payload.finalResult = finalResult;

    // Validation checks
    const isFormValid =
      validate() &&
      !checkingForTheDate &&
      validateHIVRetest.isValid &&
      validateAncEnrollment.isValid;

    // Show validation errors if any
    if (!isFormValid) {
      if (!validateHIVRetest.isValid) {
        toast.error(validateHIVRetest.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      if (!validateAncEnrollment.isValid) {
        toast.error(validateAncEnrollment.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      if (!validate()) {
        toast.error("Please fill all required fields", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      return; // Exit early if validation fails
    }

    
    // Create cycle if needed
    if (
      props.onEnrollPatient 
    ) {
      const checkIfCycleIsCreated = await createCycle();
      payload.pmtctCycleId = checkIfCycleIsCreated?.response?.id;

      if (!checkIfCycleIsCreated?.status) {
        toast.error("Failed to create cycle", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return; // Exit if cycle creation fails
      }
    } else {
      payload.pmtctCycleId = props?.latestPmtctCycle?.id;
    }


    // Process the enrollment
    setSaving(true);

    try {
      const isUpdate = props.activeContent?.actionType === "update";
      let response;

      if (isUpdate) {
        // Update existing enrollment
        response = await axios.put(
          `${baseUrl}pmtct/anc/update-pmtct-hts-enrollment/${props.activeContent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Record updated successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        // Create new enrollment
        response = await axios.post(
          `${baseUrl}pmtct/anc/pmtct-hts-enrollment`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Enrollment saved successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      // Handle post-submission routing
      if (!isUpdate && props.handleRoute && props.onEnrollPatient) {
        const data = {
          ...props?.patientObj,
          id: props?.patientObj.id,
          entryPoint: props.entrypointValue,
          hospitalNumber: props?.patientObj?.identifier?.identifier[0]?.value,
          fullName: props?.patientObj?.surname,
          age: props?.patientAge,
          hivStatus: props?.patientObj?.dynamicHivStatus,
          ancNo: props?.patientObj?.ancNo,
          personUuid: props.personUuid,
        };
        props.handleRoute(data);
      } else {
        props.setActiveContent({
          ...props.activeContent,
          route: "recent-history",
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
        { position: toast.POSITION.TOP_RIGHT }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
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
                  {payload.testingType === "PMTCT-HTS"
                    ? " PMTCT HTS"
                    : "Retesting"}
                </h5>
              </div>

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Date of HIV Test <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="dateOfHivTest"
                      id="dateOfHivTest"
                      onChange={handleInputChange}
                      value={payload.dateOfHivTest}
                      min={
                        patientObj.ancNo ? props?.patientObj?.firstAncDate : ""
                      }
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
                    />
                  </InputGroup>

                  {errors.dateOfHivTest !== "" ? (
                    <span className={classes.error}>
                      {errors.dateOfHivTest}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Hospital Number<span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="text"
                      name="hospitalNumber"
                      id="hospitalNumber"
                      value={payload.hospitalNumber}
                      disabled
                    />
                  </InputGroup>
                </FormGroup>
              </div>

              {props?.patientObj?.ancNo && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>
                      ANC No <span style={{ color: "red" }}> *</span>
                    </Label>
                    <InputGroup>
                      <Input
                        type="text"
                        name="ancNo"
                        id="ancNo"
                        value={payload.ancNo}
                        disabled
                      />
                    </InputGroup>
                  </FormGroup>
                </div>
              )}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Test Entry Point</Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="testEntryPoint"
                      id="testEntryPoint"
                      onChange={handleInputChange}
                      value={payload.testEntryPoint}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {testEntryPoint.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>

                  {errors.testEntryPoint !== "" ? (
                    <span className={classes.error}>
                      {errors.testEntryPoint}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Test Setting <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="testSetting"
                      id="testSetting"
                      onChange={handleInputChange}
                      value={payload.testSetting}
                      disabled={
                        disableEntryPoint ? disableEntryPoint : disabledField
                      }
                    >
                      <option value="">Select</option>
                      {communitySetting.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.testSetting !== "" ? (
                    <span className={classes.error}>{errors.testSetting}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {payload.testSetting.includes("_ANC") && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>
                      Stage of Pregnancy
                      <span style={{ color: "red" }}>*</span>{" "}
                    </Label>
                    <InputGroup>
                      <Input
                        type="select"
                        name="stageOfPregnancy"
                        id="stageOfPregnancy"
                        onChange={handleInputChange}
                        value={payload.stageOfPregnancy}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        <option value="first trimester">First trimester</option>
                        <option value="second trimester">
                          Second trimester
                        </option>
                        <option value="third trimester">Third trimester</option>
                      </Input>
                    </InputGroup>
                    {errors.stageOfPregnancy !== "" ? (
                      <span className={classes.error}>
                        {errors.stageOfPregnancy}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}

              {/* <div className="form-group mb-3 col-md-4">
                       <FormGroup>
                       <Label for=""> Date of Initial HIV Test </Label>
                           <Input
                             type="date"
                             onKeyPress={(e) => {e.preventDefault()}}
                               name="dateOfTest"
                               id="dateOfTest"
                                value={initialHivTest.dateOfTest}
                                onChange={handleInitialInputChange}
                                min={patientObj.ancNo? props?.patientObj?.firstAncDate:payload?.dateOfHiv9aTest? payload?.dateOfHivTest: ''}
                                max={moment(new Date()).format("YYYY-MM-DD")}
                               disabled={disabledField}
                                  />

                               {errors.initialHivTest !== "" ? (
                    <span className={classes.error}>
                      {errors.initialHivTest}
                    </span>
                  ) : (
                    ""
                  )}
                                </FormGroup>
                  </div> */}

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Initial HIV Test
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="result"
                      id="result"
                      onChange={handleInitialInputChange}
                      value={initialHivTest.result}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      <option value="reactive">Reactive</option>
                      <option value="non-reactive">Non-reactive</option>
                    </Input>
                  </InputGroup>
                  {errors.initialresult !== "" ? (
                    <span className={classes.error}>
                      {errors.initialresult}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {initialHivTest.result === "reactive" && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">
                        {" "}
                        Date of Confirmatory Test{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="dateOfTest"
                        id="dateOfTest"
                        value={confirmatoryHivTest.dateOfTest}
                        onChange={handleConfirmatoryInputChange}
                        min={
                          payload.dateOfHivTest
                            ? payload.dateOfHivTest
                            : props?.patientObj?.firstAncDate
                            ? props?.patientObj?.firstAncDate
                            : ""
                        }
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />

                      {errors.confirmatorydateOfTest !== "" ? (
                        <span className={classes.error}>
                          {errors.confirmatorydateOfTest}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>
                        {" "}
                        Confirmatory HIV Test{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="result"
                          id="result"
                          onChange={handleConfirmatoryInputChange}
                          value={confirmatoryHivTest.result}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="reactive">Reactive</option>
                          <option value="non-reactive">Non-reactive</option>
                        </Input>
                      </InputGroup>

                      {errors.confirmatoryresult !== "" ? (
                        <span className={classes.error}>
                          {errors.confirmatoryresult}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}

              {confirmatoryHivTest.result === "non-reactive" && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">
                        {" "}
                        Date of Tie Breaker Test{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="dateOfTest"
                        id="dateOfTest"
                        value={tieBreaker.dateOfTest}
                        onChange={handleTieBreakerInputChange}
                        min={confirmatoryHivTest.dateOfTest}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />

                      {errors.tieBreakerdateOfTest !== "" ? (
                        <span className={classes.error}>
                          {errors.tieBreakerdateOfTest}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>
                        Tie Breaker<span style={{ color: "red" }}> *</span>
                      </Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="result"
                          id="result"
                          onChange={handleTieBreakerInputChange}
                          value={tieBreaker.result}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="reactive">Reactive</option>
                          <option value="non-reactive">Non-reactive</option>
                        </Input>
                      </InputGroup>
                      {errors.tieBreakerresult !== "" ? (
                        <span className={classes.error}>
                          {errors.tieBreakerresult}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}

              {(tieBreaker.result === "reactive" ||
                confirmatoryHivTest.result === "reactive") && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">
                        {" "}
                        Date of Retesting{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="dateOfTest"
                        id="dateOfTest"
                        value={retesting.dateOfTest}
                        onChange={handleRetestingInputChange}
                        min={
                          confirmatoryHivTest.dateOfTest
                            ? confirmatoryHivTest.dateOfTest
                            : tieBreaker.dateOfTest
                        }
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />

                      {errors.retestingdateOfTest !== "" ? (
                        <span className={classes.error}>
                          {errors.retestingdateOfTest}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>
                        Retesting<span style={{ color: "red" }}> *</span>
                      </Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="result"
                          id="result"
                          onChange={handleRetestingInputChange}
                          value={retesting.result}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="reactive">Reactive</option>
                          <option value="non-reactive">Non-reactive</option>
                        </Input>
                      </InputGroup>
                      {errors.retestingresult !== "" ? (
                        <span className={classes.error}>
                          {errors.retestingresult}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}

              {retesting.result === "reactive" && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">
                        {" "}
                        Date of Confirmatory Test 2{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="dateOfTest"
                        id="dateOfTest"
                        value={confirmatoryTest2.dateOfTest}
                        onChange={handleConfirmatory2InputChange}
                        min={retesting.dateOfTest}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      {errors.confirmatoryTest2dateOfTest !== "" ? (
                        <span className={classes.error}>
                          {errors.confirmatoryTest2dateOfTest}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>
                        Confirmatory Test 2
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="result"
                          id="result"
                          onChange={handleConfirmatory2InputChange}
                          value={confirmatoryTest2.result}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="reactive">Reactive</option>
                          <option value="non-reactive">Non-reactive</option>
                        </Input>
                      </InputGroup>
                      {errors.confirmatoryTest2result !== "" ? (
                        <span className={classes.error}>
                          {errors.confirmatoryTest2result}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>{" "}
                </>
              )}

              {confirmatoryTest2?.result === "non-reactive" && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">
                        {" "}
                        Date of Tie Breaker Test 2{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="dateOfTest"
                        id="dateOfTest"
                        value={tieBreaker2.dateOfTest}
                        onChange={handleTieBreaker2InputChange}
                        min={confirmatoryTest2.dateOfTest}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />

                      {errors.tieBreaker2dateOfTest !== "" ? (
                        <span className={classes.error}>
                          {errors.tieBreaker2dateOfTest}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>
                        Tie Breaker Test 2
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="result"
                          id="result"
                          onChange={handleTieBreaker2InputChange}
                          value={tieBreaker2.result}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="reactive">Reactive</option>
                          <option value="non-reactive">Non-reactive</option>
                        </Input>
                      </InputGroup>
                      {errors.tieBreaker2result !== "" ? (
                        <span className={classes.error}>
                          {errors.tieBreaker2result}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}

              {props?.PmtctHtsRetestingType === "pmtct-hts" && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Syphilis </Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="syphilis"
                          id="syphilis"
                          onChange={handleInputChange}
                          value={payload.syphilis}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="reactive">Reactive</option>
                          <option value="non-reactive">
                            Non-reactive
                          </option>{" "}
                        </Input>
                      </InputGroup>
                    </FormGroup>
                  </div>

                  {props?.PmtctHtsRetestingType === "pmtct-hts" && (
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Hepatitis B</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hepatitisB"
                            id="hepatitisB"
                            onChange={handleInputChange}
                            value={payload.hepatitisB}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  )}

                  {props?.PmtctHtsRetestingType === "pmtct-hts" && (
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Hepatitis C</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hepatitisC"
                            id="hepatitisC"
                            onChange={handleInputChange}
                            value={payload.hepatitisC}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>{" "}
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  )}
                </>
              )}
            </div>
            {saving ? <Spinner /> : ""}
            <br />

            <>
              <>
                {/*  */}
                {finalResult && (
                  <>
                    <b>Result : </b>
                    <LabelRibbon
                      color={finalResult === "Positive" ? "red" : "green"}
                    >
                      {finalResult}
                    </LabelRibbon>
                    <br />
                  </>
                )}

                {/*  */}

                <>
                  {props.activeContent &&
                  props.activeContent.actionType === "update" ? (
                    <>
                      <MatButton
                        type="button"
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
                            Update
                          </span>
                        ) : (
                          <span style={{ textTransform: "capitalize" }}>
                            Updating...
                          </span>
                        )}
                      </MatButton>
                    </>
                  ) : props.activeContent.actionType !== "view" ? (
                    <>
                      <MatButton
                        type="button"
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
                  ) : null}
                </>
              </>
            </>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PmtctHtsForm;
