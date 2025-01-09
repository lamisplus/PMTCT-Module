import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../api";

const usePatientStatus = (patientId, commenced) => {
  const [currentStatus, setCurrentStatus] = useState(() => {
    const savedStatus = localStorage.getItem("currentStatus");
    return savedStatus || "";
  });

  const [isPatientActive, setIsPatientActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const updateCurrentStatus = (status) => {
    if (status) {
   
      localStorage.setItem("currentStatus", status);
      setCurrentStatus(status);
      setIsPatientActive(!status.toLowerCase().includes("stopped"));
    }
  };

  const fetchCurrentStatus = async () => {
    if (!patientId) return;

    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${baseUrl}hiv/patient-current/${patientId}?commenced=${commenced}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      updateCurrentStatus(data);
    } catch (error) {
      console.error("Error fetching patient status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEnrollmentStatus = async (personUuid) => {
    try {
      const response = await axios.post(
        `${baseUrl}hiv/status/activate-stop_status/${personUuid}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 204) {
        setIsPatientActive(true);
        updateCurrentStatus("ACTIVE");
        toast.success("Patient reactivated successfully");
        return true;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.apierror?.message ||
        "Something went wrong, please try again";
      toast.error(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    fetchCurrentStatus();
  }, [patientId, commenced]);

  return {
    currentStatus,
    isPatientActive,
    isLoading,
    updateCurrentStatus,
    updateEnrollmentStatus,
    refetchStatus: fetchCurrentStatus,
  };
};

export default usePatientStatus;
