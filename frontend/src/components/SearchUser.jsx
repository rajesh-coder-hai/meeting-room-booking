import React, { useState, useEffect, useCallback } from "react";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import { debounce } from "lodash";
import { searchUsers } from "../api/api";

const icon = <Checkbox style={{ marginRight: 8 }} />;
const checkedIcon = <Checkbox checked style={{ marginRight: 8 }} />;

export default function SearchUser() {
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users from Microsoft Graph API
  const fetchUsers = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const {data} = await searchUsers(query);
    //   const data = await response.json();
      if (data.length) {
        setSearchResult(
          data.map((user) => ({
            displayName: user.displayName,
            mail: user.mail,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  // Debounce API call to prevent excessive requests
  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  // Handle input change
  const handleInputChange = (event, value) => {
    setSearchText(value);
    debouncedFetchUsers(value);
  };

  return (
    <Autocomplete
    className="w-full mb-4"
      multiple
      id="checkboxes-ms-user"
      options={searchResult}
      getOptionLabel={(option) => `${option.displayName} (${option.mail})`}
      disableCloseOnSelect
      loading={loading}
      noOptionsText="No users found"
      onInputChange={handleInputChange}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              checked={selected}
            />
            {option.displayName} ({option.mail})
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search attendees"
          placeholder="Enter name"
          variant="standard"
        />
      )}
    />
  );
}
