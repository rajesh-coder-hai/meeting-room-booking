// sharedSlice.js (or whatever your slice file is named)
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify'; // Import the toast object

const sharedSliceNx = createSlice({
    name: 'shared',
    initialState: {
        loading: false,
        profile: null,
        isAdmin: false,
        // Remove the toast state from Redux.  react-toastify manages its own state.
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        // Remove setToast and clearToast. We'll use react-toastify's functions directly.

        showSuccessToast: (state, action) => {
             toast.success(action.payload); // Use toast.success
        },
        showErrorToast: (state, action) => {
            toast.error(action.payload);  // Use toast.error
        },
        showInfoToast: (state, action) => { //Added info toast
            toast.info(action.payload);
        },
        showWarningToast: (state, action) => { //Added warning toast
            toast.warn(action.payload);
        },
        showDefaultToast: (state, action) => { //Added default toast
            toast(action.payload);
        },
        setProfile: (state, action) => {
            state.profile = action.payload;
            state.isAdmin = action.payload.isAdministrator;
        }
    }
});

export const { setLoading, showSuccessToast, showErrorToast, showInfoToast, showWarningToast, showDefaultToast, setProfile } = sharedSliceNx.actions;
export default sharedSliceNx.reducer;