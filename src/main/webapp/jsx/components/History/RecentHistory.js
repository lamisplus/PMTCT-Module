import React, { Fragment, useState, useEffect } from "react";
// BS
import { Dropdown,} from "react-bootstrap";
/// Scroll
//import { makeStyles } from '@material-ui/core/styles';
import PerfectScrollbar from "react-perfect-scrollbar";
//import { Link } from "react-router-dom";
import axios from "axios";
import { url as baseUrl, token } from "../../../api";
//import { Alert } from "react-bootstrap";
import {  Card,Accordion } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import "react-widgets/dist/css/react-widgets.css";
import { toast} from "react-toastify";
import {  Modal } from "react-bootstrap";
import {Button } from 'semantic-ui-react'

const RecentHistory = (props) => {
  let history = useHistory();
  const [recentActivities, setRecentActivities] = useState([])
  const [infants, setInfants] = useState([])
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = useState(false)
  const [record, setRecord] = useState(null)
   const toggle = () => setOpen(!open);
   let notToBeUpdated = ['pmtct_infant_information'];
  const [summartChart, setSummaryChart]= useState({
    motherVisit: 0,
    childVisit: 1,
    childAlive: 0,
    childDead: 0
  })
  const [
    activeAccordionHeaderShadow,
    setActiveAccordionHeaderShadow,
  ] = useState(0);

  useEffect(() => {
    InfantInfo();
    RecentActivities();
    SummaryChart();
  }, [props.patientObj.id]);
  ///GET LIST OF Infants

  const InfantInfo =()=>{
    axios
        .get(`${baseUrl}pmtct/anc/get-infant-by-ancno/${props.patientObj.ancNo}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
                setInfants(response.data)
        })

        .catch((error) => {
        //console.log(error);
        });
    
  }

  const RecentActivities =()=>{
    axios
       .get(`${baseUrl}pmtct/anc/activities/${props.patientObj.ancNo}`,
           { headers: {"Authorization" : `Bearer ${token}`} }
       )
       .then((response) => {
          setRecentActivities(response.data)
       })
       .catch((error) => {
       //console.log(error);
       });
   
  }
  const SummaryChart =()=>{
    axios
       .get(`${baseUrl}pmtct/anc/get-summary-chart/${props.patientObj.ancNo}`,
           { headers: {"Authorization" : `Bearer ${token}`} }
       )
       .then((response) => {
        setSummaryChart(response.data)
       })
       .catch((error) => {
       //console.log(error);
       });
   
  }
  const ActivityName =(name)=> {
      if(name==='HIV Enrollment'){
        return "HE"
      }else if(name==='Pharmacy refill'){
        return "PR"
      }else if(name==='Clinical evaluation'){
        return "CE"
      }else if(name==='Clinic visit follow up'){
        return "CV"
      }else if(name==='ART Commencement'){
        return "AC"
      }else {
        return "RA"
      }
  }

  const LoadViewPage =(row,action)=>{

    if(row.path==='anc-enrollment'){        
        //props.setActiveContent({...props.activeContent, route:'anc-enrollment', id:row.id, actionType:action})
        history.push({
            pathname: '/update-patient',
            state: { id: row.recordId, patientObj:props.patientObj, actionType:action }
        });
    }else if(row.path==='anc-delivery'){
        props.setActiveContent({...props.activeContent, route:'labour-delivery', id:row.recordId, actionType:action})

    }else if(row.path==='pmtct-enrollment'){
        props.setActiveContent({...props.activeContent, route:'anc-pnc', id:row.recordId, activeTab:"history", actionType:action, })
  
    }else if(row.path==='anc-mother-visit'){
        props.setActiveContent({...props.activeContent, route:'consultation', id:row.recordId, activeTab:"home", actionType:action, })
  
    }else if(row.path==='pmtct_infant_visit'){
      props.setActiveContent({...props.activeContent, route:'consultation', id:row.recordId, activeTab:"child", actionType:action, })

    }else if(row.path==='pmtct_infant_information'){
      props.setActiveContent({...props.activeContent, route:'add-infant', id:row.recordId, activeTab:"home", actionType:action, })

    }else{

    }
    
  }
  const LoadDeletePage =(row)=>{
          
    if(row.path==='anc-enrollment'){ 
        setSaving(true)       
        //props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id})
        axios
        .delete(`${baseUrl}pmtct/anc/delete/anc/${row.recordId}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            toast.success("Record Deleted Successfully");
            RecentActivities()
            toggle()
            setSaving(false) 
        })
        .catch((error) => {
            setSaving(false) 
            if(error.response && error.response.data){
                let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                toast.error(errorMessage);
              }
              else{
                toast.error("Something went wrong. Please try again...");
              }
        });  
    }else if(row.path==='pmtct-enrollment'){
        setSaving(true) 
        //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
        axios
        .delete(`${baseUrl}pmtct/anc/delete/pmtct/${row.recordId}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            toast.success("Record Deleted Successfully");
            RecentActivities()
            toggle()
            setSaving(false) 
        })
        .catch((error) => {
            setSaving(false) 
            if(error.response && error.response.data){
                let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                toast.error(errorMessage);
              }
              else{
                toast.error("Something went wrong. Please try again...");
              }
        });

    }else if(row.path==='anc-delivery'){
        setSaving(false) 
        //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
        axios
        .delete(`${baseUrl}pmtct/anc/delete/delivery/${row.recordId}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            toast.success("Record Deleted Successfully");
            RecentActivities()
            toggle()
            setSaving(false) 
        })
        .catch((error) => {
            setSaving(false) 
            if(error.response && error.response.data){
                let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                toast.error(errorMessage);
              }
              else{
                toast.error("Something went wrong. Please try again...");
              }
        });

    }else if(row.path==='anc-mother-visit'){
        setSaving(true) 
        //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
        axios
        .delete(`${baseUrl}pmtct/anc/delete/delivery/${row.recordId}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            toast.success("Record Deleted Successfully");
            RecentActivities()
            toggle()
            setSaving(false) 
        })
        .catch((error) => {
            setSaving(false) 
            if(error.response && error.response.data){
                let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                toast.error(errorMessage);
              }
              else{
                toast.error("Something went wrong. Please try again...");
              }
        });

    }else if(row.path==='pmtct_infant_visit'){
        setSaving(true) 
        //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
        axios
        .delete(`${baseUrl}pmtct/anc/delete/infantvisit/${row.recordId}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            toast.success("Record Deleted Successfully");
            RecentActivities()
            toggle()
            setSaving(false) 
        })
        .catch((error) => {
            setSaving(false) 
            if(error.response && error.response.data){
                let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                toast.error(errorMessage);
              }
              else{
                toast.error("Something went wrong. Please try again...");
              }
        });

    }else if(row.path==='pmtct_infant_information'){
      setSaving(true) 
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
      .delete(`${baseUrl}pmtct/anc/delete/infantinfo/${row.recordId}`,
          { headers: {"Authorization" : `Bearer ${token}`} }
      )
      .then((response) => {
          toast.success("Record Deleted Successfully");
          RecentActivities()
          toggle()
          setSaving(false) 
      })
      .catch((error) => {
          setSaving(false) 
          if(error.response && error.response.data){
              let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
              toast.error(errorMessage);
            }
            else{
              toast.error("Something went wrong. Please try again...");
            }
      });

    }
    else{

    }
    
  }
  const LoadModal =(row)=>{
    toggle()
    setRecord(row)
  }
