import React, { useEffect, useState } from 'react';
import { Table, Column, AutoSizer } from 'react-virtualized';
import useWindowDimensions from './utils/useWindowDimensions';
import { SortableContainer } from 'react-sortable-hoc';
import _ from 'lodash';
import 'react-virtualized/styles.css';

import { FilterToggle, FilterSearch } from './Filter';
import ClearQueryButton from './buttons/ClearQueryButton';
import RefreshQueryButton from './buttons/RefreshQueryButton';
import CreateHelpModal from './modals/CreateHelpModal';
import CreateHeaderConfigModal from './modals/CreateHeaderConfigModal';
import { useStore } from '../../stores';
import shallow from 'zustand/shallow';
import Spinner from './ui/Spinner';
import CreateLogModal from './modals/CreateLogModal';
import { Specimen } from '../types';

const SortableTable = SortableContainer(Table);

type SortingConfig = {
  direction: 'asc' | 'desc';
  column: string;
};

type FooterProps = {
  disableInteractables?: boolean;
};

// TODO: CONSIDER https://medium.com/better-programming/an-introduction-to-react-table-6ebd34d8059e

function TableFooter({ disableInteractables }: FooterProps) {
  return (
    <div className="h-16 bg-gray-50 flex items-center justify-between px-4">
      <div className="flex space-x-2">
        <FilterToggle disabled={disableInteractables} />
        <ClearQueryButton disabled={disableInteractables} />
        <FilterSearch disabled={disableInteractables} />
        <RefreshQueryButton disabled={disableInteractables} />
        <CreateHeaderConfigModal disabled={disableInteractables} />
      </div>
      <div className="flex space-x-2">
        <CreateLogModal />
        <CreateHelpModal variant="global" />
      </div>
    </div>
  );
}

// TODO: make me
export default function () {
  const { width } = useWindowDimensions();
  const [sortingDirection, setSortingDirection] = useState<SortingConfig>();

  const {
    headers,
    data,
    selectedSpecimen,
    setSelectedSpecimen,
    loading,
  } = useStore(
    (state) => ({
      headers: state.tableConfig.headers,
      data: state.queryData.data,
      selectedSpecimen: state.selectedSpecimen,
      setSelectedSpecimen: state.setSelectedSpecimen,
      loading: state.loading,
    }),
    shallow
  );

  let display = sortingDirection
    ? _.orderBy(data, [sortingDirection.column], [sortingDirection.direction])
    : data;

  // const [display, setDisplay] = useState(data);

  // useEffect(() => {
  //   setDisplay(data);
  // }, [data]);

  // useEffect(() => {
  //   if (!sortingDirection) {
  //     setDisplay(data);
  //   } else if (sortingDirection.direction === 'asc') {
  //     _.orderBy(list, [sorting.column], [sorting.direction])
  //   } else if (sortingDirection.direction === 'desc') {

  //   }
  // }, [sortingDirection]);

  const toggleLoading = useStore((state) => state.toggleLoading);

  function handleRowClick({ rowData }: any) {
    if (selectedSpecimen?.id === rowData?.id) {
      setSelectedSpecimen(null);
    } else {
      setSelectedSpecimen(rowData as Specimen);
    }
  }

  function handleHeaderClick({ dataKey }: any) {
    if (!sortingDirection) {
      setSortingDirection({
        column: dataKey,
        direction: 'asc',
      });
    } else if (sortingDirection && sortingDirection.column === dataKey) {
      if (sortingDirection.direction === 'asc') {
        setSortingDirection({
          ...sortingDirection,
          direction: 'desc',
        });
      } else {
        setSortingDirection(undefined);
      }
    } else {
      setSortingDirection({
        column: dataKey,
        direction: 'asc',
      });
    }
  }

  function renderHeader({ dataKey }: any) {
    let icon = null;

    if (sortingDirection && sortingDirection.column === dataKey) {
      if (sortingDirection.direction === 'asc') {
        icon = (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        );
      } else {
        icon = (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        );
      }
    }

    return (
      <div key={dataKey} className="flex space-x-2 items-center">
        <p>{dataKey}</p>
        {icon}
      </div>
    );
  }

  function getRowStyle({ index }: { index: number }) {
    if (index === -1) {
      return { backgroundColor: '#f7fafc' };
    } else if (display[index]?.id === selectedSpecimen?.id) {
      return {
        backgroundColor: '#f7fafc',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      };
    }
    return {};
  }

  function getColumns() {
    const columns =
      !data || !data.length
        ? []
        : Array.from(headers).map((header) => {
            return (
              <Column
                key={header}
                label={header}
                dataKey={header}
                flexGrow={1}
                flexShrink={1}
                width={width / headers.length}
                headerRenderer={renderHeader}
              />
            );
          });

    return columns;
  }

  return (
    <React.Fragment>
      <div className="table-height">
        <Spinner active={loading} />

        <AutoSizer>
          {({ height, width }) => (
            <SortableTable
              height={height}
              width={width}
              rowHeight={40}
              headerHeight={60}
              rowCount={display.length}
              rowGetter={({ index }) => display[index]}
              onRowClick={handleRowClick}
              onHeaderClick={handleHeaderClick}
              onRowsRendered={() => toggleLoading(false)}
              rowStyle={getRowStyle}
              headerClassName="cursor-pointer focus:outline-none"
            >
              {getColumns()}
            </SortableTable>
          )}
        </AutoSizer>
      </div>
      <TableFooter disableInteractables={!display || !display.length} />
    </React.Fragment>
  );
}
