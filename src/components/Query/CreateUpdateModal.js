import React from "react";
import { Modal } from "semantic-ui-react";
import { UPDATE } from "./QueryTypes";

export default function CreateUpdateModal({
  open,
  props,
  closeModal,
  checkAuth,
}) {
  return (
    <Modal centered open={open} size="small" onClose={closeModal}>
      <UPDATE
        // dbSelection={dbSelection}
        runUpdateQuery={props.runUpdateQuery}
        refresh={props.refresh}
        clearQuery={props.clearQuery}
        closeModal={closeModal}
        errorMessages={props.errorMessages}
        updateUpdateErrorMessage={props.updateUpdateErrorMessage}
        notify={props.notify}
        disabled={props.disabled}
        userData={props.userData}
        checkAuth={checkAuth}
      />
    </Modal>
  );
}
