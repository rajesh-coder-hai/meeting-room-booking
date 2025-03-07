import React from "react";
import { bookRoom } from "../api/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useDispatch } from "react-redux";
import {  showErrorToast, showSuccessToast } from "../store/slices/sharedSlice";

const BookRoomForm = ({rooms, handleRoomChange, currentRoomId}) => {
 const dispatch = useDispatch();
  const handleSubmit = async (values) => {
    try {
      console.log("Form Values:", values);
      const payload = {
        ...values,
        start: values.startTime,
        end: values.endTime,
        extendedProps: {
          description: values.description || "",
        },
      };
      await bookRoom(payload);
      dispatch(showSuccessToast('Room booked successfully!'));
    } catch (error) {
            console.error("Booking Error:", error);
      dispatch(showErrorToast(error.response.data.error || 'An error occurred!'))
    }
  };

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
        <Form className="container my-5">
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
                <option value="" >Select a meeting room</option>
                {rooms.map((room) => (
                  <option
                    key={room._id}
                    value={room._id}
                    selected={values.roomId === room._id}
                  >
                    {room.roomName}{" "}
                    {`===> floor ${room.floorNo} ===> ${room.capacity} person`}
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
              />
              <ErrorMessage
                name="startTime"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="col-md mb-3">
              <label htmlFor="endTime" className="form-label fw-semibold">
                End Time*
              </label>
              <Field
                type="datetime-local"
                name="endTime"
                className="form-control"
                disabled={values.allDay}
              />
              <Field
              type="checkbox"
              name="allDay"
              id="allDay"
              className="form-check-input mt-2"
              onChange={() => setFieldValue("allDay", !values.allDay)}
            />
            <label htmlFor="allDay" className="form-check-label fw-semibold mt-2">
              All Day
            </label>

              <ErrorMessage
                name="endTime"
                component="div"
                className="text-danger"
              />

            </div>
        
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
