const mysql = require("mysql");
const bcrypt = require("bcrypt");
const canAccess = require("../helpers/downAccess");

module.exports = function (connection, app) {
  app.post("/api/admin/create-table/", function (req, res) {
    const { tableName } = req.body;
    const username = req.body.adminUser;
    const password = req.body.adminPass;

    // authenticate user trying to create table
    connection.query(
      `SELECT * FROM users WHERE username="${username}";`,
      (err, data) => {
        if (err) {
          res.status(503).send("Bad connection detected");
          return;
        } else if (data.length < 1 || data === [] || !data) {
          // auth failed
          res.status(401).send("Authorization either failed or denied");
          return;
        } else {
          // const _adminUsername = data[0].username;
          const _password = data[0].password;
          const privilege = data[0].privilege_level;

          if (!canAccess(privilege, "admin")) {
            res.status(403).send("Authorization either failed or denied");
            return;
          }

          bcrypt.compare(password, _password).then((result) => {
            if (result !== true) {
              // invalid auth state, unauthorized to create table
              res.status(401).send("Authorization either failed or denied");
              return;
            } else {
              const command = `CREATE TABLE ${tableName}
              (
                id INT NOT NULL AUTO_INCREMENT, catalogNumber varchar(20), otherCatalogNumber varchar(20) UNIQUE NOT NULL,
                  recordNumber varchar(20), order_ varchar(40), superfamily varchar(40), family varchar(40),
                  subfamily varchar(40), tribe varchar(40), genus varchar(40), subgenus varchar(40), specificEpithet varchar(40),
                  infraspecificEpithet varchar(30), identificationQualifier varchar(10), recordedBy varchar(255), identifiedBy varchar(255),
                  dateIdentified varchar(10), verbatimDate varchar(25), collectedYear varchar(4), collectedMonth varchar(2), collectedDay varchar(2),
                  sex char(1), lifeStage varchar(40), habitat varchar(40),
                  occurrenceRemarks text, molecularOccurrenceRemarks text, samplingProtocol varchar(20), country varchar(100), stateProvince varchar(100),
                  county varchar(100), municipality varchar(100), locality varchar(100), elevationInMeters varchar(20), decimalLatitude DECIMAL(10, 8),
                  decimalLongitude DECIMAL(11, 8), geodeticDatum varchar(20), coordinateUncertainty varchar(20), verbatimLatitude varchar(20),
                  verbatimLongitude varchar(20), georeferencedBy text, disposition varchar(15),
                  isLoaned char(1), loanInstitution varchar(50), loaneeName varchar(50), loanDate varchar(10), loanReturnDate varchar(10),
                  preparations varchar(100), freezer varchar(20), rack varchar(10), box varchar(5), tubeSize varchar(20), associatedSequences varchar(15),
                  associatedReferences text, recordEnteredBy varchar(50), dateEntered date, withholdData char(1),
                  reared char(1), fieldNotes text, otherCollectors text, modifiedInfo text,
                PRIMARY KEY (id)
              );`;

              connection.query(command, (err, data) => {
                if (err) {
                  // console.log(err);
                  res.json({
                    error: "Error in creating table",
                    sqlMessage: err,
                  });
                } else {
                  // console.log("Sucessfully created table");
                  res.status(201);
                  res.json({ data: "Sucessfully created table" });
                }
              });
            }
          });
        }
      }
    );
  });
};