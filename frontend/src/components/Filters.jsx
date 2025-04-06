import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Slider,
  Typography,
  FormControl, // Import FormControl
  InputLabel, // Import InputLabel
  Button,
  Stack, // Import Stack for layout
  CircularProgress,
  Alert,
  Chip, // For displaying selected items in Select
  Divider,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import RestartAltIcon from "@mui/icons-material/RestartAlt"; // Reset Icon
import { getFilterConfigForRoom } from "../api/api"; // Assuming correct API function

const Filters = ({
  filterName = "roomFilter",
  appliedFilters = {}, // Receive currently applied filters from parent
  onApplyFilters, // Renamed prop: called when user clicks "Apply"
}) => {
  const [configData, setConfigData] = useState({});
  const [filterValues, setFilterValues] = useState({}); // Local state for user selections
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);

  // --- Fetch Configuration ---
  const fetchFilterConfig = useCallback(async () => {
    setLoadingConfig(true);
    setConfigError(null);
    try {
      const { data } = await getFilterConfigForRoom(filterName);
      if (data?.configData) {
        setConfigData(data.configData);
        // Initialize local filter values after config is fetched
        initializeLocalFilters(data.configData, appliedFilters);
      } else {
        throw new Error("Invalid configuration format received.");
      }
    } catch (error) {
      console.error("Error while fetching filter config:", error);
      setConfigError(error.message || "Failed to load filter configuration.");
    } finally {
      setLoadingConfig(false);
    }
  }, [filterName]); // Refetch if filterName changes

  // --- Initialize Local State ---
  const initializeLocalFilters = (config, currentAppliedFilters) => {
    const initialValues = {};
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        // Prioritize applied filter value, otherwise use config default/initial
        initialValues[key] =
          currentAppliedFilters[key] !== undefined
            ? currentAppliedFilters[key]
            : config[key].value; // Use 'value' from config as default
      }
    }
    setFilterValues(initialValues);
  };

  // --- Fetch config on mount ---
  useEffect(() => {
    fetchFilterConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFilterConfig]); // Run fetchConfig once

  // --- Re-initialize if appliedFilters from parent change externally ---
  useEffect(() => {
    if (Object.keys(configData).length > 0) {
      // Only run if config is loaded
      initializeLocalFilters(configData, appliedFilters);
    }
  }, [appliedFilters, configData]); // Watch for external changes

  // --- Handlers for Local State Update ---
  const handleCheckboxChange = (key) => (event) => {
    setFilterValues((prev) => ({ ...prev, [key]: event.target.checked }));
  };

  const handleMultiSelectChange = (key) => (event) => {
    const {
      target: { value },
    } = event;
    setFilterValues((prev) => ({
      ...prev,
      // On autofill we get a stringified value.
      [key]: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // Use onChangeCommitted for Slider to update state only when dragging stops
  const handleSliderChangeCommitted = (key) => (_, newValue) => {
    setFilterValues((prev) => ({ ...prev, [key]: newValue }));
  };

  // --- Apply & Reset Actions ---
  const handleApplyClick = () => {
    onApplyFilters(filterValues); // Pass local state to parent
  };

  const handleResetClick = () => {
    // Reset local state back to config defaults
    initializeLocalFilters(configData, {}); // Reset using empty appliedFilters
    // Optionally: Immediately apply the reset filters
    // onApplyFilters(initialValuesFromConfig); // Need to recalculate defaults here
  };

  // --- Render Logic ---
  if (loadingConfig) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (configError) {
    return (
      <Alert severity="error">Could not load filters: {configError}</Alert>
    );
  }

  if (Object.keys(configData).length === 0) {
    return (
      <Typography sx={{ p: 2, color: "text.secondary" }}>
        No filter options available.
      </Typography>
    );
  }

  return (
    // Use Stack for vertical spacing of filter groups
    <Stack spacing={3} sx={{ p: 1 }}>
      {/* Header moved to Drawer in parent */}
      {/* <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TuneIcon sx={{ color: "primary.main", mr: 1 }} />
                Filters
            </Typography> */}

      {Object.entries(configData).map(([key, config]) => (
        <Box key={key}>
          {/* --- Checkbox --- */}
          {config.component === "checkbox" && config.type === "boolean" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterValues[key] ?? false} // Use ?? for default false
                  onChange={handleCheckboxChange(key)}
                  size="small"
                />
              }
              // Use displayName from config, fallback to key
              label={
                config.displayName || key.charAt(0).toUpperCase() + key.slice(1)
              }
            />
          )}

          {/* --- Multi-Select Dropdown --- */}
          {config.component === "dropdown" && config.multiSelect === true && (
            <FormControl fullWidth size="small">
              {" "}
              {/* Use FormControl for label and structure */}
              <InputLabel id={`${key}-multi-select-label`}>
                {config.displayName ||
                  key.charAt(0).toUpperCase() + key.slice(1)}
              </InputLabel>
              <Select
                multiple
                labelId={`${key}-multi-select-label`}
                id={key}
                value={filterValues[key] || []} // Ensure value is always an array
                onChange={handleMultiSelectChange(key)}
                label={
                  config.displayName ||
                  key.charAt(0).toUpperCase() + key.slice(1)
                } // Required for outlined variant label positioning
                // Render selected values as Chips
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map(
                      (
                        value // Type assertion if using TS
                      ) => (
                        <Chip key={value} label={value} size="small" />
                      )
                    )}
                  </Box>
                )}
              >
                {/* Check if options exist */}
                {config.options &&
                  config.options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}

          {/* --- Range Slider --- */}
          {config.component === "range" && config.type === "number" && (
            <Box sx={{ px: 1 }}>
              {" "}
              {/* Add padding for slider */}
              <Typography gutterBottom id={`${key}-range-slider-label`}>
                {config.displayName ||
                  key.charAt(0).toUpperCase() + key.slice(1)}
              </Typography>
              <Slider
                value={
                  filterValues[key] || [config.min ?? 0, config.max ?? 100]
                } // Default from config if not set
                // Use onChangeCommitted to update state only when user stops sliding
                onChangeCommitted={handleSliderChangeCommitted(key)}
                valueLabelDisplay="auto"
                min={config.min ?? 0} // Use nullish coalescing for defaults
                max={config.max ?? 100}
                step={config.step || 1} // Add step from config if available
                disableSwap // Prevent handles from crossing
                aria-labelledby={`${key}-range-slider-label`}
              />
            </Box>
          )}
          {/* Add rendering for other component types if needed */}
        </Box>
      ))}

      {/* Action Buttons */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          variant="text"
          size="small"
          onClick={handleResetClick}
          startIcon={<RestartAltIcon />}
        >
          Reset
        </Button>
        <Button variant="contained" size="small" onClick={handleApplyClick}>
          Apply Filters
        </Button>
      </Stack>
    </Stack>
  );
};

export default Filters;
