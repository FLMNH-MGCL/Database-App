import { useMemo } from 'react';
import shallow from 'zustand/shallow';
import { useStore } from '../../../stores';
import { resetSelectedSpecimen } from '../../functions/util';
import { BACKEND_URL, Specimen } from '../../types';
import { useNotify } from './context';
import useExpiredSession from './useExpiredSession';
import axios from 'axios';
import { CountQueryReturn } from '../modals/CreateCountModal';
import { User } from '../UsersTable';
import useLogError from './useLogError';
// import { queriablesStats } from '../../../main/server/endpoints/sql/utils/queriablesStats';

export default function useQuery() {
  const { notify } = useNotify();

  const {
    query,
    setData,
    setTable,
    setCurrentQuery,
    setAvailableFields,
    selectedSpecimen,
    setSelectedSpecimen,
    toggleLoading,
    username,
  } = useStore(
    (state) => ({
      query: state.queryData.queryString,
      setData: state.queryData.setData,
      setTable: state.queryData.setTable,
      setCurrentQuery: state.queryData.setCurrentQuery,
      setAvailableFields: state.chartConfig.setAvailableFields,
      selectedSpecimen: state.selectedSpecimen,
      setSelectedSpecimen: state.setSelectedSpecimen,
      toggleLoading: state.toggleLoading,
      username: state.user?.username,
    }),
    shallow
  );

  const [, { expireSession, awaitReauth }] = useExpiredSession();

  const { logSqlError } = useLogError();

  const queries = useMemo(
    () => ({
      async count(
        query: string,
        columns: any[],
        conditions: any[] | null,
        setState: React.Dispatch<
          React.SetStateAction<CountQueryReturn | undefined>
        >
      ) {
        const countResponse = await axios
          .post(BACKEND_URL + '/api/count', {
            query,
            columns,
            conditions,
          })
          .catch((error) => error.response);

        if (countResponse.status === 200 && countResponse.data) {
          const { count, query } = countResponse.data;

          setState({ numTuples: count, queryString: query });
        } else if (countResponse.status === 401) {
          expireSession();

          await awaitReauth();
          queries.count(query, columns, conditions, setState);
        } else if (countResponse.status === 403) {
          notify({
            title: 'SQL Error',
            message: 'Invalid count query format',
            level: 'error',
          });
        } else {
          notify({
            title: 'Server Error',
            message:
              'Could not process Count query, please check the corresponding logs',
            level: 'error',
          });

          logSqlError(countResponse.data, 'count');
        }
      },
      async createUser(newUser: Partial<User>) {
        const creationResponse = await axios
          .post(BACKEND_URL + '/api/admin/user/create', { newUser })
          .catch((error) => error.response);

        if (creationResponse.status === 201) {
          notify({
            title: 'Success',
            message: `Created new user @${newUser.username}`,
            level: 'success',
          });
        } else if (creationResponse.status === 401) {
          expireSession();

          await awaitReauth();
          await queries.createUser(newUser);
        } else {
          notify({
            title: 'Error Occurred',
            message: 'Please check the logs',
            level: 'error',
          });

          return {
            status: creationResponse.status,
            data: creationResponse.data,
          };
        }

        return;
      },

      async deleteSpecimen(
        id: number,
        table: string
      ): Promise<any | undefined> {
        const deleteResponse = await axios.post(BACKEND_URL + '/api/delete', {
          id,
          table,
        });

        if (deleteResponse.status === 201) {
          setSelectedSpecimen(null);
          queries.refresh();

          const { query } = deleteResponse.data;

          return query;
        } else if (deleteResponse.status === 401) {
          expireSession();

          await awaitReauth();
          return await queries.deleteSpecimen(id, table);
        } else {
          notify({
            title: 'Unknown Error',
            message: 'Please notify Aaron of this bug',
            level: 'error',
          });

          logSqlError(deleteResponse.data, 'delete');

          return undefined;
        }
      },

      async deleteUser(id: number): Promise<boolean> {
        const deleteResponse = await axios
          .post(BACKEND_URL + '/api/admin/user/delete', { id })
          .catch((error) => error.response);

        if (deleteResponse.status === 200) {
          return true;
        } else if (deleteResponse.status === 401) {
          expireSession();

          await awaitReauth();
          return await queries.deleteUser(id);
        } else {
          notify({
            title: 'Unknown Error',
            message: 'Please notify Aaron of this bug',
            level: 'error',
          });

          // TODO: log
          // logSqlError(deleteResponse.data, 'delete');

          return false;
        }
      },

      async deleteTable() {
        // TODO: make me please
      },

      async getTableLogs(table: string): Promise<any | undefined> {
        const logResponse = await axios
          .post(BACKEND_URL + '/api/admin/table/logs', {
            table: table,
          })
          .catch((error) => error.response);

        if (logResponse.status === 200) {
          return logResponse.data;
        } else if (logResponse.status === 401) {
          expireSession();

          await awaitReauth();
          return await queries.getTableLogs(table);
        } else {
          notify({
            title: 'Unknown Error',
            message: 'Please notify Aaron of this bug',
            level: 'error',
          });

          // TODO: logSqlError(deleteResponse.data, 'delete');

          return undefined;
        }
      },

      async insert(table: string, values: Specimen) {
        const insertResponse = await axios
          .post(BACKEND_URL + '/api/insert/single', {
            values,
            table,
          })
          .catch((error) => error.response);

        if (insertResponse.status === 201) {
        } else if (insertResponse.status === 401) {
          // session expired
          expireSession();

          await awaitReauth();
          await queries.insert(table, values);
        } else {
          notify(
            {
              title: 'Server Error',
              message:
                'Please check the corresponding log for more information',
              level: 'error',
            },
            'error'
          );

          logSqlError(insertResponse.data, 'singleInsert');
        }
      },

      async logUpdate(
        query: string,
        updates: any,
        table: string,
        catalogNumber: string | null
      ) {
        const logResponse = await axios
          .post(BACKEND_URL + '/api/log/update', {
            query,
            updates,
            table,
            catalogNumber,
            username,
          })
          .catch((error) => error.respnse);

        if (logResponse.status === 201) {
          // good
        } else if (logResponse.status === 401) {
          expireSession();

          await awaitReauth();
          await queries.logUpdate(query, updates, table, catalogNumber);
        } else {
          // TODO: notify of error
        }
      },

      async logDelete(
        query: string,
        specimen: string,
        table: string,
        catalogNumber: string | null
      ) {
        const logResponse = await axios
          .post(BACKEND_URL + '/api/log/delete', {
            query,
            updates: [{ specimen: { old: specimen, new: '' } }],
            table,
            catalogNumber,
            username,
          })
          .catch((error) => error.respnse);

        if (logResponse.status === 201) {
          // good
        } else if (logResponse.status === 401) {
          expireSession();

          await awaitReauth();
          await queries.logUpdate(query, specimen, table, catalogNumber);
        } else {
          // TODO: notify of error
          notify(
            {
              title: 'Could not delete',
              message:
                'Please check the corresponding log for more information',
              level: 'error',
            },
            'error'
          );
        }
      },

      async refresh() {
        if (!query || query === '') {
          return;
        }

        setData([]);

        toggleLoading(true);

        const selectResponse = await axios
          .post(BACKEND_URL + '/api/select', {
            query,
          })
          .catch((error) => error.response);

        if (selectResponse.status === 200 && selectResponse.data) {
          const { specimen } = selectResponse.data;
          setData(specimen);
          resetSelectedSpecimen(
            selectedSpecimen,
            setSelectedSpecimen,
            specimen
          );
        } else if (selectResponse.status === 401) {
          expireSession();

          await awaitReauth();
          queries.refresh();
        } else {
          // TODO: interpret status
          const error = selectResponse.data;
          notify({ title: 'Error Occurred', message: error, level: 'error' });
        }

        toggleLoading(false);
      },

      async select(
        query: string,
        columns: any[],
        conditions: any[] | null,
        databaseTable: string,
        callback: () => void
      ) {
        const selectResponse = await axios
          .post(BACKEND_URL + '/api/select', {
            query,
            columns,
            conditions,
          })
          .catch((error) => error.response);

        if (selectResponse.status === 200 && selectResponse.data) {
          const { specimen, query } = selectResponse.data;

          if (!specimen.length) {
            notify({
              title: 'Empty Return',
              message: 'Query yielded no data',
              level: 'warning',
            });
          } else {
            callback();
            setData(specimen);
            setTable(databaseTable);
            setCurrentQuery(query);

            if (columns.length === 1 && columns[0] === '*') {
              setAvailableFields('*');
            } else {
              setAvailableFields(columns);
            }
          }
        } else if (selectResponse.status === 401) {
          expireSession();

          await awaitReauth();
          await queries.select(
            query,
            columns,
            conditions,
            databaseTable,
            callback
          );
        } else {
          notify({
            title: 'Server Error',
            message:
              'Could not process Select query, please check the corresponding logs',
            level: 'error',
          });

          logSqlError(selectResponse.data, 'select');
        }

        toggleLoading(false);
      },

      async queriablesStats(): Promise<any[]> {
        const statsResponse = await axios
          .get(BACKEND_URL + '/api/admin/queriables/stats')
          .catch((error) => error.response);

        if (statsResponse.status === 200 && statsResponse.data) {
          return statsResponse.data;
        } else if (statsResponse.status === 401) {
          expireSession();

          await awaitReauth();
          return await queries.queriablesStats();
        } else {
          return [];
        }
      },

      async update(
        query: string,
        conditions: any[],
        updates: any
      ): Promise<string | undefined> {
        const updateResponse = await axios
          .post(BACKEND_URL + '/api/update', {
            query,
            conditions,
            updates,
          })
          .catch((error) => error.response);

        if (updateResponse.status === 200 && updateResponse.data) {
          const { message } = updateResponse.data.result;
          const queryString = updateResponse.data.query;

          notify({
            title: 'Update Successful',
            message,
            level: 'success',
          });

          await queries.refresh();

          return queryString;
        } else if (updateResponse.status === 401) {
          expireSession();

          await awaitReauth();
          return await queries.update(query, conditions, updates);
        } else {
          notify({
            title: 'Update Failed',
            message: 'An unknown error occurred',
            level: 'error',
          });

          return undefined;
        }
      },
      async updateTable(_table: string, _updates: any) {},
    }),
    [query, selectedSpecimen]
  );

  // TODO: change return if adding more stuff to this hook
  return queries;
}
