const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'windsurf-project',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createBeneficiaryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateBeneficiary', inputVars);
}
createBeneficiaryRef.operationName = 'CreateBeneficiary';
exports.createBeneficiaryRef = createBeneficiaryRef;

exports.createBeneficiary = function createBeneficiary(dcOrVars, vars) {
  return executeMutation(createBeneficiaryRef(dcOrVars, vars));
};

const listBeneficiariesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListBeneficiaries');
}
listBeneficiariesRef.operationName = 'ListBeneficiaries';
exports.listBeneficiariesRef = listBeneficiariesRef;

exports.listBeneficiaries = function listBeneficiaries(dc) {
  return executeQuery(listBeneficiariesRef(dc));
};

const updateTransferStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTransferStatus', inputVars);
}
updateTransferStatusRef.operationName = 'UpdateTransferStatus';
exports.updateTransferStatusRef = updateTransferStatusRef;

exports.updateTransferStatus = function updateTransferStatus(dcOrVars, vars) {
  return executeMutation(updateTransferStatusRef(dcOrVars, vars));
};

const getExchangeRateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExchangeRate', inputVars);
}
getExchangeRateRef.operationName = 'GetExchangeRate';
exports.getExchangeRateRef = getExchangeRateRef;

exports.getExchangeRate = function getExchangeRate(dcOrVars, vars) {
  return executeQuery(getExchangeRateRef(dcOrVars, vars));
};
