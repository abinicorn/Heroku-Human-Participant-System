import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {request} from "../../utils/request";

// adding participants
export const addParticipants = createAsyncThunk(
  'participants/addParticipants',
  async (participants) => {
    const response = await request.post('http://localhost:3001/participant/add', participants);
    return response.data;
  }
);

const participantsSlice = createSlice({
  name: 'Participants',
  initialState: [], // init state is an empty array
  reducers: {
    addParticipants: (state, action) => {
      // add new SP to current array
      return [...state, ...action.payload];
    },
    deleteParticipant: (state, action) => {
      const newState = state.filter(participant => participant._id !== action.payload);
      return newState;
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(addParticipants.pending, (state) => {
        // Empty the participants array when a new addition starts
        return [];
      })
      .addCase(addParticipants.fulfilled, (state, action) => {
        // Handle the fulfilled case. For example, you can add the new participant to the state
        state.push(action.payload);
      });
  }
});

export const { 
  addStudyParticipants,
  deleteStudyParticipant 
} = participantsSlice.actions;

export default participantsSlice.reducer;
