import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Dropdown, Menu } from "semantic-ui-react";
import { makeStyles } from "@material-ui/core/styles";
import { url as baseUrl, token } from "../../../api";
import { usePermissions } from "../../../hooks/usePermissions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const useStyles = makeStyles((theme) => ({
  navItemText: {
    padding: theme.spacing(2),
  },
}));

function SubMenu(props) {
  const classes = useStyles();
  let gender = "";
  const patientObjs = props.patientObj ? props.patientObj : {};
  //const patientCurrentStatus=props.patientObj && props.patientObj.currentStatus==="Died (Confirmed)" ? true : false ;
  const [patientObj, setpatientObj] = useState(patientObjs);
  const [genderType, setGenderType] = useState();
  const [menuReady, setMenuReady]=useState(false)
  const [showRetesting, setShowRetesting]=useState(false)
  const [retestingStatus, setRetestingStatus]=useState("pmtct-hts")
  // const [derivedHivStatus, setDerivedHivStatus]=useState("")
 const[closeCycle, setCloseCycle]=useState(true)
  const [deliveryStatus, setDeliveryStatus] = useState(true);

  const [patientStatus, setPatientStatus] = useState(() => {
    const statuses = [
      props?.patientObj?.staticHivStatus,
      props?.patientObj?.hivStatus,
      props?.patientObj?.dynamicHivStatus
    ];
    const isPositive = statuses.some(status =>
      status && ["Positive", "reactive"].includes(status.trim?.() || status)
    );
    return isPositive ? "Positive" : (props?.patientObj?.staticHivStatus || props?.patientObj?.hivStatus || props?.patientObj?.dynamicHivStatus);
  });
  const [allPmtctCycleRecord, setAllPmtctCycleRecord] = useState([]);

  // Use selectedCycleId from props if available, otherwise use local state
  const selectedCycleId = props.selectedCycleId !== undefined && props.selectedCycleId !== null
    ? props.selectedCycleId
    : (allPmtctCycleRecord.length > 0 ? allPmtctCycleRecord[0].id : null);


  // Use isOnPMTCT from props if provided, otherwise use local state
  const isOnPMTCT = props.isOnPMTCT !== undefined ? props.isOnPMTCT : (props?.patientObj?.pmtctRegStatus ||  props?.patientObj?.isOnPmtct);
  const setIsOnPMTCT = props.setIsOnPMTCT || (() => {});




  const { hasPermission, hasRDErole } = usePermissions();

    const permissions = useMemo(
    () => ({
      canSeePMTCT: hasPermission("maternal_cohort_register" ),
      canSeeDelivery: hasPermission("delivery_register"),
      genAndPmtct: hasRDErole  || hasPermission("maternal_cohort_register" ),
     genAndANC: hasRDErole  || hasPermission("delivery_register" ),


    }),
    [hasPermission, hasRDErole]
  );

  // Function to handle cycle selection (both default and onChange)
  const handleCycleChange = (cycleId) => {

    // Fetch latest confirmatory result for the selected cycle
    getLatestConfirmatoryResult(cycleId);

    // Pass the selected cycle to parent component
    if (props.onCycleChange) {
      props.onCycleChange(cycleId);
    }
  };

      const getAllPmtctCycle = async () => {
        const personUuid = patientObj.person_uuid
          ? patientObj.person_uuid
          : patientObj.personUuid
          ? patientObj.personUuid
          : patientObj.uuid;

        await axios
          .get(`${baseUrl}pmtct/anc/pregnancy-cycles?personUuid=${personUuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setAllPmtctCycleRecord(response.data);
            // Set the first cycle as default if available and no cycle is currently selected
            if (response.data && response.data.length > 0) {
              const firstCycleId = response.data[0].id;
              // Only set default if parent hasn't provided a selectedCycleId
              if (props.selectedCycleId === undefined || props.selectedCycleId === null) {
                handleCycleChange(firstCycleId);
              }
            }
          })
          .catch((error) => {
            toast.error(error?.message);
          });
      }; 
  
  let mentalStatus = false;
  let initialEvaluationStatus = false;
  useEffect(() => {
    getLatestConfirmatoryResult();
    getAllPmtctCycle();

    Observation();
    gender =
      props.patientObj && props.patientObj.sex ? props.patientObj.sex : null;
    setGenderType(gender === "Female" ? true : false);



    if(props.maternalOutcome){
      const negativeOutcome=["MATERNAL_OUTCOME_DEAD", "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP", "MATERNAL_OUTCOME_TRANSFERRED_OUT"  ]
      let isNegativeOutcome=negativeOutcome.includes(props.maternalOutcome)

      setCloseCycle(!isNegativeOutcome)
    }
  }, [props]);

    useEffect(() => {
    getLatestConfirmatoryResult(selectedCycleId);
   
    setDeliveryStatus( props.mainDeliveryStatus  ||  patientObj.deliveryStatus )

    // Only update if setIsOnPMTCT is passed from parent
    if (props.setIsOnPMTCT) {
      props.setIsOnPMTCT(props?.patientObj?.pmtctRegStatus ||  props?.patientObj?.isOnPmtct);
    }
  }, [props.activeContent, props?.patientObj, props.mainDeliveryStatus, selectedCycleId]);


  //Get list of RegimenLine
  const Observation = () => {
    axios
      .get(
        `${baseUrl}observation/person/${
          props.patientObj.id ? props.patientObj.id : props.patientObj.personId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        const observation = response.data;
        const mental = observation.filter((x) => x.type === "mental health");
        const evaluation = observation.filter(
          (x) => x.type === "initial evaluation"
        );
        if (mental.length > 1) {
          mentalStatus = true;
        }
        if (evaluation.length > 1) {
          initialEvaluationStatus = true;
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const loadAncPnc = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "anc-pnc", actionType: "create", id: "", obj: {} });
  };
  const loadLabourDelivery = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "labour-delivery", actionType: "create", id: "", obj: {} });
  };
  const onClickConsultation = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "consultation", actionType: "create", id: "", obj: {}, activeTab: "home" });
  };

    const onClickPmtctHts= (type) => {
    props.setActiveContent({ ...props.activeContent, route: "pmtct-hts", actionType: "create", id: "", obj: {} });
    props.setPmtctHtsRetestingType(type)
  };

  const onClickHome = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "recent-history", actionType: "create", id: "", obj: {} });
  };

  const onClickInfant = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "infants", actionType: "create", id: "", obj: {} });
  };
  const onClickPartner = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "partners", actionType: "create", id: "", obj: {} });
  };
  const loadPatientHistory = () => {
    props.setActiveContent({ ...props.activeContent, route: "patient-history", actionType: "create", id: "", obj: {} });
  };
  //

  
  const getLatestConfirmatoryResult = async(pmtctCycleId) => {
    let thePmtctCycleId = pmtctCycleId || props.latestPmtctCycle?.id;
    if (thePmtctCycleId) {
      const personUuid =
        props.patientObj.person_uuid || props.patientObj.personUuid;



      const url = `${baseUrl}pmtct/anc/get-confirmatory-latest-result?personUuid=${personUuid}&pmtctCycleId=${thePmtctCycleId}`;

      await axios
        .get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setPatientStatus(
            response.data
              ? response.data
              : props?.patientObj?.staticHivStatus
              ? props?.patientObj?.staticHivStatus
              : props?.patientObj?.hivStatus
              ? props?.patientObj?.hivStatus
              : props.patientObj.dynamicHivStatus
          );
          showRetestingMenu(response.data);
          setMenuReady(true);
        })
        .catch((error) => {
          console.error("Error fetching confirmatory result:", error);
          setMenuReady(true);
        });
    }
  
  };
