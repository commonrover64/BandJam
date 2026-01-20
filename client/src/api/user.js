import { axiosInstance } from ".";

const RegisterUser = async (values) => {
  try {
    const response = await axiosInstance.post("/users/register", values);
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const LoginUser = async (values) => {
  try {
    const response = await axiosInstance.post("/users/login", values);
    return response.data;
  } catch (error) {
    return error;
  }
};

const GetCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/users/currentUser");
    return response.data;
  } catch (error) {
    return error;
  }
};

export { RegisterUser, LoginUser, GetCurrentUser };
