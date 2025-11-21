import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import PatientCardDetail from "./PatientCard";
import { useHistory } from "react-router-dom";
import SubMenu from "./SubMenu";
import ClinicVisit from "../Consultation/Index";
import PmtctEnrollment from "./../PmtctServices/PmtctEnrollment";
import AncEnrollement from "./../PmtctServices/AncEnrollement";
import LabourDelivery from "./../PmtctServices/LabourDelivery";
import PmtctHts from "./../PMTCTHTSEnrollment/Index";
import Partners from "./../PmtctServices/Partners/Index";
import Infants from "./../PmtctServices/Infants/Index";
import AddPartners from "./../PmtctServices/Partners/AddNewPartner";
import AddInfants from "./../PmtctServices/Infants/InfantRegistration";
import PatientHistory from "./../History/PatientHistory";
import RecentHistory from "./../History/RecentHistory";
import axios from "axios";
import { url as baseUrl, token as token } from "./../../../api";
import PmtctHtsForm from "../PmtctServices/PmtctHtsForm";
import PatientVisits from "./CheckedInVisit";
import { GET_CODESETS_IN_BATCH } from "../../../utils";
const styles = (theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20,
  },
  details: {
    alignItems: "center",
  },
  column: {
    flexBasis: "20.33%",
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

function PatientCard(props) {
  let history = useHistory();
  const [art, setArt] = useState(false);
  const [PersonInfo, setPersonInfo] = useState({});
  const [deliveryInfo, setDeliveryInfo] = useState([]);
  const [allEntryPoint, setAllEntryPoint] = useState([]);
  const [enrollPMTCT, setEnrollPMTCT] = useState(false);
  const [PmtctHtsRetestingType, setPmtctHtsRetestingType] = useState("");
  const [lastestConfirmatoryTest, setLastestConfirmatoryTest] = useState("");
  const [maternalOutcome, setMaternalOutcome] = useState("");
  const [lastestHivStatus, setLatestHivStatus] = useState("");
  const [mainDeliveryStatus, setMainDeliveryStatus] = useState(true);
  const [checkForRetesting, setCheckForRetesting] = useState(true);
  const [isOnPMTCT, setIsOnPMTCT] = useState(false);

   const patientObj =
    history.location && history.location.state
      ? history.location.state.patientObj
      : {};
  
      console.log("patientObj", patientObj);
  const [latestPmtctCycle, setLatestPmtctCycle] = useState({
    id: patientObj.pmtctCycleId,
  });
  const [selectedCycleId, setSelectedCycleId] = useState(null);

  const [activeContent, setActiveContent] = useState({
    route: "recent-history",
    id: "",
    activeTab: "home",
    actionType: "create",
    obj: {},
  });

  const { classes } = props;

  // Handler for cycle selection changes
  const handleCycleChange = async (cycleId) => {
    setSelectedCycleId(cycleId);
    console.log('Cycle changed in PatientDetail:', cycleId);

    // Fetch the selected cycle data
    const personUuid = patientObj.person_uuid || patientObj.personUuid || patientObj.uuid;

    try {
      // Get all cycles and find the selected one
      const response = await axios.get(
        `${baseUrl}pmtct/anc/pregnancy-cycles?personUuid=${personUuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.length > 0) {
        const selectedCycle = response.data.find(cycle => cycle.id === cycleId);
        if (selectedCycle) {
          setLatestPmtctCycle(selectedCycle);
          console.log('Updated latestPmtctCycle:', selectedCycle);
        }
      }
    } catch (error) {
      console.error('Error fetching cycle data:', error);
    }
  };


  const getLatestPmtctCycle = async () => {
    const personUuid = patientObj.person_uuid
      ? patientObj.person_uuid
      : patientObj.personUuid
      ? patientObj.personUuid
      : patientObj.uuid;

    await axios
      .get(
        `${baseUrl}pmtct/anc/get-latest-pregnancy-cycle?personUuid=${personUuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        setLatestPmtctCycle(response.data);
      })
      .catch((error) => {
        toast.error(error?.message);
      });
  };
  const RecentActivities = () => {
    if (patientObj.pmtctCycleId) {
      const personUuid = patientObj.person_uuid
        ? patientObj.person_uuid
        : patientObj.personUuid
        ? patientObj.personUuid
        : patientObj.uuid;
      const pmtctCycleId = props.latestPmtctCycle?.id;
      axios
        .get(
          `${baseUrl}pmtct/anc/getAllActivities/${personUuid}?pmtctCycleId=${patientObj.pmtctCycleId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          console.log("response", response);
          if (response?.data) {
            const hasDeliveryActivity = response.data.some(
              (each) => each.activityName == "Labour and Delivery"
            );
            setMainDeliveryStatus(hasDeliveryActivity);
            const hasRetestingActivity = response.data.some(
              (each) =>
                (each.activityName &&
                  each.activityName.toUpperCase().includes("RETEzzSTING")) ||
                (each.activityName &&
                  each.activityName.toUpperCase().includes("PMTCT-HTS"))
            );
            setCheckForRetesting(hasRetestingActivity ? false : true);
          } else {
            setDeliveryInfo({});
          }
        })
        .catch((error) => {
          console.error("Error fetching recent activities:", error);
        });
    }
 
  };

  const getLatestMaternalOutcome = async () => {
    const personUuid = patientObj.person_uuid
      ? patientObj.person_uuid
      : patientObj.personUuid
      ? patientObj.personUuid
      : patientObj.uuid;

    await axios
      .get(
        `${baseUrl}pmtct/anc/get-latest-maternal-outcome?personUuid=${personUuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        setMaternalOutcome(response.data);
      })
      .catch((error) => {
        console.error("Error fetching confirmatory result:", error);
      });
  };
  const POINT_ENTRY_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PMTCT_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAllEntryPoint(response.data);
      })
      .catch((error) => {
        console.error("Error fetching entry points:", error);
      });
  };

  // BATCH API
  const GET_CODESETS = () => {
    GET_CODESETS_IN_BATCH("MATERNAL_OUTCOME").then((response) => {
      localStorage.setItem(
        "maternalOutcome",
        JSON.stringify(response.data.MATERNAL_OUTCOME)
      );
    });
  };

  useEffect(() => {
    GET_CODESETS();
    RecentActivities();
    getLatestMaternalOutcome();
    let patientId=patientObj?.id||patientObj?.personId
    axios
      .get(`${baseUrl}patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log(response.data);
        setPersonInfo(response.data);
      })
      .catch((error) => {
        console.error("Error fetching patient info:", error);
      });
    POINT_ENTRY_PMTCT();
    getLatestPmtctCycle();
  }, []);

  useEffect(() => {
    getLatestMaternalOutcome();
    getLatestPmtctCycle();
  }, [activeContent]);

  return (
    <div className={classes.root}>
      <div
        className="row page-titles mx-0"
        style={{ marginTop: "0px", marginBottom: "-10px" }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <h4>
              <Link to={"/"}>PMTCT /</Link> Patient Dashboard
            </h4>
          </li>
        </ol>
      </div>

      <Card>
        <CardContent>
          {/* Patient Card Detail */}
          <PatientCardDetail
            patientObj={patientObj}
            setArt={setArt}
            setActiveContent={setActiveContent}
            activeContent={activeContent}
            setLastestConfirmatoryTest={setLastestConfirmatoryTest}
            maternalOutcome={maternalOutcome}
            setLatestHivStatus={setLatestHivStatus}
            latestPmtctCycle={latestPmtctCycle}
            selectedCycleId={selectedCycleId}
          />

          {/* Patient Dashboard menu */}
          <SubMenu
            patientObj={patientObj}
            art={art}
            setActiveContent={setActiveContent}
            deliveryInfo={deliveryInfo}
            enrollPMTCT={enrollPMTCT}
            setPmtctHtsRetestingType={setPmtctHtsRetestingType}
            activeContent={activeContent}
            mainDeliveryStatus={mainDeliveryStatus}
            maternalOutcome={maternalOutcome}
            isOnPMTCT={isOnPMTCT}
            setIsOnPMTCT={setIsOnPMTCT}
            latestPmtctCycle={latestPmtctCycle}
            selectedCycleId={selectedCycleId}
            onCycleChange={handleCycleChange}
          />
          <br />

          {/* Conditional Rendering of Routes */}
          {activeContent.route === "recent-history" && (
            <RecentHistory
              allEntryPoint={allEntryPoint}
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              setPmtctHtsRetestingType={setPmtctHtsRetestingType}
              lastestHivStatus={lastestHivStatus}
              activeContent={activeContent}
              checkForRetesting={checkForRetesting}
              entrypointValue={
                patientObj.ancNo
                  ? "PMTCT_ENTRY_POINT_ANC"
                  : patientObj.entryPoint
              }
              latestPmtctCycle={latestPmtctCycle}
              setIsOnPMTCT={setIsOnPMTCT}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "consultation" && (
            <ClinicVisit
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              maternalOutcome={maternalOutcome}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "pmtct-hts" && (
            <PmtctHtsForm
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              PmtctHtsRetestingType={PmtctHtsRetestingType}
              handleRoute={""}
              onEnrollPatient={false}
              entrypointValue={patientObj.entryPoint}
              patientAge={patientObj?.age}
              personUuid={
                patientObj.person_uuid
                  ? patientObj.person_uuid
                  : patientObj.personUuid
                  ? patientObj.personUuid
                  : patientObj.uuid
              }
              latestPmtctCycle={latestPmtctCycle}
              hasPmtctHtsRecord={"omit"}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "anc-pnc" && (
            <PmtctEnrollment
              newRegDate={""}
              allEntryPoint={allEntryPoint}
              entrypointValue={patientObj.entryPoint}
              ancEntryType={patientObj.ancNo ? true : false}
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              hideUpdateButton={true}
              htsHivStatus={""}
              lastestConfirmatoryTest={lastestConfirmatoryTest}
              showLastHivTestMessage={false}
              latestPmtctCycle={latestPmtctCycle}
              onEnrollPatient={false}
              hasPmtctHtsRecord={"omit"}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "anc-enrollment" && (
            <AncEnrollement
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "labour-delivery" && (
            <LabourDelivery
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "partners" && (
            <Partners
              patientObj={patientObj}
              patientAge={patientObj.age}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "infants" && (
            <Infants
              patientObj={patientObj}
              patientAge={patientObj.age}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "add-partner" && (
            <AddPartners
              patientObj={patientObj}
              patientAge={patientObj.age}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "add-infant" && (
            <AddInfants
              patientObj={patientObj}
              patientAge={patientObj.age}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "patient-history" && (
            <PatientHistory
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}

          {activeContent.route === "patient-visit" && (
            <PatientVisits
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);
