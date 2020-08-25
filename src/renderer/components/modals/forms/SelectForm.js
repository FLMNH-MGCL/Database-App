//
import React from "react";

import {
  Button,
  Form,
  Input,
  Select,
  Checkbox,
  Modal,
  Header,
} from "semantic-ui-react";
import {
  selectQueryOption,
  headerSelection,
  // setOperatorOptions,
  conditionalOperatorOptions,
  // setCountOptions,
  conditionalCountOptions,
} from "../../../constants/constants";

import CreateHelpModal from "../CreateHelpModal";
import axios from "axios";
import CreateErrorLogModal from "../CreateErrorLogModal";

export default class SelectForm extends React.Component {
  state = {
    advanced_query: "",
    basic_query: true,
    query_action: "SELECT",
    fields: ["*"],
    db: "",
    conditionalCount: 0,
    conditionals: [],
    fields_search: [],
    search_: "",
    operator: "",
    loading: false,
    loadingOptions: true,
    dbSelection: [],
  };

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

  checkBasicQueryErrors = () => {
    // return ['test 1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test 1', 'test2', 'test3', 'test4', 'test5', 'test6']
    let errors = [];
    if (this.state.query_action.toUpperCase() !== "SELECT") {
      errors.push(
        "Query Type Error: Invalid query type. This section is reserved for SELECT queries only."
      );
    }
    if (this.state.fields.length > 1 && this.state.fields.indexOf("*") > -1) {
      errors.push(
        "Query Format Error: If ALL is selected, no other fields should be selected."
      );
    }
    if (this.state.fields.length === 0) {
      errors.push("Query Format Error: A field must be selected.");
    }
    if (this.state.db === "") {
      errors.push("Query Format Error: A database table must be selected.");
    }
    if (this.state.fields.indexOf("*") < 0) {
      this.state.conditionals.forEach((condition, index) => {
        if (this.state.fields.indexOf(condition.field) < 0) {
          errors.push(
            `Query Format Error: Attempting have condition in field not queried for. Field ${condition.field} is missing from query.`
          );
        }
      });
    }

    // if () {
    //     errors.push()
    // }
    // if () {
    //     errors.push()
    // }

    return errors;
  };

  checkFieldError = () => {
    if (this.state.fields.length < 1) {
      return { content: "You must select a field." };
    } else if (
      this.state.fields.length > 1 &&
      this.state.fields.indexOf("*") > -1
    ) {
      return {
        content: "If All is selected no other fields should be selected.",
      };
    }
  };

  checkAdvancedSelect = () => {
    let errors = [];
    if (this.state.advanced_query === "") {
      errors.push("Format Error: Empty submission detected.");
    }
    if (!this.state.advanced_query.toLowerCase().startsWith("select")) {
      errors.push(
        "Query Format Error: Invalid query type. This section is reserved for SELECT queries only."
      );
    }

    return errors;
  };

  // DANGEROUS, EASY TO BREAK NEED MORE CHECKS
  handleSubmit = () => {
    let errors = this.checkBasicQueryErrors();
    if (errors.length > 0) {
      // errors found, update redux error for select query
      this.props.notify({
        type: "error",
        message: "Uh oh, some errors detected. Please check SELECT error log",
      });
      this.props.updateSelectErrorMessage(errors);
      return;
    } else {
      // console.log('made it to else???')
      let command = String(this.state.query_action + " ");

      for (let i = 0; i < this.state.fields.length; i++) {
        command += this.state.fields[i];

        if (i !== this.state.fields.length - 1) {
          command += ",";
        } else {
          if (this.state.fields.indexOf("*") < 0) {
            command += ",id ";
          } else {
            command += " ";
          }
        }
      }

      command += "FROM " + this.state.db;

      if (this.state.conditionalCount > 0) {
        command += " WHERE ";

        let conditionalString = "";

        this.state.conditionals.forEach((conditional, index) => {
          conditionalString += conditional.field + " ";
          conditionalString += conditional.operator + " ";
          conditionalString += "'" + conditional.searchTerms + "'";

          if (index === this.state.conditionalCount - 1) {
            conditionalString += ";";
          } else {
            conditionalString += " AND ";
          }
        });

        command += conditionalString;
      } else command += ";";

      // console.log(command)
      this.props.closeModal();
      this.props.clearQuery();
      this.props.runSelectQuery(command);
    }
  };

