import React from "react";
import { Modal } from "semantic-ui-react";
import CSVInsert from "./InsertTypes/CSVInsert";
import "./../../assets/globals.css";

export default function CreatePasteModal({ props, open, closeModal }) {
  return (
    <Modal open={open} size="small" onClose={closeModal}>
      <CSVInsert {...props} closeModal={closeModal} />
    </Modal>
  );
}
