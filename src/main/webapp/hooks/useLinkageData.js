import { useCallback } from "react";
import axios from "axios";

export const useLinkageData = (baseUrl, token) => {
  const formattedDate = (inputDate) => {
    const dateObject = new Date(inputDate);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchLinkages = useCallback(
    async (query) => {
      try {
        const response = await axios.get(`${baseUrl}linkages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedData = response.data.map((row) => ({
          name: row.lastName,
          artNumber: row.artNumber,
          caregiverOtherName: row.caregiverOtherName,
          caregiverSurname: row.caregiverSurname,
          cboName: row.cboName,
          enrolledInOvcProgram: row.enrolledInOvcProgram,
          createdDate: formattedDate(row.createdDate),
          originalData: row, 
        }));

        return {
          data: formattedData,
          page: query?.page || 0,
          totalCount: formattedData.length,
        };
      } catch (error) {
        console.error("Failed to fetch linkages:", error);
        return {
          data: [],
          page: 0,
          totalCount: 0,
        };
      }
    },
    [baseUrl, token]
  );

  return { fetchLinkages };
};
