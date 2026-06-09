import React, { useState, Fragment, useEffect } from "react";
import { Row, Col, Card, Tab, Tabs, Modal } from "react-bootstrap";
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
import axios from "axios";
import { url as baseUrl, token } from "../../api";

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
  const [migrationAlert, setMigrationAlert] = useState(null);

  useEffect(() => {
    setKey("home");
  }, []);

  // Check migration status on mount
  useEffect(() => {
    axios
      .get(`${baseUrl}pmtct/anc/migration-status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && res.data.migrationRequired) {
          setMigrationAlert(res.data.unmigratedCount);
        }
      })
      .catch(() => {
        // Silently ignore — endpoint may not exist on older backend
      });
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
                  {migrationAlert && <Modal
                    show={true}
                    backdrop="static"
                    keyboard={false}
                    centered
                    animation={false}
                    dialogClassName="pmtct-migration-modal"
                  >
                    <style>{`.pmtct-migration-modal { max-width: 400px; }`}</style>
                    <Modal.Body style={{ padding: '0', textAlign: 'center' }}>
                      <div style={{ padding: '24px 24px 16px' }}>
                        <div style={{
                          backgroundColor: '#dc3545',
                          borderRadius: '8px',
                          padding: '14px 20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>
                            Migration Required
                          </span>
                        </div>
                      </div>
                      <div style={{ padding: '20px 28px 24px', backgroundColor: '#fff' }}>
                        <div style={{ marginBottom: '18px' }}>
                          <span style={{
                            color: '#dc3545',
                            fontSize: '28px',
                            fontWeight: 800,
                            display: 'block',
                            marginBottom: '4px',
                          }}>
                            {migrationAlert}
                          </span>
                          <span style={{
                            fontSize: '14px',
                            color: '#1a1a1a',
                            fontWeight: 600,
                            lineHeight: '1.5',
                          }}>
                            PMTCT HTS record{migrationAlert > 1 ? 's' : ''} must be migrated
                            before this module can be used.
                          </span>
                        </div>
                        <div style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          padding: '16px',
                          marginBottom: '16px',
                          textAlign: 'left',
                          border: 'none',
                        }}>
                          <p style={{
                            fontSize: '12px',
                            color: '#555',
                            lineHeight: '1.7',
                            margin: 0,
                            fontWeight: 500,
                          }}>
                            <span style={{ fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What to do: </span>
                            Contact your system administrator to run the
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#dc3545',
                            }}> pmtct_hts_migration.sql </span>
                            script on the database provided during
                            <span style={{ fontWeight: 700 }}> pmtct-2.5.0</span> release.
                          </p>
                        </div>
                        <p style={{
                          fontSize: '11px',
                          color: '#adb5bd',
                          marginBottom: 0,
                          letterSpacing: '0.3px',
                        }}>
                          This module will unlock automatically after migration.
                        </p>
                      </div>
                    </Modal.Body>
                  </Modal>}

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
