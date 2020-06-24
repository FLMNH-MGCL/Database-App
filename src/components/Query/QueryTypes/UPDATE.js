import React from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Modal,
  Header,
  TextArea,
  ModalActions,
  Segment,
  Container,
} from "semantic-ui-react";
import { Checkmark } from "react-checkmark";
import {
  updateQueryOption,
  headerSelection,
  setOperatorOptions,
  setCountOptions,
  countryControl,
  sexControl,
  lifeStageControl,
  samplingProtocolControl,
  yesOrNo,
  geodeticDatumControl,
  identificationQualifierControl,
  preparationsControl,
  dispositionControl,
} from "../QueryConstants/constants";
import CreateHelpModal from "../../Help/CreateHelpModal";
import axios from "axios";
import ConfirmAuth from "../../../views/Admin/components/ConfirmAuth";
import CreateErrorLogModal from "../../Error/CreateErrorLogModal";
import { checkField } from "../../../functions/queryChecks";
import SemanticDatepicker from "react-semantic-ui-datepickers";

const setOptions = headerSelection.slice(1, headerSelection.length);

export default class UPDATE extends React.Component {
  state = {
    advanced_query: "",
    basic_query: true,
    query_action: "UPDATE",
    db: "",
    setCount: 1,
    sets: [
      {
        field: "",
        operator: "=",
        newValue: "",
      },
    ],
    conditionalCount: 1,
    conditionals: [
      {
        field: "",
        operator: "=",
        searchTerms: "",
      },
    ],
    loading: false,
    reason: "",
    loadingOptions: true,
    dbSelection: [],
    activePage: 0,
  };

  canContinue() {
    // return true;
    const { activePage } = this.state;

    let hasError = true;

    if (activePage === 0) {
      // fieldsToCheck = ["reason", "query_action", "db"];

      if (this.state.reason === "") {
        hasError = true;
      } else if (this.state.query_action !== "UPDATE") {
        hasError = true;
      } else if (this.state.db === "") {
        hasError = true;
      } else {
        hasError = false;
      }
    } else if (activePage === 1) {
      // check sets
      this.state.sets.forEach((set, index) => {
        const fieldError = this.checkSetContent(index, "field");
        const operatorError = this.checkSetContent(index, "operator");
        const valueError = this.checkSetContent(index, "newValue");

        if (fieldError || operatorError || valueError) {
          hasError = true;
        } else {
          hasError = false;
        }
      });
    } else if (activePage === 2) {
      // check conditionals
      this.state.conditionals.forEach((cond, index) => {
        const fieldError = this.checkConditionalContent(index, "field");
        const operatorError = this.checkConditionalContent(index, "operator");
        const valueError = this.checkConditionalContent(index, "searchTerms");

        if (fieldError || operatorError || valueError) {
          hasError = true;
        } else {
          hasError = false;
        }
      });
    }

    return !hasError;
  }

  // FIXME
  paginateForward() {
    if (this.state.activePage === 3) {
      return;
    } else if (this.canContinue()) {
      this.setState({ activePage: this.state.activePage + 1 });
    } else {
      this.props.notify({
        type: "error",
        message: "Please fix errors on this page before continuing",
      });
    }
  }

  paginateBackward() {
    if (this.state.activePage === 0) {
      return;
    } else {
      this.setState({ activePage: this.state.activePage - 1 });
    }
  }

  async initTableOptions(query_type) {
    let dbSelection = [];
    const { userData } = this.props;
    await axios
      .post("/api/list-tables/", {
        privilege_level: userData.privilege_level,
        query_type: query_type,
      })
      .then((response) => {
        if (response.data.error) {
          this.setState({ loadingOptions: false });
        } else {
          dbSelection = response.data.tables.map((table, index) => {
            return { key: index + 1 * 1002, text: table, value: table };
          });

          // console.log(dbSelection);
          this.setState({ dbSelection: dbSelection, loadingOptions: false });
        }
      });
  }

