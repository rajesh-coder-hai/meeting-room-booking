import React, { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";

// --- MUI Imports ---
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button as MuiButton, // Alias to avoid naming conflict if needed elsewhere
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText, // For simple text inside dialog
  DialogActions,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid2, // For potential future use
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // For Dialog close button
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
import Favorites from "../components/Favourite";
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

  // --- Core Logic Functions (Keep As Is) ---
  const handleViewChange = useCallback((arg) => {
    setCurrentView(arg.view.type);
    setTimeRange({
      // Directly set new range
      start: moment(arg.start).toISOString(), // Use ISO string for consistency
      end: moment(arg.end).toISOString(),
    });
  }, []); // Empty dependency array - correct

  const getRoomBookingsByDateRangeAPIcall = useCallback(
    async (roomIdToFetch, startDate, endDate) => {
      if (!roomIdToFetch || !startDate || !endDate) return; // Don't fetch without required info

      setLoadingCalendar(true);
      setFormError(null);
      try {
        const { data: availability } = await getRoomBookingsByDateRange(
          roomIdToFetch,
          startDate,
          endDate
        );
        const modifiedEvents = availability.map((event) => ({
          // Use event._id directly if available, otherwise graph event id might be different
          id: event._id || event.id, // Ensure unique ID for FullCalendar
          title: event.title || "Untitled Event", // Add default title
          start: moment(event.start).toISOString(),
          end: moment(event.end).toISOString(),
          allDay: event.allDay || false, // Assume not all day if missing
          backgroundColor: moment(event.start).isBefore(moment()) // Use moment() for current time
            ? "#6c757d" // Bootstrap grey-like color
            : "#198754", // Bootstrap green-like color
          borderColor: moment(event.start).isBefore(moment())
            ? "#6c757d"
            : "#198754",
          extendedProps: {
            ...event.extendedProps, // Keep existing extendedProps
            _id: event._id, // Ensure local DB ID is available
            description: event.description,
            webLink: event.webLink, // Make sure these are in your backend data
            teamsLink: event.onlineMeeting?.joinUrl || event.teamsLink, // Get teams link
          },
        }));
        setEvents(modifiedEvents);
      } catch (error) {
        console.error("Error fetching room bookings:", error);
        const errorMsg =
          error.response?.data?.message || "Failed to load bookings.";
        setFormError(errorMsg);
        dispatch(showErrorToast(errorMsg));
        setEvents([]); // Clear events on error
      } finally {
        setLoadingCalendar(false);
      }
    },
    [dispatch]
  ); // Add dispatch dependency

  const handleRoomChange = useCallback(
    (newRoomId) => {
      console.log("handleRoomChange called----", newRoomId);
      setCurrentMeetingRoom(newRoomId);
      // Update URL search param
      setSearchParam({ roomId: newRoomId });
      // Fetch data for the new room based on the *current* timeRange
      if (timeRange.start && timeRange.end) {
        getRoomBookingsByDateRangeAPIcall(
          newRoomId,
          timeRange.start,
          timeRange.end
        );
      } else {
        // If timeRange isn't set yet, trigger initial fetch based on current view
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          const view = calendarApi.view;
          getRoomBookingsByDateRangeAPIcall(
            newRoomId,
            moment(view.activeStart).toISOString(),
            moment(view.activeEnd).toISOString()
          );
        }
      }
    },
    [timeRange, getRoomBookingsByDateRangeAPIcall, setSearchParam]
  );

  const handleNewBookingSchedule = useCallback(
    (newBookingData, newEventData) => {
      console.log("New booking schedule:", newBookingData);
      // Create a FullCalendar-compatible event object from the new booking data
      const newEvent = {
        id: newEventData.id || newBookingData._id, // Use Graph ID if available, else DB ID
        title: newBookingData.subject || "New Booking",
        start: moment(newBookingData.startDateTime).toISOString(),
        end: moment(newBookingData.endDateTime).toISOString(),
        allDay: newBookingData.isAllDay || false,
        backgroundColor: "#198754", // Green for new
        borderColor: "#198754",
        extendedProps: {
          _id: newBookingData._id, // Ensure local DB ID is available if needed
          description: newBookingData.description,
          webLink: newEventData.webLink, // Get from Graph response
          teamsLink: newEventData.onlineMeeting?.joinUrl, // Get from Graph response
        },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      dispatch(showSuccessToast("Meeting booked successfully!"));
      // Maybe close the form section or clear the form here
    },
    [dispatch]
  );

  const handleEventClick = useCallback((clickInfo) => {
    console.log("Event clicked:", clickInfo.event);
    setModalEvent({
      // Prioritize local _id if available from extendedProps
      _id: clickInfo.event.extendedProps?._id || clickInfo.event.id,
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps?.description,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      allDay: clickInfo.event.allDay,
      // Get links from extendedProps where they should be stored
      webLink: clickInfo.event.extendedProps?.webLink,
      teamsLink: clickInfo.event.extendedProps?.teamsLink,
    });
    setShowDetailsModal(true);
  }, []);

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setModalEvent(null);
  };

  const handleEventUpdate = useCallback(
    async (info, updateType) => {
      const eventId = info.event.extendedProps?._id || info.event.id;
      const updatedEventData = {
        // Prepare data needed by your updateBooking API
        // This might just be start/end, or more depending on your API
        start: moment(info.event.start).toISOString(),
        end: moment(info.event.end).toISOString(),
        // Include other fields if your updateBooking expects them
        // subject: info.event.title, // Usually not changed on drop/resize
      };

      try {
        // --- Client-side validation ---
        if (moment(updatedEventData.start).isBefore(moment())) {
          dispatch(showErrorToast("Cannot move booking to the past."));
          info.revert(); // Revert the change visually
          return;
        }
        if (
          moment(updatedEventData.end).isSameOrBefore(
            moment(updatedEventData.start)
          )
        ) {
          dispatch(showErrorToast("End time must be after start time."));
          info.revert();
          return;
        }
        // --- End Client-side validation ---

        // Optimistic UI update (optional but good UX)
        // setEvents(currentEvents => currentEvents.map(ev =>
        //     (ev.id || ev._id) === eventId
        //         ? { ...ev, start: updatedEventData.start, end: updatedEventData.end }
        //         : ev
        // ));

        await updateBooking(eventId, updatedEventData);

        // Refetch or confirm update (refetching is safer)
        getRoomBookingsByDateRangeAPIcall(
          currentMeetingRom,
          timeRange.start,
          timeRange.end
        );

        dispatch(showSuccessToast("Booking updated successfully!"));
      } catch (error) {
        console.error(`Error from ${updateType}:`, error);
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update booking.";
        dispatch(showErrorToast(errorMsg));
        info.revert(); // Revert the change visually if API call fails
      }
    },
    [dispatch, currentMeetingRom, timeRange, getRoomBookingsByDateRangeAPIcall]
  ); // Added dependencies

  const handleEventDrop = useCallback(
    (dropInfo) => {
      console.log("Event dropped:", dropInfo.event);
      handleEventUpdate(dropInfo, "handleEventDrop");
    },
    [handleEventUpdate]
  );

  const handleEventResize = useCallback(
    (resizeInfo) => {
      console.log("Event resized:", resizeInfo.event);
      handleEventUpdate(resizeInfo, "handleEventResize");
    },
    [handleEventUpdate]
  );

  const handleCancelMeeting = useCallback(
    async (meetingId) => {
      if (!meetingId) return;
      try {
        await cancelBooking(meetingId);
        setEvents((prevEvents) =>
          prevEvents.filter((event) => (event.id || event._id) !== meetingId)
        );
        dispatch(showSuccessToast("Booking cancelled successfully!"));
      } catch (error) {
        console.error("Error from handleCancelMeeting", error);
        const errorMsg =
          error.response?.data?.message || "Failed to cancel booking.";
        dispatch(showErrorToast(errorMsg));
      } finally {
        handleCloseModal(); // Close modal regardless of success/fail
      }
    },
    [dispatch]
  ); // Added dispatch dependency

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingCalendar(true);
      setFormError(null);
      try {
        const { data: roomData } = await fetchRooms();
        setRooms(roomData);

        // Set initial room ID if not present in URL, or validate URL room ID
        let initialRoomId = roomId;
        if (!initialRoomId && roomData.length > 0) {
          initialRoomId = roomData[0]._id; // Default to first room
          setSearchParam({ roomId: initialRoomId }); // Update URL
        } else if (
          initialRoomId &&
          !roomData.some((r) => r._id === initialRoomId)
        ) {
          console.warn("Room ID from URL not found, defaulting to first room.");
          initialRoomId = roomData.length > 0 ? roomData[0]._id : "";
          if (initialRoomId) setSearchParam({ roomId: initialRoomId });
          else setSearchParam({});
        }
        setCurrentMeetingRoom(initialRoomId);

        // Fetch initial events for the selected/default room and view
        if (initialRoomId && calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          const view = calendarApi.view;
          setTimeRange({
            // Set initial time range for useEffect trigger
            start: moment(view.activeStart).toISOString(),
            end: moment(view.activeEnd).toISOString(),
          });
          // getRoomBookingsByDateRangeAPIcall will be triggered by timeRange change
        } else if (initialRoomId) {
          // Fallback if calendarRef not ready (less likely but possible)
          const start = moment().startOf("week").toISOString();
          const end = moment().endOf("week").toISOString();
          setTimeRange({ start, end });
          // getRoomBookingsByDateRangeAPIcall will be triggered by timeRange change
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        const errorMsg =
          error.response?.data?.message || "Failed to load initial data.";
        setFormError(errorMsg);
        dispatch(showErrorToast(errorMsg));
      } finally {
        setLoadingCalendar(false);
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Refetch bookings when the selected room changes
  useEffect(() => {
    if (currentMeetingRom && timeRange.start && timeRange.end) {
      getRoomBookingsByDateRangeAPIcall(
        currentMeetingRom,
        timeRange.start,
        timeRange.end
      );
    }
  }, [currentMeetingRom, timeRange, getRoomBookingsByDateRangeAPIcall]); // Added getRoomBookingsByDateRangeAPIcall

  // --- Refined Event Content Styling ---
  const renderEventContent = useCallback((eventInfo) => {
    return (
      <Box
        sx={{
          p: "2px 4px",
          borderRadius: "4px",
          bgcolor: eventInfo.event.backgroundColor || "primary.main",
          color: eventInfo.event.textColor || "primary.contrastText",
          fontSize: "0.75rem",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderLeft: `3px solid ${
            eventInfo.borderColor ||
            eventInfo.event.backgroundColor ||
            "primary.light"
          }`,
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{
            fontWeight: "bold",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {eventInfo.event.title}
        </Typography>
        {!eventInfo.event.allDay && eventInfo.timeText && (
          <Typography variant="caption" sx={{ display: "block", opacity: 0.9 }}>
            {eventInfo.timeText}
          </Typography>
        )}
        {eventInfo.event.extendedProps?.description && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              opacity: 0.8,
            }}
          >
            {eventInfo.event.extendedProps.description}
          </Typography>
        )}
      </Box>
    );
  }, []);
  // --- End Refined Event Content Styling ---

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
      <Grid2 container spacing={3} sx={{ flexGrow: 1, overflow: "hidden" }}>
        {/* --- Left Column --- */}
        <Grid2
          item
          xs={12}
          md={4}
          lg={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 64px - 48px - 24px)",
            overflowY: "auto",
            pr: 1,
          }}
        >
          {" "}
          {/* Adjust height calc based on header/padding */}
          {/* Section for Booking Form */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom component="div">
              Book a Room
            </Typography>
            {/* Ensure BookRoomForm uses MUI internally */}
            <BookRoomForm
              rooms={rooms}
              currentRoomId={currentMeetingRom}
              handleRoomChange={handleRoomChange} // Passes the room ID
              handleNewBookingSchedule={handleNewBookingSchedule}
            />
          </Paper>
          {/* Section for Favorites */}
          <Paper elevation={1} variant="outlined" sx={{ p: 2, flexGrow: 1 }}>
            {/* Ensure Favorites uses MUI internally */}
            <Favorites />
          </Paper>
        </Grid2>

        {/* --- Right Column --- */}
        <Grid2
          item
          xs={12}
          md={8}
          lg={9}
          sx={{
            height: "calc(100vh - 64px - 48px)",
            display: "flex",
            flexDirection: "column",
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
                // eventMaxStack={3} // Limit number of events shown before "+ more"
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
                outlookWebLink={modalEvent?.webLink}
                teamsJoinUrl={modalEvent?.teamsLink}
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
