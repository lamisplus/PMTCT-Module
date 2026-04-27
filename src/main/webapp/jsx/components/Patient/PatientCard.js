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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chip from '@mui/material/Chip';

import { url as baseUrl, token } from "./../../../api";
import Typography from "@material-ui/core/Typography";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Alert,
  AlertTitle,
  Box,
  Divider,
} from '@mui/material';
import { convertMaternalCodeToValue } from "../../utils";

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ChildCareIcon from '@mui/icons-material/ChildCare';


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
  
  const [highRiskInfants, setHighRiskInfants] = useState([]);
  const [expandedHighRiskIndex, setExpandedHighRiskIndex] = useState(false);
  const [unsuppressedVl, setUnsuppressedVl] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(
    props?.patientObj?.finalResult ||
    props?.patientObj?.staticHivStatus ||
    props?.patientObj?.hivStatus ||
    props?.patientObj?.dynamicHivStatus
  );
  const [pmtctHtsFinalStatus, setPmtctHtsFinalStatus] = useState(null);
  const [hasPmtctHtsRecord, setHasPmtctHtsRecord] = useState(false);

  const [biometricStatus, setBiometricStatus] = useState(false);
  const [devices, setDevices] = useState([]);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const [biometricModal, setBiometricModal] = useState(false);
  const BiometricModalToggle = () => setBiometricModal(!biometricModal);
  const [hivStatus, setHivStatus] = useState('');
  const [infantHeiPcr, setInfantHeiPcr] = useState([]);
  const [infantHeiPcrAlert, setInfantHeiPcrAlert] = useState([]);
  const [retestStatus, setRetestStatus] = useState({
        status: '',
        seroconverted: '',
        remainedHivNegative: '',
  });

  // 
  const [artModal, setArtModal] = useState(false);
  const Arttoggle = () => setArtModal(!artModal);

let alerts =[{infantName: 'ade', infantHospitalNo: 'dgd', expectedPCR: 'ffd'}]

const [expandedIndex, setExpandedIndex] = useState(false);

  const handleClick = () => {
    setExpandedIndex(!expandedIndex);
  };

  const handleHighRiskClick = () => {
    setExpandedHighRiskIndex(!expandedHighRiskIndex);
  };

