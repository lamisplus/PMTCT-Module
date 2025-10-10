import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Dropdown, Menu } from "semantic-ui-react";
import { makeStyles } from "@material-ui/core/styles";
import { url as baseUrl, token } from "../../../api";
import { usePermissions } from "../../../hooks/usePermissions";



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

  
  
  
  let mentalStatus = false;
  let initialEvaluationStatus = false;
  useEffect(() => {
    getLatestConfirmatoryResult();


    console.log("THE logic", props)
    Observation();
    gender =
      props.patientObj && props.patientObj.sex ? props.patientObj.sex : null;
    setGenderType(gender === "Female" ? true : false);



    if(props.maternalOutcome){
      const negativeOutcome=["MATERNAL_OUTCOME_DEAD", "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP", "MATERNAL_OUTCOME_TRANSFERRED_OUT"  ]
      let isNegativeOutcome=negativeOutcome.includes(props.maternalOutcome)

      console.log('isNegativeOutcome', isNegativeOutcome, props.maternalOutcome)
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
        console.log("GET_LATEST_CONFIRMATORY_RESULT", response.data);
        setPatientStatus(response.data? response.data: props?.patientObj?.staticHivStatus?  props?.patientObj?.staticHivStatus : props?.patientObj?.hivStatus? props?.patientObj?.hivStatus: props.patientObj.dynamicHivStatus );
          showRetestingMenu(response.data);

      })
      .catch((error) => {
        console.error("Error fetching confirmatory result:", error);
      });
  };

    const showRetestingMenu = (patientHivStatus) => {
       if(props?.patientObj?.pmtctRegStatus){
          setShowRetesting(false)
      }
      // setPatientStatus(patientHivStatus? patientHivStatus: props?.patientObj?.staticHivStatus?  props?.patientObj?.staticHivStatus : props?.patientObj?.hivStatus? props?.patientObj?.hivStatus: props.patientObj.dynamicHivStatus )

      let hivStatusSource= [patientHivStatus, props?.patientObj?.hivStatus, props?.patientObj?.dynamicHivStatus, props?.patientObj?.staticHivStatus]
      if(hivStatusSource.some(status => String(status).includes("Positive"))  || hivStatusSource.some(status => String(status).includes("reactive"))){

          setShowRetesting(false)
          setRetestingStatus('retesting')

      }else if(hivStatusSource.some(status => String(status).includes("Negative")) || hivStatusSource.some(status => String(status).includes("non-reactive"))){

        // check if the patient is anc  = props?.patientObj?.ancNo
          setShowRetesting(true)
          setRetestingStatus('retesting')


      }else{

      // if the status is unknown 
          setShowRetesting(true)
         setRetestingStatus("pmtct-hts")


      }
    // props.setActiveContent({ ...props.activeContent, route: "anc-pnc" });



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

        {console.log('showRetesting', showRetesting)}

        <Menu.Item onClick={() => loadPatientHistory()}>History</Menu.Item>
      </Menu>
      {console.log(patientObj)}
    </div>
  );
}

export default SubMenu;
