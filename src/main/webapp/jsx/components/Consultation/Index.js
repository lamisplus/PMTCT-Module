import React, { useState, Fragment, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import ConsultationPage from "./Home";
import { convertMaternalCodeToValue } from "../../utils";

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const ClinicVisitPage = (props) => {
  const patientObj = props.patientObj;
  const [showMaternalVisit, setShowMaternalVisit] = useState(true);

  useEffect(() => {
    if (props.activeContent.actionType === "create") {
      if (
        props.maternalOutcome === "MATERNAL_OUTCOME_DEAD" ||
        props.maternalOutcome === "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP" ||
        props.maternalOutcome === "MATERNAL_OUTCOME_TRANSFERRED_OUT" ||
        props.maternalOutcome ===
          "MATERNAL_OUTCOME_TRANSFERRED_TO_ANOTHER_PMTCT_COHORT_(NEW_PREGNANCY)" ||
        props.maternalOutcome === "MATERNAL_OUTCOME_TRANSITIONED_TO_ART_CLINIC"
      ) {
        setShowMaternalVisit(false);
      } else {
        setShowMaternalVisit(true);
      }
    } else {
      setShowMaternalVisit(true);
    }
  }, [props.patientObj.id, props.activeContent.activeTab]);

  return (
    <Fragment>
      <Row>
        <Col xl={12}>
              {showMaternalVisit ? (
                <ConsultationPage
                  patientObj={patientObj}
                  setActiveContent={props.setActiveContent}
                  activeContent={props.activeContent}
                  latestPmtctCycle={props?.latestPmtctCycle}
                  motherVisitType={props.motherVisitType}
                />
              ) : (
                <p>
                  Maternal outcome:{" "}
                  {props.maternalOutcome &&
                    convertMaternalCodeToValue(props.maternalOutcome)}
                </p>
              )}
        </Col>
      </Row>
    </Fragment>
  );
};

export default ClinicVisitPage;
