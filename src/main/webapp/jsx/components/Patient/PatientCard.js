import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Link } from 'react-router-dom'
import ButtonMui from "@material-ui/core/Button";
import { TiArrowBack } from 'react-icons/ti'
//import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import { Button } from 'semantic-ui-react';
import {Label,} from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';
import { Col, Row } from "reactstrap";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
import moment from "moment";
import axios from "axios";
import { url as baseUrl, token } from "./../../../api";
import Typography from '@material-ui/core/Typography';
import CaptureBiometric from './CaptureBiometric';

//Dtate Picker package
Moment.locale("en");
momentLocalizer();

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '20.33%',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

function PatientCard(props) {
  const { classes } = props;
  const patientCurrentStatus=props.patientObj && props.patientObj.currentStatus==="Died (Confirmed)" ? true : false ;
  const patientObjs = props.patientObj ? props.patientObj : {}
  const permissions= props.permissions ? props.permissions : [];
  const [patientObj, setpatientObj] = useState(patientObjs)
  const [patientBiometricStatus, setPatientBiometricStatus]= useState(props.patientObj.biometricStatus);
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
  }, [props.patientObj]);

  //Get list of KP
  const CheckBiometric =()=>{
      axios
        .get(`${baseUrl}modules/check?moduleName=biometric`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setBiometricStatus(response.data);
            if(response.data===true){
              axios
                  .get(`${baseUrl}biometrics/devices`,
                      { headers: {"Authorization" : `Bearer ${token}`} }
                  )
                  .then((response) => {
                      setDevices(response.data);
                      
                  })
                  .catch((error) => {
                      console.log(error)
                  });
            
              }
        })
        .catch((error) => {
        //console.log(error);
        });
    
  }
    ///GET LIST OF Patients
    async function PatientCurrentStatus() {
        axios
            .get(`${baseUrl}hiv/status/patient-current/${patientObj.id}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {

              setHivStatus(response.data);
            })
            .catch((error) => {    
            });        
    }
    const get_age = dob => {
      var today = new Date();
      var dateParts = dob.split("-");
      var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
      var birthDate = new Date(dateObject); // create a date object directlyfrom`dob1`argument
      var age_now = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  age_now--;
              }
          if (age_now === 0) {
                  return m + " month(s)";
              }
              return age_now ;
    }
    const calculate_age = dob => {
      var today = new Date();
      var dateParts = dob.split("-");
      var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
      var birthDate = new Date(dateObject); // create a date object directlyfrom`dob1`argument
      var age_now = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  age_now--;
              }
          if (age_now === 0) {
                  return m + " month(s)";
              }
              return age_now + " year(s)";
    };

    const loadChildEvaluation =(row)=> {
      props.setActiveContent('child-evaluation')
    }
    const capturePatientBiometric =(row)=> {
      //props.setActiveContent('biometrics')
      props.setActiveContent({...props.activeContent, route:'biometrics', obj:row})
    }
    const loadArtCommencement =(row)=> {
      props.setActiveContent('art-commencement')
    }
    
    const loadArt =(row)=> {
        setpatientObj({...patientObj, ...row});
            setArtModal(!artModal)
    }
    
    const CurrentStatus = ()=>{

          return (  <Label color="blue" size="mini">{hivStatus}</Label>);
  }
    const getHospitalNumber = (identifier) => {     
      const identifiers = identifier;
      const hospitalNumber = identifiers.identifier.find(obj => obj.type == 'HospitalNumber');       
      return hospitalNumber ? hospitalNumber.value : '';
    };
    const getPhoneNumber = (identifier) => {     
      const identifiers = identifier;
      const phoneNumber = identifiers.contactPoint.find(obj => obj.type == 'phone');       
      return phoneNumber ? phoneNumber.value : '';
    };
    const getAddress = (identifier) => {     
      const identifiers = identifier;
      const address = identifiers.address.find(obj => obj.city);      
      return address ? address.city : '';
    };
    const handleBiometricCapture = (id) => { 
      let patientObjID= id
      setBiometricModal(!biometricModal);
    }

  
  return (
    <div className={classes.root}>
       <ExpansionPanel defaultExpanded>

                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                
                <Row>
                
                    <Col md={12}>
                    <Row className={"mt-1"}>
                    <Col md={12} className={classes.root2}>
                        <b style={{fontSize: "25px"}}>
                        {patientObj.firstName + " " + patientObj.surname }
                        </b>
                        <Link to={"/"} >
                        <ButtonMui
                            variant="contained"
                            color="primary"
                            className=" float-end ms-2 mr-2 mt-2"
                            //startIcon={<FaUserPlus size="10"/>}
                            startIcon={<TiArrowBack  />}
                            style={{backgroundColor:"rgb(153, 46, 98)", color:'#fff', height:'35px'}}

                        >
                            <span style={{ textTransform: "capitalize" }}>Back</span>
                        </ButtonMui>
                      </Link>
                    </Col>
                    <Col md={4} className={classes.root2}>
                    <span>
                        {" "}
                        Patient ID : <b>{getHospitalNumber(patientObj.identifier) }</b>
                    </span>
                    </Col>

                    <Col md={4} className={classes.root2}>
                    <span>
                        Date Of Birth : <b>{patientObj.dateOfBirth }</b>
                    </span>
                    </Col>
                    <Col md={4} className={classes.root2}>
                    <span>
                        {" "}
                        Age : <b>{calculate_age(moment(patientObj.dateOfBirth).format("DD-MM-YYYY"))}</b>
                    </span>
                    </Col>
                    <Col md={4}>
                    <span>
                        {" "}
                        Gender :{" "}
                        <b>{patientObj.sex && patientObj.sex!==null ?  patientObj.sex : '' }</b>
                    </span>
                    </Col>
                    <Col md={4} className={classes.root2}>
                    <span>
                        {" "}
                        Phone Number : <b>{getPhoneNumber(patientObj.contactPoint)}</b>
                    </span>
                    </Col>
                    <Col md={4} className={classes.root2}>
                    <span>
                        {" "}
                        Address : <b>{getAddress(patientObj.address)} </b>
                    </span>
                    </Col>

                    <Col md={12}>
                      {biometricStatus===true ? (
                          <>
                              <div >
                                  <Typography variant="caption">
                                      <Label color={props.patientObj.biometricStatus===true? "green" : "red"} size={"mini"}>
                                          Biometric Status
                                          <Label.Detail>{props.patientObj.biometricStatus===true? "Captured" : "Not Capture"}</Label.Detail>
                                      </Label>
                                      {props.patientObj.biometricStatus!==true ? (
                                    
                                          <>
                                             
                                                  <>
                                                  <Label as='a' color='teal' onClick={() => capturePatientBiometric(patientObj)} tag>
                                                      Capture Now
                                                  </Label>
                                                  </>
                                            
                                          </>
                                      )
                                      :""
                                      }
                                      
                                  </Typography>
                              </div>
                          </>
                          )
                          :
                          <>
                              <div >
                                  <Typography variant="caption">
                                      <Label color={"red"} size={"mini"}>
                                          Biometric Not Install
                                          
                                      </Label>
                                    
                                  </Typography>
                              </div>
                          </>
                      }
                    </Col>
                    </Row>
                    </Col>
                </Row>
            
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                
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
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions expandIcon={<ExpandMoreIcon />}>
                
                </ExpansionPanelActions>
            </ExpansionPanel>
    
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);
