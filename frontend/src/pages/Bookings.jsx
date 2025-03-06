import React, { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import BookRoomForm from "../components/BookRoomForm";

const Bookings = () => {
  const calendarRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [events, setEvents] = useState(
    [
      {
        title: "All Day Meeting",
        allDay: true,
        start: moment().add(1, "days").format(),
        end: moment().add(1, "days").format(),
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
    ].map((event) => ({
      ...event,
      backgroundColor: getRandomGradient(),
      borderColor: "transparent",
    }))
  );
  const [currentView, setCurrentView] = useState("timeGridWeek");

  const handleViewChange = (arg) => {
    console.log("View changed to:", arg.view.type);
    setCurrentView(arg.view.type);
  };

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      console.log("Calendar API:", calendarApi);

      calendarApi.setOption("events", events);
      calendarApi.setOption("height", 700);
    }
  }, [events]);

  useEffect(()=>{
    if (currentView){
      getMeetingRoomAvailability(currentView);
    }
  },[currentView])

  function getRandomGradient() {
    const colors = [
      `linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(
        16
      )}, #${Math.floor(Math.random() * 16777215).toString(16)})`,
      `linear-gradient(45deg, #${Math.floor(Math.random() * 16777215).toString(
        16
      )}, #${Math.floor(Math.random() * 16777215).toString(16)})`,
      `linear-gradient(90deg, #${Math.floor(Math.random() * 16777215).toString(
        16
      )}, #${Math.floor(Math.random() * 16777215).toString(16)})`,
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function getMeetingRoomAvailability(timeFilter=currentView) {
    try {
      //write the logic to get the meeting room availability initially for the week, after that based on the user selection i.e. month, day
    } catch (error) {
      console.log("Error from getMeetingRoomAvailability", error);
    }
  };

  useEffect(() => {
    getMeetingRoomAvailability();
  }, []);

  const handleEventClick = (info) => {
    console.log("Event clicked:", info.event);

    setModalEvent(info.event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEventDrop = (info) => {
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
    setEvents(updatedEvents);
  };

  const handleEventResize = (info) => {
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
    setEvents(updatedEvents);
  };

  return (
    <div style={{ padding: "20px" }}>
      <BookRoomForm />
      <div style={{ height: "300px" }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          datesSet={handleViewChange}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          hand
          editable={true}
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
