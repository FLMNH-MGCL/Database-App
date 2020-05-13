import React from "react";
import { Modal } from "semantic-ui-react";
import FormInsert from "./InsertTypes/FormInsert";

export default function CreatePasteModal({
  props,
  open,
  closeModal,
  checkAuth,
}) {
  return (
    <Modal open={open} size="small" onClose={closeModal}>
      <FormInsert {...props} closeModal={closeModal} checkAuth={checkAuth} />
    </Modal>
  );
}