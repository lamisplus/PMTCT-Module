import React,{useState} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PatientCardDetail from './PatientCard'
import { useHistory } from "react-router-dom";
import SubMenu from './SubMenu';
//import RecentHistory from './../History/RecentHistory';
import ClinicVisit from '../Consultation/Index'
import PmtctEnrollment from './../PmtctServices/PmtctEnrollment';
import AncEnrollement from './../PmtctServices/AncEnrollement';
import LabourDelivery from './../PmtctServices/LabourDelivery';
import PmtctHts from './../PMTCTHTSEnrollment/Index'
import Partners from './../PmtctServices/Partners/Index'
import Infants from './../PmtctServices/Infants/Index'
import AddPartners from './../PmtctServices/Partners/AddNewPartner'
import AddInfants from './../PmtctServices/Infants/InfantRegistration'
import PatientHistory from './../History/PatientHistory'
import RecentHistory from './../History/RecentHistory';

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
    let history = useHistory();
    const [art, setArt] = useState(false);
    const [activeContent, setActiveContent] = useState({route:"recent-history", id:"", activeTab:"home", actionType:"create", obj:{}});
    const { classes } = props;
    const patientObj = history.location && history.location.state ? history.location.state.patientObj : {}
    console.log(patientObj)

  return (
    <div className={classes.root}>
      <div className="row page-titles mx-0" style={{marginTop:"0px", marginBottom:"-10px"}}>
			<ol className="breadcrumb">
				<li className="breadcrumb-item active"><h4> <Link to={"/"} >PMTCT /</Link> Patient Dashboard</h4></li>
			</ol>
		  </div>
      <Card >
        <CardContent>
            {/* Patient Card Detail */}
            <PatientCardDetail patientObj={patientObj} setArt={setArt} setActiveContent={setActiveContent}/>  
            {/* Patient Dashboard menu */}
            <SubMenu patientObj={patientObj} art={art} setActiveContent={setActiveContent}/>
            <br/>
            {/* Patient dashboard menu route */}
            {activeContent.route==='recent-history' &&(<RecentHistory patientObj={patientObj} setActiveContent={setActiveContent} activeContent={activeContent}/>)}

            {activeContent.route==='consultation' &&( <ClinicVisit patientObj={patientObj} setActiveContent={setActiveContent} activeContent={activeContent}/>)}
            {activeContent.route==='anc-pnc' &&( <PmtctEnrollment patientObj={patientObj} setActiveContent={setActiveContent} activeContent={activeContent}  hideUpdateButton={true}/>)}
            {activeContent.route==='anc-enrollment' &&( <AncEnrollement patientObj={patientObj} setActiveContent={setActiveContent} activeContent={activeContent}/>)}
            {activeContent.route==='labour-delivery' &&( <LabourDelivery patientObj={patientObj} setActiveContent={setActiveContent} activeContent={activeContent}/>)}
            {activeContent.route==='pmtct-hts' &&( <PmtctHts patientObj={patientObj} patientAge={patientObj.age} setActiveContent={setActiveContent} activeContent={activeContent}/>)}
            {activeContent.route==='partners' &&( <Partners patientObj={patientObj} patientAge={patientObj.age} setActiveContent={setActiveContent} activeContent={activeContent}/>)}
            {activeContent.route==='infants' &&( <Infants patientObj={patientObj} patientAge={patientObj.age} setActiveContent={setActiveContent} activeContent={activeContent}/>)}
            {activeContent.route==='add-partner' &&( <AddPartners patientObj={patientObj} patientAge={patientObj.age} setActiveContent={setActiveContent} activeContent={activeContent}/>)}
            {activeContent.route==='add-infant' &&( <AddInfants patientObj={patientObj} patientAge={patientObj.age} setActiveContent={setActiveContent} activeContent={activeContent}/>)}
            {activeContent.route==='patient-history' &&( <PatientHistory patientObj={patientObj} setActiveContent={setActiveContent} activeContent={activeContent}/>)}         
            {/* History Pages */}
         
         </CardContent>
      </Card>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);
