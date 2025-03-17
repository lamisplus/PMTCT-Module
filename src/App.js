import React from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./main/webapp/vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./../src/main/webapp/css/style.css";
import "bootstrap/dist/css/bootstrap.css";
import Home from "./main/webapp/jsx/components/Home";
import PatientDetail from "./main/webapp/jsx/components/Patient/PatientDetail";
import RegisterPatientPage from "./main/webapp/jsx/components/Patient/RegisterPatient";
import EnrollPatientPage from "./main/webapp/jsx/components/Patient/EnrollPatient";
import UpdatePatientEnrollment from "./main/webapp/jsx/components/Patient/UpdatePatientEnrollment";
import CheckedInPatientsAlert from "./main/webapp/jsx/components/Globals/CheckinPatientsAlert";
export default function App() {
  return (
    <Router>
      <div>
        <ToastContainer />

        <CheckedInPatientsAlert />
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          {/* Route to patient Dashboard */}
          <Route path="/patient-history">
            <PatientDetail />
          </Route>

          <Route path="/register-patient">
            <RegisterPatientPage />
          </Route>
          <Route path="/enroll-patient">
            <EnrollPatientPage />
          </Route>
          <Route path="/update-patient">
            <UpdatePatientEnrollment />
          </Route>
          {/* Default Route */}
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
