import React from 'react';
import Button from '../ui/Button';
import useQuery from '../utils/useQuery';

export default function RefreshQueryButton({
  disabled,
}: {
  disabled?: boolean;
}) {
  const [{ refresh }] = useQuery();

  return (
    <Button variant="outline" rounded disabled={disabled} onClick={refresh}>
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </Button>
  );
}
