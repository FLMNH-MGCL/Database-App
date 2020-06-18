import React, { useState } from "react";
import { Modal, Button, Icon, Form, Select, Input } from "semantic-ui-react";
import ConfirmAuth from "./ConfirmAuth";
import axios from "axios";

const ACCESS_LEVELS = [
  { key: "Guest", text: "Guest", value: "guest" },
  { key: "Manager", text: "Manager", value: "manager" },
  { key: "Admin", text: "Admin", value: "admin" },
];

export default function AddTableModal({
  tables,
  checkAuth,
  createNotification,
  refresh,
  errors,
  updateError,
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [minSel, setMinSel] = useState("guest");
  const [minIns, setMinIns] = useState("manager");
  const [minUp, setMinUp] = useState("manager");
  const [hasError, setHasError] = useState(false);

  const tableNames = tables ? tables.map((table) => table.tbl_name) : [];

  function resetState() {
    setOpen(false);
    setName("");
    setMinSel("guest");
    setMinIns("manager");
    setMinUp("manager");
    setHasError(false);
  }

  async function registerTable(tableAttributes) {
    // axios to register table to admin table of tables
    const registerResponse = await axios.post("/api/admin/register-table/", {
      tableAttributes: tableAttributes,
    });

    console.log(registerResponse);
    if (registerResponse.data.data) {
      // createNotification({
      //   type: "success",
      //   message: registerResponse.data.data,
      // });
      return true;
    } else {
      createNotification({
        type: "error",
        message: registerResponse.data.sqlMessage.sqlMessage,
      });

      updateError([registerResponse.data.sqlMessage.sqlMessage]);
      return false;
    }
  }

  async function handleSubmit() {
    if (hasError) {
      createNotification({
        type: "error",
        message: "You must fix errors in form.",
      });
      return;
    }

    const tableAttributes = {
      tbl_name: name,
      minimum_access_update: minUp,
      minimum_access_insert: minIns,
      minimum_access_select: minSel,
    };

    // axios to create table
    const creationResponse = await axios.post("/api/admin/create-table/", {
      tableName: name,
    });

    console.log(creationResponse);

    if (creationResponse.data.error) {
      // short curcuit function
      createNotification({
        type: "error",
        message: creationResponse.data.error.sqlMessage,
      });

      updateError([creationResponse.data.error.sqlMessage]);

      return;
    }

    const registeredResponse = await registerTable(tableAttributes);

    if (!registeredResponse) {
      // this should never happen
      createNotification({
        type: "warning",
        message:
          "Table successfully created, however could not register to interactables. Please contact Aaron for support and check the logs.",
      });
    } else {
      createNotification({
        type: "success",
        message: "Successfully created and registered table!",
      });
    }
  }

  function checkName(tables) {
    if (!tables) return;
    // console.log(tables);
    if (tables.indexOf(name) > -1) {
      if (!hasError) {
        setHasError(true);
      }
      return { content: "Must enter unique table name" };
    }

    if (name.length < 4) {
      return { content: "Name must be at least 4 characters long." };
    }

    if (hasError) setHasError(false);
  }

  return (
    <Modal
      trigger={
        <Button
          floated="right"
          icon
          labelPosition="left"
          color="green"
          size="small"
          onClick={() => setOpen(true)}
        >
          <Icon name="table" /> Create
        </Button>
      }
      onClose={resetState}
      open={open}
      size="small"
    >
      <Modal.Header>Create a New Table</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Group widths="equal">
            <Form.Field
              control={Input}
              label="Table Name"
              value={name}
              onChange={(e, { value }) => setName(value)}
              error={checkName(tableNames)}
            />
            <Form.Field
              control={Select}
              options={ACCESS_LEVELS}
              label="Minimum Role for Insert"
              value={minIns}
              onChange={(e, { value }) => setMinIns(value)}
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field
              control={Select}
              options={ACCESS_LEVELS}
              label="Minimum Role for Update"
              value={minUp}
              onChange={(e, { value }) => setMinUp(value)}
            />
            <Form.Field
              control={Select}
              options={ACCESS_LEVELS}
              label="Minimum Role for Select"
              value={minSel}
              onChange={(e, { value }) => setMinSel(value)}
            />
          </Form.Group>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button icon basic color="linkedin" floated="left">
          <Icon name="question" />
        </Button>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <ConfirmAuth handleSubmit={handleSubmit} checkAuth={checkAuth} />
      </Modal.Actions>
    </Modal>
  );
}
