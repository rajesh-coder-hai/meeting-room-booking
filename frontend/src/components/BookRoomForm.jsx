import React, { useCallback, useState, useEffect } from "react";
import { Formik, Form } from "formik"; // Keep Formik core
import * as Yup from "yup";
import moment from "moment";
import { useDispatch } from "react-redux";
import { showErrorToast, showSuccessToast } from "../store/slices/sharedSlice";
import { bookRoom } from "../api/api"; // Keep your API call

// MUI Imports
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch, // Use Switch instead of Checkbox for 'All Day'
  Button,
  Box,
  FormHelperText, // For displaying errors with Select
  CircularProgress,
  Grid2,
} from "@mui/material";

// Your Child Components (ASSUMING they are also refactored/compatible)
import SearchUser from "./SearchUser";
import Favorites from "./Favourite";

// Helper function (keep as is)
function getFloorName(floorNumber) {
  if (floorNumber == null || floorNumber === undefined) return ""; // Handle null/undefined
  if (floorNumber === 0) return "Ground";
  if (floorNumber === -1) return "Lower ground";
  const n = Math.abs(floorNumber);
  const suffix = ["th", "st", "nd", "rd"][
    n % 100 > 3 && n % 100 < 21 ? 0 : n % 10 < 4 ? n % 10 : 0
  ];
  return `${n}${suffix} floor`;
}

