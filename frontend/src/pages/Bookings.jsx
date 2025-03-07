import React, { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import BookRoomForm from "../components/BookRoomForm";
import {
  fetchRooms,
  getRoomBookingsByDateRange,
  updateBooking,
} from "../api/api";
import { useSearchParams } from "react-router-dom";
import { getRandomColor, randomGradient } from "../helper";
import { useDispatch } from "react-redux";
import { showErrorToast, showSuccessToast } from "../store/slices/sharedSlice";


const Bookings = () => {
  const dispatch = useDispatch();
  const [searchParam, setSearchParam] = useSearchParams();
  const roomId = searchParam.get("roomId");
  const [currentMeetingRom, setCurrentMeetingRoom] = useState(roomId);
  const calendarRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [events, setEvents] = useState([
    {
      title: "All Day Meeting",
      allDay: true,
      start: moment().add(1, "days").toISOString(),
      end: moment().add(1, "days").toISOString(),
      extendedProps: {
        description: "Important all day meeting",
      },
    },
    {
      title: "Project Review",
      start: moment()
        .add(2, "days")
        .set({ hour: 10, minute: 0, second: 0 })
        .format(),
      end: moment()
        .add(2, "days")
        .set({ hour: 12, minute: 0, second: 0 })
        .format(),
      extendedProps: {
        description: "Review project progress",
      },
    },
    {
      title: "Team Lunch",
      start: moment()
        .add(3, "days")
        .set({ hour: 12, minute: 30, second: 0 })
        .format(),
      end: moment()
        .add(3, "days")
        .set({ hour: 13, minute: 30, second: 0 })
        .format(),
      extendedProps: {
        description: "Team lunch at restaurant",
      },
    },
    {
      title: "Overlapping Meeting",
      start: moment()
        .add(2, "days")
        .set({ hour: 11, minute: 0, second: 0 })
        .format(),
      end: moment()
        .add(2, "days")
        .set({ hour: 13, minute: 0, second: 0 })
        .format(),
      extendedProps: {
        description: "This meeting overlaps with Project Review",
      },
    },
  ]);
  const [currentView, setCurrentView] = useState("timeGridWeek");

  const handleViewChange = (arg) => {
    setCurrentView(arg.view.type);
  };

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.setOption("events", events);
    }
  }, [events]);

  useEffect(() => {
    if (currentView) {
      getRoomAvailabilityByDateRange(currentView, currentMeetingRom);
    }
  }, [currentView, currentMeetingRom]);

  async function getRoomAvailabilityByDateRange(
    timeFilter = currentView,
    roomId
  ) {
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
          : getRandomColor(),
        start: moment(event.start).toISOString(),
        end: moment(event.end).toISOString(),
      }));
      // Update state with retrieved events
      setEvents(modifiedEvents);
    } catch (error) {
      dispatch(
        showErrorToast(error.response.data.error || "An error occurred!")
      );
      console.log("Error from getMeetingRoomAvailability", error);
    }
  }
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

  useEffect(() => {}, [currentMeetingRom]);

  const handleEventClick = (info) => {
    console.log("Event clicked:", info.event);

    setModalEvent(info.event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEventDrop = async (info) => {
    try {
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

  const handleEventResize = async(info) => {
    console.log("Event resized:", info.event);
    
    const { _id: meetingId } = info.event.extendedProps;
    try {
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

  return (
    <div style={{ padding: "20px" }}>
      <BookRoomForm
        rooms={rooms}
        currentRoomId={currentMeetingRom}
        handleRoomChange={(newRoom) => setCurrentMeetingRoom(newRoom)}
      />

      <div style={{ height: "300px" }}>
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
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          events={events} // Initial events
          eventClick={handleEventClick} // Add event click handler
          eventContent={(arg) => (
            <div onClick={() => console.log("printing a event", arg.event)}>
              <b>{arg.event.title}</b> <br />
              {arg.event.allDay ? (
                "All Day"
              ) : (
                <i>
                  {moment(arg.event.start).format("h:mm a")} -{" "}
                  {moment(arg.event.end).format("h:mm a")}
                </i>
              )}
              {arg.event.extendedProps.description && (
                <p>{arg.event.extendedProps.description}</p>
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
                <strong>Description:</strong>{" "}
                {modalEvent.extendedProps.description}
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
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Bookings;
