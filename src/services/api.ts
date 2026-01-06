import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const getStudent = async () => {
  const response = await axios.get(`${API_URL}/responses/user`);
  // No checking for .data.data anymore. The backend is raw now.
  return response.data;
};

export const getQuestion = async () => {
  const response = await axios.get(`${API_URL}/responses/question`);
  return response.data;
};

export const submitResponse = async (childId: string, questionId: string, optionId: string) => {
  const response = await axios.post(`${API_URL}/responses`, {
    childId,
    questionId,
    optionId,
  });
  return response.data;
};

// --- NEW: Get Scores for the Chart ---
export const getScores = async (childId: string) => {
  const response = await axios.get(`${API_URL}/responses/score/${childId}`);
  return response.data;
};