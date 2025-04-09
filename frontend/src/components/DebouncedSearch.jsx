import React, { useState, useRef, useEffect } from "react";
import { TextField, useTheme } from "@mui/material";

const DebouncedSearch = ({ onSearch, delay = 500 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTimeout = useRef(null);
  const theme = useTheme();

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (debouncedTimeout.current) {
      clearTimeout(debouncedTimeout.current);
    }

    debouncedTimeout.current = setTimeout(() => {
      onSearch(searchTerm);
    }, delay);

    return () => {
      if (debouncedTimeout.current) {
        clearTimeout(debouncedTimeout.current);
      }
    };
  }, [searchTerm, onSearch, delay]);

  return (
    <TextField
      type="search"
      value={searchTerm}
      onChange={handleInputChange}
      label="Search Meeting Room"
      variant="standard"
      fullWidth
      size="small"
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 2,
        input: {
          color: theme.palette.text.primary,
        },
        "& .MuiOutlinedInput-root": {
          backgroundColor: theme.palette.background.paper,
        },
      }}
    />
  );
};

export default DebouncedSearch;
