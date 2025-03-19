import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesome (if using)
import { faSave, faPlus } from "@fortawesome/free-solid-svg-icons"; // Example icons

function RoomForm({ room, onSubmit, onCancel }) {
  const [isCreatingNew, setIsCreatingNew] = useState(!room); // Check if it's a new room

  const initialValues = isCreatingNew
    ? {
        // Initial values for a new room
        roomName: "",
        floorNo: "",
        capacity: "",
        projector: false,
        tvScreen: false,
        whiteboard: false,
        isBookable: true,
        description: "",
      }
    : {
        // Initial values for editing an existing room
        roomName: room.roomName || "", // Use default values to handle null/undefined
        floorNo: room.floorNo || "",
        capacity: room.capacity || "",
        projector: room.projector || false,
        tvScreen: room.tvScreen || false,
        whiteboard: room.whiteboard || false,
        isBookable: room.isBookable === undefined ? true : room.isBookable, //Default to true if undefined
        description: room.description || "",
      };

  const validationSchema = Yup.object({
    roomName: Yup.string().required("Room Name is required"),
    floorNo: Yup.number()
      .required("Floor Number is required")
      .integer("Floor Number must be an integer")
      .typeError("Floor Number must be a number"), // Handle non-numeric input
    capacity: Yup.number()
      .required("Capacity is required")
      .integer("Capacity must be an integer")
      .typeError("Capacity must be a number")
      .min(1, "Capacity must be at least 1"),
    projector: Yup.boolean().required("Projector is required"),
    tvScreen: Yup.boolean().required("TV Screen is required"),
    whiteboard: Yup.boolean().required("Whiteboard is required"),
    isBookable: Yup.boolean().required("Is Bookable is required"),
    description: Yup.string(), // Description is optional
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    // Add the _id if we're editing an existing room
    const payload = isCreatingNew ? values : { ...values, _id: room._id };
    onSubmit(payload, isCreatingNew); // Pass isCreatingNew to the onSubmit handler
    setSubmitting(false);
    if (isCreatingNew) {
      resetForm();
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true} // Important: Re-initialize form when 'room' prop changes
    >
      {(
        { isSubmitting, values, setFieldValue } // Destructure values and setFieldValue
      ) => (
        <Form className="p-4 border rounded shadow">
          {/* <h2 className="mb-4">{isCreatingNew ? 'Create New Room' : 'Edit Room'}</h2> */}

          {/* Room Name */}
          <div className="mb-3">
            <label htmlFor="roomName" className="form-label">
              Room Name
            </label>
            <Field
              type="text"
              id="roomName"
              name="roomName"
              className="form-control"
            />
            <ErrorMessage
              name="roomName"
              component="div"
              className="text-danger"
            />
          </div>

          {/* Floor Number */}
          <div className="mb-3">
            <label htmlFor="floorNo" className="form-label">
              Floor Number
            </label>
            <Field
              type="number"
              id="floorNo"
              name="floorNo"
              className="form-control"
            />
            <ErrorMessage
              name="floorNo"
              component="div"
              className="text-danger"
            />
          </div>

          {/* Capacity */}
          <div className="mb-3">
            <label htmlFor="capacity" className="form-label">
              Capacity
            </label>
            <Field
              type="number"
              id="capacity"
              name="capacity"
              className="form-control"
            />
            <ErrorMessage
              name="capacity"
              component="div"
              className="text-danger"
            />
          </div>

          {/* Boolean Fields (Switches) */}
          <div className="mb-3">
            <label className="form-label">Features</label>
            <div className="form-check form-switch">
              <Field
                type="checkbox"
                name="projector"
                id="projector"
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="projector">
                Projector
              </label>
              <ErrorMessage
                name="projector"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="form-check form-switch">
              <Field
                type="checkbox"
                name="tvScreen"
                id="tvScreen"
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="tvScreen">
                TV Screen
              </label>
              <ErrorMessage
                name="tvScreen"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="form-check form-switch">
              <Field
                type="checkbox"
                name="whiteboard"
                id="whiteboard"
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="whiteboard">
                Whiteboard
              </label>
              <ErrorMessage
                name="whiteboard"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="form-check form-switch">
              <Field
                type="checkbox"
                name="isBookable"
                id="isBookable"
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="isBookable">
                Bookable
              </label>
              <ErrorMessage
                name="isBookable"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          {/* Description (Textarea) */}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <Field
              as="textarea"
              id="description"
              name="description"
              className="form-control"
              rows="3"
            />
            <ErrorMessage
              name="description"
              component="div"
              className="text-danger"
            />
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end">
            {/* Cancel button if onEdit */}
            
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={onCancel}
              >
              Cancel
              </button>
            
            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {"Save"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default RoomForm;
