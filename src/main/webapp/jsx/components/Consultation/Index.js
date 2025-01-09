import React, { useState, Fragment, useEffect } from "react";
import axios from "axios";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";
import ConsultationPage from "./Home";
import InfantVisit from "./InfantVisit";
import { url as baseUrl, token as token } from "./../../../api";
import { usePermissions } from "../../../hooks/usePermissions";


const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const ClinicVisitPage = (props) => {
    const { hasPermission } = usePermissions();
  
  const [key, setKey] = useState("home");
  const patientObj = props.patientObj;
  const [aliveChild, setAliveChild] = useState(0);

  const permissions = useMemo(
    () => ({
      canSeeChildFollowUp: hasPermission("child_follow_up_register" ),

    }),
    [hasPermission]
  );





  const DeliveryInfo = () => {
    if (props.patientObj.ancNo) {
      axios
        .get(`${baseUrl}pmtct/anc/view-delivery2/${props.patientObj.ancNo}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
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
    } else {
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
    }
  };

  useEffect(() => {
    setKey(props.activeContent.activeTab);
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
                  <Tab eventKey="home" title="MOTHER FOLLOW UP VISIT ">
                    <ConsultationPage
                      patientObj={patientObj}
                      setActiveContent={props.setActiveContent}
                      activeContent={props.activeContent}
                    />
                  </Tab>
                  {console.log(aliveChild)}

                  {console.log(aliveChild !== 0 && aliveChild > 0)}
                  {aliveChild !== 0 && aliveChild > 0 && permissions.canSeeChildFollowUp &&(
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
