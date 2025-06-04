
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const AppContext = createContext({});
const API_URL = 'https://hrf-asylum-be-b.herokuapp.com/cases';

const useAppContextProvider = () => {
  const [graphData, setGraphData] = useState({});
  const [isDataLoading, setIsDataLoading] = useState(false);

  useLocalStorage({ graphData, setGraphData });

  const getFiscalData = async () => {
    const fiscalRes = await axios.get(`${API_URL}/fiscalSummary`);
    return fiscalRes.data;
  };

  const getCitizenshipResults = async () => {
    const citizenRes = await axios.get(`${API_URL}/citizenshipSummary`);
    return citizenRes.data;
  };

  const fetchData = async () => {
    try {
      const [fiscalData, citizenshipResults] = await Promise.all([
        getFiscalData(),
        getCitizenshipResults(),
      ]);
      setGraphData({ ...fiscalData, citizenshipResults });
    } catch (error) {
      console.error("API fetch failed:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const updateQuery = async () => {
    setIsDataLoading(true);
    await fetchData();
  };

  const clearQuery = () => {
    setGraphData({});
  };

  const getYears = () =>
    graphData?.yearResults?.map(({ fiscal_year }) => Number(fiscal_year)) ?? [];

  useEffect(() => {
    fetchData(); // Optional: auto-fetch on mount
  }, []);

  return {
    graphData,
    setGraphData,
    isDataLoading,
    updateQuery,
    clearQuery,
    getYears,
  };
};

export function useAppContext() {
  return useContext(AppContext);
}

export function ProvideAppContext({ children }) {
  const contextValue = useAppContextProvider();

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