const BookRoomForm = ({
  rooms,
  handleRoomChange,
  currentRoomId,
  handleNewBookingSchedule,
}) => {
  const dispatch = useDispatch();
  // Manage selected attendees state here, passed to SearchUser/Favorites
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  // Form submission logic (keep as is, maybe slight payload adjustment if needed)
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log("Form Values:", values);
      const payload = {
        subject: values.title,
        location:
          rooms.find((r) => r._id === values.roomId)?.roomName ||
          "Meeting Room", // Get location name
        startDateTime: moment(values.startTime).toISOString(), // Send ISO UTC
        endDateTime: values.allDay
          ? moment(values.startTime).add(1, "day").startOf("day").toISOString()
          : moment(values.endTime).toISOString(), // Handle allDay end time
        isAllDay: values.allDay,
        attendees: selectedAttendees.map((a) => ({
          email: a.mail,
          name: a.displayName,
          id: a.id,
        })), // Send required attendee info
        description: values.description || "",
        teamName: values.teamName || "",
        // No need to send timezone if sending ISO strings (they imply UTC or have offset)
      };
      // --- IMPORTANT: Backend needs userId and accessToken ---
      // This component doesn't have direct access. The API call needs modification
      // or these need to be passed down/retrieved differently.
      // Assuming bookRoom injects them or is modified.
      const { data: newEventData } = await bookRoom(payload); // Assuming bookRoom now handles userId/token

      handleNewBookingSchedule(payload, newEventData); // Pass original payload and event data
      dispatch(showSuccessToast("Room booked successfully!"));
      resetForm(); // Clear form on success
      setSelectedAttendees([]); // Clear attendees
    } catch (error) {
      console.error("Booking Error:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "An error occurred!";
      dispatch(showErrorToast(errorMsg));
    } finally {
      setSubmitting(false);
    }
  };

  // Attendee selection handler (keep as is)
  const handleAttendeeChange = useCallback((updatedAttendees) => {
    console.log(
      "Selected attendees updated in BookRoomForm:",
      updatedAttendees
    );
    setSelectedAttendees(updatedAttendees);
  }, []);

  // Validation Schema (keep as is, but refine date validation message)
  const BookRoomSchema = Yup.object().shape({
    roomId: Yup.string().required("Please select a room"),
    allDay: Yup.boolean().default(false),
    startTime: Yup.date()
      .typeError("Invalid start date/time")
      .required("Start time is required")
      .min(new Date(), "Start time cannot be in the past"), // Add min date validation
    endTime: Yup.date()
      .typeError("Invalid end date/time")
      .when("allDay", {
        is: false, // Only require end time if NOT all day
        then: (schema) =>
          schema
            .required("End time is required")
            .min(Yup.ref("startTime"), "End time must be after start time"), // End must be after start
        otherwise: (schema) => schema.notRequired(),
      }),
    title: Yup.string()
      .min(2, "Title is too short")
      .max(150, "Title is too long")
      .required("Meeting title is required"),
    description: Yup.string().max(1000, "Description is too long"),
    teamName: Yup.string().max(50, "Team name is too long"), // Increased limit slightly
  });

  // Handler for selecting attendees from a favorite list
  const chooseAttendeeFromFavorite = useCallback(
    (attendeesFromFavorite) => {
      // Combine unique attendees from current selection and favorite list
      const combined = [...selectedAttendees];
      attendeesFromFavorite.forEach((favAttendee) => {
        if (
          !combined.some((selAttendee) => selAttendee.id === favAttendee.id)
        ) {
          combined.push({
            // Ensure structure matches SearchUser output
            id: favAttendee.id,
            mail: favAttendee.email,
            displayName: favAttendee.displayName,
          });
        }
      });
      handleAttendeeChange(combined);
    },
    [selectedAttendees, handleAttendeeChange]
  );

  // Set initial values dynamically based on currentRoomId
  const initialValues = {
    roomId: currentRoomId || "",
    // Default start time to next nearest 30-min slot
    startTime: moment()
      .add(30 - (moment().minute() % 30), "minutes")
      .format("YYYY-MM-DDTHH:mm"),
    // Default end time 30 mins after start time
    endTime: moment()
      .add(30 - (moment().minute() % 30) + 30, "minutes")
      .format("YYYY-MM-DDTHH:mm"),
    allDay: false,
    title: "",
    description: "",
    teamName: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={BookRoomSchema}
      onSubmit={handleSubmit}
      enableReinitialize // Important to update initialValues if currentRoomId changes
    >
      {/* Use Formik's render prop pattern */}
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        isSubmitting,
        isValid,
        dirty,
        resetForm,
      }) => (
        <Form>
          {/* Grid container for overall form layout */}
          <Grid2 container spacing={3}>
            {/* Attendee Search and Favorites Section */}
            <Grid2 item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box sx={{ flexGrow: 1, width: "100%" }}>
                  <SearchUser
                    value={selectedAttendees} // Controlled component
                    onChange={(newAttendees) => {
                      // Directly use the callback from props
                      handleAttendeeChange(newAttendees);
                    }}
                  />
                </Box>
                <Box sx={{ flexShrink: 0, mt: { xs: 2, sm: 0 } }}>
                  {/* Pass the handler to apply selected favorites */}
                  <Favorites onSelectAttendees={chooseAttendeeFromFavorite} />
                </Box>
              </Box>
            </Grid2>

            {/* Room Selection */}
            <Grid2 item xs={12} sm={6} md={4}>
              <FormControl
                fullWidth
                error={touched.roomId && Boolean(errors.roomId)}
              >
                <InputLabel id="room-select-label">Select Room *</InputLabel>
                <Select
                  labelId="room-select-label"
                  id="roomId"
                  name="roomId"
                  value={values.roomId}
                  label="Select Room *"
                  onChange={(e) => {
                    const selectedRoomId = e.target.value;
                    handleChange(e); // Let Formik handle its state
                    handleRoomChange(selectedRoomId); // Call parent callback
                  }}
                  onBlur={handleBlur}
                >
                  <MenuItem value="" disabled>
                    <em>Select a meeting room</em>
                  </MenuItem>
                  {rooms.map((room) => (
                    <MenuItem key={room._id} value={room._id}>
                      {`${room.roomName} - ${getFloorName(room.floorNo)}`}
                    </MenuItem>
                  ))}
                </Select>
                {touched.roomId && errors.roomId && (
                  <FormHelperText>{errors.roomId}</FormHelperText>
                )}
              </FormControl>
            </Grid2>

            {/* Start Time */}
            <Grid2 item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="startTime"
                name="startTime"
                label="Start Time *"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={values.startTime}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.startTime && Boolean(errors.startTime)}
                helperText={touched.startTime && errors.startTime}
                inputProps={{
                  min: moment().format("YYYY-MM-DDTHH:mm"), // Restrict past dates/times
                }}
              />
            </Grid2>

            {/* End Time (Conditionally Rendered) */}
            {!values.allDay && (
              <Grid2 item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  id="endTime"
                  name="endTime"
                  label="End Time *"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={values.endTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.endTime && Boolean(errors.endTime)}
                  helperText={touched.endTime && errors.endTime}
                  disabled={values.allDay}
                  inputProps={{
                    min:
                      values.startTime || moment().format("YYYY-MM-DDTHH:mm"), // End must be after start
                  }}
                />
              </Grid2>
            )}

            {/* All Day Switch */}
            <Grid2
              item
              xs={12}
              sm={values.allDay ? 12 : 6}
              md={values.allDay ? 12 : 4}
            >
              {" "}
              {/* Adjust width if EndTime hidden */}
              <FormControlLabel
                control={
                  <Switch
                    id="allDay"
                    name="allDay"
                    checked={values.allDay}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFieldValue("allDay", isChecked);
                      if (isChecked) {
                        setFieldValue("endTime", ""); // Clear end time if all day
                      } else {
                        // Set default end time if switching back from all day
                        setFieldValue(
                          "endTime",
                          moment(values.startTime)
                            .add(30, "minutes")
                            .format("YYYY-MM-DDTHH:mm")
                        );
                      }
                    }}
                  />
                }
                label="All Day Event"
              />
            </Grid2>

            {/* Meeting Title */}
            <Grid2 item xs={12} sm={6}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Meeting Title *"
                placeholder="e.g., Project Kick-off"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
              />
            </Grid2>

            {/* Description */}
            <Grid2 item xs={12} sm={6}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                placeholder="Meeting agenda or notes"
                multiline
                rows={3} // Adjust rows as needed
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
            </Grid2>

            {/* Team Name (Optional) */}
            <Grid2 item xs={12} sm={6}>
              <TextField
                fullWidth
                id="teamName"
                name="teamName"
                label="Team Name (Optional)"
                placeholder="e.g., Marketing Team"
                value={values.teamName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.teamName && Boolean(errors.teamName)}
                helperText={touched.teamName && errors.teamName}
              />
            </Grid2>

            {/* Action Buttons */}
            <Grid2 item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!dirty || !isValid || isSubmitting} // Disable if form not touched, invalid, or submitting
                >
                  {isSubmitting ? <CircularProgress size={24} /> : "Book Room"}
                </Button>
                <Button
                  type="button" // Important: type="button" to prevent form submission
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    resetForm(); // Reset Formik state
                    setSelectedAttendees([]); // Reset local attendee state
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Grid2>
          </Grid2>
        </Form>
      )}
    </Formik>
  );
};

export default BookRoomForm;
