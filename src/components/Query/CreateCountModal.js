import React from "react";
import { Modal } from "semantic-ui-react";
import { COUNT } from "./QueryTypes";

export default function CreateCountModal({ open, props, closeModal }) {
  return (
    <Modal centered open={open} size="small" onClose={closeModal}>
      <COUNT
        // dbSelection={dbSelection}
        runCountQuery={props.runCountQuery}
        countQueryCount={props.countQueryCount}
        closeModal={closeModal}
        updateCountQueryCount={props.updateCountQueryCount}
        errorMessages={props.errorMessages}
        updateCountErrorMessage={props.updateCountErrorMessage}
        notify={props.notify}
        userData={props.userData}
      />
    </Modal>
  );
}
