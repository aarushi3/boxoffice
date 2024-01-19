import { useEffect, useReducer, useState } from "react";
import { apiGet } from "./config";

function showsReduser(prevState, action) {
  switch (action.type) {
    case "ADD": {
      return [...prevState, action.showId];
    }
    case "REMOVE": {
      return prevState.filter((showId) => showId !== action.showId);
    }
    default:
      return prevState;
  }
}
function usePersistedReducer(reducer, initialState, key) {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    const persisted = localStorage.getItem(key);
    return persisted ? JSON.parse(persisted) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);
  return [state, dispatch];
}
export function useShows(key = "shows") {
  return usePersistedReducer(showsReduser, [], key);
}
export function useLastQuery(key = "lastQuery") {
  const [Input, setInput] = useState(() => {
    const persisted = sessionStorage.getItem(key);
    return persisted ? JSON.parse(persisted) : "";
  });
  const setPersistedInput = (newState) => {
    setInput(newState);
    sessionStorage.setItem(key, JSON.stringify(newState));
  };
  return [Input, setPersistedInput];
}
const Reducer = (prevState, action) => {
  switch (action.type) {
    case "FETCH_SUCCESS": {
      return { isLoading: false, error: null, show: action.show };
    }
    case "FETCH_FAILED": {
      return { ...prevState, isLoading: false, error: action.error };
    }
    default:
      return prevState;
  }
};
export function useShow(showId) {
  const [state, dispatch] = useReducer(Reducer, {
    isLoading: true,
    error: null,
    show: null,
  });
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const [show, setShow] = useState(null);

  useEffect(() => {
    let isMount = true;
    apiGet(`shows/${showId}?embed[]=seasons&embed[]=cast`)
      .then((results) => {
        if (isMount) {
          dispatch({ type: "FETCH_SUCCESS", show: results });
          // setShow(results);
          // setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMount) {
          dispatch({ type: "FETCH_FAILED", Error: err.message });
          // setError(err.message);
          // setIsLoading(false);
        }
      });
    return () => {
      isMount = false;
    };
  }, [showId]);
  return state;
}
