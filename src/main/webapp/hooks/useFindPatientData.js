import axios from "axios";
import { useCallback } from "react";
import { calculate_age } from "../utils";

export const useFindPatientData = (baseUrl, token) => {
  const fetchPatients = useCallback(
    async (query) => {
      try {
        const response = await axios.get(
          `${baseUrl}hiv/patients?pageSize=${query.pageSize}&pageNo=${query.page}&searchValue=${query.search}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mappedData = response.data.records.map((row) => ({
          ...row,
          age: calculate_age(row.dateOfBirth),
        }));

        return {
          data: mappedData,
          page: query.page,
          totalCount: response.data.totalRecords,
        };
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        return { data: [], page: 0, totalCount: 0 };
      }
    },
    [baseUrl, token]
  );

  return { fetchPatients };
};
