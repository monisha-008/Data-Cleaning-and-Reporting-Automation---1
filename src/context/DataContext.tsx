import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  dataReducer,
  initialDataState,
  DataState,
  AppNavigationTab,
} from '../reducers/dataReducer';
import { workerClient } from '../workers/workerClient';
import { isValidDataFile } from '../utils/fileUtils';
import sampleCsvText from '../data/sample-data.csv?raw';

interface DataContextType {
  state: DataState;
  setTab: (tab: AppNavigationTab) => void;
  loadSampleDataset: () => Promise<void>;
  handleFileUpload: (file: File) => Promise<void>;
  handleSheetSelect: (sheetName: string) => Promise<void>;
  handlePageChange: (page: number) => Promise<void>;
  handleSearchChange: (search: string) => Promise<void>;
  handleSortChange: (column: string) => Promise<void>;
  resetDataset: () => Promise<void>;
  clearError: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialDataState);

  // Ping worker on mount to verify responsiveness
  useEffect(() => {
    workerClient.ping().then((isReady) => {
      if (!isReady) {
        console.warn('Worker initialization ping did not return ready status');
      }
    });
  }, []);

  const setTab = useCallback((tab: AppNavigationTab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const loadSampleDataset = useCallback(async () => {
    try {
      dispatch({
        type: 'SET_PROCESSING',
        payload: { isProcessing: true, progress: { percent: 10, message: 'Initiating sample data load...' } },
      });

      const result = await workerClient.loadSample(sampleCsvText, (percent, message) => {
        dispatch({ type: 'SET_PROGRESS', payload: { percent, message } });
      });

      dispatch({ type: 'DATASET_LOADED', payload: result });
    } catch (err: any) {
      console.error('Error loading sample dataset:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Failed to load deterministic sample dataset.',
      });
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    const validation = isValidDataFile(file);
    if (!validation.valid) {
      dispatch({ type: 'SET_ERROR', payload: validation.error || 'Invalid file format or size.' });
      return;
    }

    try {
      dispatch({
        type: 'SET_PROCESSING',
        payload: {
          isProcessing: true,
          progress: { percent: 10, message: `Preparing "${file.name}" for worker parsing...` },
        },
      });

      const result = await workerClient.parseFile(file, (percent, message) => {
        dispatch({ type: 'SET_PROGRESS', payload: { percent, message } });
      });

      dispatch({ type: 'DATASET_LOADED', payload: result });
    } catch (err: any) {
      console.error('File parsing error:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'An error occurred while parsing the dataset in Web Worker.',
      });
    }
  }, []);

  const handleSheetSelect = useCallback(async (sheetName: string) => {
    try {
      dispatch({
        type: 'SET_PROCESSING',
        payload: {
          isProcessing: true,
          progress: { percent: 20, message: `Switching to worksheet "${sheetName}"...` },
        },
      });

      const result = await workerClient.selectSheet(sheetName, (percent, message) => {
        dispatch({ type: 'SET_PROGRESS', payload: { percent, message } });
      });

      dispatch({ type: 'DATASET_LOADED', payload: result });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to switch sheet.' });
    }
  }, []);

  const handlePageChange = useCallback(
    async (page: number) => {
      const updatedQuery = { ...state.tableQuery, page };
      dispatch({ type: 'SET_TABLE_QUERY', payload: { page } });

      try {
        const pageResult = await workerClient.getPage(updatedQuery);
        dispatch({ type: 'SET_TABLE_PAGE', payload: pageResult });
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: `Pagination error: ${err.message}` });
      }
    },
    [state.tableQuery]
  );

  const handleSearchChange = useCallback(
    async (search: string) => {
      const updatedQuery = { ...state.tableQuery, search, page: 1 };
      dispatch({ type: 'SET_TABLE_QUERY', payload: { search, page: 1 } });

      try {
        const pageResult = await workerClient.getPage(updatedQuery);
        dispatch({ type: 'SET_TABLE_PAGE', payload: pageResult });
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: `Filter error: ${err.message}` });
      }
    },
    [state.tableQuery]
  );

  const handleSortChange = useCallback(
    async (column: string) => {
      const isCurrent = state.tableQuery.sortColumn === column;
      const nextDir: 'asc' | 'desc' | undefined =
        isCurrent && state.tableQuery.sortDirection === 'asc'
          ? 'desc'
          : isCurrent && state.tableQuery.sortDirection === 'desc'
          ? undefined
          : 'asc';

      const updatedQuery = {
        ...state.tableQuery,
        sortColumn: nextDir ? column : undefined,
        sortDirection: nextDir,
        page: 1,
      };

      dispatch({
        type: 'SET_TABLE_QUERY',
        payload: { sortColumn: nextDir ? column : undefined, sortDirection: nextDir, page: 1 },
      });

      try {
        const pageResult = await workerClient.getPage(updatedQuery);
        dispatch({ type: 'SET_TABLE_PAGE', payload: pageResult });
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: `Sorting error: ${err.message}` });
      }
    },
    [state.tableQuery]
  );

  const resetDataset = useCallback(async () => {
    try {
      await workerClient.reset();
      dispatch({ type: 'RESET_DATASET' });
    } catch (err: any) {
      console.error('Reset error:', err);
      dispatch({ type: 'RESET_DATASET' });
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        state,
        setTab,
        loadSampleDataset,
        handleFileUpload,
        handleSheetSelect,
        handlePageChange,
        handleSearchChange,
        handleSortChange,
        resetDataset,
        clearError,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
