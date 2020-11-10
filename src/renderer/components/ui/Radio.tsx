import clsx from 'clsx';
import React, { forwardRef } from 'react';

type Props = {
  checked: boolean;
  label?: string;
  stacked?: boolean;
} & React.ComponentProps<'input'>;

export default forwardRef<HTMLInputElement, Props>(
  ({ label, checked, stacked, className, ...props }, ref) => {
    return (
      <div
        className={clsx(
          'flex items-center ',
          stacked && 'flex-col justify-center space-y-1'
        )}
      >
        <input
          ref={ref}
          checked={checked}
          disabled={props.disabled}
          type="checkbox"
          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out cursor-pointer"
          {...props}
        />
        <label
          className="ml-2 block text-sm leading-5 text-gray-900 cursor-pointer"
          // @ts-ignore: this will work
          onClick={props.onChange}
        >
          {label}
        </label>
      </div>
    );
  }
);
