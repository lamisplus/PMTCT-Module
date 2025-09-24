import React, { useState, Fragment, useEffect, useMemo} from "react";
import axios from "axios";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";
import ConsultationPage from "./Home";
import InfantVisit from "./InfantVisit";
import { url as baseUrl, token as token } from "./../../../api";
import { convertMaternalCodeToValue } from "../../utils";
import { usePermissions } from "../../../hooks/usePermissions";


const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const ClinicVisitPage = (props) => {
    const { hasPermission, hasRDErole } = usePermissions();
  
  const [key, setKey] = useState("home");
  const patientObj = props.patientObj;
  const [aliveChild, setAliveChild] = useState(0);
  const [showMaternalVisit, setShowMaternalVisit] = useState(true);


  const permissions = useMemo(
    () => ({
      canSeeChildFollowUp: hasPermission("child_follow_up_register" ),
        genPermission: hasRDErole   ||  hasPermission("child_follow_up_register") }),
    [hasPermission, hasRDErole]
  );



  const DeliveryInfo = () => {
    // if (props.patientObj.ancNo) {
    //   axios
    //     .get(`${baseUrl}pmtct/anc/view-delivery2?ancNo= ${props.patientObj.ancNo}`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     })
    //     .then((response) => {
    //       // console.log(response.data);
    //       setAliveChild(
    //         response.data && response.data.numberOfInfantsAlive
    //           ? response.data.numberOfInfantsAlive
    //           : 0
    //       );
    //     })
    //     .catch((error) => {
    //       //console.log(error);
    //     });
    // } else {
      axios
        .get(
          `${baseUrl}pmtct/anc/view-delivery-with-uuid/${
            props.patientObj.person_uuid
              ? props.patientObj.person_uuid
              : props.patientObj.personUuid
              ? props.patientObj.personUuid
              : props.patientObj.uuid
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          // console.log(response.data);
          setAliveChild(
            response.data && response.data.numberOfInfantsAlive
              ? response.data.numberOfInfantsAlive
              : 0
          );
        })
        .catch((error) => {
          //console.log(error);
        });
    // }
  };



  
  useEffect(() => {
    setKey(props.activeContent.activeTab);
  console.log("props.maternalOutcome", props.maternalOutcome)
    if(props.activeContent.actionType === "create"){
        if(props.maternalOutcome === "MATERNAL_OUTCOME_DEAD" ||   props.maternalOutcome === "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP" || props.maternalOutcome === "MATERNAL_OUTCOME_TRANSFERRED_OUT" || props.maternalOutcome === "MATERNAL_OUTCOME_TRANSFERRED_TO_ANOTHER_PMTCT_COHORT_(NEW_PREGNANCY)" || props.maternalOutcome === "MATERNAL_OUTCOME_TRANSITIONED_TO_ART_CLINIC"){
            setShowMaternalVisit(false)
            //  setKey("child")
        }else{
            setShowMaternalVisit(true)

        }
    }else{
          setShowMaternalVisit(true)

    }

    DeliveryInfo();
  }, [props.patientObj.id, props.activeContent.activeTab]);
  ///GET Delivery Object

  return (
    <Fragment>
      <Row>
        <Col xl={12}>
          <Card style={divStyle}>
            <Card.Body>
              {/* <!-- Nav tabs --> */}
              <div className="custom-tab-1">
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3"
                >
                  {  console.log("eventKey",props.maternalOutcome && convertMaternalCodeToValue(props.maternalOutcome))
}

{/*  */}
                  <Tab eventKey="home" title="MOTHER FOLLOW UP VISIT ">
                    {showMaternalVisit?<ConsultationPage
                      patientObj={patientObj}
                      setActiveContent={props.setActiveContent}
                      activeContent={props.activeContent}
                    />: <p>Maternal outcome: {props.maternalOutcome && convertMaternalCodeToValue(props.maternalOutcome)}</p>}
                  </Tab>

   
                  {aliveChild !== 0 && aliveChild > 0 && permissions.genPermission &&(
                    <Tab eventKey="child" title="CHILD FOLLOW UP VISIT">
                      <InfantVisit
                        patientObj={patientObj}
                        setActiveContent={props.setActiveContent}
                        activeContent={props.activeContent}
                      />
                    </Tab>
                  )}
                </Tabs>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default ClinicVisitPage;
