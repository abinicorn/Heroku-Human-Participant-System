// store.js
import { configureStore } from '@reduxjs/toolkit';
import studyParticipantReducer from './slices/studyParticipantsSlice'

export default configureStore({
  reducer: {
    studyParticipants: studyParticipantReducer
  }
});
