import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Account_Key {
  id: UUIDString;
  __typename?: 'Account_Key';
}

export interface Beneficiary_Key {
  id: UUIDString;
  __typename?: 'Beneficiary_Key';
}

export interface CreateBeneficiaryData {
  beneficiary_insert: Beneficiary_Key;
}

export interface CreateBeneficiaryVariables {
  userId: UUIDString;
  accountNumber?: string | null;
  address?: string | null;
  bankName?: string | null;
  country: string;
  currency: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  swiftCode?: string | null;
}

export interface ExchangeRate_Key {
  id: UUIDString;
  __typename?: 'ExchangeRate_Key';
}

export interface GetExchangeRateData {
  exchangeRates: ({
    rate: number;
    timestamp: TimestampString;
  })[];
}

export interface GetExchangeRateVariables {
  baseCurrency: string;
  targetCurrency: string;
}

export interface ListBeneficiariesData {
  beneficiaries: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    country: string;
    currency: string;
  } & Beneficiary_Key)[];
}

export interface Transfer_Key {
  id: UUIDString;
  __typename?: 'Transfer_Key';
}

export interface UpdateTransferStatusData {
  transfer_update?: Transfer_Key | null;
}

export interface UpdateTransferStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateBeneficiaryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBeneficiaryVariables): MutationRef<CreateBeneficiaryData, CreateBeneficiaryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBeneficiaryVariables): MutationRef<CreateBeneficiaryData, CreateBeneficiaryVariables>;
  operationName: string;
}
export const createBeneficiaryRef: CreateBeneficiaryRef;

export function createBeneficiary(vars: CreateBeneficiaryVariables): MutationPromise<CreateBeneficiaryData, CreateBeneficiaryVariables>;
export function createBeneficiary(dc: DataConnect, vars: CreateBeneficiaryVariables): MutationPromise<CreateBeneficiaryData, CreateBeneficiaryVariables>;

interface ListBeneficiariesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBeneficiariesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListBeneficiariesData, undefined>;
  operationName: string;
}
export const listBeneficiariesRef: ListBeneficiariesRef;

export function listBeneficiaries(): QueryPromise<ListBeneficiariesData, undefined>;
export function listBeneficiaries(dc: DataConnect): QueryPromise<ListBeneficiariesData, undefined>;

interface UpdateTransferStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTransferStatusVariables): MutationRef<UpdateTransferStatusData, UpdateTransferStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTransferStatusVariables): MutationRef<UpdateTransferStatusData, UpdateTransferStatusVariables>;
  operationName: string;
}
export const updateTransferStatusRef: UpdateTransferStatusRef;

export function updateTransferStatus(vars: UpdateTransferStatusVariables): MutationPromise<UpdateTransferStatusData, UpdateTransferStatusVariables>;
export function updateTransferStatus(dc: DataConnect, vars: UpdateTransferStatusVariables): MutationPromise<UpdateTransferStatusData, UpdateTransferStatusVariables>;

interface GetExchangeRateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExchangeRateVariables): QueryRef<GetExchangeRateData, GetExchangeRateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetExchangeRateVariables): QueryRef<GetExchangeRateData, GetExchangeRateVariables>;
  operationName: string;
}
export const getExchangeRateRef: GetExchangeRateRef;

export function getExchangeRate(vars: GetExchangeRateVariables): QueryPromise<GetExchangeRateData, GetExchangeRateVariables>;
export function getExchangeRate(dc: DataConnect, vars: GetExchangeRateVariables): QueryPromise<GetExchangeRateData, GetExchangeRateVariables>;

