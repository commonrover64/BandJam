import { axiosInstance } from ".";

const RegisterRoom = async (values) => {
  try {
    const response = await axiosInstance.post("/room/addroom", values);
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const GetAllRooms = async () => {
  try {
    const response = await axiosInstance.get("/room/getallrooms");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const GetAllRoomsbyID = async (values) => {
  try {
    const response = await axiosInstance.post("/room/getallroomsbyid", {
      ID: values,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const UpdateRoom = async (values) => {
  try {
    const response = await axiosInstance.patch("/room/updateroom", values);
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const DeleteRoom = async (values) => {
  try {
    const response = await axiosInstance.delete("/room/deleteroom", {
      data: { roomID: values },
    });
    return response.data;
  } catch (error) {
    return error;
  }
};

export { RegisterRoom, GetAllRooms, UpdateRoom, DeleteRoom, GetAllRoomsbyID };
