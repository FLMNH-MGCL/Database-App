import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  NeutralValidator,
  validateFieldSelection,
  validateOperator,
  validateTableSelection,
  validateSetValue,
} from '../../functions/validation';
import numberParser from 'number-to-words';
import { conditionCountOptions, updateFieldOptions } from '../utils/constants';
import ConditionalForm from './ConditionalForm';
import { fetchTables } from './utils';
import useExpiredSession from '../utils/useExpiredSession';
import { Form, FormSubmitValues, Heading, SelectOption } from '@flmnh-mgcl/ui';
import CodeEditor from '../CodeEditor';

type SetFormProps = {
  advanced: boolean;
};

// TODO: add sets!
function SetForm({ advanced }: SetFormProps) {
  const { getValues, watch } = useFormContext();
  const setCountOptions = conditionCountOptions.filter((el) => el.value !== 0);

  const [setCount, updateSetCount] = useState(1);

  watch();

  function setValidator(validator: any) {
    if (!advanced) {
      return validator;
    } else return NeutralValidator;
  }

  return (
    <React.Fragment>
      <Heading className="pt-3 pb-1">Set Statements</Heading>

      <Form.Group flex>
        <Form.Select
          name="setCount"
          label="How many set statements? (i.e. how many fields are you updating)"
          value={setCount}
          disabled={advanced}
          fullWidth
          searchable
          options={setCountOptions}
          updateControlled={(newVal: any) => {
            updateSetCount(newVal);
          }}
          toolTip="A set is like an assigment operation, I am setting a field to a new value. So this just asks how many assignments you want."
          toolTipOrigin="right"
        />
      </Form.Group>

      <div className="z-0 bg-gray-50 dark:bg-dark-600 dark:text-dark-300 rounded-lg w-full p-3">
        <div className="">
          {Array.from({ length: setCount }).map((_, index) => {
            const numberInEnglish = numberParser.toWords(index);

            const setFieldVal = getValues()[`setField_${numberInEnglish}`];

            // TODO, pass to validateConditionalValue
            //@ts-ignore
            // const setOperator = getValues()[`setOperator_${numberInEnglish}`];

            return (
              <Form.Group flex key={index}>
                <Form.Select
                  name={`setField_${numberInEnglish}`}
                  label="Field"
                  disabled={advanced}
                  fullWidth
                  options={updateFieldOptions}
                  searchable
                  register={{
                    validate: setValidator(validateFieldSelection),
                  }}
                  toolTip="The field that will be updated"
                  toolTipOrigin="right"
                />

                <Form.Input
                  name={`setOperator_${numberInEnglish}`}
                  label="Operator"
                  disabled
                  value="="
                  fullWidth
                  register={{
                    validate: setValidator(validateOperator),
                  }}
                  toolTip="This is set to =, since you're assigning a value to a field"
                  toolTipOrigin="right"
                />
                <Form.Input
                  name={`setValue_${numberInEnglish}`}
                  label="Value"
                  disabled={advanced}
                  fullWidth
                  register={{
                    validate: setValidator((value: any) =>
                      validateSetValue(value, setFieldVal)
                    ),
                  }}
                  toolTip="The value that the field will be updated to"
                  toolTipOrigin="right"
                />
              </Form.Group>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
}

type Props = {
  onSubmit(values: FormSubmitValues): void;
};

export default function UpdateBulkQueryForm({ onSubmit }: Props) {
  const [advanced, setAdvanced] = useState(false);
  const [tables, setTables] = useState<SelectOption[]>([]);
  const [code, setCode] = useState('');

  const [expiredSession, { expireSession }] = useExpiredSession();

  // TODO: type validator as function
  function setValidator(validator: any) {
    if (!advanced) {
      return validator;
    } else return NeutralValidator;
  }

  // if modal launches and session is expired, trigger reauth modal
  // once reauthed, the effect will retrigger and load the tables for the
  // select input
  useEffect(() => {
    async function init() {
      const errored = await fetchTables(setTables);

      if (errored) {
        if (errored === 'BAD SESSION') {
          expireSession();
        } else {
          throw new Error('Some other error occurred!');
        }
      }
    }

    init();
  }, [expiredSession.current]);

  return (
    <Form onSubmit={onSubmit} id="update-bulk-form" className="mb-3">
      <Form.Group flex>
        <Form.Radio
          name="advanced-check"
          checked={advanced}
          onChange={() => setAdvanced(!advanced)}
          label="Advanced Query"
        />
      </Form.Group>

      <Form.Group>
        <CodeEditor code={code} setCode={setCode} disabled={!advanced} small />
        {/* hidden input to capture the input on submit */}
        <Form.Input
          className="hidden"
          name="advancedQuery"
          value={code}
          disabled={!advanced}
        />
      </Form.Group>

      <Form.Group flex>
        <Form.Input
          name="queryType"
          disabled
          value="UPDATE"
          label="Query Type"
          fullWidth
        />

        <Form.Select
          name="databaseTable"
          label="Table"
          disabled={advanced}
          fullWidth
          searchable
          options={tables}
          register={{ validate: setValidator(validateTableSelection) }}
          toolTip="This is the database table from which the data will be queried"
          toolTipOrigin="right"
        />
      </Form.Group>

      <SetForm advanced={advanced} />

      <ConditionalForm
        advanced={advanced}
        min={1}
        fieldsOverride={updateFieldOptions}
      />
    </Form>
  );
}
