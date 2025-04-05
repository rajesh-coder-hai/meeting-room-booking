import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Modal from "react-bootstrap/Modal";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  cancelBooking,
  fetchRooms,
  getRoomBookingsByDateRange,
  updateBooking,
} from "../api/api";
import BookRoomForm from "../components/BookRoomForm";
import { showErrorToast, showSuccessToast } from "../store/slices/sharedSlice";
import MeetingLinks from "../components/MeetingLinks";

const Bookings = () => {
  const dispatch = useDispatch();
  const [searchParam, setSearchParam] = useSearchParams();
  const roomId = searchParam.get("roomId");
  const [currentMeetingRom, setCurrentMeetingRoom] = useState(roomId);
  const calendarRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [isAccordionOpen, setIsAccordionOpen] = useState(0); //1 is closed, 0 is open
  const [timeRange, setTimeRange] = useState({ start: null, end: null });

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
        timeRange.start,
        timeRange.end
      );
    }
  }, [timeRange]);

  function getRoomAvailabilityByDateRange(roomId, timeFilter = currentView) {
    try {
      // Define start and end dates
      let startDate, endDate;

      switch (timeFilter) {
        case "dayGridMonth":
          startDate = moment().startOf("month").format();
          endDate = moment().endOf("month").format();
          break;

        case "timeGridWeek":
          startDate = moment().startOf("week").format();
          endDate = moment().endOf("week").format();
          break;

        case "timeGridDay":
          startDate = moment().startOf("day").format();
          endDate = moment().endOf("day").format();
          break;

        default:
          console.warn("Invalid time filter, defaulting to weekly view.");
          startDate = moment().startOf("week").format();
          endDate = moment().endOf("week").format();
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
        start: moment(event.start).toISOString(),
        end: moment(event.end).toISOString(),
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
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
    setIsAccordionOpen(1);
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
      setShowModal(false);
    }
  };

  return (
    <div style={{ height: "88vh" }} className="container my-5 overflow-auto">
      <Accordion defaultActiveKey={isAccordionOpen}>
        <Accordion.Item eventKey={isAccordionOpen}>
          <Accordion.Header>Send Meeting Invite</Accordion.Header>
          <Accordion.Body>
            <BookRoomForm
              rooms={rooms}
              currentRoomId={currentMeetingRom}
              handleRoomChange={(newRoom) => {
                console.log("handleRoomChange called----", newRoom);

                getRoomAvailabilityByDateRange(newRoom);
                setCurrentMeetingRoom(newRoom);
              }}
              handleNewBookingSchedule={handleNewBookingSchedule}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <div className="d-flex justify-content-between align-items-center my-3">
        <MeetingLinks
          outlookWebLink="https://outlook.office365.com/owa/?itemid=AAMkADcyZmEzOGUxLTc0ZjAtNGY1NS05N2FjLTkzNDk3MjdmMWU0NwBGAAAAAACvhkybgr90QbBJPThUik2xBwBV2iBcEjw5QoGjiqMFpzBQAAAAAAENAABV2iBcEjw5QoGjiqMFpzBQAADHxJmMAAA%3D&exvsurl=1&path=/calendar/item"
          teamsJoinUrl="https://teams.microsoft.com/l/meetup-join/19%3ameeting_NmZlYWQyNzMtYWE2OS00YWI2LWEzMTMtODhjMjM2MjMwZmJi%40thread.v2/0?context=%7b%22Tid%22%3a%229810f93f-68e8-41cb-92b6-fc7e27d15e83%22%2c%22Oid%22%3a%2274769a65-e308-44da-9ad0-1c281d19d7f2%22%7d"
        />
      </div>
      <div className="mt-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          datesSet={handleViewChange} //event to identify when the view is changed
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          editable={true}
          eventOverlap={false}
          // validRange={{
          //   start: moment().startOf("day").format(),
          // }}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          events={events} // Initial events
          eventClick={handleEventClick} // Add event click handler
          eventContent={(arg) => (
            <div
              className="p-1 rounded-md shadow-md text-white text-xs overflow-hidden"
              style={{
                backgroundColor: arg.event.backgroundColor || "#007bff", // Default color
                borderLeft: "4px solid #fff",
                height: "100%", // Ensures event height is fixed
                display: "flex",
                flexDirection: "column",
              }}
            >
              <b className="truncate">{arg.event.title}</b>
              {!arg.event.allDay && (
                <span className="text-[10px]">
                  {moment(arg.event.start).format("h:mm a")} -{" "}
                  {moment(arg.event.end).format("h:mm a")}
                </span>
              )}
              {arg.event.extendedProps.description && (
                <p className="text-[10px] truncate">
                  {arg.event.extendedProps.description}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalEvent && (
            <>
              <p>
                <strong>Description:</strong> {modalEvent.description || "N/A"}
              </p>
              {modalEvent.allDay ? (
                <p>
                  <strong>All Day:</strong> Yes
                </p>
              ) : (
                <>
                  <p>
                    <strong>Start:</strong>{" "}
                    {moment(modalEvent.start).format("MMMM Do YYYY, h:mm a")}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {moment(modalEvent.end).format("MMMM Do YYYY, h:mm a")}
                  </p>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-danger"
            onClick={() => handleCancelMeeting(modalEvent._id)}
          >
            Cancel Meeting
          </button>
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Bookings;