const index=0;

  return (
    <Fragment>
      {/* <Ext /> */}
     
      <div className="row">
      <div className="col-xl-4 col-xxl-4 col-lg-4">
          <div className="card">
            <div className="card-header  border-0 pb-0">
              <h4 className="card-title"> Recent Activities</h4>
            </div>
            <div className="card-body">
              <PerfectScrollbar
                style={{ height: "370px" }}
                id="DZ_W_Todo1"
                className="widget-media dz-scroll ps ps--active-y"
              >
                <Accordion
                    className="accordion accordion-header-bg accordion-header-shadow accordion-rounded "
                    defaultActiveKey="0"
                  >
                    <>
                    {recentActivities.map((data, i)=>
                    <div className="accordion-item" key={i}>
                      <Accordion.Toggle
                          as={Card.Text}
                          eventKey={`${i}`}
                          className={`accordion-header ${
                            activeAccordionHeaderShadow === 1 ? "" : "collapsed"
                          } accordion-header-info`}
                          onClick={() =>
                            setActiveAccordionHeaderShadow(
                              activeAccordionHeaderShadow === 1 ? -1 : i
                            )
                          }
                      >
                      <span className="accordion-header-icon"></span>
                      <span className="accordion-header-text">Visit Date : <span className="">{data.activityName}</span> </span>
                      <span className="accordion-header-indicator"></span>
                    </Accordion.Toggle>
                    <Accordion.Collapse
                      eventKey={`${i}`}
                      className="accordion__body"
                    >
                      <div className="accordion-body-text">
                      <ul className="timeline">

                            <li>
                              <div className="timeline-panel">
                              <div className={i % 2 == 0 ? "media me-2 media-info" : "media me-2 media-success"}>{"RA"}</div>
                              <div className="media-body">
                                <h5 className="mb-1">{data.activityName}</h5>
                                <small className="d-block">
                                {data.activityDate}
                                </small>
                              </div>
                              {!notToBeUpdated.includes(data.path) ? (
                              <Dropdown className="dropdown">
                                <Dropdown.Toggle
                                variant=" light"
                                className="i-false p-0 btn-info sharp"
                                >
                                <svg
                                  width="18px"
                                  height="18px"
                                  viewBox="0 0 24 24"
                                  version="1.1"
                                >
                                  <g
                                  stroke="none"
                                  strokeWidth="1"
                                  fill="none"
                                  fillRule="evenodd"
                                  >
                                  <rect x="0" y="0" width="24" height="24" />
                                  <circle fill="#000000" cx="5" cy="12" r="2" />
                                  <circle fill="#000000" cx="12" cy="12" r="2" />
                                  <circle fill="#000000" cx="19" cy="12" r="2" />
                                  </g>
                                </svg>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu">
                                 <Dropdown.Item
                                  className="dropdown-item"
                                  onClick={()=>LoadViewPage(data,'view')}
                                  >
                                    View
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                  className="dropdown-item"
                                  onClick={()=>LoadViewPage(data,'view')}
                                  >
                                    Update
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                  className="dropdown-item"
                                  onClick={()=>LoadModal(data, 'delete')}
                                  >
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                               ):""}
                              </div>
                            </li>
                                                 
                      </ul>
                      </div>
                    </Accordion.Collapse>
                  </div>
                )}
                </>
                </Accordion>
                
              </PerfectScrollbar>
            </div>
          </div>
      </div>
      {props.patientObj.dynamicHivStatus==='Positive'  || props.patientObj.hivStatus==='Positive' ? (
        <>
            <div className="col-xl-8 col-xxl-8 col-lg-8">
        <div className="card">
          <div className="card-header border-0 pb-0">
            <h4 className="card-title">Patient Chart</h4>
          </div>
          <br/>
          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-6">
              <div className="col-xl-12 col-xxl-12 col-sm-12">
                <div className="card overflow-hidden">
                  <div className="social-graph-wrapper widget-facebook">
                    <span className="s-icon">
                      <span style={{fontSize:"16px"}}>Total Clinic Visit</span>
                    </span>
                  </div>
                  <div className="row">
                    <div className="col-6 border-right">
                      <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                        <h4 className="m-1">
                          <span className="counter"><b>{summartChart.motherVisit}</b></span> 
                        </h4>
                        <p className="m-0"><b>Mother Visit</b></p>
                      </div>
                    </div>
                    {infants.length > 0 && (
                    <div className="col-6">
                      <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                        <h4 className="m-1">
                          <span className="counter"><b>{summartChart.childVisit}</b></span>
                        </h4>
                        <p className="m-0"><b>Infant's Visit</b></p>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-xl-12 col-xxl-12 col-sm-12">
                <div className="card overflow-hidden">
                  <div className="social-graph-wrapper widget-linkedin">
                    <span className="s-icon">
                    <span style={{fontSize:"16px"}}>No. of Infants  { infants.length > 0 ? (" : " + infants.length): ""}</span>
                    </span>
                  </div>
                  <div className="row">
                    {infants.length > 0 ? (
                      <>
                    <div className="col-6 border-right">
                      <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                        <h4 className="m-1">
                          <span className="counter">{summartChart.childAlive}</span> 
                        </h4>
                        <p className="m-0"><b>Alive </b></p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                        <h4 className="m-1">
                          <span className="counter">{summartChart.childDead}</span>
                        </h4>
                        <p className="m-0"><b>Dead </b></p>
                      </div>
                    </div>
                    </>
                    ) :
                    (<p>No Record</p>)
                  }
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-6">
            <div className="card-body">
              <h3>Current Infant's Details</h3>
              {infants.length > 0 ? 
                (
                  <PerfectScrollbar
                    style={{ height: "370px" }}
                    id="DZ_W_TimeLine1"
                    className="widget-timeline dz-scroll style-1 height370 ps ps--active-y"
                  >
                    <ul className="timeline">
                      {infants.map((obj) => 
                            <li key={index}>
                              <div className={index % 2 == 0 ? "timeline-badge info" : "timeline-badge success"}></div>
                              <span
                                className="timeline-panel text-muted"
                                //onClick={()=>redirectLink()}
                                //to=""
                              >
                                <h6 className="mb-0">
                                  Infant Given Name
                                  <br/>
                                  {obj.firstName}
                                </h6>
                                <strong className="text-teal">
                                  Infant DOB<br/>
                                  {obj.dateOfDelivery}
                                </strong><br/> 
                                <strong className="text-warning">
                                    Gender<br/>
                                    {obj.sex}
                                </strong>                    

                              </span>
                            </li>
                      )}

                    </ul>
                  </PerfectScrollbar>
                )
                :
                (
                 
                  <p>No Record</p>
                 
                  
                )
              }

            </div>
            </div>
          </div>
        </div>
      </div>
        </>
        )
          : 
          (
            <>
             <div className="col-sm-6 col-md-6 col-lg-6">
                  <div className="card-body">
                    <b>Patient has no HTS record. Please refer for testing...</b>
                  </div>
                  </div>

            </>
          )
      }
      
      <Modal show={open} toggle={toggle} className="fade" size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered backdrop="static">
            <Modal.Header >
        <Modal.Title id="contained-modal-title-vcenter">
            Notification!
        </Modal.Title>
        </Modal.Header>
            <Modal.Body>
                <h4>Are you Sure you want to delete <b>{record && record.activityName}</b></h4>
                
            </Modal.Body>
        <Modal.Footer>
            <Button onClick={()=>LoadDeletePage(record)}  style={{backgroundColor:"red", color:"#fff"}} disabled={saving}>{saving===false ? "Yes": "Deleting..."}</Button>
            <Button onClick={toggle} style={{backgroundColor:"#014d88", color:"#fff"}} disabled={saving}>No</Button>
            
        </Modal.Footer>
        </Modal>     
 </div>
      
    </Fragment>
  );
};

export default RecentHistory;
