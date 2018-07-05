import axios from "axios";

const setAuthToken = token => {
  if (token) {
    //apply to every request
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    //delete the Auth Header
    delete axios.defaults.headers.common["Athorization"];
  }
};

export default setAuthToken