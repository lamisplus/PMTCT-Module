import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { url as baseUrl, token } from "../../api";

export const calculate_age = (dob) => {
  if (dob !== null && dob != "") {
    //Check if the DOB is not null or empty
    const today = new Date();
    const dateParts = dob.split("-");
    const birthDate = new Date(dob);
    // get the day, month and year of today
    let todayMonth = today.getMonth();
    let todayYear = today.getFullYear();
    let todayDate = today.getDate(); // get the day, month and year from date of birth
    let birthDateMonth = birthDate.getMonth();
    let birthDateYear = birthDate.getFullYear();
    let birthdateDate = birthDate.getDate();
    // substract birthdate year from today year  ie todayYear - birthdateYear which  will give  "AssumedAge" is the age  we assume the patient will clock this year
    let assumedAge = todayYear - birthDateYear;
    if (assumedAge > 0) {
      //Checking the month to confirm if the age has been cloocked
      let monthGap = todayMonth - birthDateMonth;
      // If 'monthGap'> 0, the age has been clocked, 'monthGap'< 0, the age has not been clocked, 'monthGap'= 0, we are in the month then check date to confirm clocked age
      if (monthGap > 0) {
        return assumedAge + " year(s)";
      } else if (monthGap < 0) {
        let confirmedAge = assumedAge - 1;
        return confirmedAge + " year(s)";
      } else if (monthGap === 0) {
        let dateGap = todayDate - birthdateDate;

        if (dateGap > 0) {
          return assumedAge + " year(s)";
        } else if (dateGap < 0) {
          let confirmedAge = assumedAge - 1;
          return confirmedAge + " year(s)";
        }
      }
    } else {
      let monthGap = todayMonth - birthDateMonth;
      let dateGap = todayDate - birthdateDate;
      let monthOld = monthGap > 0 ? monthGap : 0;
      let DayOld = dateGap > 0 ? dateGap : 0;
      let result = monthOld ? monthOld + "month(s)" : DayOld + "day(s)";
      return result;
    }
  }
};





export const calculateGestationalAge = (enrollmentDate, lmp) => {

  if(enrollmentDate === ""){

    toast.error("Date of enrolllment is empty");
    return 0;

  }else if(lmp ===  "" ){

    toast.error("Last menstrual Period is empty");
    return 0;

  }else if(enrollmentDate < lmp){

    toast.error("Last menstrual Period is earlier than enrollment date");
    return 0;

  }else{

      let theEnrollmentDate = moment(enrollmentDate);
      let theLmp = moment(lmp);

      if(theEnrollmentDate.diff(theLmp, 'week') >= 1 ){
          return theEnrollmentDate.diff(theLmp, 'week')
      }else{
        return 0;
      }
  }


}

export const validateGestationalAge = (gaWeeks, min = 4, max = 45) => {
  const ga = parseInt(gaWeeks);
  if (isNaN(ga) || ga <= 0) {
    return { valid: false, gaWeeks: ga, reason: "invalid" };
  }
  if (ga > max) {
    return { valid: false, gaWeeks: ga, reason: "too_high" };
  }
  if (ga < min) {
    return { valid: false, gaWeeks: ga, reason: "too_low" };
  }
  return { valid: true, gaWeeks: ga, reason: null };
};

export const addWeeksToDate = (dateStr, weeks) => {
  return moment(dateStr).add(weeks, "weeks").format("YYYY-MM-DD");
};

// Scrolls to and focuses the topmost (first, in visual/reading order) field with a
// validation error, so the user isn't left hunting a long form for a red error message
// they can't see. Call with the field name/id keys that currently have an error message —
// e.g. Object.keys(newErrors).filter((k) => newErrors[k]) — after a failed validate() on
// submit. Re-running this on each submit attempt naturally advances to the next remaining
// error once earlier ones are fixed, since it always picks whichever error field is
// currently topmost on screen.
export const scrollToFirstError = (errorFieldKeys) => {
  if (!errorFieldKeys || errorFieldKeys.length === 0) return;
  let target = null;
  let minTop = Infinity;
  errorFieldKeys.forEach((key) => {
    const el = document.getElementById(key) || document.getElementsByName(key)[0];
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < minTop) {
      minTop = top;
      target = el;
    }
  });
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  // Focus after the scroll settles rather than immediately — focusing mid-scroll can jump
  // the viewport straight to the field (skipping the smooth animation) in some browsers.
  setTimeout(() => {
    if (typeof target.focus === "function") target.focus({ preventScroll: true });
  }, 400);
};

export  const convertMaternalCodeToValue = (code) => {
  const stored = JSON.parse(localStorage.getItem("maternalOutcome"));

      if(stored && stored.length > 0){
           let convertedValue =  stored.filter((each )=>{

              return each.code === code

             })

             return  convertedValue.length > 0 ? convertedValue[0].display : "";

          }
      return "";
}

