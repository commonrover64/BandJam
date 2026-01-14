import { axiosInstance } from ".";

const addNewBooking = async (values) => {
  try {
    const response = await axiosInstance.post("/booking/bookroom", values);
    return response.data;
  } catch (error) {
    return error;
  }
};

const getAllBookingsById = async (roomId) => {
  try {
    const response = await axiosInstance.get(`booking/allbooking/${roomId}`);
    return response.data;
  } catch (error) {
    console.error(error)
    throw error;
  }
};

export { addNewBooking, getAllBookingsById };
