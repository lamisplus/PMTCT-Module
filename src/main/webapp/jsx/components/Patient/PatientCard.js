import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import { Link } from "react-router-dom";
import ButtonMui from "@material-ui/core/Button";
import { TiArrowBack } from "react-icons/ti";
import { Label } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { Col, Row } from "reactstrap";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
import axios from "axios";
import { url as baseUrl, token } from "./../../../api";
import Typography from "@material-ui/core/Typography";

//Dtate Picker package
Moment.locale("en");
momentLocalizer();

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20,
  },
  details: {
    alignItems: "center",
  },
  column: {
    flexBasis: "20.33%",
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

function PatientCard(props) {
  const { classes } = props;
  //const patientCurrentStatus=props.patientObj && props.patientObj.currentStatus==="Died (Confirmed)" ? true : false ;
  const patientObjs = props.patientObj ? props.patientObj : {};
  const permissions = props.permissions ? props.permissions : [];
  const [patientObj, setpatientObj] = useState(patientObjs);
  const [patientBiometricStatus, setPatientBiometricStatus] = useState(
    props?.patientObj?.biometricStatus
  );
  const [biometricStatus, setBiometricStatus] = useState(false);
  const [devices, setDevices] = useState([]);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const [biometricModal, setBiometricModal] = useState(false);
  const BiometricModalToggle = () => setBiometricModal(!biometricModal);
  const [hivStatus, setHivStatus] = useState();
  const [artModal, setArtModal] = useState(false);
  const Arttoggle = () => setArtModal(!artModal);
  useEffect(() => {
    PatientCurrentStatus();
    CheckBiometric();
    console.log("patient", patientObj);
  }, [props.patientObj]);

  //Get list of KP
  const CheckBiometric = () => {
    axios
      .get(`${baseUrl}modules/check?moduleName=biometric`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setBiometricStatus(response.data);
        if (response.data === true) {
          axios
            .get(`${baseUrl}biometrics/devices`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setDevices(response.data);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  ///GET LIST OF Patients
  async function PatientCurrentStatus() {
    axios
      .get(`${baseUrl}hiv/status/patient-current/${patientObj.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setHivStatus(response.data);
      })
      .catch((error) => {});
  }

  // async function getPatientInfo() {
  //   axios
  //     .get(`${baseUrl}hiv/status/patient-current/${patientObj.id}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then((response) => {
  //       setHivStatus(response.data);
  //     })
  //     .catch((error) => {});
  // }
  const getAddress = (identifier) => {
    const identifiers = identifier;
    const address = identifiers?.address.find((obj) => obj.city);
    const houseAddress = address && address?.line[0] !== null ? address?.line[0] : "";
    const landMark =
      address && address.city && address.city !== null ? address.city : "";
    return address ? houseAddress + " " + landMark : "";
  };

  return (
    <div className={classes.root}>
      <ExpansionPanel>
        <ExpansionPanelSummary>
          <Row>
            <Col md={12}>
              <Row className={"mt-1"}>
                <Col md={12} className={classes.root2}>
                  <b style={{ fontSize: "25px" }}>
                    {patientObj?.fullname
                      ? patientObj?.fullname
                      : patientObj?.fullName}
                  </b>
                  <Link to={"/"}>
                    <ButtonMui
                      variant="contained"
                      color="primary"
                      className=" float-end ms-2 mr-2 mt-2"
                      //startIcon={<FaUserPlus size="10"/>}
                      startIcon={<TiArrowBack />}
                      style={{
                        backgroundColor: "rgb(153, 46, 98)",
                        color: "#fff",
                        height: "35px",
                      }}
                    >
                      <span style={{ textTransform: "capitalize" }}>Back</span>
                    </ButtonMui>
                  </Link>
                </Col>
                <Col md={4} className={classes.root2}>
                  <span>
                    {" "}
                    Patient ID : <b>{patientObj?.hospitalNumber}</b>
                  </span>
                </Col>

                <Col md={4} className={classes.root2}>
                  <span>
                    {/* Date Of Birth : <b>{patientObj.dateOfBirth }</b> */}
                  </span>
                </Col>
                <Col md={4} className={classes.root2}>
                  <span>
                    {" "}
                    Age :{" "}
                    <b>
                      {patientObj?.age}{" "}
                      {Number(patientObj?.age) > 1 ? "years" : "year"}
                    </b>
                  </span>
                </Col>
                <Col md={4}>
                  <span>
                    {" "}
                    Gender :{" "}
                    <b>
                      {patientObj.sex && patientObj.sex !== null
                        ? patientObj.sex
                        : "Female"}
                    </b>
                  </span>
                </Col>
                <Col md={4} className={classes.root2}>
                  <span>
                    {" "}
                    {/* Phone Number : <b>{getPhoneNumber(patientObj.contactPoint)}</b> */}
                  </span>
                </Col>
                <Col md={4} className={classes.root2}>
                  <span>
                    {" "}
                    Address :{" "}
                    <b>
                      {patientObj?.address && getAddress(patientObj?.address)}{" "}
                    </b>
                  </span>
                </Col>

                <Col md={12}>
                  {biometricStatus === true ? (
                    <>
                      <div>
                        <Typography variant="caption">
                          <Label
                            color={
                              props.patientObj?.biometricStatus === true
                                ? "green"
                                : "red"
                            }
                            size={"mini"}
                          >
                            Biometric Status
                            <Label.Detail>
                              {props.patientObj?.biometricStatus === true
                                ? "Captured"
                                : "Not Captured"}
                            </Label.Detail>
                          </Label>
                        </Typography>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                  {props.patientObj.dynamicHivStatus !== null ||
                  props.patientObj.staticHivStatus !== null ? (
                    <>
                      <div>
                        <Typography variant="caption">
                          <Label
                            color={
                              props.patientObj.dynamicHivStatus !==
                                "Positive" &&
                              props.patientObj.staticHivStatus !== "Positive"
                                ? "green"
                                : "red"
                            }
                            size={"mini"}
                          >
                            HIV Status
                            <Label.Detail>

                            {props?.patientObj?.staticHivStatus?  props?.patientObj?.staticHivStatus : props?.patientObj?.hivStatus? props?.patientObj?.hivStatus: props.patientObj.dynamicHivStatus}
                      
                            </Label.Detail>
                          </Label>
                        </Typography>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </ExpansionPanelSummary>

        {/* <Button
                      color='red'
                      content='BloodType'
                      //icon='heart'
                      label={{ basic: true, color: 'red', pointing: 'left', content: 'AB+' }}
                    /> */}
        {/* <Button
                        basic
                        color='blue'
                        content='Height'
                        icon='fork'
                        label={{
                            as: 'a',
                            basic: true,
                            color: 'blue',
                            pointing: 'left',
                            content: '74.5 in',
                        }}
                      />               */}
        {/* <Button
                        basic
                        color='blue'
                        content='Weight'
                        icon='fork'
                        label={{
                            as: 'a',
                            basic: true,
                            color: 'blue',
                            pointing: 'left',
                            content: '74.5 in',
                        }}
                      /> */}

        {/* <div className={classes.column}>
                  <Button primary  floated='left' onClick={() => get_age(moment(patientObj.dateOfBirth).format("DD-MM-YYYY")) > 5 ? loadAdultEvaluation(patientObj) :loadChildEvaluation(patientObj) }><span style={{fontSize:"11px"}}>Initial Clinic Evaluation</span></Button>
                </div> */}
        {/* {patientCurrentStatus !==true && props.patientObj.enrollment.targetGroupId !=="456" ?                   
                  (
                    <>
                      <div className={classes.column}>
                        <Button primary  floated='left' onClick={() => loadMentalHealthScreening(patientObj) }><span style={{fontSize:"11px"}}>Mental Health Screening</span></Button>
                      </div>
                    </>
                  ) :""           
                } */}
        {/* {patientObj.commenced!==true && (
                <div className={classes.column} style={{paddingLeft:"20px"}}>
                {" "}<Button primary onClick={() => loadArt(patientObj)} ><span style={{fontSize:"11px"}}>ART Commencement </span></Button>
                </div>
                )
               }
                     */}
      </ExpansionPanel>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);
