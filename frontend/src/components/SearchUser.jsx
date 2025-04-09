import React, { useCallback, useState, useEffect } from "react";
import { Autocomplete } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import {
  Chip,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { debounce } from "lodash";
import { searchUsers } from "../api/api";

export default function SearchUser({ options, value, onChange }) {
  const [selectedValues, setSelectedValues] = useState(value || []); // Initialize with value if passed
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update selectedValues if `value` prop changes
  useEffect(() => {
    if (value) {
      setSelectedValues(value);
    }
  }, [value]);

  // Handle change in selection
  const handleSelectionChange = (event, newSelection) => {
    setSelectedValues(newSelection);
    onChange(newSelection); // Pass updated selection to parent component
  };

  // Fetch users from the API
  const fetchUsers = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await searchUsers(query);
      if (data.length) {
        setSearchResult(
          data.map((user) => ({
            displayName: user.displayName,
            mail: user.mail,
            id: user.id,
            firstName: user.displayName.split(" ")[0], // Assume first name is first word
            lastName: user.displayName.split(" ")[1], // Assume last name is second word
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  // Debounced API call to prevent excessive requests
  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  // Handle input change
  const handleInputChange = (event, value) => {
    setSearchText(value);
    debouncedFetchUsers(value);
  };

  // Get user's initials from display name
  const getInitials = (name) => {
    const nameParts = name.split(" ");
    const initials =
      nameParts.length >= 2
        ? nameParts[0][0] + nameParts[1][0]
        : nameParts[0][0];
    return initials.toUpperCase();
  };

  return (
    <Autocomplete
      multiple
      size="small"
      variant="standard"
      id="multi-select-dropdown"
      options={searchResult}
      limitTags={5}
      sx={{ minWidth: 300, width: 400 }}
      // fullWidth
      getOptionLabel={(option) => `${option.displayName} (${option.mail})`}
      value={selectedValues}
      onChange={handleSelectionChange}
      disableCloseOnSelect
      loading={loading}
      onInputChange={handleInputChange}
      noOptionsText="No users found"
      renderInput={(params) => (
        <TextField {...params} label="Search Users" placeholder="Search" />
      )}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option, { selected }) => (
        <ListItem {...props} button selected={selected}>
          <ListItemAvatar>
            <Avatar>{getInitials(option.displayName)}</Avatar>{" "}
            {/* Display initials */}
          </ListItemAvatar>
          <ListItemText primary={`${option.displayName} (${option.mail})`} />
          <Checkbox checked={selected} />
        </ListItem>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option.displayName}
            {...getTagProps({ index })}
            style={{ margin: 2 }}
            key={option.id}
          />
        ))
      }
    />
  );
}