const showRetestingMenu = (patientHivStatus) => {

  if (props?.patientObj?.pmtctRegStatus) {
    setShowRetesting(false);
    return; // Exit early if pmtct registered
  }

  let hivStatusSource = [
    patientHivStatus, 
    props?.patientObj?.hivStatus, 
    props?.patientObj?.dynamicHivStatus, 
    props?.patientObj?.staticHivStatus
  ];
  

  // Filter out null/undefined and convert to lowercase
  const validStatuses = hivStatusSource
    .filter(status => status != null && status !== '')
    .map(status => String(status).toLowerCase().trim());

  // Check for positive/reactive (excluding non-reactive)
  const hasPositive = validStatuses.some(status => {
    // Exclude non-reactive first
    if (status.includes("non-reactive") || status.includes("non reactive")) {
      return false;
    }
    // Then check for positive/reactive
    return status.includes("positive") || status.includes("reactive");
  });

  // Check for negative/non-reactive
  const hasNegative = validStatuses.some(status => 
    status.includes("negative") || status.includes("non-reactive") || status.includes("non reactive")
  );

  if (hasPositive) {
    setShowRetesting(false);
    setRetestingStatus('retesting');
  } else if (hasNegative) {
    setShowRetesting(true);
    setRetestingStatus('retesting');
  } else {
    // if the status is unknown 
    setShowRetesting(true);
    setRetestingStatus("pmtct-hts");
  }
};

  return (
    <div>
      <Menu size="large" color={"black"} inverted>
        <Menu.Item onClick={() => onClickHome()}> Home</Menu.Item>

        {menuReady && (
          <>
            {showRetesting && retestingStatus === "pmtct-hts" && (
              <Menu.Item onClick={() => onClickPmtctHts("pmtct-hts")}>
                {" "}
                PMTCT HTS{" "}
              </Menu.Item>
            )}

            {["positive", "reactive"].includes((patientStatus || "")?.trim()?.toLowerCase()) && (
              <>
                {isOnPMTCT !== true ? (
                  <>
                    <>
                      {permissions.genAndPmtct && (
                        <Menu.Item onClick={() => loadAncPnc()}>
                          PMTCT Enrollment
                        </Menu.Item>
                      )}
                    </>
                  </>
                ) : (
                  <>
                    {closeCycle && (
                      <>
                        <Menu.Item onClick={() => onClickConsultation()}>
                          Follow Up Visit
                        </Menu.Item>

                        {!deliveryStatus && (
                          <Menu.Item onClick={() => loadLabourDelivery()}>
                            Labour and Delivery
                          </Menu.Item>
                        )}
                        {patientObj?.ancNo && (
                          <Menu.Item onClick={() => onClickPartner()}>
                            {" "}
                            Partners
                          </Menu.Item>
                        )}
                        {/* )} */}
                        <Menu.Item onClick={() => onClickInfant()}>
                          {" "}
                          Infant Information
                        </Menu.Item>
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {showRetesting && retestingStatus === "retesting" && (
              <Menu.Item onClick={() => onClickPmtctHts("retesting")}>
                Retesting{" "}
              </Menu.Item>
            )}
          </>
        )}

        <Menu.Item onClick={() => loadPatientHistory()}>History</Menu.Item>

        <Menu.Menu position="right" style={{ marginLeft: "auto" }}>
          {allPmtctCycleRecord && allPmtctCycleRecord.length > 0 && (
            <Dropdown
              item
              text={`Pregnancy Cycle ${
                selectedCycleId
                  ? allPmtctCycleRecord?.length -
                    allPmtctCycleRecord.findIndex(
                      (c) => c.id === selectedCycleId
                    )
                  : 1
              }`}
              style={{
                borderLeft: "2px solid rgba(255,255,255,0.3)",
                paddingLeft: "15px",
              }}
            >
              <Dropdown.Menu>
                <Dropdown.Divider />
                {allPmtctCycleRecord.map((cycle, index) => (
                  <Dropdown.Item
                    key={cycle.id}
                    value={cycle.id}
                    active={selectedCycleId === cycle.id}
                    onClick={() => handleCycleChange(cycle.id)}
                  >
                    <div>
                      <strong>
                        Cycle {allPmtctCycleRecord.length - index}
                      </strong>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Menu.Menu>
      </Menu>
    </div>
  );
}

export default SubMenu;
