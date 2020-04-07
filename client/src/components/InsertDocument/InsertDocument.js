import React from "react";
import { Button, Icon, Modal, Menu } from "semantic-ui-react";
// import { checkEntry } from "../../functions/queryChecks";
// import ErrorTerminal from "../Query/QueryTerminals/ErrorTerminal";
import "./InsertDocument.css";
import PASTE from "./InsertTypes/PASTE";
import MANUAL from "./InsertTypes/MANUAL";

// const localityOptions = [
//     { key: '0', text: 'United States', value: 'United States' },
// ]

class InsertDocument extends React.Component {
  state = {
    activePage: "Paste Insert",
    text_area: "",
  };

  closeModal = () => {
    this.props.updateInsertErrorMessage(null);
  };

  handlePaginationChange = (e, { name }) => this.setState({ activePage: name });

  handlePageBack = (e) => {
    if (this.state.activePage === "Paste Insert") {
      return;
    } else if (this.state.activePage === "Manual Insert") {
      this.setState({ activePage: "Paste Insert" });
    }
  };

  handlePageForward = (e) => {
    if (this.state.activePage === "Paste Insert") {
      this.setState({ activePage: "Manual Insert" });
    } else if (this.state.activePage === "Manual Insert") {
      return;
    }
  };

  render() {
    // console.log(this.props.errorMessages)

    return (
      <div>
        <Modal
          trigger={
            <Button
              icon
              labelPosition="left"
              size={this.props.small ? "mini" : "small"}
              disabled={this.props.disabled}
            >
              <Icon name="upload" />
              Insert
            </Button>
          }
          centered
          closeIcon
          onClose={this.closeModal}
          style={{ maxHeight: "85vh" }}
        >
          <Modal.Header>
            <Menu pagination size="tiny" style={{ marginRight: "1rem" }}>
              <Menu.Item onClick={this.handlePageBack}>
                <Icon name="arrow left" />
              </Menu.Item>
              <Menu.Item
                name="Paste Insert"
                active={this.state.activePage === "Paste Insert"}
                onClick={this.handlePaginationChange}
              />
              <Menu.Item
                name="Manual Insert"
                active={this.state.activePage === "Manual Insert"}
                onClick={this.handlePaginationChange}
              />
              <Menu.Item onClick={this.handlePageForward}>
                <Icon name="arrow right" />
              </Menu.Item>
            </Menu>
            Insert Query Selector
          </Modal.Header>
          <Modal.Content
            scrolling
            style={
              this.state.activePage === "Paste Insert"
                ? { minHeight: "60vh" }
                : { minHeight: "80vh" }
            }
          >
            {this.state.activePage === "Paste Insert" ? (
              <PASTE {...this.props} />
            ) : (
              <MANUAL {...this.props} />
            )}
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default InsertDocument;
