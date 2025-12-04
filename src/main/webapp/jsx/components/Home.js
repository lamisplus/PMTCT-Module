import React, { useState, Fragment, useEffect } from "react";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";
import NotEnrollPatients from "./Patient/PatientList";
import ActiveANCPatients from "./Patient/ActiveANCPatientList";
//import VisualisationHome from './Visualisation/Index'
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { FaUserPlus, FaChartLine, FaList } from "react-icons/fa";
import PmtctEntryPoint from "./PmtctServices/PmtctEntryPoint";
import ANCPatients from "./Patient/ActiveANCPatientList";
import PmtctPatients from "./Patient/PmtctPatients";
import CheckedInPatient from "./Patient/CheckedInPatient";
import ActivePmtctHtsPatients from "./Patient/ActivePmtctHtsPatientList";
import { usePermissions } from "../../hooks/usePermissions";
import PMTCTDashboard from "./Dashboard/PMTCTDashboard";

//import PageTitle from "./../layouts/PageTitle";
const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const Home = (props) => {
    const { hasRDErole, hasStrictylyRDE } = usePermissions();

  const [key, setKey] = useState("home");
  const [modalShow, setModalShow] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    setKey("home");
  }, []);

  return (
    <Fragment>
      {showDashboard ? (
        <PMTCTDashboard onNavigateToMenu={() => setShowDashboard(false)} />
      ) : (
        <>
          <Row>
            <Col xl={12}>
              <Card style={divStyle}>
                <Card.Body>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ margin: 0, padding: 0 }}>PMTCT</h4>
                    <Button
                      variant="contained"
                      onClick={() => setShowDashboard(true)}
                      startIcon={<FaChartLine />}
                      style={{ backgroundColor: 'rgb(1, 77, 136)', color: '#fff' }}
                    >
                      Dashboard
                    </Button>
                  </div>
                  {/* <!-- Nav tabs --> */}

                  <div className="custom-tab-1">
                    <Tabs
                      id="controlled-tab-example"
                      activeKey={key}
                      onSelect={(k) => setKey(k)}
                      className="mb-3"
                    >
                      {/* {hasRDErole ?     */}

                      <Tab eventKey="home" title="Find Patients">
                        <NotEnrollPatients />
                      </Tab>
                      {/* // :         */}

                      {!hasStrictylyRDE && (
                        <Tab eventKey="checked-in" title="Checked In Patients">
                          <CheckedInPatient />
                        </Tab>
                      )}
                      {/* //  } */}

                      <Tab eventKey="pmtct-hts" title="PMTCT HTS Patients">
                        <ActivePmtctHtsPatients />
                      </Tab>

                      <Tab eventKey="anc" title="ANC Patients">
                        <ANCPatients />
                      </Tab>

                      <Tab eventKey="pmtct" title="General PMTCT Patients">
                        <PmtctPatients />
                      </Tab>
                    </Tabs>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
      <PmtctEntryPoint
        route="/register-patient"
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </Fragment>
  );
};

export default Home;
