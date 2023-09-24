import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {request} from "../../utils/request";

// fetch study-participants data by study ID
export const fetchStudyParticipants = createAsyncThunk(
  'studyParticipants/fetchStudyParticipants',
  async (study_id) => {
    const response = await request.get(`http://localhost:3001/study-participants/${study_id}`);
    if (response.status == 204){
      return [];
    }
    return response.data;
  }
);

// adding study participants
export const addStudyParticipants = createAsyncThunk(
  'studyParticipants/addParticipants',
  async ({ study_id, studyParticipants }) => {
    const response = await request.post(`http://localhost:3001/study-participants/${study_id}`, studyParticipants);
    return response.data;
  }
);

const studyParticipantsSlice = createSlice({
  name: 'studyParticipants',
  initialState: [], // init state is an empty array
  reducers: {
    updateStudyParticipant: (state, action) => {
      const index = state.findIndex(studyParticipant => studyParticipant._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteStudyParticipant: (state, action) => {
      const newState = state.filter(participant => participant._id !== action.payload);
      return newState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudyParticipants.fulfilled, (state, action) => {
        // update state after async function success
        return action.payload;
      })
      .addCase(addStudyParticipants.fulfilled, (state, action) => {
        state.push(...action.payload);
      });
  }
});

export const { 
  updateStudyParticipant, 
  deleteStudyParticipant 
} = studyParticipantsSlice.actions;

export default studyParticipantsSlice.reducer;
