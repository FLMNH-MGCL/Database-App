import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import CreateLogModal from './CreateLogModal';
import { CSVReader, readString } from 'react-papaparse';
import { BACKEND_URL, isSpecimen, Specimen, SpecimenFields } from '../../types';
import { useNotify } from '../utils/context';
import CreateHelpModal from './CreateHelpModal';
import { fixPartiallyCorrect, specimenToArray } from '../../functions/util';
import { useStore } from '../../../stores';
import axios from 'axios';
import useToggle from '../utils/useToggle';
import shallow from 'zustand/shallow';
import { sleep } from '../../functions/util';
import { validateSpecimen } from '../../functions/validation';
import { ProgressBar } from 'react-step-progress-bar';
import { BulkInsertError } from '../../../stores/logging';
import {
  Button,
  Divider,
  Modal,
  Radio,
  Select,
  SelectOption,
  Tabs,
  Text,
} from '@flmnh-mgcl/ui';
import { CSVLink } from 'react-csv';
import ExcelReader from '../ExcelReader';

export function CSVParser({ onFileUpload }: UploadProps) {
  const { notify } = useNotify();

  const [isReset, setReset] = useState(false);
  const updateBulkInsertLog = useStore((state) => state.updateBulkInsertLog);

  function handleOnFileLoad(data: any) {
    if (!data || !data.length) {
      notify({
        title: 'Upload Error',
        message:
          'No entries were found in the uploaded file. Please remove the selected file',
        level: 'error',
      });
    }

    const invalidFields = isSpecimen(data[0].data);

    if (invalidFields.length > 0) {
      // if any invalid fields are just empty columns, notify to remove them
      if (invalidFields.find((entry) => entry.includes('EMPTY COL'))) {
        notify({
          title: 'Empty Colmns Detected',
          message: 'Please remove empty columns and retry upload',
          level: 'error',
        });
      } else {
        let message = 'Entries were found that are not valid specimen: ';

        invalidFields.forEach((field, index) => {
          if (index != invalidFields.length - 1) {
            message += field + ', ';
          } else {
            message += field + '... ';
          }
        });

        message += 'Please remove the selected file.';

        notify({
          title: 'Upload Error',
          message,
          level: 'error',
        });
      }
    } else {
      onFileUpload(data);
    }
  }
  function handleOnError(error: any) {
    notify({
      title: 'CSV Parsing Error',
      message:
        'An unknown error occurred, please notify Aaron to look into this (you can find the error in the logs)',
      level: 'error',
    });

    // FIXME: I do not know the structure of an error like this,
    // if it ever happens and is reported to me I will update this section to match
    updateBulkInsertLog([
      {
        index: 0,
        errors: [
          {
            field: 'N/A: CSV Parsing Error',
            message: JSON.stringify(error),
          },
        ],
      },
    ]);
  }

  function handleRemoveFile(data: any) {
    // FIXME: I am waiting on version 4.0 release for papaparse, which will introduce
    // convenient, react hooks for offloading files programatically!!
    // until then, I have to trigger the reset state twice to get the cache to clear
    onFileUpload(data);

    setReset(true);
    setReset(false);
  }

  // documentation for styling the CSV reader https://github.com/Bunlong/react-papaparse/wiki/CSVReader-(Drag-to-Upload)-Style
  return (
    <CSVReader
      onDrop={handleOnFileLoad}
      onError={handleOnError}
      config={{ header: true }}
      style={{ dropArea: { borderRadius: '.375rem' } }}
      onRemoveFile={handleRemoveFile}
      addRemoveButton
      isReset={isReset}
      accept=".csv"
    >
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-1 text-sm text-gray-600 dark:text-dark-300">
          Click or drag and drop to upload a CSV file
        </p>
      </div>
    </CSVReader>
  );
}

type UploadProps = { onFileUpload(data: any): void };

