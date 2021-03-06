import React from 'react';
import CircleButton from './CircleButton';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useNotify } from '../utils/context';

type CopyProps = {
  value: string;
  title?: string;
  disabled?: boolean;
};

export default function CopyButton({ title, value, disabled }: CopyProps) {
  const { notify } = useNotify();

  function onCopy() {
    notify({
      title: title ?? 'Text Copied',
      message: '',
      level: 'success',
    });
  }

  if (disabled) {
    return (
      <CircleButton
        disabled
        icon={
          <svg
            className="w-5 h-5 dark:text-dark-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        }
      />
    );
  }

  return (
    <CopyToClipboard text={value} onCopy={onCopy}>
      <CircleButton
        icon={
          <svg
            className="w-5 h-5 dark:text-dark-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        }
      />
    </CopyToClipboard>
  );
}
