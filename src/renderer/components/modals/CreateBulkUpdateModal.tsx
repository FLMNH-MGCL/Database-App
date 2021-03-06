import React from 'react';
import { useNotify } from '../utils/context';
import useKeyboard from '../utils/useKeyboard';
import CreateLogModal from './CreateLogModal';
import numberParser from 'number-to-words';
import { buildUpdateQuery } from '../../functions/builder';
import UpdateBulkQueryForm from '../forms/UpdateBulkQueryForm';
import CreateHelpModal from './CreateHelpModal';
import useToggle from '../utils/useToggle';
import useQuery from '../utils/useQuery';
import { Button, FormSubmitValues, Modal } from '@flmnh-mgcl/ui';
import { getDatabaseTableFromAdvancedUpdate } from '../../functions/util';
import { validateAdvancedUpdateQuery } from '../../functions/validation';
import { useStore } from '../../../stores';

type Props = {
  open: boolean;
  onClose(): void;
};

export default function CreateBulkUpdateModal({ open, onClose }: Props) {
  const { notify } = useNotify();

  const [loading, { on, off }] = useToggle(false);

  const { update, advancedUpdate, logUpdate } = useQuery();
  const updateUpdateLog = useStore((state) => state.updateUpdateLog);

  useKeyboard('Escape', () => {
    onClose();
  });

  function parseConditions(count: any, values: FormSubmitValues) {
    const numConditions = parseInt(count, 10);

    if (numConditions < 1) {
      notify({
        title: 'Invalid Conditions',
        message: 'You must specify at least one condition',
        level: 'error',
      });

      return null;
    }

    let conditionals = [];

    for (let i = 0; i < numConditions; i++) {
      const current = numberParser.toWords(i);

      conditionals.push({
        field: values[`conditionalField_${current}`],
        operator: values[`conditionalOperator_${current}`],
        value: values[`conditionalValue_${current}`],
      });
    }

    return conditionals;
  }

  function parseSets(count: any, values: FormSubmitValues) {
    const numSets = parseInt(count, 10);

    if (numSets < 1) {
      notify({
        title: 'Invalid Set Statements',
        message: 'You must specify at least one set statement',
        level: 'error',
      });

      return null;
    }

    let sets = [];

    for (let i = 0; i < numSets; i++) {
      const current = numberParser.toWords(i);

      sets.push({
        field: values[`setField_${current}`],
        operator: values[`setOperator_${current}`],
        value: values[`setValue_${current}`],
      });
    }

    return sets;
  }

  function checkNumChanges(message: string) {
    if (message.includes('Changed: 0') || message.includes('Rows matched: 0')) {
      notify({
        title: 'No matches found',
        message:
          'No tuples matched your conditions for the update, and therefore no changes were made.',
        level: 'info',
      });
    } else {
      notify({
        title: 'Update Successful',
        message,
        level: 'success',
      });
    }
  }

  async function runAdvancedQuery(query: string) {
    const table = getDatabaseTableFromAdvancedUpdate(query);

    if (table) {
      const { errors } = validateAdvancedUpdateQuery(query);
      if (errors) {
        notify({
          title: 'Update Failed',
          message:
            'Your query failed validation, please view the corresponding logs.',
          level: 'error',
        });

        updateUpdateLog(errors);
      } else {
        const ret = await advancedUpdate(query);

        if (ret) {
          const { queryString, message } = ret;

          checkNumChanges(message);

          if (queryString) {
            await logUpdate(queryString, null, table, null);
          }

          off();
        }
      }
    } else {
      notify({
        title: 'Could not determine table',
        message: "Please ensure you use 'UPDATE tablename SET' notation.",
        level: 'error',
      });
    }
  }

  async function handleSubmit(values: FormSubmitValues) {
    on();

    const { advancedQuery, setCount, conditionalCount, databaseTable } = values;

    let query: string = '';
    let conditions = null;

    if (advancedQuery) {
      await runAdvancedQuery(advancedQuery);
    } else {
      const conditionals = parseConditions(conditionalCount, values);

      if (!conditionals) {
        off();
        return;
      }

      const sets = parseSets(setCount, values);

      if (!sets) {
        off();
        return;
      }

      const { queryString, conditionalPairs, updates } = buildUpdateQuery(
        databaseTable,
        conditionals,
        sets
      );

      query = queryString;
      conditions = conditionalPairs;

      if (!query) {
        off();

        notify({
          title: 'Update Unsuccessful',
          message: 'Please create a bug report on GitHub',
          level: 'error',
        });

        return;
      }

      const queryStringRet = await update(query, conditions, updates);

      if (queryStringRet) {
        const { queryStr, message } = queryStringRet;

        checkNumChanges(message);

        await logUpdate(queryStr, null, databaseTable, null);
      }

      off();
    }

    off();
  }

  return (
    <React.Fragment>
      <Modal open={open} onClose={onClose} size="medium">
        <Modal.Content title="Update Query">
          <UpdateBulkQueryForm onSubmit={handleSubmit} />
        </Modal.Content>

        <Modal.Footer>
          <Button.Group>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              form="update-bulk-form"
              loading={loading}
            >
              Confirm
            </Button>
          </Button.Group>

          <div className="flex space-x-2 flex-1">
            <CreateLogModal initialTab={3} />
            <CreateHelpModal variant="update" />
          </div>
        </Modal.Footer>
      </Modal>

      {/* <Dropdown.Item text="Select" onClick={on} /> */}
    </React.Fragment>
  );
}