  handleAdvancedSubmit = () => {
    this.setState({ loading: true });
    this.props.updateSelectErrorMessage(null);
    let errors = this.checkAdvancedSelect(this.state.advanced_query);

    if (errors.length > 0) {
      this.props.notify({
        type: "error",
        message: "Uh oh, some errors detected. Please check SELECT error log",
      });
      this.props.updateSelectErrorMessage(errors);
    } else {
      this.props.runSelectQuery(this.state.advanced_query);
    }

    setTimeout(() => {
      if (!this.props.loading && !this.props.errorMessages.selectError) {
        this.props.closeModal();
      } else {
        this.setState({ loading: false });
      }
    }, 500);
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  handleCheck = (e, { name, value }) =>
    this.setState({ where: !this.state.where });

  handleAdvancedCheck = (e, { name, value }) =>
    this.setState({ basic_query: !this.state.basic_query });

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
      // console.log(newConditionals)

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
              name="field"
              error={
                this.state.conditionals[index].field === "" &&
                this.state.basic_query
                  ? { content: "You must select a conditional field." }
                  : false
              }
              value={this.state.conditionals[index].field}
              onChange={this.handleConditionalItemChange}
              id={index}
              disabled={!this.state.basic_query}
            />
            <Form.Field
              control={Select}
              options={conditionalOperatorOptions}
              label="Operator"
              placeholder="="
              name="operator"
              error={
                this.state.conditionals[index].operator === "" &&
                this.state.basic_query
                  ? { content: "You must select a conditional operator." }
                  : false
              }
              value={this.state.conditionals[index].operator}
              onChange={this.handleConditionalItemChange}
              id={index}
              disabled={!this.state.basic_query}
            />
            <Form.Field
              control={Input}
              label="Search"
              placeholder="Search Term(s)"
              search
              name="searchTerms"
              error={
                this.state.conditionals[index].searchTerms === "" &&
                this.state.basic_query
                  ? { content: "You must enter a value for the conditional." }
                  : false
              }
              value={this.state.conditionals[index].searchTerms}
              onChange={this.handleConditionalItemChange}
              id={index}
              disabled={!this.state.basic_query}
            />
          </Form.Group>
        );
      }
    );
    return conditionals;
  };

  renderBasicForm = (
    query_action,
    fields,
    db,
    conditionalCount,
    conditionals
  ) => (
    <>
      <Header size="small">Basic Select Query</Header>

      <Form onSubmit={this.handleSubmit}>
        <Form.Group widths="equal">
          <Form.Field
            control={Select}
            options={selectQueryOption}
            label="QUERY"
            placeholder="SELECT"
            search
            name="query_action"
            value={query_action}
            onChange={this.handleChange}
            disabled={!this.state.basic_query}
            required
          />
          <Form.Field
            control={Select}
            options={headerSelection}
            label="FIELD"
            placeholder="FIELD"
            search
            multiple
            name="fields"
            error={this.checkFieldError()}
            value={fields}
            onChange={this.handleChange}
            disabled={!this.state.basic_query}
          />
          <Form.Field
            control={Select}
            options={this.state.dbSelection}
            label="Database Table"
            placeholder=""
            search
            name="db"
            error={
              this.state.db === "" && this.state.basic_query
                ? { content: "You must select a database table." }
                : false
            }
            value={db}
            onChange={this.handleChange}
            disabled={!this.state.basic_query}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field
            control={Select}
            label="WHERE count (how many conditionals)"
            options={conditionalCountOptions}
            name="conditionalCount"
            value={conditionalCount}
            onChange={this.handleConditionalCountChange}
            disabled={!this.state.basic_query}
          />
        </Form.Group>
        {conditionals}

        {this.state.loading
          ? "Loading... This may take some time, please wait."
          : null}
      </Form>
    </>
  );

  render() {
    const {
      advanced_query,
      query_action,
      fields,
      db,
      conditionalCount,
      loadingOptions,
      dbSelection,
    } = this.state;

    const conditionals = this.renderConditions();

    if (dbSelection.length === 0 && loadingOptions) {
      this.initTableOptions("select");
    }

    return (
      <>
        <Modal.Header>Select Query</Modal.Header>

        <Modal.Content>
          <Header size="small">Advanced Select Query</Header>
          <Form onSubmit={this.handleAdvancedSubmit}>
            <Form.Group>
              <Form.Field
                control={Checkbox}
                label="Advanced"
                name="basic_query"
                value={this.state.basic_query}
                onChange={this.handleAdvancedCheck}
                width={3}
              />
              <Form.Field
                control={Input}
                name="advanced_query"
                value={advanced_query}
                onChange={this.handleChange}
                disabled={this.state.basic_query}
                width={13}
                error={
                  this.state.basic_query === false &&
                  !advanced_query.toUpperCase().startsWith("SELECT")
                    ? {
                        content: "This query must be a SELECT command.",
                      }
                    : false
                }
              />
            </Form.Group>
          </Form>

          {this.state.basic_query
            ? this.renderBasicForm(
                query_action,
                fields,
                db,
                conditionalCount,
                conditionals
              )
            : null}
        </Modal.Content>
        <Modal.Actions>
          <CreateHelpModal queryType="SELECT" />
          <CreateErrorLogModal
            type="Select"
            errors={this.props.errorMessages.selectError}
            updateError={this.props.updateSelectErrorMessage}
          />
          <Button onClick={() => this.props.closeModal()}>Cancel</Button>
          <Button
            loading={this.state.loading}
            style={{ backgroundColor: "#5c6ac4", color: "#fff" }}
            onClick={
              this.state.basic_query
                ? this.handleSubmit
                : this.handleAdvancedSubmit
            }
          >
            Submit
          </Button>
        </Modal.Actions>
      </>
    );
  }
}