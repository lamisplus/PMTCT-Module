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
    : (allPmtctCycleRecord.length > 0 ? allPmtctCycleRecord[0].uuid : null);


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
        const patientUuid = patientObj.patient_uuid
          ? patientObj.patient_uuid
          : patientObj.patientUuid
          ? patientObj.patientUuid
          : patientObj.uuid;

        await axios
          .get(`${baseUrl}pmtct/anc/pregnancy-cycles?patientUuid=${patientUuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setAllPmtctCycleRecord(response.data);
            // Set the first cycle as default if available and no cycle is currently selected
            if (response.data && response.data.length > 0) {
              const firstCycleId = response.data[0].uuid;
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
  
  useEffect(() => {
    getLatestConfirmatoryResult();
    getAllPmtctCycle();

    gender =
      props.patientObj && props.patientObj.sex ? props.patientObj.sex : null;
    setGenderType(gender === "Female" ? true : false);



    if(props.maternalOutcome){
      const negativeOutcome=["MATERNAL_OUTCOME_DEAD", "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP", "MATERNAL_OUTCOME_TRANSFERRED_OUT"  ]
      let isNegativeOutcome=negativeOutcome.includes(props.maternalOutcome)

      setCloseCycle(!isNegativeOutcome)
    } else {
      // No maternal outcome for this cycle — allow all actions
      setCloseCycle(true)
    }
  }, [props]);

    useEffect(() => {
    getLatestConfirmatoryResult(selectedCycleId);
   
    setDeliveryStatus( props.mainDeliveryStatus  ||  patientObj.deliveryStatus )

    // isOnPMTCT is now driven by RecentHistory.checkForPmtctEnrollment (cycle-aware)
    // Do not override it here with the patient-level prop, which is not cycle-specific
  }, [props.activeContent, props?.patientObj, props.mainDeliveryStatus, selectedCycleId]);


  const loadAncPnc = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "anc-pnc", actionType: "create", id: "", obj: {} });
  };
  const loadLabourDelivery = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "labour-delivery", actionType: "create", id: "", obj: {} });
  };
  const onClickConsultation = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "consultation", actionType: "create", id: "", obj: {}, activeTab: "home" });
    if (props.setMotherVisitType) props.setMotherVisitType("MOTHER_VISIT");
  };

  const onClickAncRevisit = () => {
    props.setActiveContent({ ...props.activeContent, route: "consultation", actionType: "create", id: "", obj: {}, activeTab: "home" });
    if (props.setMotherVisitType) props.setMotherVisitType("ANC_REVISIT");
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

  
  const getLatestConfirmatoryResult = async(pmtctCycleUuid) => {
    let thePmtctCycleUuid = pmtctCycleUuid || props.latestPmtctCycle?.uuid;
    if (thePmtctCycleUuid) {
      const patientUuid =
        props.patientObj.patient_uuid || props.patientObj.patientUuid;



      const url = `${baseUrl}pmtct/anc/get-confirmatory-latest-result?patientUuid=${patientUuid}&pmtctCycleUuid=${thePmtctCycleUuid}`;

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
    } else {
      // No cycle UUID available yet — still allow menu to render
      setMenuReady(true);
    }

  };
const showRetestingMenu = (patientHivStatus) => {

  if (props?.patientObj?.pmtctRegStatus) {
    setShowRetesting(false);
    return; // Exit early if pmtct registered
  }

  // If the API returned a definitive result, use it as the sole source of truth
  if (patientHivStatus) {
    const status = String(patientHivStatus).toLowerCase().trim();
    if (status.includes("positive") || (status.includes("reactive") && !status.includes("non-reactive") && !status.includes("non reactive"))) {
      setShowRetesting(false);
      setRetestingStatus('retesting');
      return;
    }
    if (status.includes("negative") || status.includes("non-reactive") || status.includes("non reactive")) {
      setShowRetesting(true);
      setRetestingStatus('retesting');
      return;
    }
  }

  // Only fall through to checking patientObj if API had no result
  let hivStatusSource = [
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
    if (status.includes("non-reactive") || status.includes("non reactive")) {
      return false;
    }
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

  const activeRoute = props.activeContent?.route || "recent-history";

  const menuItemStyle = (route) => ({
    color: "#fff",
    fontWeight: activeRoute === route ? "700" : "600",
    fontSize: "12.5px",
    borderRadius: "7px",
    margin: "0 1px",
    padding: "8px 14px",
    background: activeRoute === route ? "rgba(255,255,255,0.15)" : "transparent",
    boxShadow: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  return (
    <div>
      <Menu size="large" secondary style={{
        background: "#1e293b",
        borderRadius: "10px",
        padding: "4px 5px",
        border: "none",
        marginBottom: 0,
        minHeight: "auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <Menu.Item onClick={() => onClickHome()} style={menuItemStyle("recent-history")}>
          Home
        </Menu.Item>

        {menuReady && (
          <>
            {showRetesting && retestingStatus === "pmtct-hts" && (
              <Menu.Item onClick={() => onClickPmtctHts("pmtct-hts")} style={menuItemStyle("pmtct-hts")}>
                PMTCT HTS
              </Menu.Item>
            )}

            {/* ANC Revisit — available for ALL women with ANC enrollment, before delivery */}
            {patientObj?.ancNo && !deliveryStatus && closeCycle && (
              <Menu.Item onClick={() => onClickAncRevisit()} style={menuItemStyle("anc-revisit")}>
                ANC Revisit
              </Menu.Item>
            )}

            {(["positive", "reactive"].includes((patientStatus || "")?.trim()?.toLowerCase()) || isOnPMTCT === true) && (
              <>
                {isOnPMTCT !== true ? (
                  <>
                    {permissions.genAndPmtct && (
                      <Menu.Item onClick={() => loadAncPnc()} style={menuItemStyle("anc-pnc")}>
                        Mother Clinical Information
                      </Menu.Item>
                    )}
                  </>
                ) : (
                  <>
                    {closeCycle && (
                      <>
                        <Menu.Item onClick={() => onClickConsultation()} style={menuItemStyle("consultation")}>
                          Mother Follow Up Visit
                        </Menu.Item>

                        {!deliveryStatus && (
                          <Menu.Item onClick={() => loadLabourDelivery()} style={menuItemStyle("labour-delivery")}>
                            Labour and Delivery
                          </Menu.Item>
                        )}
                        {/* {patientObj?.ancNo && (
                          <Menu.Item onClick={() => onClickPartner()} style={menuItemStyle("partners")}>
                            Partners
                          </Menu.Item>
                        )} */}
                        <Menu.Item onClick={() => onClickInfant()} style={menuItemStyle("infants")}>
                          Infant Information
                        </Menu.Item>
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {showRetesting && retestingStatus === "retesting" && (
              <Menu.Item onClick={() => onClickPmtctHts("retesting")} style={menuItemStyle("pmtct-hts")}>
                Retesting
              </Menu.Item>
            )}
          </>
        )}

        <Menu.Item onClick={() => loadPatientHistory()} style={menuItemStyle("patient-history")}>
          History
        </Menu.Item>

        <Menu.Menu position="right" style={{ marginLeft: "auto" }}>
          {allPmtctCycleRecord && allPmtctCycleRecord.length > 0 && (
            <Dropdown
              item
              text={<span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></svg>{`Pregnancy Cycle ${
                selectedCycleId
                  ? allPmtctCycleRecord?.length -
                    allPmtctCycleRecord.findIndex(
                      (c) => c.uuid === selectedCycleId
                    )
                  : 1
              }`}</span>}
              style={{
                borderLeft: "1px solid rgba(255,255,255,0.15)",
                paddingLeft: "14px",
                color: "#fff",
                fontWeight: "600",
                fontSize: "12.5px",
              }}
            >
              <Dropdown.Menu>
                {allPmtctCycleRecord.map((cycle, index) => (
                  <Dropdown.Item
                    key={cycle.uuid}
                    value={cycle.uuid}
                    active={selectedCycleId === cycle.uuid}
                    onClick={() => handleCycleChange(cycle.uuid)}
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
