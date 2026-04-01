const SESSION_KEY = "e_prescription_session";

export const getStoredSession = () => {
  const rawValue = window.localStorage.getItem(SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const setStoredSession = (session) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
};

export const getStoredToken = () => getStoredSession()?.token ?? "";

