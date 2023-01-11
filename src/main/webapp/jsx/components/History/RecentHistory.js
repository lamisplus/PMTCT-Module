import React, { Fragment, useState, useEffect } from "react";
// BS
import { Dropdown,} from "react-bootstrap";
/// Scroll
import { makeStyles } from '@material-ui/core/styles';
import PerfectScrollbar from "react-perfect-scrollbar";
import { Link } from "react-router-dom";
import axios from "axios";
import { url as baseUrl, token } from "../../../api";
import { Alert } from "react-bootstrap";
import {  Card,Accordion } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import "react-widgets/dist/css/react-widgets.css";
import { toast} from "react-toastify";


const RecentHistory = (props) => {
  const [recentActivities, setRecentActivities] = useState([])
  const [infants, setInfants] = useState([])
  const [
    activeAccordionHeaderShadow,
    setActiveAccordionHeaderShadow,
  ] = useState(0);

  useEffect(() => {
    InfantInfo();
    RecentActivities();
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
  //Get list of LaboratoryHistory
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
        
    if(row.path==='Mental-health'){        
        props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id, actionType:action})

    }else if(row.path==='clinic-visit'){
      props.setActiveContent({...props.activeContent, route:'consultation', id:row.id, activeTab:"history",actionType:action, })

  }else{

    }
    
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
                      <span className="accordion-header-text">Visit Date : <span className="">{data.activityDate}</span> </span>
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
                                  //onClick={()=>LoadViewPage(activity,'view')}
                                  >
                                    View
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
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
                          <span className="counter"><b>1</b></span> 
                        </h4>
                        <p className="m-0"><b>ANC</b></p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                        <h4 className="m-1">
                          <span className="counter"><b>0</b></span>
                        </h4>
                        <p className="m-0"><b>PNC</b></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-12 col-xxl-12 col-sm-12">
                <div className="card overflow-hidden">
                  <div className="social-graph-wrapper widget-linkedin">
                    <span className="s-icon">
                    <span style={{fontSize:"16px"}}>No. of Infants  { infants.length > 0 ? (" - " + infants.length): ""}</span>
                    </span>
                  </div>
                  <div className="row">
                    {infants.length > 0 ? (
                      <>
                    <div className="col-6 border-right">
                      <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                        <h4 className="m-1">
                          <span className="counter">0</span> 
                        </h4>
                        <p className="m-0"><b>HIV <sup style={{color:"red"}}>+</sup></b></p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                        <h4 className="m-1">
                          <span className="counter">{infants.length}</span>
                        </h4>
                        <p className="m-0"><b>HIV <sup style={{color:"green"}}>-</sup></b></p>
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
     
 </div>
      
    </Fragment>
  );
};

export default RecentHistory;
