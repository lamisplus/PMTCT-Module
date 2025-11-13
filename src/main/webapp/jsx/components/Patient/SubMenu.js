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
  const [showRetesting, setShowRetesting]=useState(false)
  const [retestingStatus, setRetestingStatus]=useState("pmtct-hts")
  // const [derivedHivStatus, setDerivedHivStatus]=useState("")
 const[closeCycle, setCloseCycle]=useState(true)
  const [deliveryStatus, setDeliveryStatus] = useState(true);

  const [patientStatus, setPatientStatus] = useState(props?.patientObj?.staticHivStatus?  props?.patientObj?.staticHivStatus : props?.patientObj?.hivStatus? props?.patientObj?.hivStatus: props.patientObj.dynamicHivStatus );
  const [allPmtctCycleRecord, setAllPmtctCycleRecord] = useState([]);


  const [isOnPMTCT, setIsOnPMTCT] = useState(props?.patientObj?.pmtctRegStatus ||  props?.patientObj?.isOnPmtct)




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
    getLatestConfirmatoryResult();

    setDeliveryStatus( props.mainDeliveryStatus  ||  patientObj.deliveryStatus )


    setIsOnPMTCT(props?.patientObj?.pmtctRegStatus ||  props?.patientObj?.isOnPmtct)
  }, [props.activeContent, props?.patientObj, props.mainDeliveryStatus]);


  //Get list of RegimenLine
  const Observation = () => {
    axios
      .get(`${baseUrl}observation/person/${props.patientObj.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
    props.setActiveContent({ ...props.activeContent, route: "anc-pnc", actionType: "create"
 });
  };
  const loadLabourDelivery = (row) => {
    props.setActiveContent({
      ...props.activeContent,
      route: "labour-delivery",
       actionType: "create"
    });
  };
  const onClickConsultation = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "consultation",   actionType: "create" });
  };

    const onClickPmtctHts= (type) => {
    props.setActiveContent({ ...props.activeContent, route: "pmtct-hts",  actionType: "create" });
    props.setPmtctHtsRetestingType(type)
  };
  
  const onClickHome = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "recent-history",   actionType: "create" });
  };

  const onClickInfant = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "infants",  actionType: "create" });
  };
  const onClickPartner = (row) => {
    props.setActiveContent({ ...props.activeContent, route: "partners",   actionType: "create" });
  };
  const loadPatientHistory = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "patient-history",
    });
  };
  //

  
  const getLatestConfirmatoryResult = async() => {
    const personUuid = props.patientObj.person_uuid || props.patientObj.personUuid;

    await axios
      .get(
        `${baseUrl}pmtct/anc/get-confirmatory-latest-result?personUuid=${personUuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        setPatientStatus(response.data? response.data: props?.patientObj?.staticHivStatus?  props?.patientObj?.staticHivStatus : props?.patientObj?.hivStatus? props?.patientObj?.hivStatus: props.patientObj.dynamicHivStatus );
          showRetestingMenu(response.data);

      })
      .catch((error) => {
        console.error("Error fetching confirmatory result:", error);
      });
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


        {showRetesting && retestingStatus=== "pmtct-hts" && <Menu.Item onClick={() => onClickPmtctHts("pmtct-hts")}>  PMTCT HTS  </Menu.Item>}
       
  


        {["Positive", "reactive"].includes(patientStatus?.trim()) && (
          <>
           

            {isOnPMTCT !== true ? (
              <>
              <>
                {permissions.genAndPmtct &&<Menu.Item onClick={() => loadAncPnc()}>
                  PMTCT Enrollment
                </Menu.Item>}
              </>
              </>
            ) : (
              <>
              {closeCycle &&  <>
               <Menu.Item onClick={() => onClickConsultation()}>
                  Follow Up Visit
                </Menu.Item>

                {!deliveryStatus  && (
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
              
              
              </>  }
               
              </>
            )}
          </>
        )}
        {showRetesting && retestingStatus === "retesting" && <Menu.Item onClick={() => onClickPmtctHts("retesting")}>Retesting  </Menu.Item>}

   

        <Menu.Item onClick={() => loadPatientHistory()}>History</Menu.Item>

        <Menu.Menu position="right" style={{ marginLeft: 'auto' }}>
          {allPmtctCycleRecord && allPmtctCycleRecord.length > 0 && (
            <Dropdown item text="Pregnancy Cycle" style={{ borderLeft: '2px solid rgba(255,255,255,0.3)', paddingLeft: '15px' }}>
              <Dropdown.Menu>
                <Dropdown.Header>Select Pregnancy Cycle</Dropdown.Header>
                <Dropdown.Divider />
                {allPmtctCycleRecord.map((cycle, index) => (
                  <Dropdown.Item
                    key={cycle.id}
                    onClick={() => {
                      // You can add logic here to handle cycle selection
                      console.log('Selected cycle:', cycle);
                    }}
                  >
                    <div>
                      <strong>Cycle {index + 1}</strong>
                      <br />
                      <small>Status: {cycle.pmtctStatus || 'N/A'}</small>
                      <br />
                      <small>
                        Created: {cycle.createdDate ? new Date(cycle.createdDate).toLocaleDateString() : 'N/A'}
                      </small>
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
