import React, { useState } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import axios from "axios";

import { token as token, url as baseUrl } from "./../../../api";
import { forwardRef } from "react";
import "semantic-ui-css/semantic.min.css";
import { Link } from "react-router-dom";
import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
//import { MdDashboard } from "react-icons/md";
import "@reach/menu-button/styles.css";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
import moment from "moment";
//import { FaUserPlus } from "react-icons/fa";
import { TiArrowForward } from "react-icons/ti";
import PmtctEntryPoint from "../PmtctServices/PmtctEntryPoint";

//Dtate Picker package
Moment.locale("en");
momentLocalizer();

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const Patients = (props) => {
  const [showPPI, setShowPPI] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [info, setInfo] = useState({});
  const [maternalOutcomeOptions, setMaternalOutcomeOptions] = useState(JSON.parse(localStorage.getItem("maternalOutcome")));


  // Define negative maternal outcomes that should disable enrollment
  const negativeOutcomes = [
    "MATERNAL_OUTCOME_DEAD",
    "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP",
    "MATERNAL_OUTCOME_LOST_TO_FOLLOW_UP",
    "MATERNAL_OUTCOME_TRANSFERRED_OUT"
  ];

  // Helper function to check if maternal outcome is negative
  const isNegativeOutcome = (maternalOutcome) => {
    if (!maternalOutcome) return false;
    return negativeOutcomes.includes(maternalOutcome);
  };

  // Helper function to convert maternal outcome code to display value
  const getMaternalOutcomeDisplay = (code) => {
    if (!code) return "";
    const option = maternalOutcomeOptions.find((item) => item.code === code);
    return option ? option.display : code;
  };

  const calculate_age = (dob) => {
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

  const getHospitalNumber = (identifier) => {
    const identifiers = identifier;
    const hospitalNumber = identifiers.identifier.find(
      (obj) => obj.type == "HospitalNumber"
    );
    return hospitalNumber ? hospitalNumber.value : "";
  };
  const handleCheckBox = (e) => {
    if (e.target.checked) {
      setShowPPI(false);
    } else {
      setShowPPI(true);
    }
  };

  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title="Find Patient "
        columns={[
          // { title: " ID", field: "Id" },
          {
            title: "Patient Name",
            field: "name",
            hidden: showPPI,
          },
          {
            title: "Hospital Number",
            field: "hospital_number",
            filtering: false,
          },
          { title: "Sex", field: "gender", filtering: false },
          { title: "Age", field: "age", filtering: false },
          {
            title: "Pregnancy Count",
            field: "pregnancy_count",
            filtering: false,
          },
          { title: "Status", field: "status", filtering: false },
          //{ title: "Enrollment Status", field: "v_status", filtering: false },
          //{ title: "ART Number", field: "v_status", filtering: false },
          // { title: "ART Status", field: "status", filtering: false },
          { title: "Actions", field: "actions", filtering: false },
        ]}
        //isLoading={loading}
        data={(query) =>
          new Promise((resolve, reject) =>
            axios
              .get(
                `${baseUrl}pmtct/anc/pmtct-from-person?pageSize=${query.pageSize}&pageNo=${query.page}&searchParam=${query.search}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .then((response) => response)
              .then((result) => {
                //console.log(result.data.records)
                resolve({
                  data: result.data.records.map((row) => ({
                    name: (
                      <Link
                        to={{
                          pathname: "/enroll-patient",
                          state: { patientId: row.id, patientObj: row },
                        }}
                        title={"Enroll Patient"}
                      >
                        {" "}
                        {row.firstName + " " + row.surname}
                      </Link>
                    ),
                    hospital_number: getHospitalNumber(row.identifier),
                    gender: row && row.sex ? row.sex : "",
                    age:
                      row.dateOfBirth === 0 ||
                      row.dateOfBirth === undefined ||
                      row.dateOfBirth === null ||
                      row.dateOfBirth === ""
                        ? 0
                        : calculate_age(
                            moment(row.dateOfBirth).format("DD-MM-YYYY")
                          ),
                    pregnancy_count: row.pregnancyCount || 0,
                    status: getMaternalOutcomeDisplay(row.maternalOutcome),

                    //status: (<Label color="blue" size="mini">{row.currentStatus}</Label>),
                    //enroll-patient
                    actions: (
                      <div
                        onClick={(e) => {
                          if (!isNegativeOutcome(row.maternalOutcome)) {
                            setModalShow(true);
                            setInfo({ patientId: row.id, patientObj: row });
                          }
                        }}
                        style={{ cursor: isNegativeOutcome(row.maternalOutcome) ? 'not-allowed' : 'pointer' }}
                        title={isNegativeOutcome(row.maternalOutcome) ? `Patient is ${getMaternalOutcomeDisplay(row.maternalOutcome)}` : ''}
                      >
                        {/* <Link
                                                to={{
                                                    pathname: "/enroll-patient",
                                                    state: { patientId : row.id, patientObj: row, entryType: 'ANC'  }
                                                }}
                                            > */}
                        <ButtonGroup
                          variant="contained"
                          aria-label="split button"
                          style={{
                            backgroundColor: isNegativeOutcome(row.maternalOutcome) ? "#cccccc" : "rgb(153, 46, 98)",
                            height: "30px",
                            width: "215px",
                            opacity: isNegativeOutcome(row.maternalOutcome) ? 0.6 : 1,
                          }}
                          size="large"
                          disabled={isNegativeOutcome(row.maternalOutcome)}
                        >
                          <Button
                            color="primary"
                            size="small"
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            style={{
                              backgroundColor: isNegativeOutcome(row.maternalOutcome) ? "#cccccc" : "rgb(153, 46, 98)",
                              cursor: isNegativeOutcome(row.maternalOutcome) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isNegativeOutcome(row.maternalOutcome)}
                          >
                            <TiArrowForward />
                          </Button>
                          <Button
                            style={{
                              backgroundColor: isNegativeOutcome(row.maternalOutcome) ? "#cccccc" : "rgb(153, 46, 98)",
                              cursor: isNegativeOutcome(row.maternalOutcome) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isNegativeOutcome(row.maternalOutcome)}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: isNegativeOutcome(row.maternalOutcome) ? "#888" : "#fff",
                                fontWeight: "bolder",
                              }}
                            >
                              {row.hasExistingEnrollment
                                ? "Re-enroll Patient"
                                : "Enroll Patient"}
                            </span>
                          </Button>
                        </ButtonGroup>
                        {/* </Link> */}
                      </div>
                    ),
                  })),
                  page: query.page,
                  totalCount: result.data.totalRecords,
                });
              })
          )
        }
        options={{
          headerStyle: {
            backgroundColor: "#014d88",
            color: "#fff",
          },
          search: true,
          searchFieldStyle: {
            width: "200%",
            margingLeft: "250px",
          },
          filtering: false,
          exportButton: false,
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 10,
          debounceInterval: 400,
        }}
        components={{
          Toolbar: (props) => (
            <div>
              <div className="form-check custom-checkbox  float-left mt-4 ml-3 ">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="showPP!"
                  id="showPP"
                  value="showPP"
                  checked={showPPI === true ? false : true}
                  onChange={handleCheckBox}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                />
                <label className="form-check-label" htmlFor="basic_checkbox_1">
                  <b style={{ color: "#014d88", fontWeight: "bold" }}>
                    SHOW PII
                  </b>
                </label>
              </div>
              <MTableToolbar {...props} />
            </div>
          ),
        }}
      />
      <PmtctEntryPoint
        route="/enroll-patient"
        show={modalShow}
        info={info}
        onHide={() => setModalShow(false)}
      />
    </div>
  );
};

export default Patients;
