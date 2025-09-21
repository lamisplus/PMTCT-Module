import React, { memo } from "react";
import { Link } from "react-router-dom";

const PatientName = memo(({ patient }) => {
  const { currentStatus, id, firstName, surname } = patient;
  const isEnrolled = currentStatus !== "Not Enrolled";

  return (
    <Link
      to={{
        pathname: isEnrolled ? "/patient-history" : "/enroll-patient",
        state: isEnrolled
          ? { patientObj: patient }
          : { patientId: id, patientObj: patient },
      }}
      title={isEnrolled ? "Click to view patient dashboard" : "Enroll Patient"}
    >
      {firstName} {surname}
    </Link>
  );
});

export default PatientName;
