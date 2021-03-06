import React from 'react';
import { useNavigate } from 'react-router-dom';
import CircleButton from './CircleButton';

type Props = {
  to?: string;
};

export default function BackButton({ to = '..' }: Props) {
  const navigate = useNavigate();

  return (
    <CircleButton
      icon={
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      }
      onClick={() => navigate(to)}
    />
  );
}
