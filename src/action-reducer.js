'use strict';

import immutable, { Map } from 'immutable';

// For updating multiple UI variables at once.  Each variable might be part of
// a different context; this means that we need to either call updateUI on each
// key of the object to update or do transformations within one action in the
// reducer. The latter only triggers one store change event and is more
// performant.
export const MASS_UPDATE_UI_STATE = '@@redux-ui/MASS_UPDATE_UI_STATE';
export const UPDATE_UI_STATE = '@@redux-ui/UPDATE_UI_STATE';
export const SET_DEFAULT_UI_STATE = '@@redux-ui/SET_DEFAULT_UI_STATE';

const defaultState = new Map();

export default function(state = defaultState, action) {
  let key = action.payload && (action.payload.key || []);

  if (!Array.isArray(key)) {
    key = [key];
  }

  switch (action.type) {
    case UPDATE_UI_STATE:
      const { name, value } = action.payload;
      return state.setIn(key.concat(name), value);

    case MASS_UPDATE_UI_STATE:
      const { uiVars, transforms } = action.payload;

      return state.withMutations( s => {
        Object.keys(transforms).forEach(k => {
          const path = uiVars[k];
          invariant(
            path,
            `Couldn't find variable ${k} within your component's UI state ` +
            `context. Define ${k} before using it in the @ui decorator`
          );

          s.setIn(path.concat(k), transforms[k]);
        });
      });

    case SET_DEFAULT_UI_STATE:
      // Replace all UI under a key with the given values
      return state.setIn(key, action.payload.value);
  }

  return state;
}

export function updateUI(key, name, value) {
  return {
    type: UPDATE_UI_STATE,
    payload: {
      key,
      name,
      value
    }
  };
};

export function massUpdateUI(uiVars, transforms) {
  return {
    type: MASS_UPDATE_UI_STATE,
    payload: {
      uiVars,
      transforms
    }
  };
}

export function setDefaultUI(key, value) {
  return {
    type: SET_DEFAULT_UI_STATE,
    payload: {
      key,
      value: immutable.fromJS(value)
    }
  };
};