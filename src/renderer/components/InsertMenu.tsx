import React from "react";
import CreateBulkInsertModal from "./modals/CreateBulkInsertModal";
import Dropdown from "./ui/Dropdown";

export default function InsertMenu() {
  return (
    <Dropdown
      label="Insert"
      labelIcon={
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      }
    >
      <Dropdown.Header text="Insert Menu" />
      <CreateBulkInsertModal />
    </Dropdown>
  );
}