function PasteUpload({ onFileUpload }: UploadProps) {
  return (
    <textarea
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
        onFileUpload(e.target.value)
      }
      rows={4}
      placeholder="Be sure to include the CSV header row"
      className="flex w-full justify-center px-6 mx-auto pt-5 pb-6 border border-gray-400 dark:border-dark-400 placeholder-gray-400 dark:placeholder-dark-300 rounded-md h-full dark:bg-dark-400"
    />
  );
}

type Props = {
  open: boolean;
  onClose(): void;
};

export default function CreateBulkInsertModal({ open, onClose }: Props) {
  const { notify } = useNotify();

  const [tab, setTab] = useState(0);
  const [pasteData, setPasteData] = useState('');
  const [rawData, setRawFile] = useState<any>();
  const [databaseTable, setDatabaseTable] = useState();
  const [tables, setTables] = useState<SelectOption[]>([]);

  const [loading, { on, off }] = useToggle(false);
  const [rowByRow, setInsertMethod] = useToggle(true);

  const [downloadFailures, setDownloadMethods] = useToggle(false);
  const [failures, setFailures] = useState<any[]>();
  const failureRef = useRef(failures);
  const csvRef = useRef<any>();

  const [useCsv, useCsvMethods] = useToggle(true);

  const [progress, setProgress] = useState(0);

  const updateBulkInsertLog = useStore((state) => state.updateBulkInsertLog);

  const { expiredSession, expireSession } = useStore(
    (state) => ({
      expiredSession: state.expiredSession,
      expireSession: state.expireSession,
    }),
    shallow
  );

  const expiredRef = useRef(expiredSession);

  const mountedRef = useRef(true);

  useEffect(() => {
    async function init() {
      const res = await axios
        .get(BACKEND_URL + '/api/queriables/select/')
        .catch((error) => error.response);

      if (res.data && res.data.tables) {
        if (mountedRef.current === true) {
          setTables(
            res.data.tables.map((table: string) => {
              return { label: table, value: table };
            })
          );
        }
      } else if (res.status === 401) {
        expireSession();
      }
    }

    expiredRef.current = expiredSession;
    if (mountedRef.current === true) {
      init();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [expiredSession]);

  useEffect(() => {
    failureRef.current = failures;
  }, [failures]);

  // look into xlsx package:
  // https://stackoverflow.com/questions/46909260/reading-excel-file-in-reactjs

  //https://github.com/Bunlong/react-papaparse/blob/master/demo/CSVReader1.js

  async function awaitReauth() {
    notify({
      title: 'Session Expired',
      message: 'Pausing the insertion query until you revalidate the session',
      level: 'warning',
    });

    while (expiredRef.current === true) {
      await sleep(2000);
    }

    if (expiredRef.current === false) {
      notify({
        title: 'Session Restored',
        message: 'Insert query resuming',
        level: 'success',
      });
    }

    return '';
  }

  async function handleProgressUpdate(index: number, length: number) {
    if (index === 0) {
      return;
    }

    let percent = ((index + 1) / length) * 100;

    if (Math.floor(percent) > 100) {
      // SHOULD NEVER HAPPEN
      throw new Error(
        `An invalid percentage value was somehow generated in the insertion process: index: ${index}, length: ${length}, percentage: ${percent}`
      );
    }

    setProgress(percent);
  }

  function parseUploadRows() {
    let allErrors = [];
    let insertionValues = [];
    let newCsv = [];

    for (let i = 0; i < rawData.length; i++) {
      // xlsx reader returns a slightly different structure than the Csv reader,
      // so I have to collect the current specimen a little differently
      const currentSpecimen = useCsv
        ? (rawData[i].data as Specimen)
        : (rawData[i] as Specimen);

      const specimenErrors = validateSpecimen(currentSpecimen);

      if (specimenErrors && specimenErrors.length) {
        allErrors.push({ index: i, row: i + 2, errors: specimenErrors });

        if (downloadFailures) {
          newCsv.push(currentSpecimen);
        }
      } else {
        insertionValues.push(fixPartiallyCorrect(currentSpecimen));
      }
    }

    if (downloadFailures) {
      setFailures(newCsv);
    }

    return { allErrors, insertionValues };
  }

  function parsePasteRows(result: any[]) {
    let allErrors: BulkInsertError[] = [];
    let insertionValues = [];
    let newCsv = [];

    for (let i = 0; i < result.length; i++) {
      const currentSpecimen = result[i] as Specimen;
      const specimenErrors = validateSpecimen(currentSpecimen);

      if (specimenErrors && specimenErrors.length) {
        allErrors.push({ index: i, row: i + 2, errors: specimenErrors });

        if (downloadFailures) {
          newCsv.push(currentSpecimen);
        }
      } else {
        insertionValues.push(fixPartiallyCorrect(currentSpecimen));
      }
    }

    if (downloadFailures) {
      setFailures(newCsv);
    }

    return { allErrors, insertionValues };
  }

  async function bulkInsert(insertionValues: Partial<SpecimenFields>[]) {
    let errors = [];
    const values = insertionValues
      .map((specimen) => specimenToArray(specimen))
      .filter((specimen) => !!specimen);

    const insertResponse = await axios
      .post(BACKEND_URL + '/api/insert/bulk', {
        values: values,
        table: databaseTable,
        columns: Object.keys(insertionValues[0]),
      })
      .catch((error) => error.response);

    if (insertResponse.status === 401) {
      // session expired
      expireSession();

      await awaitReauth();
    } else if (insertResponse.status !== 201) {
      const { code, sqlMessage, index } = insertResponse.data;
      errors.push({
        index,
        errors: [{ field: code, message: sqlMessage }],
      });
    }

    return errors;
  }

  async function insertRows(insertionValues: Partial<SpecimenFields>[]) {
    let serverErrors = [];
    for (let i = 0; i < insertionValues.length; i++) {
      const currentValue = insertionValues[i];
      const insertResponse = await axios
        .post(BACKEND_URL + '/api/insert/single', {
          values: currentValue,
          table: databaseTable,
        })
        .catch((error) => error.response);

      await handleProgressUpdate(i, insertionValues.length);

      if (insertResponse.status === 401) {
        // session expired
        expireSession();

        await awaitReauth().then(() => {
          i -= 1;
        });
      } else if (insertResponse.status !== 201) {
        const { code, sqlMessage } = insertResponse.data;
        serverErrors.push({
          index: i,
          errors: [{ field: code, message: sqlMessage }],
        });
      }
    }

    return serverErrors;
  }

  function interpret(allErrors: any, serverErrors: any) {
    if (serverErrors.length && allErrors.length) {
      notify({
        title: 'Client & Server Errors',
        message:
          'There was a combination of validation errors and SQL errors, please review the appropriate logs.',
        level: 'error',
      });
      updateBulkInsertLog([...serverErrors, ...allErrors]);
    } else if (serverErrors.length) {
      notify({
        title: 'Server Errors Occurred',
        message:
          'Some or all of the insertions emitted errors. Please review the appropriate logs.',
        level: 'error',
      });
      updateBulkInsertLog(serverErrors);
    } else if (allErrors.length) {
      notify({
        title: 'Validation Errors',
        message:
          'The insertion is completed, however validation errors were present. These rows were skipped, however please review the appropriate logs',
        level: 'warning',
      });
      updateBulkInsertLog(allErrors);
    } else {
      notify(
        {
          title: 'Insertions Complete',
          message: 'No errors detected',
          level: 'success',
        },
        'success'
      );
    }
  }

  async function handleUploadSubmit() {
    on();

    const { allErrors, insertionValues } = parseUploadRows();

    const insertions = allErrors.length
      ? insertionValues.filter((_, index) => {
          return allErrors.some((_, i) => i !== index);
        })
      : insertionValues;

    if (!insertions || !insertions.length) {
      notify({
        title: 'Could not complete query',
        message: 'All rows contained validation errors',
        level: 'error',
      });

      updateBulkInsertLog(allErrors);
    } else {
      const serverErrors = rowByRow
        ? await insertRows(insertions)
        : await bulkInsert(insertions);

      interpret(allErrors, serverErrors);
    }

    off();
  }

  async function handlePasteSubmit() {
    const readingConfig = { header: true };

    const results = readString(pasteData, readingConfig);

    on();

    const { allErrors, insertionValues } = parsePasteRows(results.data);

    const insertions = allErrors.length
      ? insertionValues.filter((_, index) => {
          return allErrors.some((_, i) => i !== index);
        })
      : insertionValues;

    if (!insertions || !insertions.length) {
      notify({
        title: 'Could not complete query',
        message: 'All rows contained validation errors',
        level: 'error',
      });

      updateBulkInsertLog(allErrors);
    } else {
      const serverErrors = rowByRow
        ? await insertRows(insertions)
        : await bulkInsert(insertions);

      interpret(allErrors, serverErrors);
    }

    off();
  }

  function downloadFailedRows() {
    if (!failureRef.current || !failureRef.current.length) {
      return;
    }

    csvRef.current?.link.click();
  }

  async function handleSubmit() {
    if (!databaseTable) {
      notify({
        title: 'Invalid Table',
        message: 'You must select a table!',
        level: 'error',
      });
    } else if (rawData && rawData.length > 0) {
      await handleUploadSubmit();
    } else if (pasteData) {
      await handlePasteSubmit();
    }

    if (downloadFailures) {
      downloadFailedRows();
    }
  }

  return (
    <React.Fragment>
      <CSVLink
        data={failureRef.current ?? []}
        filename="failures.csv"
        className="hidden"
        ref={csvRef}
        target="_blank"
      />

      <Modal open={loading ? true : open} size="medium" onClose={onClose}>
        <Modal.Content title="Bulk Insert Query">
          <Tabs
            fullWidth
            tabs={['File Upload', 'CSV Paste']}
            selectedIndex={tab}
            onChange={setTab}
          />

          <div className="pt-8 pb-2">
            <Select
              name=""
              className="-mt-3"
              options={tables}
              value={databaseTable}
              label="Select a Table"
              updateControlled={(newVal: any) => {
                setDatabaseTable(newVal);
              }}
            />

            <div className="flex space-x-2 py-2">
              <Radio label="CSV" checked={useCsv} onChange={useCsvMethods.on} />

              <Radio
                label="XLSX"
                checked={!useCsv}
                onChange={useCsvMethods.off}
              />
            </div>

            {tab === 0 && useCsv && (
              <CSVParser onFileUpload={(data: any) => setRawFile(data)} />
            )}

            {tab === 0 && !useCsv && (
              <ExcelReader onFileUpload={(data: any) => setRawFile(data)} />
            )}

            {tab === 1 && (
              <PasteUpload onFileUpload={(data: any) => setPasteData(data)} />
            )}

            <Radio
              className="pt-4"
              checked={rowByRow}
              label="Insert row-by-row"
              disabled={loading}
              onChange={setInsertMethod.on}
            />
            <Text>This is slower overall, but will skip failing rows</Text>

            <Radio
              className="pt-2"
              checked={!rowByRow}
              label="Insert all at once"
              disabled={loading}
              onChange={setInsertMethod.off}
            />
            <Text className="pb-3">
              This is much quicker overall, but the entire query will fail if
              one entry is invalid
            </Text>

            <Divider />

            <Radio
              className="pt-3"
              checked={downloadFailures}
              label="Download Failures on Insertion"
              disabled={loading}
              onChange={setDownloadMethods.toggle}
            />
            <Text>
              On successful insertion, any rows which failed client-side
              validation will be added to a new CSV and automatically downloaded
            </Text>

            {progress > 0 && (
              <div className="pt-4">
                <ProgressBar percent={progress} />
              </div>
            )}
          </div>
        </Modal.Content>

        <Modal.Footer>
          <Button.Group>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              loading={loading}
            >
              Submit
            </Button>
          </Button.Group>

          <div className="flex space-x-2 flex-1">
            <CreateLogModal initialTab={2} watch="bulkInsert" />
            <CreateHelpModal variant="insert" />
          </div>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
