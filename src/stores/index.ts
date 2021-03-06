import create from 'zustand';
import { Specimen } from '../renderer/types';
import { defaultQueryConfig, QueryConfig } from './query';
import { BulkInsertError, defaultLogs, LoggingError, Logs } from './logging';

export type User = {
  id: string;
  username: string;
  fullName: string;
  accessRole: string;
};

export type TableConfig = {
  headers: string[];
  updateTableHeaders(newHeaders: string[]): void;
};

export const defaultTableConfig = {
  headers: [
    'catalogNumber',
    'otherCatalogNumber',
    'order_',
    'genus',
    'specificEpithet',
  ],
};

type SpesqlSession = {
  user?: User | null;

  expiredSession: boolean;
  expireSession(): void;

  isInsertingRecord: boolean;
  setIsInsertingRecord(isInserting: boolean): void;

  isEditingRecord: boolean;
  setIsEditingRecord(isEditing: boolean): void;

  prefersSound: boolean;
  toggleSoundPreference(newVal?: boolean): void;

  // query config
  queryData: QueryConfig;
  tableConfig: TableConfig;

  selectedSpecimen: Specimen | null;

  // globals
  loading: boolean;
  errors: Logs;

  clearErrors(target: string): void;

  updateSelectLog(newLog: LoggingError[]): void;
  updateCountLog(newLog: LoggingError[]): void;
  updateUpdateLog(newLog: LoggingError[]): void;
  updateSingleInsertLog(newLog: LoggingError[]): void;
  updateBulkInsertLog(newLog: BulkInsertError[]): void;
  updateDeleteLog(newLog: LoggingError[]): void;

  // actions
  toggleLoading(newLoading?: boolean): void;
  setSelectedSpecimen(specimen: Specimen | null): void;
  login(
    id: string,
    fullName: string,
    username: string,
    accessRole: string
  ): void;
  logout(): void;
};

const defaultSession: Partial<SpesqlSession> = {
  user: null,
  expiredSession: true,
  isEditingRecord: false,
  isInsertingRecord: false,
  prefersSound: true,
  selectedSpecimen: null,
  loading: false,
};

export const useStore = create<SpesqlSession>((set) => ({
  user: null,

  expiredSession: true,

  expireSession: () =>
    set((state) => ({
      ...state,
      expiredSession: true,
    })),

  isInsertingRecord: false,
  setIsInsertingRecord: function (isInserting) {
    set((state) => ({
      ...state,
      isInsertingRecord: isInserting,
    }));
  },

  isEditingRecord: false,
  setIsEditingRecord: function (isEditing) {
    set((state) => ({
      ...state,
      isEditingRecord: isEditing,
    }));
  },

  prefersSound: true,
  toggleSoundPreference: (newVal?: boolean) =>
    set((state) => ({
      ...state,
      prefersSound: newVal ?? !state.prefersSound,
    })),

  login: (id: string, fullName: string, username: string, accessRole: string) =>
    set((state) => ({
      ...state,
      user: { id, fullName, username, accessRole },
      expiredSession: false,
    })),

  logout: () =>
    set((state) => ({
      ...state,
      ...defaultSession,
      queryData: { ...state.queryData, ...defaultQueryConfig },
      tableConfig: { ...state.tableConfig, ...defaultTableConfig },
    })),

  // QUERY CONFIGS
  queryData: {
    ...defaultQueryConfig,
    setData: (data: Specimen[]) =>
      set((state) => ({
        ...state,
        queryData: { ...state.queryData, data },
      })),
    setTable: (table: string) =>
      set((state) => ({
        ...state,
        queryData: { ...state.queryData, table },
      })),
    setCurrentQuery: (query: string) =>
      set((state) => ({
        ...state,
        queryData: { ...state.queryData, queryString: query },
      })),
    setFilter: (filter: string) =>
      set((state) => ({
        ...state,
        queryData: { ...state.queryData, filter },
      })),
    setFilterByFields: (fields: (keyof Specimen)[] | 'all') =>
      set((state) => ({
        ...state,
        queryData: { ...state.queryData, filterByFields: fields },
      })),
  },
  tableConfig: {
    ...defaultTableConfig,
    updateTableHeaders: (newHeaders: string[]) =>
      set((state) => ({
        ...state,
        tableConfig: { ...state.tableConfig, headers: newHeaders },
      })),
  },

  selectedSpecimen: null,
  setSelectedSpecimen: (specimen: Specimen | null) => {
    set((state) => ({
      ...state,
      selectedSpecimen: specimen,
    }));
  },

  errors: defaultLogs,

  clearErrors: (target: string) => {
    set((state) => ({
      ...state,
      errors: {
        ...state.errors,
        [target]: [],
      },
    }));
  },

  updateSelectLog: (newLog: LoggingError[]) => {
    // resetLog('select', set);
    set((state) => ({
      ...state,
      errors: {
        ...state.errors,
        select: newLog.map((el) => el),
      },
    }));
  },
  updateCountLog: (newLog: LoggingError[]) => {
    set((state) => ({
      ...state,
      errors: {
        ...state.errors,
        count: newLog,
      },
    }));
  },
  updateUpdateLog: (newLog: LoggingError[]) => {
    set((state) => ({
      ...state,
      errors: {
        ...state.errors,
        update: newLog,
      },
    }));
  },
  updateSingleInsertLog: (newLog: LoggingError[]) => {
    set((state) => ({
      ...state,
      errors: {
        ...state.errors,
        singleInsert: newLog,
      },
    }));
  },
  updateBulkInsertLog: (newLog: BulkInsertError[]) => {
    set((state) => ({
      ...state,
      errors: {
        ...state.errors,
        bulkInsert: newLog,
      },
    }));
  },
  updateDeleteLog: (newLog: LoggingError[]) => {
    set((state) => ({
      ...state,
      errors: {
        ...state.errors,
        delete: newLog,
      },
    }));
  },

  // APP STATES
  loading: false,
  toggleLoading: (newLoading?: boolean) =>
    set((state) => ({
      ...state,
      loading: newLoading ?? !state.loading,
    })),
}));