const getHivRetestStatus = async () => {

        if(props.latestPmtctCycle.id){
            const personUuid = props.patientObj.person_uuid || props.patientObj.personUuid;

        try {
          let url = `${baseUrl}pmtct/anc/get-hiv-retest-status?personUuid=${personUuid}&pmtctCycleId=${props.latestPmtctCycle.id}`;

        

          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setRetestStatus(response.data);



          return response.data;
        } catch (error) {
          console.error("Error fetching HIV retest status:", error);
          toast.error("Failed to load HIV retest status");
        }
        }

};

   

  useEffect(() => {
      getHETInfantStatus();


    getHighRiskInfantStatus();
    checkUnsuppressedVl();
    PatientCurrentStatus();
    CheckBiometric();
  }, [props.patientObj]);



    useEffect(() => {
       getHETInfantStatus();
      getHivRetestStatus()
    getLatestConfirmatoryResult();
     getHighRiskInfantStatus();
     checkUnsuppressedVl();
    // getMaternalOutcome();


  }, [props.activeContent, props.latestPmtctCycle]);
    
  const getLatestConfirmatoryResult = async() => {
    if(props.latestPmtctCycle?.id){
      const personUuid = props.patientObj.person_uuid || props.patientObj.personUuid;

    await axios
      .get(
        `${baseUrl}pmtct/anc/get-confirmatory-latest-result?personUuid=${personUuid}&pmtctCycleId=${props.latestPmtctCycle.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if(response.data !== null && response.data !== undefined && response.data !== ''){

          props.setLastestConfirmatoryTest(response.data)
          setConfirmStatus(response.data);
          props.setLatestHivStatus(response.data);

        } else {
          // Fallback to other HIV status fields if no confirmatory result
          const fallbackStatus =
            props?.patientObj?.finalResult ||
            props?.patientObj?.staticHivStatus ||
            props?.patientObj?.hivStatus ||
            props?.patientObj?.dynamicHivStatus;

          if (fallbackStatus) {
            setConfirmStatus(fallbackStatus);
            props.setLatestHivStatus(fallbackStatus);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching confirmatory result:", error);
      });

      // Also fetch the full PMTCT HTS record to get finalStatus
      await getPmtctHtsRecord(personUuid, props.latestPmtctCycle.id);
    }
  };

  const getPmtctHtsRecord = async (personUuid, pmtctCycleId) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/get-latest-pmtct-hts-enrollment/${personUuid}?pmtctCycleId=${pmtctCycleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      if (response.data && response.data.finalResult) {
        setPmtctHtsFinalStatus(response.data.finalResult);
        setHasPmtctHtsRecord(true);
      } else {
        setHasPmtctHtsRecord(false);
      }
    } catch (error) {
      console.error("Error fetching PMTCT HTS record:", error);
      setHasPmtctHtsRecord(false);
    }
  };

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

const getMaternalOutcome = async () => {
  try {
    const response = await axios.get(`${baseUrl}application-codesets/v2/MATERNAL_OUTCOME`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  localStorage.setItem("maternalOutcome", JSON.stringify(response.data));
  } catch (error) {
    console.error("Error fetching maternal outcome:", error);
    return []; // Return empty array on error
  }
};

   const getHighRiskInfantStatus = () => {
    const personUuid = props.patientObj.person_uuid || props.patientObj.personUuid;
    const pmtctCycleId = props.latestPmtctCycle?.id;

    if (!pmtctCycleId) {
      return; // Don't call if no cycle ID available
    }

    axios
      .get(`${baseUrl}pmtct/anc/check-for-infant-high-risk/${personUuid}?pmtctCycleId=${pmtctCycleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data && response.data.length > 0) {
          setHighRiskInfants(response.data);
        } else {
          setHighRiskInfants([]);
        }
      })
      .catch((error) => {
        //console.log(error);
        setHighRiskInfants([]);
      });
  };


  const checkUnsuppressedVl = () => {
    const personUuid = props.patientObj.person_uuid || props.patientObj.personUuid;
    if (!personUuid) return;

    axios
      .get(`${baseUrl}pmtct/anc/check-unsuppressed-vl/${personUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUnsuppressedVl(response.data === true);
      })
      .catch((error) => {
        setUnsuppressedVl(false);
      });
  };

 const getHETInfantStatus = () => {
    
    if ( props.latestPmtctCycle?.id) {
        const personUuid = props.patientObj.person_uuid || props.patientObj.personUuid;
        const pmtctCycleId = props.latestPmtctCycle?.id;
          axios
            .get(
              `${baseUrl}pmtct/anc/check-for-infant-pcr-alert/${personUuid}?pmtctCycleId=${pmtctCycleId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .then((response) => {
              if (response.data) {
                setInfantHeiPcr(response.data);
                let heiInfant = response.data.filter((each) => {
                  return each.alertMessage;
                });
                setInfantHeiPcrAlert(heiInfant);
              }
            })
            .catch((error) => {
              //console.log(error);
            });   
           }

 
  };
  ///GET LIST OF Patients
  async function PatientCurrentStatus() {
    axios
      .get(
        `${baseUrl}hiv/status/patient-current/${
          patientObj.id ? patientObj.id : patientObj.personId
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
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
                  {patientObj?.ancNo && (
                  <span>
                    {" "}
                    ANC Number : <b>{patientObj.ancNo}</b>
                  </span>
                  )}
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
                      { typeof patientObj.address !== 'object' ?  patientObj?.address   : getAddress(patientObj?.address)}
                    </b>
                  </span>
                </Col>
                <Col md={12}>
                {/* biometricStatus == */}
                
                    
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

            
                       {(retestStatus?.seroconverted || retestStatus?.remainedHivNegative) &&  
                           <div>
                               <Typography variant="caption"> <Label
                            color={
                              retestStatus?.remainedHivNegative === true
                                ? "green"
                                : "red"
                            }
                            size={"mini"}
                          >{retestStatus?.seroconverted
                                ? "Seroconverted to HIV Positive"
                                :retestStatus?.remainedHivNegative? "Remained HIV Negative": ''}
                            
                          </Label>
                        </Typography>

                      </div>}
                      {/* retestStatus */}
                             {props.maternalOutcome &&   <div>
                        <Typography variant="caption">
                          <Label
                            color={
                              'blue'
                            }
                            size={"mini"}
                          >
                            Maternal Outcome:
                            <Label.Detail>
                              {props.maternalOutcome && convertMaternalCodeToValue(props.maternalOutcome)}
                            </Label.Detail>
                          </Label>
                        </Typography>
                      </div>} 
                   {infantHeiPcrAlert && infantHeiPcrAlert.length > 0 && (
  <div>
    <Typography variant="caption">
      <List sx={{ 
        maxWidth: '150px', 
        width: 'fit-content',
        maxHeight: '200px', 
        bgcolor: '#db2828',
        padding: '0px', 
        borderRadius: '4px',
        color: 'white',
        fontSize: '9px',
        border: '1px solid #e0e0e0' 
      }}>
        {/* Move the Fragment and key inside the map */}
        <ListItem sx={{ padding: '0px' }}>
          <ListItemButton 
            onClick={() => handleClick()} 
            sx={{ 
              padding: '0px', 
              fontSize: '9px',
            }}
          >
            <Label color={'red'} style={{ padding: '2px 4px' }}>    
              <span style={{fontSize: '9px'}}>PCR Alerts!!  ({infantHeiPcrAlert.length})</span>       
            </Label>
            {expandedIndex ? <ExpandMore /> : <ExpandLess />}
          </ListItemButton>
        </ListItem>

        {/* Map through alerts */}
        {infantHeiPcrAlert.map((alert, index) => (
          <React.Fragment key={index}>
            <Collapse in={expandedIndex} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 0.5, pr: 0.5, pb: 0.5, pt: 0, fontSize: '9px' }}>
                <Typography variant="body2" gutterBottom>
                  <span style={{fontSize: '9px'}}>
                    <strong>{alert.infantHospitalNo}:</strong> {alert.alertMessage}
                  </span> 
                </Typography>
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Typography>
  </div>
)}
                    
                 
                  <div  style={{display: 'flex', gap: '2px'}}>
                  {(props.patientObj.finalResult ||
                  props.patientObj.dynamicHivStatus !== null ||
                  props.patientObj.staticHivStatus !== null ||
                  confirmStatus) ? (
                    <>
                      <div>
                        <Typography variant="caption">
                          <Label
                            color={
                          confirmStatus === "Positive" || confirmStatus === 'reactive'
                                ? "red"
                                :  confirmStatus === "Negative" || confirmStatus === 'non-reactive'? 'green': 'grey'
                            }
                            size={"mini"}
                          >
                            HIV Status
                            <Label.Detail>

                            {confirmStatus === 'Unknown'?  'Not Tested' : confirmStatus === 'reactive'? 'Positive' : confirmStatus === 'non-reactive'? 'Negative': confirmStatus}

                            </Label.Detail>
                          </Label>
                        </Typography>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                 {highRiskInfants && highRiskInfants.length > 0 && (
                  <div>
                    <Typography variant="caption">
                      <List sx={{
                        maxWidth: '180px',
                        width: 'fit-content',
                        maxHeight: '200px',
                        bgcolor: '#f85032',
                        padding: '0px',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '9px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <ListItem sx={{ padding: '0px' }}>
                          <ListItemButton
                            onClick={() => handleHighRiskClick()}
                            sx={{
                              padding: '0px',
                              fontSize: '9px',
                            }}
                          >
                            <Label color={'red'} style={{ padding: '2px 4px' }}>
                              <WarningAmberIcon sx={{ fontSize: '12px', marginRight: '2px' }} />
                              <span style={{fontSize: '9px'}}>Infant High Risk!! ({highRiskInfants.length})</span>
                            </Label>
                            {expandedHighRiskIndex ? <ExpandMore /> : <ExpandLess />}
                          </ListItemButton>
                        </ListItem>

                        {highRiskInfants.map((infant, index) => (
                          <React.Fragment key={index}>
                            <Collapse in={expandedHighRiskIndex} timeout="auto" unmountOnExit>
                              <Box sx={{ pl: 0.5, pr: 0.5, pb: 0.5, pt: 0, fontSize: '9px' }}>
                                <Typography variant="body2" gutterBottom>
                                  <span style={{fontSize: '9px'}}>
                                    <ChildCareIcon sx={{ fontSize: '10px', marginRight: '2px' }} />
                                    <strong>{infant.infantHospitalNo}:</strong> {infant.alertMessage}
                                  </span>
                                </Typography>
                              </Box>
                            </Collapse>
                          </React.Fragment>
                        ))}
                      </List>
                    </Typography>
                  </div>
                )}
                  {unsuppressedVl && (
                  <div>
                    <Typography variant="caption">
                      <Label
                        color="red"
                        size="mini"
                        style={{ animation: 'none' }}
                      >
                        <WarningAmberIcon sx={{ fontSize: '10px', marginRight: '2px', verticalAlign: 'middle' }} />
                        Unsuppressed VL
                        <Label.Detail>
                          {'>='} 1,000 copies/ml
                        </Label.Detail>
                      </Label>
                    </Typography>
                  </div>
                  )}

                  </div>
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
