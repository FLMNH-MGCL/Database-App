import React, { useContext, createContext, useEffect, useState } from 'react';
import { Instance, onSnapshot, applySnapshot } from 'mobx-state-tree';
import Store from 'electron-store';
import { RootModel } from './Root';

const store = new Store();

export const rootStore = RootModel.create({
  session: {
    currentQuery: {},
  },
});

const STORAGE_KEY = process.env.ELECTRON_WEBPACK_WDS_SECRET_KEY!;

console.log(STORAGE_KEY);

onSnapshot(rootStore, (snapshot) => {
  console.log('Snapshot: ', snapshot);
  store.set(STORAGE_KEY, snapshot);
  console.log('Snapshot persisted to storage.');
});

export type RootInstance = Instance<typeof RootModel>;
const RootStoreContext = createContext<null | RootInstance>(null);

export function Provider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // const data = store.get(STORAGE_KEY);
    // if (data) {
    //   console.log('Hydrating store from snapshot', data);
    //   applySnapshot(rootStore, data);
    // }

    setLoaded(true);

    () => {
      // store.delete(STORAGE_KEY);
      // console.log('I WILL DELETE THE STORE AND STUFF');
    };
  }, []);

  if (!loaded) return null;

  return (
    <RootStoreContext.Provider value={rootStore}>
      {children}
    </RootStoreContext.Provider>
  );
}

export function useMst() {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
