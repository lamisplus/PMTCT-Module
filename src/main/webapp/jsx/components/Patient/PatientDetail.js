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
import InfantVisit from "./../Consultation/InfantVisit";
import PatientHistory from "./../History/PatientHistory";
import RecentHistory from "./../History/RecentHistory";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [motherVisitType, setMotherVisitType] = useState("MOTHER_VISIT");
  const [lastestConfirmatoryTest, setLastestConfirmatoryTest] = useState("");
  const [maternalOutcome, setMaternalOutcome] = useState("");
  const [lastestHivStatus, setLatestHivStatus] = useState("");
  const [mainDeliveryStatus, setMainDeliveryStatus] = useState(false);
  const [numberOfInfantsAlive, setNumberOfInfantsAlive] = useState(0);
  const [checkForRetesting, setCheckForRetesting] = useState(true);
  const [isOnPMTCT, setIsOnPMTCT] = useState(false);

  const patientObj =
    history.location && history.location.state
      ? history.location.state.patientObj
      : {};

  const [latestPmtctCycle, setLatestPmtctCycle] = useState({
    uuid: patientObj.pmtctCycleUuid,
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

    // Fetch the selected cycle data
    const patientUuid =
      patientObj.patient_uuid || patientObj.patientUuid || patientObj.uuid;

    try {
      // Get all cycles and find the selected one
      const response = await axios.get(
        `${baseUrl}pmtct/anc/pregnancy-cycles?patientUuid=${patientUuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.length > 0) {
        const selectedCycle = response.data.find(
          (cycle) => cycle.uuid === cycleId
        );
        if (selectedCycle) {
          setLatestPmtctCycle(selectedCycle);
        }
      }

      // Fetch activities for the selected cycle
      RecentActivities(cycleId);
    } catch (error) {
      console.error("Error fetching cycle data:", error);
    }
  };

  const getLatestPmtctCycle = async () => {
    const patientUuid = patientObj.patient_uuid
      ? patientObj.patient_uuid
      : patientObj.patientUuid
      ? patientObj.patientUuid
      : patientObj.uuid;

    await axios
      .get(
        `${baseUrl}pmtct/anc/get-latest-pregnancy-cycle?patientUuid=${patientUuid}`,
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
  const RecentActivities = (cycleIdToUse) => {
    const patientUuid = patientObj.patient_uuid
      ? patientObj.patient_uuid
      : patientObj.patientUuid
      ? patientObj.patientUuid
      : patientObj.uuid;

    // Use the provided cycleId, or fall back to selectedCycleId, latestPmtctCycle, or patientObj
    const pmtctCycleUuid = cycleIdToUse || selectedCycleId || latestPmtctCycle?.uuid || patientObj.pmtctCycleUuid;

    if (pmtctCycleUuid) {
      axios
        .get(
          `${baseUrl}pmtct/anc/getAllActivities/${patientUuid}?pmtctCycleUuid=${pmtctCycleUuid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          if (response?.data) {
            const hasDeliveryActivity = response.data.some(
              (each) => each.activityName == "Labour and Delivery"
            );
            setMainDeliveryStatus(hasDeliveryActivity);

            // Fetch number of infants alive from the delivery record
            if (hasDeliveryActivity && pmtctCycleUuid) {
              axios
                .get(
                  `${baseUrl}pmtct/anc/view-delivery-with-uuid/${patientUuid}/${pmtctCycleUuid}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                )
                .then((deliveryRes) => {
                  const alive = deliveryRes.data?.numberOfInfantsAlive;
                  setNumberOfInfantsAlive(alive != null ? parseInt(alive) : 0);
                })
                .catch(() => setNumberOfInfantsAlive(0));
            } else {
              setNumberOfInfantsAlive(0);
            }

            const hasRetestingActivity = response.data.some(
              (each) =>
                (each.activityName &&
                  each.activityName.toUpperCase().includes("RETESTING")) ||
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
    const patientUuid = patientObj.patient_uuid
      ? patientObj.patient_uuid
      : patientObj.patientUuid
      ? patientObj.patientUuid
      : patientObj.uuid;

    const cycleId = selectedCycleId || latestPmtctCycle?.uuid || patientObj.pmtctCycleUuid;
    if (!cycleId) return;

    await axios
      .get(
        `${baseUrl}pmtct/anc/get-latest-maternal-outcome?patientUuid=${patientUuid}&pmtctCycleUuid=${cycleId}`,
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

  // One-time setup: fetch patient info, codesets, entry points, and latest cycle
  useEffect(() => {
    GET_CODESETS();
    POINT_ENTRY_PMTCT();
    getLatestPmtctCycle();
    let patientId = patientObj?.id || patientObj?.personId;
    if (patientId) {
      axios
        .get(`${baseUrl}patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setPersonInfo(response.data);
        })
        .catch((error) => {
          console.error("Error fetching patient info:", error);
        });
    }

    // Auto-open a route if redirected from enrollment (e.g., L&D → HTS)
    const autoOpenRoute = history.location?.state?.autoOpenRoute;
    if (autoOpenRoute) {
      if (autoOpenRoute === "pmtct-hts") {
        setPmtctHtsRetestingType("pmtct-hts");
      }
      setActiveContent((prev) => ({
        ...prev,
        route: autoOpenRoute,
        actionType: "create",
        id: "",
        obj: {},
      }));
    }
  }, []);

  // Cycle-dependent calls: only run when we have a valid cycle UUID
  useEffect(() => {
    if (!latestPmtctCycle?.uuid) return;
    getLatestMaternalOutcome();
    RecentActivities(selectedCycleId);
  }, [activeContent, latestPmtctCycle?.uuid, selectedCycleId]);

  // Re-fetch cycle when user selects a different cycle manually
  useEffect(() => {
    if (selectedCycleId && selectedCycleId !== latestPmtctCycle?.uuid) {
      // handleCycleChange already updates latestPmtctCycle, no extra fetch needed
    }
  }, [selectedCycleId]);

  return (
    <div className={classes.root} style={{ background: "#f4f6f9", minHeight: "100vh", padding: "0 0 24px" }}>
      <div style={{ padding: "10px 24px 6px", marginBottom: "4px" }}>
        <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <Link to={"/"} style={{ color: "#64748b", textDecoration: "none", fontWeight: "500" }}>
            PMTCT
          </Link>
          <span style={{ color: "#cbd5e1", fontSize: "11px" }}>/</span>
          <span style={{ color: "#0f172a", fontWeight: "600" }}>Patient Dashboard</span>
        </nav>
      </div>

      <Card style={{ background: "transparent", boxShadow: "none" }}>
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
            numberOfInfantsAlive={numberOfInfantsAlive}
            maternalOutcome={maternalOutcome}
            isOnPMTCT={isOnPMTCT}
            setIsOnPMTCT={setIsOnPMTCT}
            latestPmtctCycle={latestPmtctCycle}
            selectedCycleId={selectedCycleId}
            onCycleChange={handleCycleChange}
            setMotherVisitType={setMotherVisitType}
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
              motherVisitType={motherVisitType}
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
              patientUuid={
                patientObj.patient_uuid
                  ? patientObj.patient_uuid
                  : patientObj.patientUuid
                  ? patientObj.patientUuid
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
              setPmtctHtsRetestingType={setPmtctHtsRetestingType}
            />
          )}

          {activeContent.route === "labour-delivery" && (
            <LabourDelivery
              patientObj={patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              latestPmtctCycle={latestPmtctCycle}
              selectedCycleId={selectedCycleId}
              setPmtctHtsRetestingType={setPmtctHtsRetestingType}
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

          {activeContent.route === "infant-visit" && (
            <InfantVisit
              patientObj={patientObj}
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