  // because you must fix errors before continuing through the form
  // it is unlikely this check will pick anything up, however for safety
  // reasons I am keeping it here and using it before attempt is sent to
  // sql server
  finalCheck() {
    // check sets and conditionals
    let errors = [];

    this.state.sets.forEach((set, index) => {
      const fieldError = this.checkSetContent(index, "field");
      const operatorError = this.checkSetContent(index, "operator");
      const valueError = this.checkSetContent(index, "newValue");

      if (fieldError) {
        errors.push(fieldError.content);
      }

      if (operatorError) {
        errors.push(operatorError.content);
      }

      if (valueError) {
        errors.push(valueError.content);
      }
    });

    // check conditionals
    this.state.conditionals.forEach((cond, index) => {
      const fieldError = this.checkConditionalContent(index, "field");
      const operatorError = this.checkConditionalContent(index, "operator");
      const valueError = this.checkConditionalContent(index, "searchTerms");

      if (fieldError) {
        errors.push(fieldError.content);
      }

      if (operatorError) {
        errors.push(operatorError.content);
      }

      if (valueError) {
        errors.push(valueError.content);
      }
    });

    return errors;
  }

  // generateModifications() {
  //   const { sets } = this.state;

  //   const changes = sets.map((change) => {
  //     return {
  //       field: change.field,
  //       oldValue: "unknown",
  //       newValue: change.newValue,
  //     };
  //   });

  //   var today = new Date();
  //   var dd = String(today.getDate()).padStart(2, "0");
  //   var mm = String(today.getMonth() + 1).padStart(2, "0");
  //   var yyyy = today.getFullYear();

  //   today = yyyy + "-" + mm + "-" + dd;

  //   let modification = {
  //     [today]: {
  //       modifiedBy: this.props.userData.username,
  //       fieldsChanged: changes,
  //       reasonForChanges: this.state.reason,
  //     },
  //   };
  // }

