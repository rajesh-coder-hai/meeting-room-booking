import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

function MeetingLinks({ outlookWebLink, teamsJoinUrl }) {
  const [copiedLinkType, setCopiedLinkType] = useState(null); // 'outlook', 'teams', or null

  const handleOpenLink = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyLink = async (url, type) => {
    if (!url || !navigator.clipboard) {
      console.error("Clipboard API not available or URL is missing.");
      // Optionally show an error message to the user
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkType(type); // Set which link was copied
      // Reset the "copied" state after a short delay
      setTimeout(() => setCopiedLinkType(null), 2000); // Hide tooltip after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Optionally show an error message to the user
    }
  };

  return (
    <Box
      sx={{
        my: 2,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Meeting Links
      </Typography>
      <Stack spacing={2} direction={"row"}>
        {/* Outlook Link */}
        {/* --- Modified Outlook Link --- */}
        {outlookWebLink && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              // Use an <img> tag for the icon from the public folder
              startIcon={
                <img
                  src="/outlook.svg" // <-- IMPORTANT: Absolute path from public root
                  alt="Outlook icon"
                  width="20" // Adjust size as needed
                  height="20"
                  style={{ marginRight: "8px" }} // Add some space like MUI icons do
                />
              }
              onClick={() => handleOpenLink(outlookWebLink)}
              disabled={!outlookWebLink}
              sx={{
                bgcolor: "#0078D4",
                "&:hover": { bgcolor: "#005a9e" },
                flexGrow: 1,
                // Adjust padding if needed to accommodate the img icon naturally
                // paddingLeft: '12px'
              }} // Outlook blue
            >
              Open in Outlook
            </Button>
            <Tooltip
              title={
                copiedLinkType === "outlook" ? "Copied!" : "Copy Outlook Link"
              }
              open={copiedLinkType === "outlook"}
              placement="top"
              arrow
            >
              <span>
                <IconButton
                  aria-label="Copy Outlook Link"
                  onClick={() => handleCopyLink(outlookWebLink, "outlook")}
                  disabled={!outlookWebLink}
                  color="primary"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )}
        {/* --- End Modified Outlook Link --- */}

        {/* Teams Link */}
        {teamsJoinUrl && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={
                <img
                  src="/msTeams.png" // <-- IMPORTANT: Absolute path from public root
                  alt="Ms Teams icon"
                  width="20" // Adjust size as needed
                  height="20"
                  style={{ marginRight: "8px" }} // Add some space like MUI icons do
                />
              }
              onClick={() => handleOpenLink(teamsJoinUrl)}
              disabled={!teamsJoinUrl}
              sx={{
                bgcolor: "#6264A7",
                "&:hover": { bgcolor: "#464775" },
                flexGrow: 1,
              }} // Teams purple
            >
              Join Teams Meeting
            </Button>
            <Tooltip
              title={copiedLinkType === "teams" ? "Copied!" : "Copy Teams Link"}
              open={copiedLinkType === "teams"} // Control tooltip visibility
              placement="top"
              arrow
            >
              {/* Add span for Tooltip ref when button is disabled */}
              <span>
                <IconButton
                  aria-label="Copy Teams Link"
                  onClick={() => handleCopyLink(teamsJoinUrl, "teams")}
                  disabled={!teamsJoinUrl}
                  sx={{ color: "#6264A7" }} // Match Teams color
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )}

        {!outlookWebLink && !teamsJoinUrl && (
          <Typography variant="body2" color="text.secondary">
            No meeting links available.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default MeetingLinks;
