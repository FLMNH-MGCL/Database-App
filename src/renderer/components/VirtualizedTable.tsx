import React, { useState } from 'react';
import { Table, Column, AutoSizer } from 'react-virtualized';
import useWindowDimensions from './utils/useWindowDimensions';
import { SortableContainer } from 'react-sortable-hoc';
import _ from 'lodash';
import { FilterSearch } from './Filter';
import ClearQueryButton from './buttons/ClearQueryButton';
import RefreshQueryButton from './buttons/RefreshQueryButton';
import CreateHelpModal from './modals/CreateHelpModal';
import CreateHeaderConfigModal from './modals/CreateHeaderConfigModal';
import { useStore } from '../../stores';
import shallow from 'zustand/shallow';
import CreateLogModal from './modals/CreateLogModal';
import { Specimen, SpecimenFields } from '../types';
import serverImage from '../assets/svg/data_processing_two.svg';
import ShowQueryButton from './buttons/ShowQueryButton';
import 'react-virtualized/styles.css';
import CreateFilterFieldModal from './modals/CreateFilterFieldModal';
import { usePersistedStore } from '../../stores/persisted';
import { Spinner, Heading, Text } from '@flmnh-mgcl/ui';
import { TABLE_CLASSES } from '@flmnh-mgcl/ui/lib/components/constants';

const SortableTable = SortableContainer(Table);

export type SortingConfig = {
  direction: 'asc' | 'desc';
  column: string;
};

function EmptyTableArt() {
  return (
    <div className="absolute bottom-0 inset-0 flex flex-col items-center justify-center pointer-events-none">
      <img
        className="object-scale-down h-64 md:h-80 mt-6 offset-table-header -ml-20"
        src={serverImage}
      />
      <Heading tag="h3" className="mt-3 text-center ">
        Make a query for the specimen to appear!
      </Heading>
    </div>
  );
}

type FooterProps = {
  disableInteractables?: boolean;
  count: number;
};

// TODO: CONSIDER https://medium.com/better-programming/an-introduction-to-react-table-6ebd34d8059e

function TableFooter({ disableInteractables, count }: FooterProps) {
  const { isEditing, isInserting } = useStore(
    (state) => ({
      isInserting: state.isInsertingRecord,
      isEditing: state.isEditingRecord,
    }),
    shallow
  );

  // todo: delete option?
  const watch = isEditing ? 'update' : isInserting ? 'singleInsert' : 'global';
  const initialTab = isEditing ? 3 : isInserting ? 2 : 0;

  return (
    <div className={TABLE_CLASSES.footerFixed}>
      <div className="flex space-x-2">
        <CreateFilterFieldModal disabled={disableInteractables} />
        <FilterSearch disabled={disableInteractables} />
        <RefreshQueryButton disabled={disableInteractables} />
        <ClearQueryButton disabled={disableInteractables} />
        <CreateHeaderConfigModal disabled={disableInteractables} />

        <ShowQueryButton disabled={disableInteractables} />
      </div>

      <div className="flex space-x-2">
        {count > 0 && (
          <Text className="self-center px-1 dark:text-dark-200">{`Count: ${count}`}</Text>
        )}
        <CreateLogModal
          watch={watch}
          variant="single"
          initialTab={initialTab}
        />
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
    hasQueried,
    selectedSpecimen,
    setSelectedSpecimen,
    loading,
    filter,
    filterByFields,
    isInserting,
    isEditing,
  } = useStore(
    (state) => ({
      headers: state.tableConfig.headers,
      data: state.queryData.data,
      hasQueried:
        state.queryData.queryString !== undefined &&
        state.queryData.queryString !== '',
      selectedSpecimen: state.selectedSpecimen,
      setSelectedSpecimen: state.setSelectedSpecimen,
      loading: state.loading,
      filter: state.queryData.filter,
      filterByFields: state.queryData.filterByFields,
      isInserting: state.isInsertingRecord,
      isEditing: state.isEditingRecord,
    }),
    shallow
  );

  const theme = usePersistedStore((state) => state.theme, shallow);

  let display = getDisplay();

  const toggleLoading = useStore((state) => state.toggleLoading);

  // FIXME
  function filterDisplay(_display: Partial<SpecimenFields>[]) {
    if (filter === '') {
      return _display;
    } else if (filterByFields === 'all') {
      return _display.filter((specimen) =>
        Object.values(specimen)
          .toString()
          .toLowerCase()
          .includes(filter.toLowerCase())
      );
    } else {
      return _display.filter((specimen) => {
        let compounded = true;

        filterByFields.forEach((field) => {
          if (!specimen[field]) {
            compounded = false;
          } else if (
            specimen[field] &&
            specimen[field]!.toString()
              .toLowerCase()
              .includes(filter.toLowerCase())
          ) {
            compounded = true;
          } else {
            compounded = false;
          }
        });

        return compounded;
      });
    }
  }

  function getDisplay() {
    let display = sortingDirection
      ? _.orderBy(data, [sortingDirection.column], [sortingDirection.direction])
      : data;

    return filterDisplay(display);
  }

  function handleRowClick({ rowData }: any) {
    if (isEditing || isInserting) {
      return;
    }
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
            className="w-4 h-4"
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
            className="w-4 h-4"
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
      <div key={dataKey} className="flex space-x-2 items-center select-none">
        <p>{dataKey}</p>
        {icon}
      </div>
    );
  }

  function getRowStyle({ index }: { index: number }) {
    // -1 is the header row
    if (index === -1) {
      return {
        backgroundColor: theme === 'dark' ? '#2D2D2D' : '#f7fafc',
      };
    } else if (!selectedSpecimen) {
      return {
        cursor: 'pointer',
      };
    }

    // styles for actively selected row
    else if (display[index]?.id === selectedSpecimen?.id) {
      return {
        backgroundColor: theme === 'dark' ? '#2D2D2D' : '#f7fafc',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
      };
    }

    // default styles for all rows
    return {
      cursor: 'pointer',
    };
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

        {!hasQueried && !loading && <EmptyTableArt />}

        <AutoSizer>
          {({ height, width }) => (
            // Should I capitalize the header row??
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
              rowClassName={TABLE_CLASSES.row}
              headerClassName={TABLE_CLASSES.headerRow}
              gridClassName={TABLE_CLASSES.grid}
            >
              {getColumns()}
            </SortableTable>
          )}
        </AutoSizer>
      </div>
      <TableFooter
        disableInteractables={!data || !data.length}
        count={display.length}
      />
    </React.Fragment>
  );
}
