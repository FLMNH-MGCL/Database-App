import clsx from 'clsx';
import React, { useState } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import {
  AutoSizer,
  Column,
  Table as VTable,
  TableRowProps,
  TableProps as VTableProps,
} from 'react-virtualized';
import useWindowDimensions from '../utils/useWindowDimensions';
import Spinner from './Spinner';

const SortableTable = SortableContainer(VTable);

export type SortingConfig = {
  direction: 'asc' | 'desc';
  column: string;
};

type TableProps = Omit<VTableProps, 'width' | 'height'> & {
  basic?: boolean;
  data: Object[];
  activeIndex?: number;
  headers: string[];
  loading?: boolean;
  sortable?: boolean;
  containerClassname?: string;
};

// TODO: finish me plz
function VirtualTable({
  data,
  activeIndex,
  headerClassName,
  gridClassName,
  rowHeight = 40,
  headerHeight = 60,
  headers,
  loading,
  sortable,
  containerClassname,
  ...props
}: TableProps) {
  const { width } = useWindowDimensions();
  const [sortingDirection, setSortingDirection] = useState<SortingConfig>();

  // TODO: this implementation won't hold after sorting
  function getRowStyle({ index }: { index: number }) {
    // -1 is the header row
    if (index === -1) {
      return { backgroundColor: '#f7fafc' };
    } else if (activeIndex === undefined) {
      return {
        cursor: 'pointer',
      };
    }

    // styles for actively selected row
    else if (data[index] && index === activeIndex) {
      return {
        backgroundColor: '#f7fafc',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
      };
    }

    // default styles for all rows
    return {
      cursor: 'pointer',
    };
  }

  function renderHeader({ dataKey }: any) {
    if (sortable) {
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
        <div key={dataKey} className="flex space-x-2 items-center">
          <p>{dataKey}</p>
          {icon}
        </div>
      );
    } else {
      return (
        <div key={dataKey} className="flex space-x-2 items-center">
          <p>{dataKey}</p>
        </div>
      );
    }
  }

  function getColumns() {
    return Array.from(headers).map((header) => {
      return (
        <Column
          key={header}
          label={header}
          dataKey={header}
          flexGrow={1}
          flexShrink={1}
          width={width / headers.length}
          headerRenderer={props.renderHeader ?? renderHeader}
        />
      );
    });
  }

  return (
    <div
      className={clsx(
        'min-h-16 bg-white rounded-md shadow-around-lg',
        containerClassname
      )}
    >
      <Spinner active={loading} />
      <AutoSizer>
        {({ height, width }) => (
          <SortableTable
            height={height}
            width={width}
            rowHeight={rowHeight}
            headerHeight={headerHeight}
            rowCount={data.length}
            rowGetter={({ index }) => data[index]}
            headerClassName={
              headerClassName ??
              'px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-600 tracking-wider cursor-pointer focus:outline-none'
            }
            gridClassName={
              gridClassName ??
              'whitespace-no-wrap text-sm leading-5 font-medium text-gray-900'
            }
            rowStyle={props.rowStyle ?? getRowStyle}
            {...props}
          >
            {getColumns()}
          </SortableTable>
        )}
      </AutoSizer>
      <div className="h-16 bg-gray-50 flex items-center justify-between px-4"></div>
    </div>
  );
}

function BasicTable({
  data,
  activeIndex,
  headerClassName,
  headers,
  loading,
  sortable,
  containerClassname,
  ...props
}: TableProps) {
  function getHeaders() {
    return Array.from(headers).map((header) => {
      return (
        <th
          scope="col"
          key={header}
          className={
            headerClassName ??
            'px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-600 tracking-wider focus:outline-none'
          }
        >
          {header}
        </th>
      );
    });
  }
  return (
    <div
      className={clsx(
        'min-h-16 bg-white rounded-md shadow-around-lg',
        containerClassname
      )}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>{getHeaders()}</tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.map((obj: any, i: number) => {
            return (
              <tr key={`tr-${i}`}>
                {headers.map((header: string) => (
                  <td
                    key={`${header}-${i}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {obj[header]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="h-4 bg-gray-50"></div>
    </div>
  );
}

export default function Table({ ...props }: TableProps) {
  if (props.basic) {
    return <BasicTable {...props} />;
  } else return <VirtualTable {...props} />;
}