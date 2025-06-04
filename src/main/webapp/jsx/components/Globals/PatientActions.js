import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ButtonGroup, Button } from "@material-ui/core";
import { MdDashboard } from "react-icons/md";
import { TiArrowForward } from "react-icons/ti";

const styles = {
  buttonGroup: {
    backgroundColor: "rgb(153, 46, 98)",
    height: "30px",
    width: "215px",
  },
  button: {
    backgroundColor: "rgb(153, 46, 98)",
  },
  buttonText: {
    fontSize: "12px",
    color: "#fff",
    fontWeight: "bolder",
  },
};

const PatientActions = memo(({ patient }) => {

  const { currentStatus, id } = patient;
  const isEnrolled = currentStatus !== "Not Enrolled";



  return (
    <Link
      to={{
        pathname: isEnrolled ? "/patient-history" : "/enroll-patient",
        state: isEnrolled
          ? { patientObj: patient }
          : { patientId: id, patientObj: patient },
      }}
    >
      <ButtonGroup variant="contained" style={styles.buttonGroup} size="large">
        <Button style={styles.button}>
          {isEnrolled ? <MdDashboard /> : <TiArrowForward />}
        </Button>
        <Button style={styles.button}>
          <span style={styles.buttonText}>
            {isEnrolled ? "Dashboard" : "Enroll"}
          </span>
        </Button>
      </ButtonGroup>
    </Link>
  );
});

export default PatientActions;
