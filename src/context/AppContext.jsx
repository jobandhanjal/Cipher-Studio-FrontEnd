import React, { createContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state] = useState({});
  return (
    <AppContext.Provider value={state}>{children}</AppContext.Provider>
  );
};

export default AppContext;
