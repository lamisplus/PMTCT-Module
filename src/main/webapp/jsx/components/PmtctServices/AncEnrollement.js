import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
} from "reactstrap";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "./../../../api";
import { Spinner } from "reactstrap";
import AncFormFields from "./AncFormFields";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  cardBottom: {
    marginBottom: 20,
  },
  Select: {
    height: 45,
    width: 350,
  },
  button: {
    margin: theme.spacing(1),
  },
  root: {
    flexGrow: 1,
    "& .card-title": {
      color: "#fff",
      fontWeight: "bold",
    },
    "& .form-control": {
      borderRadius: "0.25rem",
      height: "41px",
      borderColor: "#d2d6dc",
    },
    "& .card-header:first-child": {
      borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0",
    },
    "& .dropdown-toggle::after": {
      display: " block !important",
    },
    "& select": {
      "-webkit-appearance": "listbox !important",
    },
    "& p": {
      color: "red",
    },
    "& label": {
      fontSize: "14px",
      color: "#014d88",
      fontWeight: "bold",
    },
  },
  input: {
    display: "none",
  },
  error: {
    color: "#f85032",
    fontSize: "11px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}));

const AncEnrollement = (props) => {
  const patientObj = props.patientObj;
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [disabledField, setDisabledField] = useState(false);

  const [objValues, setObjValues] = useState({
    // Registration Info
    ancNo: "",
    dateOfEnrollment: "",
    ancAttendance: "New ANC",
    referredFromSpokesSite: "",
    // Obstetric History
    gravida: "",
    parity: "",
    lmp: "",
    gaweeks: "",
    // Vital Signs (JSONB)
    vitalSigns: {
      weight: "",
      height: "",
      systolic: "",
      diastolic: "",
    },
    // Counselling (JSONB)
    counselling: {
      hts: "",
      fgm: "",
      fp: "",
      maternalNutrition: "",
      earlyBf: "",
      exclusiveBf: "",
    },
    // Syphilis (JSONB)
    syphilisInfo: {
      testedSyphilis: "",
      testResultSyphilis: "",
      treatedSyphilis: "",
      referredSyphilisTreatment: "",
    },
    // Hepatitis B (JSONB)
    hepatitisBInfo: {
      testedHepatitisB: "",
      hepatitisB: "",
      referredHepatitisB: "",
    },
    // Hepatitis C (JSONB)
    hepatitisCInfo: {
      testedHepatitisC: "",
      hepatitisC: "",
      referredHepatitisC: "",
    },
    // Lab Tests (JSONB)
    labTest: {
      hbPcv: "",
      pcv: "",
      bloodSugarGdm: "",
    },
    // Urinalysis (JSONB)
    urinalysis: {
      sugar: "",
      proteins: "",
    },
    // Interventions / Preventive Services (JSONB)
    interventions: {
      llinGiven: "",
      iptDose: "",
      hematinicsGiven: "",
      tdImmunization: "",
      associatedProblems: "",
    },
    outcomeOfVisit: "",
    referralReason: "",
    transportationOut: "",
    // System
    patientUuid: patientObj?.patient_uuid || patientObj?.patientUuid || patientObj?.uuid || "",
    source: "WEB",
  });

  // Flatten nested state to flat values for AncFormFields
  const getFlatValues = () => {
    return {
      ...objValues,
      // Vital signs: nested -> flat
      weight: objValues.vitalSigns?.weight || "",
      height: objValues.vitalSigns?.height || "",
      systolic: objValues.vitalSigns?.systolic || "",
      diastolic: objValues.vitalSigns?.diastolic || "",
      // Counselling: nested -> flat with "counselling" prefix
      counsellingHts: objValues.counselling?.hts || "",
      counsellingFgm: objValues.counselling?.fgm || "",
      counsellingFp: objValues.counselling?.fp || "",
      counsellingMaternalNutrition: objValues.counselling?.maternalNutrition || "",
      counsellingEarlyBf: objValues.counselling?.earlyBf || "",
      counsellingExclusiveBf: objValues.counselling?.exclusiveBf || "",
      // Syphilis: nested -> flat
      testedSyphilis: objValues.syphilisInfo?.testedSyphilis || "",
      testResultSyphilis: objValues.syphilisInfo?.testResultSyphilis || "",
      treatedSyphilis: objValues.syphilisInfo?.treatedSyphilis || "",
      referredSyphilisTreatment: objValues.syphilisInfo?.referredSyphilisTreatment || "",
      // Hepatitis B: nested -> flat
      testedHepatitisB: objValues.hepatitisBInfo?.testedHepatitisB || "",
      dateOfHepatitisB: objValues.hepatitisBInfo?.dateOfHepatitisB || "",
      hepatitisB: objValues.hepatitisBInfo?.hepatitisB || "",
      treatedHepatitisB: objValues.hepatitisBInfo?.treatedHepatitisB || "",
      referredHepatitisB: objValues.hepatitisBInfo?.referredHepatitisB || "",
      // Hepatitis C: nested -> flat
      testedHepatitisC: objValues.hepatitisCInfo?.testedHepatitisC || "",
      dateOfHepatitisC: objValues.hepatitisCInfo?.dateOfHepatitisC || "",
      hepatitisC: objValues.hepatitisCInfo?.hepatitisC || "",
      treatedHepatitisC: objValues.hepatitisCInfo?.treatedHepatitisC || "",
      referredHepatitisC: objValues.hepatitisCInfo?.referredHepatitisC || "",
      // Urinalysis: nested -> flat
      urinalysisSugar: objValues.urinalysis?.sugar || "",
      urinalysisProteins: objValues.urinalysis?.proteins || "",
      // Lab Tests: nested -> flat
      hbPcv: objValues.labTest?.hbPcv || "",
      pcv: objValues.labTest?.pcv || "",
      bloodSugarGdm: objValues.labTest?.bloodSugarGdm || "",
      // Interventions: nested -> flat
      llinGiven: objValues.interventions?.llinGiven || "",
      iptDose: objValues.interventions?.iptDose || "",
      hematinicsGiven: objValues.interventions?.hematinicsGiven || "",
      tdImmunization: objValues.interventions?.tdImmunization || "",
      associatedProblems: objValues.interventions?.associatedProblems || "",
    };
  };

  // Reverse-mapping adapter: maps flat field names from AncFormFields back to nested state
  const handleFieldChange = (name, value) => {
    if (name === "__clearError__") {
      setErrors((prev) => ({ ...prev, [value]: "" }));
      return;
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Vital signs mapping
    const vitalSignsMap = { weight: "weight", height: "height", systolic: "systolic", diastolic: "diastolic" };
    if (vitalSignsMap[name]) {
      setObjValues((prev) => ({
        ...prev,
        vitalSigns: { ...prev.vitalSigns, [vitalSignsMap[name]]: value },
      }));
      return;
    }

    // Counselling mapping
    const counsellingPrefix = "counselling";
    if (name.startsWith(counsellingPrefix) && name.length > counsellingPrefix.length) {
      const key = name.slice(counsellingPrefix.length);
      const nestedKey = key.charAt(0).toLowerCase() + key.slice(1);
      setObjValues((prev) => ({
        ...prev,
        counselling: { ...prev.counselling, [nestedKey]: value },
      }));
      return;
    }

    // Syphilis mapping
    const syphilisFields = ["testedSyphilis", "testResultSyphilis", "treatedSyphilis", "referredSyphilisTreatment"];
    if (syphilisFields.includes(name)) {
      setObjValues((prev) => ({
        ...prev,
        syphilisInfo: { ...prev.syphilisInfo, [name]: value },
      }));
      return;
    }

    // Hepatitis B mapping
    const hepBFields = ["testedHepatitisB", "hepatitisB", "referredHepatitisB", "dateOfHepatitisB", "treatedHepatitisB"];
    if (hepBFields.includes(name)) {
      setObjValues((prev) => ({
        ...prev,
        hepatitisBInfo: { ...prev.hepatitisBInfo, [name]: value },
      }));
      return;
    }

    // Hepatitis C mapping
    const hepCFields = ["testedHepatitisC", "hepatitisC", "referredHepatitisC", "dateOfHepatitisC", "treatedHepatitisC"];
    if (hepCFields.includes(name)) {
      setObjValues((prev) => ({
        ...prev,
        hepatitisCInfo: { ...prev.hepatitisCInfo, [name]: value },
      }));
      return;
    }

    // Urinalysis mapping
    if (name === "urinalysisSugar") {
      setObjValues((prev) => ({
        ...prev,
        urinalysis: { ...prev.urinalysis, sugar: value },
      }));
      return;
    }
    if (name === "urinalysisProteins") {
      setObjValues((prev) => ({
        ...prev,
        urinalysis: { ...prev.urinalysis, proteins: value },
      }));
      return;
    }

    // Lab Test mapping
    const labTestFields = ["hbPcv", "pcv", "bloodSugarGdm"];
    if (labTestFields.includes(name)) {
      setObjValues((prev) => ({
        ...prev,
        labTest: { ...prev.labTest, [name]: value },
      }));
      return;
    }

    // Interventions mapping
    const interventionsFields = ["llinGiven", "iptDose", "hematinicsGiven", "tdImmunization", "associatedProblems"];
    if (interventionsFields.includes(name)) {
      setObjValues((prev) => ({
        ...prev,
        interventions: { ...prev.interventions, [name]: value },
      }));
      return;
    }

    // Default: flat field
    setObjValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate counselling fields (using flat field names that AncFormFields expects)
    const counsellingFields = [
      { key: "hts", flatKey: "counsellingHts", label: "HIV Testing Services" },
    ];
    const newErrors = { ...errors };
    let hasError = false;
    counsellingFields.forEach(({ key, flatKey, label }) => {
      if (!objValues.counselling[key]) {
        newErrors[flatKey] = `${label} is required`;
        hasError = true;
      }
    });
    // Validate vital signs ranges (using flat field names that AncFormFields expects)
    const vs = objValues.vitalSigns;
    if (vs.weight && (parseFloat(vs.weight) < 30 || parseFloat(vs.weight) > 150)) {
      newErrors.weight = "Weight must be between 30 and 150 kg";
      hasError = true;
    }
    if (vs.height && (parseFloat(vs.height) < 48.26 || parseFloat(vs.height) > 216.408)) {
      newErrors.height = "Height must be between 48.26 and 216.408 cm";
      hasError = true;
    }
    if (vs.systolic && (parseFloat(vs.systolic) < 90 || parseFloat(vs.systolic) > 240)) {
      newErrors.systolic = "Systolic BP must be between 90 and 240";
      hasError = true;
    }
    if (vs.diastolic && (parseFloat(vs.diastolic) < 60 || parseFloat(vs.diastolic) > 140)) {
      newErrors.diastolic = "Diastolic BP must be between 60 and 140";
      hasError = true;
    }
    // Validate HB (g/dl) and PCV (%) ranges
    const lt = objValues.labTest || {};
    if (lt.hbPcv && (parseFloat(lt.hbPcv) < 0 || parseFloat(lt.hbPcv) > 25)) {
      newErrors.hbPcv = "HB must be between 0 and 25 g/dL";
      hasError = true;
    }
    if (lt.pcv && (parseFloat(lt.pcv) < 0 || parseFloat(lt.pcv) > 70)) {
      newErrors.pcv = "PCV must be between 0% and 70%";
      hasError = true;
    }
    if (lt.bloodSugarGdm && (parseFloat(lt.bloodSugarGdm) < 0 || parseFloat(lt.bloodSugarGdm) > 500)) {
      newErrors.bloodSugarGdm = "Blood Sugar must be between 0 and 500 mg/dL";
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      toast.error("Please fill all required fields and correct validation errors");
      return;
    }
    setSaving(true);
    const payload = {
      ...objValues,
      patient_uuid: objValues.patientUuid,
      pmtctCycleUuid: props?.latestPmtctCycle?.uuid || props?.selectedCycleId,
    };
    axios
      .post(`${baseUrl}pmtct/anc/anc-enrollement`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSaving(false);
        toast.success("ANC Enrollment saved successfully");
        if (props.setPmtctHtsRetestingType) {
          props.setPmtctHtsRetestingType("pmtct-hts");
        }
        props.setActiveContent({
          ...props.activeContent,
          route: "pmtct-hts",
          actionType: "create",
          id: "",
          obj: {},
        });
      })
      .catch((error) => {
        setSaving(false);
        const apiError = error.response?.data?.apierror;
        const subError = apiError?.subErrors?.[0];
        let errorMessage =
          apiError?.message ||
          subError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Something went wrong, please try again";
        if (apiError?.message && subError?.field && subError?.message) {
          errorMessage = `${apiError.message}: ${subError.field} ${subError.message}`;
        }
        toast.error(errorMessage);
      });
  };

  // Fetch existing ANC record for view/update mode
  const fetchAncRecord = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/view-anc/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        const d = response.data;
        // Convert Boolean values from API to "Yes"/"No" strings for dropdown compatibility
        const boolToYesNo = (val) => val === true ? "Yes" : val === false ? "No" : val || "";
        setObjValues((prev) => ({
          ...prev,
          ancNo: d.ancNo || "",
          ancAttendance: d.ancAttendance || prev.ancAttendance,
          referredFromSpokesSite: d.referredFromSpokesSite || "",
          dateOfEnrollment: d.dateOfEnrollment || "",
          gravida: d.gravida != null ? d.gravida : "",
          parity: d.parity != null ? d.parity : "",
          lmp: d.lmp || "",
          gaweeks: d.gaweeks != null ? d.gaweeks : "",
          ancSetting: d.ancSetting || "",
          communitySetting: d.communitySetting || "",
          staticHivStatus: d.staticHivStatus || "",
          previouslyKnownHivStatus: d.previouslyKnownHivStatus || "",
          currentlyOnArt: d.currentlyOnArt || "",
          facilityEnrolledIn: d.facilityEnrolledIn || "",
          labTest: {
            hbPcv: d.labTest?.hbPcv || "",
            pcv: d.labTest?.pcv || "",
            bloodSugarGdm: d.labTest?.bloodSugarGdm || "",
          },
          interventions: {
            llinGiven: d.interventions?.llinGiven || "",
            iptDose: d.interventions?.iptDose || "",
            hematinicsGiven: d.interventions?.hematinicsGiven || "",
            tdImmunization: d.interventions?.tdImmunization || "",
            associatedProblems: d.interventions?.associatedProblems || "",
          },
          outcomeOfVisit: d.outcomeOfVisit || "",
          referralReason: d.referralReason || "",
          transportationOut: d.transportationOut || "",
          // Flatten nested objects
          vitalSigns: {
            weight: d.vitalSigns?.weight || "",
            height: d.vitalSigns?.height || "",
            systolic: d.vitalSigns?.systolic || "",
            diastolic: d.vitalSigns?.diastolic || "",
          },
          counselling: {
            hts: d.counselling?.counsellingHts || d.counselling?.hts || "",
            fgm: d.counselling?.counsellingFgm || d.counselling?.fgm || "",
            fp: d.counselling?.counsellingFp || d.counselling?.fp || "",
            maternalNutrition: d.counselling?.counsellingMaternalNutrition || d.counselling?.maternalNutrition || "",
            earlyBf: d.counselling?.counsellingEarlyBf || d.counselling?.earlyBf || "",
            exclusiveBf: d.counselling?.counsellingExclusiveBf || d.counselling?.exclusiveBf || "",
          },
          syphilisInfo: {
            testedSyphilis: d.syphilisInfo?.testedSyphilis || "",
            testResultSyphilis: d.syphilisInfo?.testResultSyphilis || "",
            treatedSyphilis: d.syphilisInfo?.treatedSyphilis || "",
            referredSyphilisTreatment: d.syphilisInfo?.referredSyphilisTreatment || "",
          },
          hepatitisBInfo: {
            testedHepatitisB: boolToYesNo(d.hepatitisBInfo?.testedHepatitisB),
            dateOfHepatitisB: d.hepatitisBInfo?.dateOfHepatitisB || "",
            hepatitisB: d.hepatitisBInfo?.hepatitisB || "",
            treatedHepatitisB: boolToYesNo(d.hepatitisBInfo?.treatedHepatitisB),
            referredHepatitisB: boolToYesNo(d.hepatitisBInfo?.referredHepatitisB),
          },
          hepatitisCInfo: {
            testedHepatitisC: boolToYesNo(d.hepatitisCInfo?.testedHepatitisC),
            dateOfHepatitisC: d.hepatitisCInfo?.dateOfHepatitisC || "",
            hepatitisC: d.hepatitisCInfo?.hepatitisC || "",
            treatedHepatitisC: boolToYesNo(d.hepatitisCInfo?.treatedHepatitisC),
            referredHepatitisC: boolToYesNo(d.hepatitisCInfo?.referredHepatitisC),
          },
          urinalysis: {
            sugar: d.urinalysis?.sugar || "",
            proteins: d.urinalysis?.proteins || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching ANC record:", error);
      toast.error("Failed to load ANC enrollment record");
    }
  };

  useEffect(() => {
    if (
      props.activeContent?.id &&
      props.activeContent?.actionType !== "create"
    ) {
      setDisabledField(props.activeContent.actionType === "view");
      fetchAncRecord(props.activeContent.id);
    }
  }, []);

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <div>
            <form>
              <div
                className="card-header mb-3"
                style={{
                  background: "#fff",
                  borderRadius: "0",
                  padding: "14px 20px",
                  border: "none",
                  borderBottom: "2px solid #e2e8f0",
                  boxShadow: "none",
                }}
              >
                <h5 style={{ color: "#0f172a", fontWeight: "700", marginBottom: "0", fontSize: "15px" }}>
                  ANC Enrollment
                </h5>
              </div>

                  <AncFormFields
                    values={getFlatValues()}
                    errors={errors}
                    onChange={handleFieldChange}
                    disabled={disabledField}
                  />

              {saving ? <Spinner /> : ""}
            <br />

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              {props.activeContent &&
              props.activeContent.actionType === "update" ? (
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Update</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>Updating...</span>
                  )}
                </MatButton>
              ) : props.activeContent?.actionType !== "view" ? (
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>Saving...</span>
                  )}
                </MatButton>
              ) : null}
            </div>
            </form>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AncEnrollement;
