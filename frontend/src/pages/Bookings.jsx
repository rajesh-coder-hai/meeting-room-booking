import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";

// --- MUI Imports ---
import CloseIcon from "@mui/icons-material/Close"; // For Dialog close button
import {
  Alert,
  Box,
  CircularProgress,
  Container, // Alias to avoid naming conflict if needed elsewhere
  Dialog, // For simple text inside dialog
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid2,
  IconButton,
  Button as MuiButton,
  Paper,
  Typography,
} from "@mui/material";
// --- End MUI Imports ---

// --- Your Component Imports ---
import BookRoomForm from "../components/BookRoomForm"; // ASSUMING this is refactored with MUI
// import Favorites from "../components/Favorites"; // ASSUMING you have this and it uses MUI
import MeetingLinks from "../components/MeetingLinks"; // ASSUMING this uses MUI
// --- End Your Component Imports ---

// --- Your API functions and Redux actions ---
import {
  cancelBooking,
  fetchRooms,
  getRoomBookingsByDateRange,
  updateBooking,
} from "../api/api";
import { showErrorToast, showSuccessToast } from "../store/slices/sharedSlice";
// --- End API/Redux ---

const Bookings = () => {
  const dispatch = useDispatch();

  const [searchParam, setSearchParam] = useSearchParams();
  const roomId = searchParam.get("roomId");
  const [currentMeetingRom, setCurrentMeetingRoom] = useState(roomId || ""); // Initialize with empty string if no roomID
  const calendarRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [timeRange, setTimeRange] = useState({ start: null, end: null });
  const [loadingCalendar, setLoadingCalendar] = useState(false); // Loading state for calendar
  const [formError, setFormError] = useState(null); // Error state specific to form/calendar loading

  // --- Define a color palette (use colors from your theme or define custom ones) ---
  const eventColorPalette = [
    "#1976d2", // MUI primary.main (Blue)
    "#0288d1", // MUI info.main (Light Blue)
    "#388e3c", // MUI success.main (Green)
    "#f57c00", // MUI warning.main (Orange)
    "#ab47bc", // MUI Purple
    "#00897b", // MUI Teal
    // Add more distinct professional colors if needed
  ];
  const eventBorderPalette = [
    // Slightly darker versions for borders
    "#115293",
    "#01579b",
    "#1b5e20",
    "#e65100",
    "#7b1fa2",
    "#004d40",
  ];
  // Simple hash function (can be improved if needed)
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  // -----------------------------------------------------------------------------

  const handleViewChange = useCallback((arg) => {
    setCurrentView(arg.view.type);
    setTimeRange((prev) => {
      const newRange = {
        start: moment(arg.start).format(),
        end: moment(arg.end).format(),
      };
      return prev.start !== newRange.start || prev.end !== newRange.end
        ? newRange
        : prev;
    });
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.setOption("events", events);
    }
  }, [events]);

  useEffect(() => {
    if (timeRange) {
      let apiIdentifier = getTimeFilter(timeRange);
      getRoomBookingsByDateRangeAPIcall(currentMeetingRom, apiIdentifier);
    }
  }, [timeRange]);

  function getTimeFilter(timeFilter) {
    let apiIdentifier = "week"; // Default
    if (timeFilter === "dayGridMonth") apiIdentifier = "month";
    else if (timeFilter === "timeGridDay") apiIdentifier = "day";
    else if (timeFilter === "timeGridWeek") apiIdentifier = "week";

    return apiIdentifier;
  }

  function getRoomAvailabilityByDateRange(roomId, timeFilter = currentView) {
    try {
      let apiIdentifier = getTimeFilter(timeFilter);

      getRoomBookingsByDateRangeAPIcall(roomId, apiIdentifier);
    } catch (error) {
      dispatch(
        showErrorToast(error.response.data.error || "An error occurred!")
      );
      console.log("Error from getMeetingRoomAvailability", error);
    }
  }

  async function getRoomBookingsByDateRangeAPIcall(roomId, apiIdentifier) {
    try {
      console.log("bhei dekh", { roomId, apiIdentifier });

      const { data: availability } = await getRoomBookingsByDateRange(
        roomId,
        apiIdentifier
      );

      const modifiedEvents = availability.map((booking, index) => {
        // Add index if needed
        // Determine color based on booking ID hash modulo palette size
        const colorIndex = simpleHash(booking._id) % eventColorPalette.length;
        const bgColor = eventColorPalette[colorIndex];
        // Use corresponding border or generate a darker shade
        const borderColor = eventBorderPalette[colorIndex]; //||          tinycolor(bgColor).darken(10).toString(); // Example using tinycolor

        // Determine if event is in the past
        const isPast = moment(booking.startDateTime).isBefore(moment());
        const finalBgColor = isPast ? "#adb5bd" : bgColor; // Use grey for past events
        const finalBorderColor = isPast ? "#6c757d" : borderColor;

        return {
          id: booking._id,
          title: booking.subject || "Booked",
          start: moment(booking.startDateTime).toISOString(),
          end: moment(booking.endDateTime).toISOString(),
          allDay: booking.isAllDay || false,
          backgroundColor: finalBgColor, // Use calculated color or grey
          borderColor: finalBorderColor, // Use calculated border or grey
          extendedProps: {
            _id: booking._id,
            description: booking.description,
            teamName: booking.teamName,
            // webLink: booking.webLink, // Fetch these if available
            // teamsLink: booking.teamsLink,
          },
        };
      }); // End map

      setEvents(modifiedEvents);
    } catch (error) {
      console.log("Error from getMeetingRoomAvailability", error);
    }
  }
  //dropdown for all meeting room
  const getAllMeetingRooms = async () => {
    try {
      const { data: rooms } = await fetchRooms();
      setRooms(rooms);
    } catch (error) {
      console.log("Error from getRooms", error);
    }
  };

  useEffect(() => {
    getAllMeetingRooms();
  }, []);

  const handleEventClick = (info) => {
    console.log("Event clicked:", info.event);

    const meetingData = {
      ...info.event._def.extendedProps,
      title: info.event._def.title,
      allDay: info.event._def.allDay,
    };
    console.log("Event clicked after:", meetingData);
    setModalEvent(meetingData);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
  };

  const handleEventDrop = async (info) => {
    try {
      if (new Date(info.event.start) < new Date()) {
        return info.revert(); // Prevent moving to past
      }

      const { _id: meetingId } = info.event.extendedProps;

      const updatedEvents = events.map((event) => {
        if (event.title === info.event.title) {
          return {
            ...event,
            start: moment(info.event.start).format(),
            end: info.event.end ? moment(info.event.end).format() : null,
          };
        }
        return event;
      });
      // update the meeting record and then update the state
      const myUpdatedEvent = updatedEvents.find(
        (event) => event._id === meetingId
      );
      await updateBooking(meetingId, {
        ...myUpdatedEvent,
      });

      setEvents(updatedEvents);
      dispatch(showSuccessToast("Booking updated successfully!"));
    } catch (error) {
      info.revert();
      console.log("Error from handleEventDrop", error);
      dispatch(
        showErrorToast(error.response.data.error || "An error occurred!")
      );
    }
  };

  const handleEventResize = async (info) => {
    console.log("Event resized:", info.event);

    try {
      if (new Date(info.event.end) <= new Date(info.event.start)) {
        return info.revert(); // Prevent shrinking end time before start
      }

      const { _id: meetingId } = info.event.extendedProps;
      const updatedEvents = events.map((event) => {
        if (event.title === info.event.title) {
          return {
            ...event,
            start: moment(info.event.start).format(),
            end: moment(info.event.end).format(),
          };
        }
        return event;
      });
      const myUpdatedEvent = updatedEvents.find(
        (event) => event._id === meetingId
      );
      console.log("myUpdatedEvent", myUpdatedEvent);

      await updateBooking(meetingId, {
        ...myUpdatedEvent,
      });

      setEvents(updatedEvents);
    } catch (error) {
      info.revert();
      console.log("Error from handleEventResize", error);
      dispatch(
        showErrorToast(error.response.data.error || "An error occurred!")
      );
    }
  };

  const handleNewBookingSchedule = (newBookingSchedule) => {
    const newBookingData = newBookingSchedule;
    console.log("New booking schedule", newBookingSchedule);
    const newEvent = {
      id: newBookingData._id, // Use the database ID as the FullCalendar event ID
      title: newBookingData.subject || "Booked", // Use subject as title, provide fallback
      start: moment(newBookingData.startDateTime).toISOString(), // Already ISO string (UTC)
      end: moment(newBookingData.endDateTime).toISOString(), // Already ISO string (UTC)
      allDay: newBookingData.isAllDay || false,
      backgroundColor: "#198754", // Use a distinct color for newly booked events (e.g., green)
      borderColor: "#146c43", // A slightly darker border
      extendedProps: {
        _id: newBookingData._id, // Keep DB ID accessible
        description: newBookingData.description,
        teamName: newBookingData.teamName,
      },
    };
    // 4. Update the events state using the functional form
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  const handleCancelMeeting = async (meetingId) => {
    try {
      await cancelBooking(meetingId);
      const modifiedEvents = events.filter((event) => event._id !== meetingId);
      setEvents(modifiedEvents);
      dispatch(showSuccessToast("Booking cancelled successfully!"));
    } catch (error) {
      console.log("Error from handleCancelMeeting", error);
      dispatch(
        showErrorToast(error.response.data.message || "An error occurred!")
      );
    } finally {
      setShowDetailsModal(false);
    }
  };

  // In Bookings.jsx

  const renderEventContent = useCallback((eventInfo) => {
    const isMonthView = eventInfo.view.type === "dayGridMonth";
    const isTimeGrid = eventInfo.view.type.startsWith("timeGrid");
    const title = eventInfo.event.title || "Untitled Event";
    const startTime = eventInfo.event.start
      ? moment(eventInfo.event.start)
      : null;

    // --- Styling for Month View ---
    if (isMonthView) {
      return (
        <Box
          sx={{
            px: "4px", // Minimal horizontal padding
            py: "1px", // Minimal vertical padding
            fontSize: "0.7rem", // Slightly smaller font for month view
            overflow: "hidden", // Still hide overflow, but allow wrap
            textOverflow: "ellipsis", // Add ellipsis if title overflows
            whiteSpace: "normal", // ALLOW WRAPPING
            color: eventInfo.event.textColor || "primary.contrastText", // Ensure text is visible
            // No fixed height, let content determine height within limits
          }}
        >
          {/* Show time only if not all day */}
          {!eventInfo.event.allDay && startTime && (
            <Typography
              component="span" // Render inline
              variant="caption"
              sx={{ fontWeight: "bold", mr: 0.5, fontSize: "inherit" }} // Inherit size
            >
              {startTime.format("HH:mm")} {/* Use simple HH:mm format */}
            </Typography>
          )}
          <Typography
            component="span"
            variant="caption"
            sx={{ fontSize: "inherit" }}
          >
            {" "}
            {/* Inherit size */}
            {title}
          </Typography>
        </Box>
      );
    }

    // --- Styling for Week/Day View (Your existing refined style) ---
    else {
      // Assuming this is for timeGridWeek, timeGridDay, etc.
      return (
        <Box
          sx={{
            p: "3px 5px",
            bgcolor: eventInfo.event.backgroundColor || "primary.main", // Background applied here
            color: eventInfo.event.textColor || "primary.contrastText",
            fontSize: "0.75rem",
            overflow: "hidden", // Keep hidden for week/day where segments are taller
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "3px",
            // No border needed if bg color is set
          }}
        >
          {/* Show Time First if available (common in time grids) */}
          {eventInfo.timeText && (
            <Typography
              variant="caption"
              component="div"
              sx={{
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
            >
              {eventInfo.timeText}
            </Typography>
          )}
          {/* Event Title */}
          <Typography
            variant="caption"
            component="div"
            sx={{
              fontWeight: "medium",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          {/* Optional: Conditionally show description only if enough space? Hard to determine. */}
          {/* {eventInfo.event.extendedProps?.description && ( ... )} */}
        </Box>
      );
    }
  }, []); // Dependencies array is empty as it only uses eventInfo

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
        Book a Room
      </Typography>

      <Grid2 container spacing={3} sx={{ flexGrow: 1, overflow: "hidden" }}>
        {/* --- Left Column FORM AND FAVORITES --- */}
        <Grid2
          item
          xs={12}
          md={4}
          lg={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            // height: "calc(100vh - 64px - 48px - 24px)",
            minWidth: "45%",
            overflowY: "auto",
            p: 2,
          }}
        >
          {" "}
          {/* Adjust height calc based on header/padding */}
          {/* Section for Booking Form */}
          {/* <Paper elevation={2} sx={{ p: 2, mb: 3 }}> */}
          <BookRoomForm
            rooms={rooms}
            currentRoomId={currentMeetingRom}
            handleRoomChange={(newRoom) => {
              console.log("handleRoomChange called----", newRoom);
              setSearchParam({ roomId: newRoom });
              getRoomAvailabilityByDateRange(newRoom, null);
              setCurrentMeetingRoom(newRoom);
            }}
            handleNewBookingSchedule={handleNewBookingSchedule}
          />
          {/* </Paper> */}
        </Grid2>

        {/* --- Right Column CALENDER --- */}
        <Grid2
          item
          xs={12}
          md={8}
          lg={9}
          sx={{
            height: "calc(100vh - 64px - 48px)",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          {" "}
          {/* Adjust height */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 1, sm: 2 },
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {loadingCalendar && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {formError && !loadingCalendar && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Alert severity="error" sx={{ width: "100%", mx: "auto" }}>
                  {formError}
                </Alert>
              </Box>
            )}
            {!loadingCalendar && !formError && (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                editable={true}
                events={events}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                datesSet={handleViewChange} // Use the memoized handler
                eventContent={renderEventContent}
                height="100%"
                eventOverlap={false}
                // Consider adding these for better UX:
                // selectable={true} // Allows selecting time slots
                // select={handleDateSelect} // Handler for when a date/time is selected
                eventMaxStack={3} // Limit number of events shown before "+ more"
              />
            )}
          </Paper>
        </Grid2>
      </Grid2>
      {/* --- Event Details Dialog (MUI) --- */}
      <Dialog
        open={showDetailsModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {modalEvent?.title || "Event Details"}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {" "}
          {/* Adds dividers */}
          {modalEvent ? (
            <Box>
              {" "}
              {/* Wrap content in Box for potential styling */}
              <Typography
                variant="body1"
                gutterBottom
                sx={{ fontWeight: "medium" }}
              >
                Description:
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                {modalEvent.description || "N/A"}
              </Typography>
              {modalEvent.allDay ? (
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: "medium" }}
                >
                  All Day Event
                </Typography>
              ) : (
                <Box>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    Start:{" "}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {moment(modalEvent.start).format("llll")}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    End:{" "}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {moment(modalEvent.end).format("llll")}
                    </Typography>
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <MeetingLinks
                outlookWebLink={modalEvent?.outlookWebLink}
                teamsJoinUrl={modalEvent?.teamsJoinUrl}
              />
            </Box>
          ) : (
            <DialogContentText>Loading event details...</DialogContentText> // Use MUI component
          )}
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          {" "}
          {/* Add padding */}
          <MuiButton
            onClick={() => handleCancelMeeting(modalEvent?._id)}
            color="error"
            variant="outlined"
            disabled={
              !modalEvent || moment(modalEvent?.start).isBefore(moment())
            } // Also disable for past events
            size="small"
          >
            Cancel Meeting
          </MuiButton>
          <MuiButton
            onClick={handleCloseModal}
            variant="contained"
            size="small"
          >
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bookings;
