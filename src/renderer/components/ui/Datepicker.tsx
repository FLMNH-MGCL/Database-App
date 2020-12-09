import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import DayPicker, { DateUtils, RangeModifier } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import Form from './Form';
import useToggle from '../utils/useToggle';
import OutsideClickHandler from 'react-outside-click-handler';
import useKeyboard from '../utils/useKeyboard';
import { AnimatePresence, motion } from 'framer-motion';
import { PropsOf } from '../../types';
import { isArray } from 'lodash';

type SinglePickerProps = {
  label?: string;
  name?: string;
  futureOnly?: boolean;
  pastOnly?: boolean;
  ranged?: boolean;
  fullWidth?: boolean;
  initialDate?: string | Date;
  placeholder?: string;
} & PropsOf<typeof Form.Input>;

// TODO: handle initial date for BOTH variants

function SinglePicker({
  label,
  fullWidth,
  initialDate,
  ...props
}: SinglePickerProps) {
  const [value, setValue] = useState<Date>();
  const [dateString, setDateString] = useState(getDateString());

  // const placeholder = new Date().toISOString().split('T')[0];

  const [visible, { on, off }] = useToggle(false);

  function setInitialState() {
    if (initialDate) {
      if (typeof initialDate === 'object') {
        setValue(initialDate);
      } else {
        try {
          const date = new Date(initialDate);
          setValue(date);
        } catch {
          throw new Error(
            `Attempted to parse invalid date in DatePicker: ${initialDate}`
          );
        }
      }
    }
  }

  function handleDayClick(day: Date) {
    setValue(day);
  }

  function getDateString() {
    if (!value) {
      return '';
    } else {
      return value?.toISOString().split('T')[0];
    }
  }

  function handleResetClick() {
    setValue(undefined);
  }

  useEffect(() => {
    setInitialState();
  }, []);

  useEffect(() => {
    setDateString(getDateString());
  }, [value]);

  useKeyboard('Escape', () => {
    off();
  });

  return (
    <label
      className={clsx(
        fullWidth && 'flex-1',
        'block text-sm font-medium leading-5 text-gray-700'
      )}
    >
      {label}

      <OutsideClickHandler onOutsideClick={off}>
        <div className="mt-1 relative">
          <AnimatePresence>
            {visible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
              >
                <DayPicker
                  className="absolute bg-white mt-12 rounded-md shadow z-50"
                  onDayClick={handleDayClick}
                  selectedDays={value}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Doing this to access the string during onSubmit */}
          <Form.Input
            slim={props.slim}
            placeholder={props.placeholder ?? 'Select a Day'}
            name={props.name}
            value={dateString}
            onChange={() => dateString}
            onClick={on}
            register={props.register}
            disabled={props.disabled}
          />

          <div className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            {value && !props.disabled && (
              <svg
                onClick={handleResetClick}
                className="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
        </div>
      </OutsideClickHandler>
    </label>
  );
}

type Range = { from?: Date; to?: Date };

type RangedPickerProps = Omit<SinglePickerProps, 'initalDate'> & {
  initialDate?: Range;
};

function RangedPicker({
  label,
  fullWidth,
  initialDate,
  ...props
}: RangedPickerProps) {
  const [range, setRange] = useState<Range>(getInitialState());
  const [rangeString, setRangeString] = useState(getDateString());

  const [visible, { on, off }] = useToggle(false);

  const { to, from } = range;
  const modifiers = { start: from, end: to };

  function getInitialState() {
    return {
      from: undefined,
      to: undefined,
    };
  }

  function setInitialState() {
    if (initialDate) {
      if (!isArray(initialDate)) {
        throw new Error(
          'Invalid date passed into Datepicker (must be array with two Dates)'
        );
      } else {
        try {
          setRange(initialDate);
        } catch {
          throw new Error(
            `Attempted to parse invalid date in DatePicker: ${initialDate}`
          );
        }
      }
    }
  }

  useEffect(() => {
    setInitialState();
  }, []);

  function getDateString() {
    if (!to && !from) {
      return '';
    } else {
      return clsx(
        from?.toISOString().split('T')[0],
        'to',
        to?.toISOString().split('T')[0]
      );
    }
  }

  function handleDayClick(day: Date) {
    const newRange = DateUtils.addDayToRange(day, range as RangeModifier);
    setRange(newRange);
  }

  function handleResetClick() {
    setRange(getInitialState());
  }

  function hasRange() {
    return range.to && range.from;
  }

  useEffect(() => {
    setRangeString(getDateString());
  }, [range]);

  useKeyboard('Escape', () => {
    off();
  });

  return (
    <label
      className={clsx(
        fullWidth && 'flex-1',
        'block text-sm font-medium leading-5 text-gray-700'
      )}
    >
      {label}
      <OutsideClickHandler onOutsideClick={off}>
        <div className="mt-1 relative">
          <AnimatePresence>
            {visible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
              >
                {/* @ts-ignore: it works I promise */}
                <DayPicker
                  className="absolute bg-white mt-12 rounded-md shadow"
                  selectedDays={[from, { from, to }]}
                  modifiers={modifiers}
                  onDayClick={handleDayClick}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Doing this to access the string during onSubmit */}
          <Form.Input
            slim={props.slim}
            placeholder="Select a range"
            name={props.name}
            register={props.register}
            value={rangeString}
            onChange={() => rangeString}
            onClick={on}
          />

          <div className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
            <svg
              className="w-4 h-4 "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            {hasRange() && (
              <svg
                onClick={handleResetClick}
                className="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
        </div>
      </OutsideClickHandler>
    </label>
  );
}

type Props = SinglePickerProps | RangedPickerProps;

export default function Datepicker({ ranged, ...props }: Props) {
  if (ranged) {
    // @ts-ignore: I know there are type issues with initial date
    return <RangedPicker {...props} />;
  } else {
    return <SinglePicker {...props} />;
  }
}

// export function MonthPicker() {

// }

// export function DayPicker() {

// }
