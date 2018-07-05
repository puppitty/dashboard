import axios from "axios";
import {
  SET_CURRENT_USER,
  PROFILE_LOADING,
  GET_PROFILE,
  CLEAR_CURRENT_PROFILE,
  GET_ERRORS
} from "./types";

//Get currnet profile

export const getCurrentProfile = () => dispatch => {
  dispatch(setProfileLoading());
  axios
    .get("/api/profile")
    .then(res =>
      dispatch({
        type: GET_PROFILE,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch({
        type: GET_PROFILE,
        payload: {}
      })
    );
};
//Delete Account and Profile
export const deleteAccount = () => dispatch => {
  if (window.confirm("Are You Certain? This can NOT be Undone!")) {
    axios
      .delete("/api/profile")
      .then(res =>
        dispatch({
          type: SET_CURRENT_USER,
          payload: {}
        })
      )
      .catch(err =>
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
      );
  }
};

//Create Profile
export const createProfile = (profileData, history) => dispatch => {
  axios
    .post("/api/profile", profileData)
    .then(res => history.push("/dashboard"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Profile Loading
export const setProfileLoading = () => {
  return {
    type: PROFILE_LOADING
  };
};

//CLear CurrentProfile and sets it back to null
export const clearCurrentProfile = () => {
  return {
    type: CLEAR_CURRENT_PROFILE
  };
};

//Add Experience to Profile
export const addExperience = (experienceData, history) => dispatch => {
  axios
    .post("/api/profile/experience", experienceData)
    .then(res => history.push("/dashboard"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const deleteExperience = (expId) => dispatch => {
  axios
  .delete(`./api/profile/experience/${expId}`)
  .then(res=> dispatch({
    type:GET_PROFILE,
    payload:res.data
  }))
  .catch(err=> dispatch({
    type:GET_ERRORS,
    payload:err.response.data
  }))
}

//Add Education to Profile
export const addEducation = (educationData, history) => dispatch => {
  axios
    .post("/api/profile/education", educationData)
    .then(res => history.push("/dashboard"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const deleteEducation = (eduId) => dispatch => {
  axios
  .delete(`./api/profile/education/${eduId}`)
  .then(res=> dispatch({
    type:GET_PROFILE,
    payload:res.data
  }))
  .catch(err=> dispatch({
    type:GET_ERRORS,
    payload:err.response.data
  }))
}