  handleSubmit = () => {
    this.setState({ loading: true });
    let errors = this.finalCheck();

    if (errors.length !== 0) {
      this.props.notify({
        type: "error",
        message: "Uh oh, some errors detected. Please check UPDATE error log",
      });
      this.props.updateUpdateErrorMessage(errors);
      this.setState({ loading: false });
      return;
    }

    let command = String(
      this.state.query_action + " " + this.state.db + " SET "
    );

    let setString = "";
    // let changes = []

    // var today = new Date();
    // var dd = String(today.getDate()).padStart(2, "0");
    // var mm = String(today.getMonth() + 1).padStart(2, "0");
    // var yyyy = today.getFullYear();
    // today = yyyy + "-" + mm + "-" + dd;

    this.state.sets.forEach((set, index) => {
      setString += set.field;
      setString += set.operator;
      setString += "'" + set.newValue + "'";

      if (index !== this.state.conditionalCount - 1) {
        setString += " AND ";
      }
    });

    let conditionalString = " WHERE ";

    this.state.conditionals.forEach((conditional, index) => {
      conditionalString += conditional.field + " ";
      conditionalString += conditional.operator + " ";
      conditionalString += "'" + conditional.searchTerms + "'";

      if (index !== this.state.conditionalCount - 1) {
        conditionalString += " AND ";
      }
    });

    command += setString;
    command += conditionalString;

    command += ";";

    this.props.runQuery(command);

    setTimeout(() => {
      if (!this.props.loading && !this.props.errorMessages.updateError) {
        this.setState({ loading: false });
        this.props.closeModal();
      } else {
        this.setState({ loading: false });
        this.notify({
          type: "error",
          message: "SQL errors occurred! Please check logs.",
        });
      }
    }, 1000);
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  handleSetCountChange = (e, { name, value }) => {
    // get previous count
    let prevCount = this.state.setCount;
    // if previous if smaller, concat more items to array
    if (prevCount < value) {
      let newSets = [...this.state.sets].concat(
        Array.from({ length: value - prevCount }, () => {
          return {
            field: "",
            operator: "=",
            newValue: "",
          };
        })
      );
      console.log(newSets);

      this.setState({
        [name]: value,
        sets: newSets,
      });
    } else if (prevCount > value) {
      let newSets = [...this.state.sets].slice(0, value);
      this.setState({
        [name]: value,
        sets: newSets,
      });
    }
    // if previous is bigger, slice to match new count
  };

  handleSetItemChange = (e, { name, value, id }) => {
    id = parseInt(id);
    const newSetItem = {
      ...this.state.sets[id],
      [name]: value,
    };

    this.setState({
      sets: [
        ...this.state.sets.slice(0, id),
        Object.assign({}, this.state.sets[id], newSetItem),
        ...this.state.sets.slice(id + 1),
      ],
    });
  };

  handleConditionalCountChange = (e, { name, value }) => {
    // get previous count
    let prevCount = this.state.conditionalCount;
    // if previous if smaller, concat more items to array
    if (prevCount < value) {
      let newConditionals = [...this.state.conditionals].concat(
        Array.from({ length: value - prevCount }, () => {
          return {
            field: "",
            operator: "=",
            searchTerms: "",
          };
        })
      );

      this.setState({
        [name]: value,
        conditionals: newConditionals,
      });
    } else if (prevCount > value) {
      let newConditionals = [...this.state.conditionals].slice(0, value);
      this.setState({
        [name]: value,
        conditionals: newConditionals,
      });
    }
    // if previous is bigger, slice to match new count
  };

  handleConditionalItemChange = (e, { name, value, id }) => {
    id = parseInt(id);
    const newConditional = {
      ...this.state.conditionals[id],
      [name]: value,
    };

    this.setState({
      conditionals: [
        ...this.state.conditionals.slice(0, id),
        Object.assign({}, this.state.conditionals[id], newConditional),
        ...this.state.conditionals.slice(id + 1),
      ],
    });
  };

  handleAdvancedCheck = (e, { name, value }) =>
    this.setState({ basic_query: !this.state.basic_query });

  checkSetContent = (index, setField) => {
    let set = this.state.sets[index];
    switch (setField) {
      case "field":
        if (set.field === "") {
          return { content: "You must select a UNIQUE field to alter." };
        }
        if (
          set.field.startsWith("'") ||
          set.field.endsWith("'") ||
          set.field.startsWith('"') ||
          set.field.startsWith('"')
        ) {
          return { content: "Remove starting/trailing punctuation." };
        }

        break;

      case "operator":
        if (set.operator === "") {
          return { content: "You must select an operator." };
        }
        break;

      case "newValue":
        if (set.newValue === "") {
          return {
            content: "You must enter a new value to update the original.",
          };
        }
        if (
          set.newValue.startsWith("'") ||
          set.newValue.endsWith("'") ||
          set.newValue.startsWith('"') ||
          set.newValue.endsWith('"')
        ) {
          return {
            content: "Remove starting/trailing punctuation/quotations.",
          };
        }
        break;

      default:
        return { content: `Error in set: Unknown field ${setField}` };
    }
  };

  basicErrorCheck(field, fieldValue) {
    if (!fieldValue) {
      fieldValue = "";
    }

    const errors = checkField(field, fieldValue);
    if (errors.length > 0) {
      const error = errors[0].split(":")[1];
      return { content: error };
    }
  }

  checkConditionalContent = (index, conditionalField) => {
    let condtional = this.state.conditionals[index];
    switch (conditionalField) {
      case "field":
        if (condtional.field === "") {
          return { content: "You must select a UNIQUE conditional field." };
        }
        if (
          condtional.field.startsWith("'") ||
          condtional.field.endsWith("'") ||
          condtional.field.startsWith('"') ||
          condtional.field.startsWith('"')
        ) {
          return { content: "Remove starting/trailing punctuation." };
        }

        break;

      case "operator":
        if (condtional.operator === "") {
          return { content: "You must select an operator." };
        }
        break;

      case "searchTerms":
        if (condtional.searchTerms === "") {
          return { content: "You must enter a value for the conditional." };
        }
        if (
          condtional.searchTerms.startsWith("'") ||
          condtional.searchTerms.endsWith("'") ||
          condtional.searchTerms.startsWith('"') ||
          condtional.searchTerms.endsWith('"')
        ) {
          return {
            content: "Remove starting/trailing punctuation/quotations.",
          };
        }
        break;

      default:
        return {
          content: `Error in condition: Unknown field ${conditionalField}`,
        };
    }
  };

  getSetFieldForm(index, fieldName, fieldValue) {
    switch (fieldName) {
      case "dateIdentified":
      case "loanDate":
      case "loanReturnDate":
        return (
          <SemanticDatepicker
            label="New Date"
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      case "country":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            options={countryControl}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      case "sex":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            options={sexControl}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      case "lifeStage":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            options={lifeStageControl}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      case "samplingProtocol":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            options={samplingProtocolControl}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      case "identificationQualifier":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            options={identificationQualifierControl}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      case "preparations":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            options={preparationsControl}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );

      case "disposition":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            options={dispositionControl}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );

      case "isLoaned":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            options={yesOrNo}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      case "loanInstitution":
      case "loaneeName":
        return (
          <Form.Field
            control={Input}
            label="New Value"
            placeholder="value"
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      case "elevationInMeters":
        return (
          <Form.Field
            control={Input}
            label="New Value"
            placeholder="value"
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck("elevationInMetersUPDATE", fieldValue)}
          />
        );
      case "geodeticDatum":
        return (
          <Form.Field
            control={Select}
            label="New Value"
            placeholder="Select One"
            options={geodeticDatumControl}
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
      default:
        return (
          <Form.Field
            control={Input}
            label="New Value"
            placeholder="value"
            name="newValue"
            value={this.state.sets[index].newValue}
            onChange={this.handleSetItemChange}
            id={String(index)}
            error={this.basicErrorCheck(fieldName, fieldValue)}
          />
        );
    }
  }

  renderSets = () => {
    // each set value should be an array position in the state's set array of objs
    // so each form field should change each elements field, op and newVal when changed
    let sets = Array.from({ length: this.state.setCount }, (item, index) => {
      return (
        <Form.Group widths="equal">
          <Form.Field
            control={Select}
            options={setOptions}
            label="SET (field)"
            placeholder="FIELD"
            search
            error={this.checkSetContent(index, "field")}
            name="field"
            index={index}
            value={this.state.sets[index].field}
            onChange={this.handleSetItemChange}
            id={String(index)}
            disabled={!this.state.basic_query}
          />
          <Form.Field
            control={Select}
            options={setOperatorOptions}
            label="Operator"
            placeholder="="
            name="operator"
            value={this.state.sets[index].operator}
            error={this.checkSetContent(index, "operator")}
            onChange={this.handleSetItemChange}
            id={String(index)}
            disabled={!this.state.basic_query}
          />
          {this.getSetFieldForm(
            index,
            this.state.sets[index].field,
            this.state.sets[index].newValue
          )}
        </Form.Group>
      );
    });
    return sets;
  };

  renderConditions = () => {
    let conditionals = Array.from(
      { length: this.state.conditionalCount },
      (item, index) => {
        return (
          <Form.Group widths="equal">
            <Form.Field
              control={Select}
              options={headerSelection}
              label="Field"
              placeholder="FIELD"
              search
              error={this.checkConditionalContent(index, "field")}
              name="field"
              value={this.state.conditionals[index].field}
              onChange={this.handleConditionalItemChange}
              id={String(index)}
              disabled={!this.state.basic_query}
            />
            <Form.Field
              control={Select}
              options={setOperatorOptions}
              label="Operator"
              placeholder="="
              name="operator"
              error={this.checkConditionalContent(index, "operator")}
              value={this.state.conditionals[index].operator}
              onChange={this.handleConditionalItemChange}
              id={String(index)}
              disabled={!this.state.basic_query}
            />
            <Form.Field
              control={Input}
              label="Conditional Value"
              placeholder="value"
              search
              name="searchTerms"
              error={this.checkConditionalContent(index, "searchTerms")}
              value={this.state.conditionals[index].searchTerms}
              onChange={this.handleConditionalItemChange}
              id={String(index)}
              disabled={!this.state.basic_query}
            />
          </Form.Group>
        );
      }
    );
    return conditionals;
  };

  checkAdvancedPostSubmit = () => {
    let errors = [];
    // check if its empty
    if (this.state.advanced_query === "" && !this.state.basic_query) {
      errors.push("Query Format Error: Empty submission.");
    }

    // check if its prefixed correctly
    if (
      !this.state.advanced_query.toUpperCase().startsWith("UPDATE") &&
      !this.state.basic_query
    ) {
      errors.push("Query Type Error: This query must be an UPDATE query.");
    }

    // check punctuation
    if (this.state.advanced_query.includes("'") && !this.state.basic_query) {
      errors.push(
        "Query Format Error: Remove any ', ` or ; punctuation marks, as these will be handled for you."
      );
    }

    // check for conditionals present
    if (
      !this.state.advanced_query.toUpperCase().includes("WHERE") &&
      this.state.advanced_query !== "" &&
      !this.state.basic_query
    ) {
      errors.push(
        "Query Format Error: You must include conditionals, only root can exclude them."
      );
    }

    if (this.state.advanced_query.endsWith(";") && !this.state.basic_query) {
      errors.push(
        "Query Format Error: Remove any ', ` or ; punctuation marks, as these will be handled for you."
      );
    }

    return errors;
  };

  checkAdvancedPreSubmit = () => {
    // check if its prefixed correctly
    if (
      !this.state.advanced_query.toUpperCase().startsWith("UPDATE") &&
      !this.state.basic_query
    ) {
      return {
        content: "This query must be an UPDATE query.",
      };
    }

    // check punctuation
    if (this.state.advanced_query.includes("'") && !this.state.basic_query) {
      return {
        content:
          "Remove any ', ` or ; punctuation marks, as these will be handled for you.",
      };
    }

    // check for conditionals present
    if (
      !this.state.advanced_query.toUpperCase().includes("WHERE") &&
      this.state.advanced_query !== "" &&
      !this.state.basic_query
    ) {
      return {
        content: "You must include conditionals, only root can exclude them.",
      };
    }

    if (this.state.advanced_query.endsWith(";") && !this.state.basic_query) {
      return {
        content:
          "Remove any ', ` or ; punctuation marks, as these will be handled for you.",
      };
    }
  };

  checkBasicPreSubmit = () => {
    let errors = [];

    if (this.state.query_action.toLowerCase() !== "update") {
      errors.push("Query Type Error: You must run an UPDATE query here.");
    }
    if (this.state.db === "") {
      errors.push("Query Format Error: You must select a database table.");
    }

    this.state.sets.forEach((set, index) => {
      if (set.field === "") {
        errors.push(
          `Query Format Error: You must select a UNIQUE field to alter. (Found empty value in row ${
            index + 1
          } of Sets)`
        );
      }
      if (set.operator !== "=") {
        errors.push(
          `Query Error: You must select an = operator for an update field. (Found ${set.operator}, expected =)`
        );
      }
      // implement check for specific field (i.e. controlled values)
      if (set.newValue === "") {
        errors.push(`Query Format Error: You must enter a new value.`);
      }
    });

    this.state.conditionals.forEach((conditional, index) => {
      if (conditional.field === "") {
        errors.push(
          `Query Format Error: You must select a UNIQUE conditional field. (Found empty value in row ${
            index + 1
          } of Conditionals)`
        );
      }
      // if (conditional.operator !== '=') {
      //   errors.push(`Query Error: You must select an = operator for an update field. (Found ${set.operator}, expected =)`)
      // }
      // implement check for specific field (i.e. controlled values)
      if (conditional.searchTerms === "") {
        errors.push(`Query Format Error: You must enter a new value.`);
      }
    });

    return errors;
  };

  renderPage() {
    const { activePage } = this.state;

    const { query_action, db, setCount, conditionalCount, reason } = this.state;

    let sets = this.renderSets();
    let conditionals = this.renderConditions();

    switch (activePage) {
      case 0:
        return (
          <>
            <Form.Group>
              <Form.Field
                width="sixteen"
                label={
                  <Header size="small">
                    You must enter a reason for this update
                  </Header>
                }
                control={TextArea}
                name="reason"
                value={reason}
                onChange={this.handleChange}
                error={
                  this.state.reason === ""
                    ? {
                        content: "You must provide a reason",
                        pointing: "above",
                      }
                    : false
                }
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field
                control={Select}
                options={updateQueryOption}
                label="QUERY"
                placeholder="UPDATE"
                search
                name="query_action"
                error={
                  this.state.query_action !== "UPDATE" && this.state.basic_query
                    ? { content: "You must run an UPDATE query here." }
                    : false
                }
                value={query_action}
                onChange={this.handleChange}
                disabled={!this.state.basic_query}
                required
              />
              <Form.Field
                control={Select}
                options={this.state.dbSelection}
                label="Database Table"
                placeholder=""
                search
                error={
                  this.state.db === "" && this.state.basic_query
                    ? { content: "You must select a database table." }
                    : false
                }
                name="db"
                value={db}
                onChange={this.handleChange}
                disabled={!this.state.basic_query}
              />
            </Form.Group>
          </>
        );

      case 1:
        return (
          <>
            <Form.Group widths="equal">
              <Form.Field
                control={Select}
                label="How many fields are being updated (a SQL 'set' clause)"
                options={setCountOptions}
                name="setCount"
                value={setCount}
                onChange={this.handleSetCountChange}
                // disabled={!this.state.basic_query}
              />
            </Form.Group>
            <Segment
              style={{
                minHeight: "100%",
                maxHeight: "50vh",
                overflowY: "scroll",
              }}
            >
              {sets}
            </Segment>
          </>
        );

      case 2:
        return (
          <>
            <Form.Group widths="equal">
              <Form.Field
                control={Select}
                label="How many conditions are there (a SQL 'where' clause)"
                options={setCountOptions}
                name="conditionalCount"
                value={conditionalCount}
                onChange={this.handleConditionalCountChange}
                disabled={!this.state.basic_query}
              />
            </Form.Group>
            <Segment style={{ maxHeight: "30vh", overflowY: "scroll" }}>
              {conditionals}
            </Segment>
          </>
        );

      case 3:
        return (
          <>
            <Header size="medium" textAlign="center">
              Form Completed!
            </Header>
            <Checkmark size="large" />
            <Container text textAlign="center" style={{ marginTop: "1rem" }}>
              <p>
                Press submit to attempt the update. Be sure to fix any errors
                that are detected and displayed in the error log.
              </p>
            </Container>
          </>
        );

      default:
        return (
          <div>
            Woah! You broke it!! How'd you get here?? That's pretty cool, make
            sure to let Aaron know exactly what you did so he can try and find
            the bug!
          </div>
        );
    }
  }

  renderActions() {
    return (
      <ModalActions>
        <CreateHelpModal queryType="UPDATE" />
        <CreateErrorLogModal
          type="Update"
          errors={this.props.errorMessages.updateError}
          updateError={this.props.updateUpdateErrorMessage}
        />
        <Button onClick={() => this.props.closeModal()}>Cancel</Button>
        {this.state.activePage !== 0 && (
          <Button onClick={this.paginateBackward.bind(this)}>Back</Button>
        )}
        {this.state.activePage === 3 ? (
          <ConfirmAuth
            checkAuth={this.props.checkAuth}
            handleSubmit={this.handleSubmit}
          />
        ) : (
          <Button onClick={this.paginateForward.bind(this)}>Continue</Button>
        )}
      </ModalActions>
    );
  }

  render() {
    const { loadingOptions, dbSelection } = this.state;

    if (dbSelection.length === 0 && loadingOptions) {
      this.initTableOptions("update");
    }

    // // console.log(this.state);
    // let sets = this.renderSets();
    // let conditionals = this.renderConditions();

    if (this.props.disabled) {
      return <div></div>;
    }

    return (
      <>
        <Modal.Header>Update Query</Modal.Header>
        <Modal.Content>
          <Form>{this.renderPage()}</Form>
        </Modal.Content>

        {this.renderActions()}
      </>
    );
  }
}
