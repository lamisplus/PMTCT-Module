import { useCallback } from "react";
import axios from "axios";

export const usePatientData = (baseUrl, token) => {
  const fetchPatients = useCallback(
    async (query) => {
      try {
        const { data: response } = await axios.get(
          `${baseUrl}hiv/patient/enrollment/list`,
          {
            params: {
              pageSize: query.pageSize,
              pageNo: query.page,
              searchValue: query.search,
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        return {
          data: response.records,
          page: query.page,
          totalCount: response.totalRecords,
        };
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        throw new Error("Failed to fetch patients");
      }
    },
    [baseUrl, token]
  );

  return { fetchPatients };
};
