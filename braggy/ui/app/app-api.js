export const INIT = 'app/INIT';
export const SET_FOLLOW = 'app/SET_FOLLOW';

const initialState = {
  follow: false,
  wavelength: null,
  detector_distance: null,
  detector_radius: null
};


export default (state = initialState, action) => {
  switch (action.type) {
    case INIT:
      return {
        ...initialState
      };
    case SET_FOLLOW:
      return {
        ...state,
        follow: action.follow,
        detectorDistance: action.detectorDistance,
        wavelength: action.wavelength,
        detectorRadious: action.detectorRadius
      };
    default:
      return state;
  }
};


export function setFollow(follow, wavelength, detectorDistance, detectorRadius) {
  return (dispatch) => {
    dispatch({
      type: SET_FOLLOW,
      follow,
      detectorDistance,
      detectorRadius,
      wavelength
    });
  };
}
