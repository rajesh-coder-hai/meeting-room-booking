import React, { useState, useRef, useEffect } from "react";

const DebouncedSearch = ({ onSearch, delay = 500 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTimeout = useRef(null);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
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
    <input
      type="search"
      className="form-control"
      id="searchRoom"
      aria-describedby="search meeting room"
      placeholder="Search Meeting Room..."
      value={searchTerm}
      onChange={handleInputChange}
    />
  );
};

export default DebouncedSearch;
