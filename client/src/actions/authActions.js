import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { GET_ERRORS, SET_CURRENT_USER } from "./types";

//Register User Action
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("api/users/register", userData)
    .then(res => history.push("/login"))
    .catch(errors =>
      dispatch({
        type: GET_ERRORS,
        payload: errors.response.data
      })
    );
};

//Login - Get User Token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      //Save to LocalStorage
      const { token } = res.data;
      //Set Token to localStorage, which can only be string
      localStorage.setItem("jwtToken", token);
      //Set token to Auth header
      setAuthToken(token);
      //Decode token to get user data
      const decoded = jwt_decode(token);
      //Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(errors =>
      dispatch({
        type: GET_ERRORS,
        payload: errors.response.data
      })
    );
};

//Set Current Logged in User
export const setCurrentUser = decodedData => {
  return {
    type: SET_CURRENT_USER,
    payload: decodedData
  };
};

//Log user out
export const logoutUser = () => dispatch=> {

    localStorage.removeItem('jwtToken')
    //remove auth header for future requests
    setAuthToken(false)
    // set currentuser to emptyobject which will set authenticated to false
    dispatch(setCurrentUser({}))
    
};
