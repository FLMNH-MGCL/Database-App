import create from 'zustand';
import { GoogleChartType } from '../renderer/types';
import { ChartConfig, defaultChartConfig } from './visualization';

type ChartData = {
  data: any[];
  setData(newData: any[]): void;

  currentQuery: string;
  setCurrentQuery(queryString: string): void;

  config: ChartConfig;
};

export const useChartStore = create<ChartData>((set, _get) => ({
  data: [],

  setData: function (newData: any[]) {
    set((state) => ({
      ...state,
      data: newData,
    }));
  },

  currentQuery: '',

  setCurrentQuery: function (queryString: string) {
    set((state) => ({
      ...state,
      currentQuery: queryString,
    }));
  },

  config: {
    ...(defaultChartConfig as ChartConfig),
    setAvailableFields: (fields: string[] | '*') =>
      set((state) => ({
        ...state,
        config: { ...state.config, availableFields: fields },
      })),
    setChartType: (newChart: GoogleChartType) =>
      set((state) => ({
        ...state,
        config: { ...state.config, chartType: newChart },
      })),
  },
}));
