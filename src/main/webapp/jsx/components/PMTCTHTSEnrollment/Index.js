import React, {useCallback, useEffect, useState} from "react";
import { Button} from 'semantic-ui-react'
import {Card, CardBody} from "reactstrap";
import {makeStyles} from "@material-ui/core/styles";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import {Link, useHistory, useLocation} from "react-router-dom";

import 'react-phone-input-2/lib/style.css'
import { Icon, Menu, Sticky } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import BasicInfo from './BasicInfo'
import PreTest from './PreTest'
import HivTestResult from './HivTestResult'
import IndexingContactTracing from './Elicitation/Index'
import Others from './Others'
import PostTest from './PostTest'
import RecencyTesting from './RecencyTesting'
import RiskStratification from './RiskStratification'


const useStyles = makeStyles((theme) => ({

    error:{
        color: '#f85032',
        fontSize: '12.8px'
    },  
    success: {
        color: "#4BB543 ",
        fontSize: "11px",
    },
}));


const PmtctHts = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
    const locationState = location.state;
    const [saving, setSaving] = useState(false);
    const [activeItem, setactiveItem] = useState('risk');
    const [completed, setCompleted] = useState([]);
    const [hideOtherMenu, setHideOtherMenu] = useState(true);
    const [patientObj, setPatientObj] = useState({
        breastFeeding: "",
        capturedBy: "",
        cd4: {},
        clientCode: "",
        riskStratificationCode:"",
        confirmatoryTest: {},
        dateVisit: "",
        extra: {},
        firstTimeVisit: "",
        hepatitisTesting: {},
        hivTestResult: "",
        id: "",
        indexClient: "",
        indexClientCode: "",
        indexElicitation: [
          {
            address: "",
            altPhoneNumber: "",
            archived: 0,
            currentlyLiveWithPartner: true,
            datePartnerCameForTesting: "",
            dob: "",
            extra: {},
            facilityId: 0,
            firstName: "",
            hangOutSpots: "",
            htsClient: {
              archived: 0,
              breastFeeding: 0,
              capturedBy: "",
              cd4: {},
              clientCode: "",
              confirmatoryTest: {},
              dateVisit: "",
              extra: {},
              facilityId: 0,
              firstTimeVisit: true,
              hepatitisTesting: {},
              hivTestResult: "",
              id: 0,
              indexClient: true,
              indexClientCode: "",
              indexNotificationServicesElicitation: {},
              knowledgeAssessment: {},
              numChildren: 0,
              numWives: 0,
              others: {},
              person: {
                active: "",
                address: {},
                archived: 0,
                contact: {},
                contactPoint: {},
                createdDate: "",
                dateOfBirth: "",
                dateOfRegistration: "",
                deceased: true,
                deceasedDateTime: "",
                education: {},
                employmentStatus: {},
                emrId: "",
                facilityId: 0,
                firstName: "string",
                gender: {},
                hospitalNumber: "",
                id: "",
                identifier: {},
                isDateOfBirthEstimated: true,
                lastModifiedDate: "",
                maritalStatus: {},
                new: true,
                ninNumber: "",
                organization: {},
                otherName: "",
                sex: "",
                surname: "",
                uuid: ""
              },
              personUuid: "",
              postTestCounselingKnowledgeAssessment: {},
              pregnant: "",
              previouslyTested: true,
              recency: {},
              referredFrom: "",
              relationWithIndexClient: "",
              riskAssessment: {},
              sexPartnerRiskAssessment: {},
              stiScreening: {},
              syphilisTesting: {},
              targetGroup: 0,
              tbScreening: {},
              test1: {},
              testingSetting: "",
              tieBreakerTest: {},
              typeCounseling: "",
              uuid: ""
            },
            htsClientUuid: "",
            id: "",
            isDateOfBirthEstimated: true,
            lastName: "",
            middleName: "",
            notificationMethod: "",
            partnerTestedPositive: "",
            phoneNumber: "",
            physicalHurt: "",
            relationshipToIndexClient: "",
            sex: "",
            sexuallyUncomfortable: "",
            threatenToHurt: "",
            uuid: ""
          }
        ],
        indexNotificationServicesElicitation: {},
        knowledgeAssessment: {},
        numChildren: "",
        numWives: "",
        others: {},
        personId: props.patientObj.personId,
        personResponseDto: {
          active: true,
          
        address: {
            address: [
              {
                city: "",
                line: [
                  ""
                ],
                stateId: "",
                district: "",
                countryId: 1,
                postalCode: "",
                organisationUnitId: 0
              }
            ]
          },
          biometricStatus: true,
          checkInDate: "",
          contact: {},
          contactPoint:{contactPoint:[
            {
                type: "phone",
                value: ""
            }
            ]},
          dateOfBirth: "",
          dateOfRegistration: "",
          deceased: true,
          deceasedDateTime: "",
          education: {},
          employmentStatus: {},
          emrId: "",
          encounterDate: "",
          facilityId: "",
          firstName: "",
          gender: {},
          id: "",
          identifier: {},
          isDateOfBirthEstimated: true,
          maritalStatus: {},
          ninNumber: "",
          organization: {},
          otherName: "",
          sex: "",
          surname: "",
          visitId: ""
        },
        postTestCounselingKnowledgeAssessment: {},
        pregnant: "",
        previouslyTested: "",
        recency: {},
        referredFrom: "",
        relationWithIndexClient: "",
        riskAssessment: {},
        sexPartnerRiskAssessment: {},
        stiScreening: {},
        syphilisTesting: {},
        targetGroup: "",
        tbScreening: {},
        test1: {},
        testingSetting: "",
        tieBreakerTest: {},
        typeCounseling: "",
        riskStratificationResponseDto:null
        
    });
    const [extra, setExtra] = useState({
    risk:"",
    index:"",
    pre:"",
    post:"",
    recency:"",
    elicitation:""
});
    const handleItemClick =(activeItem)=>{
        setactiveItem(activeItem)
        //setCompleted({...completed, ...completedMenu})
    }
    useEffect(() => { 
        // if(locationState && locationState.patientObj){
        //     setPatientObj(locationState.patientObject)           
        // }
    }, []);


    return (
        <>
            <ToastContainer autoClose={3000} hideProgressBar />
           
            <Card >
                <CardBody>
                <form >
                    <div className="row">
                    <h3>HIV COUNSELLING AND TESTING 
                    </h3>
                        <br/>
                        <br/>
                        
                        <div className="col-md-3 col-sm-3 col-lg-3">                       
                        <Menu  size='large'  vertical  style={{backgroundColor:"#014D88"}}>
                            <Menu.Item
                                name='inbox'
                                active={activeItem === 'hiv-test'}
                                onClick={()=>handleItemClick('hiv-test')}
                                style={{backgroundColor:activeItem === 'hiv-test' ? '#000': ""}}
                                //disabled={activeItem !== 'hiv-test' ? true : false}
                            >               
                                <span style={{color:'#fff'}}>Request {"&"} Result Form
                                {completed.includes('hiv-test') && (
                                    <Icon name='check' color='green' />
                                )}
                                </span>
                                
                                {/* <Label color='teal'>3</Label> */}
                            </Menu.Item>                            
                            <Menu.Item
                                name='spam'
                                active={activeItem === 'recency-testing'}
                                onClick={()=>handleItemClick('recency-testing')}
                                style={{backgroundColor:activeItem === 'recency-testing' ? '#000': ""}}
                                //disabled={activeItem !== 'recency-testing' ? true : false}
                            >
                            {/* <Label>4</Label> */}
                            <span style={{color:'#fff'}}>HIV Recency Testing
                                {completed.includes('recency-testing') && (
                                    <Icon name='check' color='green' />
                                )}
                            </span>
                           
                            </Menu.Item>
                            <Menu.Item
                                name='spam'
                                active={activeItem === 'indexing'}
                                onClick={()=>handleItemClick('indexing')}
                                style={{backgroundColor:activeItem === 'indexing' ? '#000': ""}}
                                //disabled={activeItem !== 'indexing' ? true : false}
                            >
                            {/* <Label>4</Label> */}
                            <span style={{color:'#fff'}}>Index Notification Services - Elicitation
                            {completed.includes('indexing') && (
                                <Icon name='check' color='green' />
                            )}
                            </span>
                            
                            </Menu.Item>
                        </Menu>
                        </div>
                        
                        <div className="col-md-9 col-sm-9 col-lg-9 " style={{ backgroundColor:"#fff", margingLeft:"-50px", paddingLeft:"-20px"}}>
                            {activeItem==='risk' && (<RiskStratification handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj}  setHideOtherMenu={setHideOtherMenu} patientAge={props.patientObj.age} setExtra={setExtra} extra={extra} activePage={props.activePage} setActivePage={props.setActivePage}/>)}
                            {activeItem==='basic' && (<BasicInfo handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} clientCode={props.clientCode} patientAge={props.patientObj.age} setExtra={setExtra} extra={extra}/>)}
                            {activeItem==='pre-test-counsel' && (<PreTest handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} clientCode={props.clientCode} patientAge={props.patientObj.age}/>)}
                            {activeItem==='hiv-test' && (<HivTestResult handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} clientCode={props.clientCode} patientAge={props.patientObj.age}/>)}
                            {activeItem==='post-test' && (<PostTest handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} clientCode={props.clientCode} patientAge={props.patientObj.age} patientsHistory={props.patients}/>)}
                            {activeItem==='indexing' && (<IndexingContactTracing handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} clientCode={props.clientCode} patientAge={props.patientObj.age}/>)}
                            {activeItem==='recency-testing' && (<RecencyTesting  handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} clientCode={props.clientCode} patientAge={props.patientObj.age}/>)}
                            {activeItem==='others' && (<Others handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} clientCode={props.clientCode} patientAge={props.patientObj.age}/>)}
                            
                        </div>                                   
                    </div>

                
                    </form>
                </CardBody>
            </Card>                                 
        </>
    );
};

export default PmtctHts