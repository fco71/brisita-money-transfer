import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'windsurf-project',
  location: 'us-east4'
};

export const createBeneficiaryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateBeneficiary', inputVars);
}
createBeneficiaryRef.operationName = 'CreateBeneficiary';

export function createBeneficiary(dcOrVars, vars) {
  return executeMutation(createBeneficiaryRef(dcOrVars, vars));
}

export const listBeneficiariesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListBeneficiaries');
}
listBeneficiariesRef.operationName = 'ListBeneficiaries';

export function listBeneficiaries(dc) {
  return executeQuery(listBeneficiariesRef(dc));
}

export const updateTransferStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTransferStatus', inputVars);
}
updateTransferStatusRef.operationName = 'UpdateTransferStatus';

export function updateTransferStatus(dcOrVars, vars) {
  return executeMutation(updateTransferStatusRef(dcOrVars, vars));
}

export const getExchangeRateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExchangeRate', inputVars);
}
getExchangeRateRef.operationName = 'GetExchangeRate';

export function getExchangeRate(dcOrVars, vars) {
  return executeQuery(getExchangeRateRef(dcOrVars, vars));
}

