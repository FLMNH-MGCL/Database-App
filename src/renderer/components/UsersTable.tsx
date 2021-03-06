import React, { useEffect, useState } from 'react';
import { AutoSizer, Column, Table, TableRowProps } from 'react-virtualized';
import axios from 'axios';
import useWindowDimensions from './utils/useWindowDimensions';
import { SortingConfig } from './VirtualizedTable';
import _ from 'lodash';
import useToggle from './utils/useToggle';
import CreateEditUserModal from './modals/CreateEditUserModal';
import CreateDeleteUserModal from './modals/CreateDeleteUserModal';
import CreateHelpModal from './modals/CreateHelpModal';
import CreateCreateUserModal from './modals/CreateCreateUserModal';
import CreateAdminLogModal from './modals/CreateAdminLogModal';
import { usePersistedStore } from '../../stores/persisted';
import RefreshButton from './buttons/RefreshButton';
import { BACKEND_URL } from '../types';
import { Spinner } from '@flmnh-mgcl/ui';
import { TABLE_CLASSES } from '@flmnh-mgcl/ui/lib/components/constants';
import UserTableDropdown from './UserTableDropdown';

export type User = {
  id: number;
  name: string;
  username: string;
  role: string;
  created_at: any;
};

type TableRowRenderer = (
  props: TableRowProps & {
    onEditClick: React.Dispatch<React.SetStateAction<number | undefined>>;
    onDeleteClick: React.Dispatch<React.SetStateAction<number | undefined>>;
  }
) => React.ReactNode;

const rowRenderer: TableRowRenderer = ({
  className,
  columns,
  index,
  key,
  onRowClick,
  onRowDoubleClick,
  onRowMouseOut,
  onRowMouseOver,
  onRowRightClick,
  rowData,
  style,
  onEditClick,
  onDeleteClick,
}) => {
  const a11yProps = { 'aria-rowindex': index + 1 } as any;

  if (
    onRowClick ||
    onRowDoubleClick ||
    onRowMouseOut ||
    onRowMouseOver ||
    onRowRightClick
  ) {
    a11yProps['aria-label'] = 'row';
    a11yProps.tabIndex = 0;

    if (onRowClick) {
      a11yProps.onClick = (event: any) => onRowClick({ event, index, rowData });
    }
    if (onRowDoubleClick) {
      a11yProps.onDoubleClick = (event: any) =>
        onRowDoubleClick({ event, index, rowData });
    }
    if (onRowMouseOut) {
      a11yProps.onMouseOut = (event: any) =>
        onRowMouseOut({ event, index, rowData });
    }
    if (onRowMouseOver) {
      a11yProps.onMouseOver = (event: any) =>
        onRowMouseOver({ event, index, rowData });
    }
    if (onRowRightClick) {
      a11yProps.onContextMenu = (event: any) =>
        onRowRightClick({ event, index, rowData });
    }
  }

  return (
    <div
      {...a11yProps}
      className={className}
      key={key}
      role="row"
      style={style}
    >
      {columns.map((col: any, _index) => {
        if (_index === 5) {
          return (
            <div
              key={_index}
              aria-colindex={7}
              className="ReactVirtualized__Table__rowColumn"
              role="gridcell"
              title="Actions"
              style={{ flex: '1 1 330.6px' }}
            >
              <UserTableDropdown
                onEdit={() => onEditClick(rowData.id)}
                onDelete={() => onDeleteClick(rowData.id)}
                last={index !== 0}
              />
            </div>
          );
        } else {
          return col;
        }
      })}
    </div>
  );
};

export default function UsersTable() {
  const { width } = useWindowDimensions();
  const [users, setUsers] = useState<User[]>();
  const [sortingDirection, setSortingDirection] = useState<SortingConfig>();
  const [editing, setEditing] = useState<number>();
  const [deleting, setDeleting] = useState<number>();
  const [loading, { on, off }] = useToggle(false);

  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  const theme = usePersistedStore((state) => state.theme);

  let display = users
    ? sortingDirection
      ? _.orderBy(
          users,
          [sortingDirection.column],
          [sortingDirection.direction]
        )
      : users
    : [];

  async function getUsers() {
    on();
    const response = await axios
      .get(BACKEND_URL + '/api/admin/users')
      .catch((error) => error.response);

    if (response.status !== 200) {
      off();
      return;
    }

    // TODO: use query from data?
    const newUsers = response?.data?.users;
    setUsers(
      newUsers.map((user: any) => {
        return {
          ...user,
          created_at: new Date(user.created_at).toLocaleDateString(
            undefined,
            dateOptions as any
          ),
        };
      })
    );
    off();
  }

  useEffect(() => {
    if (!users || !users.length) {
      getUsers();
    }
  }, []);

  function handleHeaderClick({ dataKey }: any) {
    if (!dataKey || dataKey === '') {
      return;
    }

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

  function getColumns() {
    const columns =
      !users || !users.length
        ? []
        : [
            ...Object.keys(users[0]).map((header) => {
              return (
                <Column
                  key={header}
                  label={header}
                  dataKey={header}
                  flexGrow={1}
                  flexShrink={1}
                  width={width / (Object.keys(users[0]).length + 1)}
                  headerRenderer={renderHeader}
                />
              );
            }),
            <Column
              key=""
              // label={header}
              dataKey=""
              flexGrow={1}
              flexShrink={1}
              width={width / (Object.keys(users[0]).length + 1)}
              headerRenderer={renderHeader}
            />,
          ];

    return columns;
  }

  function getRowStyle({ index }: { index: number }) {
    // -1 is the header row
    if (index === -1) {
      return {
        backgroundColor: theme === 'dark' ? '#2D2D2D' : '#f7fafc',
      };
    }

    // default styles for all rows
    return {
      cursor: 'pointer',
    };
  }

  return (
    <React.Fragment>
      {editing && users && (
        <CreateEditUserModal
          open={editing !== undefined}
          user={users.find((user) => user.id === editing)!}
          onClose={() => setEditing(undefined)}
          refresh={() => getUsers()}
        />
      )}

      {deleting && users && (
        <CreateDeleteUserModal
          open={deleting !== undefined}
          user={users.find((user) => user.id === deleting)!}
          onClose={() => {
            setDeleting(undefined);
          }}
          refreshUsers={() => getUsers()}
        />
      )}

      <div className="w-full align-middle overflow-x-auto overflow-hidden h-full flex flex-col">
        <div className="w-full h-full flex-1">
          <Spinner active={loading} />

          <AutoSizer>
            {({ height, width }) => (
              <Table
                height={height}
                width={width}
                rowHeight={50}
                headerHeight={60}
                rowCount={display.length}
                rowGetter={({ index }) => display[index]}
                rowStyle={getRowStyle}
                onHeaderClick={handleHeaderClick}
                rowClassName={TABLE_CLASSES.row}
                headerClassName={TABLE_CLASSES.headerRow}
                gridClassName={TABLE_CLASSES.grid}
                rowRenderer={(props) =>
                  rowRenderer({
                    ...props,
                    onEditClick: setEditing,
                    onDeleteClick: setDeleting,
                  })
                }
              >
                {getColumns()}
              </Table>
            )}
          </AutoSizer>
        </div>
        <nav className={TABLE_CLASSES.footer}>
          <div className="flex space-x-2 items-center">
            <CreateCreateUserModal refresh={getUsers} />
            <RefreshButton onClick={() => getUsers()} />
          </div>
          <div className="flex space-x-2 items-center">
            <CreateAdminLogModal />
            <CreateHelpModal variant="admin-user-table" />
          </div>
        </nav>
      </div>
    </React.Fragment>
  );
}