// HIV status is established once and carries forward permanently across PMTCT cycles — it is
// never re-established per cycle. patient-hiv-summary is already patient-wide-aware (falls back
// to the patient's latest positive result from any cycle/module when the current cycle has none
// of its own), so this is the one place every "is she already known positive" check should go
// through, instead of each caller re-deriving it from a cycle-scoped HTS lookup.
export const getPatientWideHivStatus = async (patientUuid, pmtctCycleUuid) => {
  if (!patientUuid || !pmtctCycleUuid) return null;
  try {
    const response = await axios.get(
      `${baseUrl}pmtct/anc/patient-hiv-summary?patientUuid=${patientUuid}&pmtctCycleUuid=${pmtctCycleUuid}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response?.data || null;
  } catch (error) {
    // Best-effort — a failed check must never block the normal save/routing flow.
    return null;
  }
};

// Same "positive" interpretation used elsewhere (e.g. SubMenu.js's checkPositive) — treats
// "reactive" as positive but excludes "non-reactive"/"non reactive".
export const isKnownPositiveSummary = (summary) => {
  if (!summary) return false;
  if (summary.acuteHivInfectionDetected) return true;
  const status = String(summary.hivStatus || "").toLowerCase().trim();
  if (!status) return false;
  return (
    status.includes("positive") ||
    (status.includes("reactive") && !status.includes("non-reactive") && !status.includes("non reactive"))
  );
};

// Convenience wrapper for the routing gates: fetch + interpret in one call.
export const isPatientAlreadyKnownPositive = async (patientUuid, pmtctCycleUuid) => {
  const summary = await getPatientWideHivStatus(patientUuid, pmtctCycleUuid);
  return isKnownPositiveSummary(summary);
};

// LV3-1965 Flow A2 / A2b: silently attaches pmtctCycleUuid to any external HTS-module record
// (Setting = ANC or L&D) that the mapping rule says belongs to a cycle that was just created,
// so it shows up in that cycle's history without anyone re-entering it. Called right after ANC
// Enrolment save (branch: "anc") or a Labour & Delivery entry-point save (branch: "delivery") -
// never for a routine delivery on an already-ANC-enrolled cycle, since that scenario was ruled
// out (see the design doc's "Ruled out" note on the original Flow B).
//
// pmtct_hts is deliberately left untouched on every record this syncs - it stays false, since
// nobody reviewed the record the way a provider reviews an adopted positive record via
// checkPriorHtsPositiveRecord below. The six PMTCT-side queries that used to require
// pmtct_hts = true were relaxed instead (HtsEncounterProxyRepository, PMTCT-Module) so the
// cycle match alone is sufficient.
//
// Best-effort throughout: a failure here must never block the ANC/Delivery save the caller just
// completed. Errors are swallowed and logged to the console, not surfaced to the user.
export const syncExternalHtsRecordsToCycle = async (patientUuid, pmtctCycleUuid, branch, anchorDate) => {
  if (!patientUuid || !pmtctCycleUuid || !anchorDate) return;

  const candidateEndpoint =
    branch === "delivery"
      ? `${baseUrl}pmtct/anc/hts-delivery-sync-candidates?patientUuid=${patientUuid}&dateOfDelivery=${anchorDate}`
      : `${baseUrl}pmtct/anc/hts-anc-sync-candidates?patientUuid=${patientUuid}&dateOfEnrollment=${anchorDate}`;

  let candidateIds = [];
  try {
    const response = await axios.get(candidateEndpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    candidateIds = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    return;
  }
  if (candidateIds.length === 0) return;

  for (const id of candidateIds) {
    try {
      // Fetch the record whole, directly from HTS-Module's own GET - same source
      // checkPriorHtsPositiveRecord (PmtctHtsForm.js) already trusts for this exact purpose.
      const getResponse = await axios.get(`${baseUrl}hts-encounter/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const record = getResponse?.data;
      if (!record) continue;

      // Full reconstruction, not a partial update - HTS-Module's PUT rebuilds the entire
      // observation column from whatever's in the request body, so anything omitted here
      // would be silently wiped. Spreading record.observation first preserves every custom
      // field HTS captured that this sync has no reason to touch; the explicit top-level
      // fields below round-trip unchanged; pmtctCycleUuid is the one real change.
      const putBody = {
        ...(record.observation || {}),
        dateOfVisit: record.dateOfVisit,
        clientCode: record.clientCode,
        setting: record.setting,
        facilityId: record.facilityId,
        pmtctHts: record.pmtctHts,
        source: record.source,
        longitude: record.longitude,
        latitude: record.latitude,
        pmtctCycleUuid: pmtctCycleUuid,
      };

      await axios.put(`${baseUrl}hts-encounter/${id}`, putBody, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      // Best-effort per record - one failure must not stop the rest of the batch, and must
      // never surface to the user or block the save flow that triggered this sync.
    }
  }
};



