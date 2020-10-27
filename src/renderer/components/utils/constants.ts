export const conditionCountOptions = Array.from({ length: 15 }, (_, index) => {
  return { label: String(index), value: index };
});

export const headerOptions = [
  'id',
  'catalogNumber',
  'otherCatalogNumber',
  'order_',
  'genus',
  'specificEpithet',
  'recordNumber',
  'superfamily',
  'family',
  'subfamily',
  'tribe',
  'subgenus',
  'infraspecificEpithet',
  'identificationQualifier',
  'recordedBy', // First Last | First Last
  'otherCollectors',
  'identifiedBy',
  'dateIdentified',
  'verbatimDate',
  'collectedYear',
  'collectedMonth',
  'collectedDay',
  'dateEntered',
  'sex',
  'lifeStage',
  'habitat',
  'occurrenceRemarks',
  'molecularOccurrenceRemarks',
  'samplingProtocol',
  'country',
  'stateProvince',
  'county',
  'municipality',
  'locality',
  'elevationInMeters',
  'decimalLatitude',
  'decimalLongitude',
  'geodeticDatum',
  'coordinateUncertainty',
  'verbatimLatitude',
  'verbatimLongitude',
  'georeferencedBy',
  'disposition',
  'isLoaned',
  'loanInstitution',
  'loaneeName',
  'loanDate',
  'loanReturnDate',
  'preparations',
  'freezer',
  'rack',
  'box',
  'tubeSize',
  'associatedSequences',
  'associatedReferences',
  'withholdData',
  'reared',
  'recordEnteredBy',
  'modifiedInfo',
  'fieldNotes',
];

export const fieldOptions = [
  { label: 'All', value: '*' },
  { label: 'Lep #', value: 'otherCatalogNumber' },
  { label: 'MGCL #', value: 'catalogNumber' },
  { label: 'Record #', value: 'recordNumber' },
  { label: 'Order', value: 'order_' },
  { label: 'Superfamily', value: 'superfamily' },
  { label: 'Family', value: 'family' },
  { label: 'Subfamily', value: 'subfamily' },
  { label: 'Tribe', value: 'tribe' },
  { label: 'Genus', value: 'genus' },
  { label: 'Subgenus', value: 'subgenus' },
  { label: 'Species', value: 'specificEpithet' },
  { label: 'Subspecies', value: 'infraspecificEpithet' },
  { label: 'Identification Qual.', value: 'identificationQualifier' },
  { label: 'Recorded By', value: 'recordedBy' },
  { label: 'Other Collectors', value: 'otherCollectors' },
  { label: 'Identified By', value: 'identifiedBy' },
  { label: 'Date Identified', value: 'dateIdentified' },
  { label: 'Date', value: 'verbatimDate' },
  { label: 'Year', value: 'collectedYear' },
  { label: 'Month', value: 'collectedMonth' },
  { label: 'Day', value: 'collectedDay' },
  { label: 'Sex', value: 'sex' },
  { label: 'Life Stage', value: 'lifeStage' },
  { label: 'Habitat', value: 'habitat' },
  { label: 'Occ. Remarks', value: 'occurrenceRemarks' },
  {
    label: 'Mol. Remarks',
    value: 'molecularOccurrenceRemarks',
  },
  { label: 'Protocol', value: 'samplingProtocol' },
  { label: 'Country', value: 'country' },
  { label: 'Province', value: 'stateProvince' },
  { label: 'County', value: 'county' },
  { label: 'Municipality', value: 'municipality' },
  { label: 'Locality', value: 'locality' },
  { label: 'Elevation', value: 'elevationInMeters' },
  { label: 'Latitude', value: 'verbatimLatitude' },
  { label: 'Dec. Latitude', value: 'decimalLatitude' },
  { label: 'Longitude', value: 'verbatimLongitude' },
  { label: 'Dec. Longitude', value: 'decimalLongitude' },
  { label: 'Geodetic Datum', value: 'geodeticDatum' },
  { label: 'Coord. Uncertainty', value: 'coordinateUncertainty' },
  { label: 'Georeferenced', value: 'georeferencedBy' },
  { label: 'Loaned', value: 'isLoaned' },
  { label: 'Loan Institution', value: 'loanInstitution' },
  { label: 'Loanee Name', value: 'loaneeName' },
  { label: 'Loan Date', value: 'loanDate' },
  { label: 'Loan Return Date', value: 'loanReturnDate' },
  { label: 'Preparations', value: 'preparations' },
  { label: 'Freezer', value: 'freezer' },
  { label: 'Rack', value: 'rack' },
  { label: 'Box', value: 'box' },
  { label: 'TubSize', value: 'tubeSize' },
  { label: 'Notes', value: 'fieldNotes' },
];
