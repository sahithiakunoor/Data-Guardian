import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  fetchDataset,
} from "../api";


const DatasetContext = createContext(null);

const STORAGE_KEY =
  "dataguardian_active_dataset";


export function DatasetProvider({
  children
}) {
  const [
    activeDataset,
    setActiveDatasetState,
  ] = useState(null);

  const [
    validationResult,
    setValidationResult,
  ] = useState(null);

  const [
    mlResult,
    setMlResult,
  ] = useState(null);

  const [
    restoringDataset,
    setRestoringDataset,
  ] = useState(true);


  const setActiveDataset = (
    dataset
  ) => {
    const previousId =
      activeDataset?.dataset_id;

    const nextId =
      dataset?.dataset_id;

    setActiveDatasetState(dataset);

    /*
     * If the active dataset actually changed,
     * clear results belonging to the old dataset.
     */
    if (
      previousId &&
      previousId !== nextId
    ) {
      setValidationResult(null);
      setMlResult(null);
    }

    if (nextId) {
      localStorage.setItem(
        STORAGE_KEY,
        nextId
      );
    } else {
      localStorage.removeItem(
        STORAGE_KEY
      );
    }
  };


  const clearDataset = () => {
    setActiveDatasetState(null);

    setValidationResult(null);
    setMlResult(null);

    localStorage.removeItem(
      STORAGE_KEY
    );
  };


  useEffect(() => {

    const restoreDataset =
      async () => {
  
        const datasetId =
          localStorage.getItem(
            STORAGE_KEY
          );
  
        if (!datasetId) {
          setRestoringDataset(false);
          return;
        }
  
  
        try {
  
          const dataset =
            await fetchDataset(
              datasetId
            );
  
          setActiveDatasetState(
            dataset
          );
  
        } catch (error) {
  
          console.error(
            "Unable to restore dataset:",
            error
          );
  
          localStorage.removeItem(
            STORAGE_KEY
          );
  
          setActiveDatasetState(null);
          setValidationResult(null);
          setMlResult(null);
  
        } finally {
  
          setRestoringDataset(false);
  
        }
  
      };
  
  
    restoreDataset();
  
  }, []);


  return (
    <DatasetContext.Provider
      value={{
        activeDataset,
        setActiveDataset,
        clearDataset,

        validationResult,
        setValidationResult,

        mlResult,
        setMlResult,

        restoringDataset,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}


export function useDataset() {
  const context =
    useContext(DatasetContext);

  if (!context) {
    throw new Error(
      "useDataset must be used inside DatasetProvider."
    );
  }

  return context;
}