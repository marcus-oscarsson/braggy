// Actions

export const INIT = 'app/INIT';


const initialState = {
  compress: false,
  autoScale: true
};


export default (state = initialState, action) => {
  switch (action.type) {
    case INIT:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
