import { useEffect, useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Slider,
  Typography,
} from "@mui/material";
import { debounce } from "lodash";
import { getFilterConfigForRoom } from "../api/api";
import TuneIcon from "@mui/icons-material/Tune";

const Filters = ({ filterName = "roomFilter", onFilterChange }) => {
  const [configData, setConfigData] = useState({});
  const [filterValues, setFilterValues] = useState({});

  async function fetchFilterConfig() {
    try {
      const { data } = await getFilterConfigForRoom(filterName);
      setConfigData(data.configData);
    } catch (error) {
      console.log("Error while fetching filter config:", error);
    }
  }

  useEffect(() => {
    fetchFilterConfig();
  }, []);

  const handleCheckboxChange = (key) => (event) => {
    const updatedValue = { ...filterValues, [key]: event.target.checked };
    setFilterValues(updatedValue);
    onFilterChange(updatedValue);
  };

  const handleMultiSelectChange = (key) => (event) => {
    const updatedValue = { ...filterValues, [key]: event.target.value };
    setFilterValues(updatedValue);
    onFilterChange(updatedValue);
  };

  const handleSliderChange = (key) =>
    debounce((_, newValue) => {
      const updatedValue = { ...filterValues, [key]: newValue };
      setFilterValues(updatedValue);
      onFilterChange(updatedValue);
    }, 300);

  return (
    <div>
      <Typography variant="h6" fontWeight="bold">
        <span>
          <TuneIcon sx={{ color: "#1976d2", mr: 1 }} />
        </span>
        Filters
      </Typography>
      {Object.entries(configData).map(([key, value]) => (
        <div key={key}>
          {value.type === "boolean" && value.component === "checkbox" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterValues[key] || false}
                  onChange={handleCheckboxChange(key)}
                />
              }
              label={value.displayName}
            />
          )}

          {value.component === "dropdown" && value.multiSelect === true && (
            <FormGroup>
              <Typography>{value.displayName}</Typography>
              <Select
                multiple
                value={filterValues[key] || []}
                onChange={handleMultiSelectChange(key)}
                displayEmpty
                fullWidth
              >
                {value.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormGroup>
          )}

          {value.component === "range" && value.type === "number" && (
            <FormGroup>
              <Typography>{value.displayName}</Typography>
              <Slider
                value={filterValues[key] || [value.min, value.max]}
                onChange={handleSliderChange(key)}
                valueLabelDisplay="auto"
                min={value.min}
                max={value.max}
              />
            </FormGroup>
          )}
        </div>
      ))}
    </div>
  );
};

export default Filters;
