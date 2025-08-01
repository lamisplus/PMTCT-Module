import React, { useState, useCallback } from "react";

import AsyncSelect from "react-select/async";
import axios from "axios";
import { token, url as baseUrl } from "../../../api";

const FacilitySearchDropdown = ({
  value,
  onChange,
  name,
  placeholder = "Search for a facility...",
  isDisabled = false,
  error = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Load initial options (first 50 facilities)
  const loadInitialOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}organisation-units/search?size=10&page=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLoading(false);
      return response.data.content.map((facility) => ({
        value: facility.name,
        label: facility.name,
        facility: facility,
      }));
    } catch (error) {
      setIsLoading(false);
      console.error("Error loading initial facilities:", error);
      return [];
    }
  }, []);

  // Search facilities based on input
  const loadOptions = useCallback(async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      return loadInitialOptions();
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}organisation-units/search?search=${encodeURIComponent(
          inputValue
        )}&size=50&page=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLoading(false);
      return response.data.content.map((facility) => ({
        value: facility.name,
        label: facility.name,
        facility: facility,
      }));
    } catch (error) {
      setIsLoading(false);
      console.error("Error searching facilities:", error);
      return [];
    }
  }, []);

  const handleChange = (selectedOption) => {
    if (onChange) {
      // Create a synthetic event to match the expected format
      const syntheticEvent = {
        target: {
          name: name,
          value: selectedOption ? selectedOption.label : "",
        },
      };
      onChange(syntheticEvent);
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "41px",
      borderRadius: "0.25rem",
      border: error ? "1px solid #f85032" : "1px solid #014d88",
      "&:hover": {
        border: error ? "1px solid #f85032" : "1px solid #014d88",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#014d88"
        : state.isFocused
        ? "#e3f2fd"
        : "white",
      color: state.isSelected ? "white" : "#014d88",
      "&:hover": {
        backgroundColor: state.isSelected ? "#014d88" : "#e3f2fd",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: "#014d88",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: "#014d88",
    }),
  };

  return (
    <div>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={value ? { value: value, label: value } : null}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isLoading={isLoading}
        loadingMessage={() => "Loading facilities..."}
        noOptionsMessage={() => "No facilities found"}
        styles={customStyles}
        isClearable
        isSearchable
      />
      {error && (
        <span style={{ color: "#f85032", fontSize: "12.8px" }}>{error}</span>
      )}
    </div>
  );
};

export default FacilitySearchDropdown;
