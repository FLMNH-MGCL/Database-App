import { Button } from '@flmnh-mgcl/ui';
import React from 'react';

type Props = {
  disabled?: boolean;
  onClick?(): void;
};

export default function HeaderConfigButton({ disabled, onClick }: Props) {
  return (
    <Button variant="outline" rounded onClick={onClick} disabled={disabled}>
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
          strokeWidth="2"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        ></path>
      </svg>
    </Button>
  );
}
