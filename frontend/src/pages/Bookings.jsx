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
      getRoomBookingsByDateRangeAPIcall(
        currentMeetingRom,
        moment(timeRange.start).toISOString(),
        moment(timeRange.end).toISOString()
      );
    }
  }, [timeRange]);

  function getRoomAvailabilityByDateRange(roomId, timeFilter = currentView) {
    try {
      // Define start and end dates
      let startDate, endDate;

      switch (timeFilter) {
        case "dayGridMonth":
          startDate = moment().startOf("month").toISOString();
          endDate = moment().endOf("month").toISOString();
          break;

        case "timeGridWeek":
          startDate = moment().startOf("week").toISOString();
          endDate = moment().endOf("week").toISOString();
          break;

        case "timeGridDay":
          startDate = moment().startOf("day").toISOString();
          endDate = moment().endOf("day").toISOString();
          break;

        default:
          console.warn("Invalid time filter, defaulting to weekly view.");
          startDate = moment().startOf("week").toISOString();
          endDate = moment().endOf("week").toISOString();
          break;
      }

      getRoomBookingsByDateRangeAPIcall(roomId, startDate, endDate);
    } catch (error) {
      dispatch(
        showErrorToast(error.response.data.error || "An error occurred!")
      );
      console.log("Error from getMeetingRoomAvailability", error);
    }
  }

  async function getRoomBookingsByDateRangeAPIcall(roomId, startDate, endDate) {
    try {
      console.log("bhei dekh", { roomId, startDate, endDate });
      if (!startDate || !endDate) {
        return;
      }
      // return
      // Fetch the room bookings based on the calculated date range
      const { data: availability } = await getRoomBookingsByDateRange(
        roomId,
        startDate,
        endDate
      );
      const modifiedEvents = availability.map((event) => ({
        ...event,
        backgroundColor: moment(event.start).isBefore(moment().startOf("day"))
          ? "gray"
          : "green", //getRandomColor()
        start: startDate,
        end: endDate,
      }));
      // Update state with retrieved events
      // console.log("modifiedEvents", modifiedEvents);

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
    console.log("New booking schedule");
    const modifiedEvents = [...events, newBookingSchedule];
    setEvents(modifiedEvents);
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

              getRoomAvailabilityByDateRange(null, newRoom);
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
