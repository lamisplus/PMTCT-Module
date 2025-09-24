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
 
  const [deliveryStatus, setDeliveryStatus] = useState(false);

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
    [hasPermission]
  );

  
  
  
  let mentalStatus = false;
  let initialEvaluationStatus = false;
  useEffect(() => {
    getLatestConfirmatoryResult();

    if(props?.deliveryInfo.length >0){
          props?.deliveryInfo.filter((each) => {
      if (each.activityName === "Labour and Delivery") {
        setDeliveryStatus(true);
      }
    });
    }
    console.log("THE logic", props)
    Observation();
    gender =
      props.patientObj && props.patientObj.sex ? props.patientObj.sex : null;
    setGenderType(gender === "Female" ? true : false);
  }, [props.patientObj]);

    useEffect(() => {
    getLatestConfirmatoryResult();
    setDeliveryStatus(patientObj.deliveryStatus ||   props.mainDeliveryStatus)
    setIsOnPMTCT(props?.patientObj?.pmtctRegStatus ||  props?.patientObj?.isOnPmtct)
  }, [props.activeContent, props?.patientObj]);


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
      setPatientStatus(patientHivStatus? patientHivStatus: props?.patientObj?.staticHivStatus?  props?.patientObj?.staticHivStatus : props?.patientObj?.hivStatus? props?.patientObj?.hivStatus: props.patientObj.dynamicHivStatus )

      if(patientHivStatus === "Positive" || props?.patientObj?.hivStatus === "Positive" || props?.patientObj?.dynamicHivStatus === "Positive" || props?.patientObj?.staticHivStatus === "Positive"){

          setShowRetesting(false)
          setRetestingStatus('retesting')

      }else if(patientHivStatus === "Negative" || props?.patientObj?.hivStatus === "Negative" || props?.patientObj?.dynamicHivStatus === "Negative" || props?.patientObj?.staticHivStatus === "Negative"){

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

{      console.log("isOnPMTCT",isOnPMTCT, 'props?.patientObj?.pmtctRegStatus', props?.patientObj?.pmtctRegStatus, 'props?.patientObj?.isOnPmtct', props?.patientObj?.isOnPmtct)
}
        {showRetesting && retestingStatus=== "pmtct-hts" && <Menu.Item onClick={() => onClickPmtctHts("pmtct-hts")}>  PMTCT HTS  </Menu.Item>}
        {(patientStatus === "Positive" ) && (
          <>
           

            {isOnPMTCT !== true ? (
              <>
              <>
                {permissions.canSeePMTCT &&<Menu.Item onClick={() => loadAncPnc()}>
                  PMTCT Enrollment
                </Menu.Item>}
              </>
              </>
            ) : (
              <>
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
              </>
            )}
          </>
        )}
        {showRetesting && retestingStatus === "retesting" && <Menu.Item onClick={() => onClickPmtctHts("retesting")}>Retesting  </Menu.Item>}

        <Menu.Item onClick={() => loadPatientHistory()}>History</Menu.Item>
      </Menu>
      {console.log(patientObj)}
    </div>
  );
}

export default SubMenu;
