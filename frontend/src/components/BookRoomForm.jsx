import React, { useCallback, useState } from "react";
import { bookRoom } from "../api/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useDispatch } from "react-redux";
import { showErrorToast, showSuccessToast } from "../store/slices/sharedSlice";
import SearchUser from "./SearchUser";
import Favorites from "./Favourite";

const BookRoomForm = ({
  rooms,
  handleRoomChange,
  currentRoomId,
  handleNewBookingSchedule,
}) => {
  const dispatch = useDispatch();
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  const handleSubmit = async (values) => {
    try {
      console.log("Form Values:", values);
      const payload = {
        ...values,
        start: moment(values.startTime).toISOString(),
        end: moment(values.endTime).toISOString(),
        extendedProps: {
          description: values.description || "",
        },
        attendees: selectedAttendees,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        // Timezone is passed from FE but not used by backend for now, defaults to UTC
        // if start and end are ISoString, timezone will be UTC
        // if start and end are Date, timezone will be the local time zone
      };
      const { data } = await bookRoom(payload);
      handleNewBookingSchedule(data);
      dispatch(showSuccessToast("Room booked successfully!"));
    } catch (error) {
      console.error("Booking Error:", error);
      dispatch(
        showErrorToast(error.response.data.error || "An error occurred!")
      );
    }
  };

  function getFloorName(floorNumber) {
    if (!floorNumber) return null;
    if (floorNumber === 0) {
      return "Ground";
    }
    if (floorNumber === -1) {
      return "Lower ground";
    }

    // Determine the suffix for the floor number
    const suffix = (n) => {
      if (n === 1) return "st";
      if (n === 2) return "nd";
      if (n === 3) return "rd";
      return "th"; // For numbers other than 1, 2, 3
    };

    // Handle positive floor numbers
    return `${Math.abs(floorNumber)}${suffix(Math.abs(floorNumber))} floor`;
  }

  const handleAttendeeChange = useCallback((updatedAttendees) => {
    console.log("Selected attendees updated in parent:", updatedAttendees);
    setSelectedAttendees(updatedAttendees);
  }, []); // Empty dependency array is fine if it only uses the setter

  const BookRoomSchema = Yup.object().shape({
    roomId: Yup.string().required("Required"),
    allDay: Yup.boolean().default(false), // Ensure allDay exists

    startTime: Yup.date()
      .typeError("Invalid date") // Ensures correct date format
      .required("Required"),

    endTime: Yup.date()
      .typeError("Invalid date")
      .when("allDay", (allDay, schema) =>
        allDay ? schema.notRequired() : schema.required("Required")
      ),

    title: Yup.string()
      .min(5, "Too Short!")
      .max(150, "Too Long!")
      .required("Required"),

    description: Yup.string().max(1000, "Too Long!"),
    teamName: Yup.string().max(20, "Too Long!"),
  });

  const chooseAttendeeFromFavorite = (attendee) => {
    handleAttendeeChange(attendee);
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        roomId: currentRoomId || "",
        startTime: moment().add("30", "minutes").format("YYYY-MM-DDTHH:mm"),
        endTime: moment().add("60", "minutes").format("YYYY-MM-DDTHH:mm"),
        allDay: false,
        title: "",
        description: "",
        teamName: "",
      }}
      validationSchema={BookRoomSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        setFieldValue,
        isValid,
        isSubmitting,
        dirty,
        handleSubmit,
      }) => (
        <Form>
          <div className="row">
            {/* Search User from Microsoft */}
            <div className="d-flex  align-items-center mb-3 gap-3">
              <SearchUser
                onChange={handleAttendeeChange}
                options={selectedAttendees}
                value={selectedAttendees}
              />
              <Favorites
                attendees={selectedAttendees}
                oSelectedAttendees={chooseAttendeeFromFavorite}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="roomId" className="form-label fw-semibold">
                Select Room*
              </label>
              <Field
                as="select"
                name="roomId"
                className="form-select"
                aria-label="select a meeting room"
                onChange={(e) => {
                  const selectedRoomId = e.target.value;
                  setFieldValue("roomId", selectedRoomId); // Update Formik state
                  handleRoomChange(selectedRoomId); // Call the callback function
                }}
              >
                <option value="">Select a meeting room</option>
                {rooms.map((room) => (
                  <option
                    key={room._id}
                    value={room._id}
                    selected={values.roomId === room._id}
                  >
                    {`${room.roomName} - ${getFloorName(room.floorNo)}`}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="roomId"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="startTime" className="form-label fw-semibold">
                Start Time*
              </label>
              <Field
                type="datetime-local"
                name="startTime"
                className="form-control"
                min={new Date().toISOString().slice(0, 16)} // Restrict past dates
                onChange={(e) => {
                  setFieldValue("start", e.target.value);
                  if (
                    values.end &&
                    new Date(e.target.value) >= new Date(values.end)
                  ) {
                    setFieldValue("end", ""); // Reset end date if invalid
                  }
                }}
              />
              <ErrorMessage
                name="startTime"
                component="div"
                className="text-danger"
              />
            </div>

            <div
              className="col-md-4 mb-3"
              style={{
                display: values.allDay ? "none" : "block",
              }}
            >
              <label htmlFor="endTime" className="form-label fw-semibold">
                End Time*
              </label>
              <Field
                type="datetime-local"
                name="endTime"
                className="form-control"
                disabled={values.allDay}
                min={values.start || new Date().toISOString().slice(0, 16)} // End must be after start
              />

              <ErrorMessage
                name="endTime"
                component="div"
                className="text-danger"
              />
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <Field
              type="checkbox"
              name="allDay"
              id="allDay"
              className="form-check-input mt-2"
              onChange={() => setFieldValue("allDay", !values.allDay)}
            />
            <label
              htmlFor="allDay"
              className="form-check-label fw-semibold mt-2 mx-2"
            >
              All Day
            </label>
          </div>

          {/* Rest of the form fields (title, description, team name, submit button) */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="title" className="form-label fw-semibold">
                Meeting Title*
              </label>
              <Field
                type="text"
                name="title"
                className="form-control"
                placeholder="Brainstorming Session"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="description" className="form-label fw-semibold">
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                className="form-control"
                placeholder="Describe the agenda of the meeting"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="teamName" className="form-label fw-semibold">
                Team Name
              </label>
              <Field
                type="text"
                name="teamName"
                className="form-control"
                placeholder="What is your team name?"
              />
              <ErrorMessage
                name="teamName"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          {/* <div className="col-md-4 mb-3 form-check">
            <Field
              type="checkbox"
              name="allDay"
              id="allDay"
              className="form-check-input"
              onChange={() => setFieldValue("allDay", !values.allDay)}
            />
            <label htmlFor="allDay" className="form-check-label fw-semibold">
              All Day
            </label>
          </div> */}

          <div className="w-80 text-center">
            <button
              type="submit"
              className="btn btn-primary mx-2"
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit}
            >
              Book Room
            </button>
            <button type="reset" className="btn btn-outline-secondary">
              Clear
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default BookRoomForm;
