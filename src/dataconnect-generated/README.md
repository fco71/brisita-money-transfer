# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListBeneficiaries*](#listbeneficiaries)
  - [*GetExchangeRate*](#getexchangerate)
- [**Mutations**](#mutations)
  - [*CreateBeneficiary*](#createbeneficiary)
  - [*UpdateTransferStatus*](#updatetransferstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListBeneficiaries
You can execute the `ListBeneficiaries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBeneficiaries(): QueryPromise<ListBeneficiariesData, undefined>;

interface ListBeneficiariesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBeneficiariesData, undefined>;
}
export const listBeneficiariesRef: ListBeneficiariesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBeneficiaries(dc: DataConnect): QueryPromise<ListBeneficiariesData, undefined>;

interface ListBeneficiariesRef {
  ...
  (dc: DataConnect): QueryRef<ListBeneficiariesData, undefined>;
}
export const listBeneficiariesRef: ListBeneficiariesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBeneficiariesRef:
```typescript
const name = listBeneficiariesRef.operationName;
console.log(name);
```

### Variables
The `ListBeneficiaries` query has no variables.
### Return Type
Recall that executing the `ListBeneficiaries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBeneficiariesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListBeneficiariesData {
  beneficiaries: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    country: string;
    currency: string;
  } & Beneficiary_Key)[];
}
```
### Using `ListBeneficiaries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBeneficiaries } from '@dataconnect/generated';


// Call the `listBeneficiaries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBeneficiaries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBeneficiaries(dataConnect);

console.log(data.beneficiaries);

// Or, you can use the `Promise` API.
listBeneficiaries().then((response) => {
  const data = response.data;
  console.log(data.beneficiaries);
});
```

### Using `ListBeneficiaries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBeneficiariesRef } from '@dataconnect/generated';


// Call the `listBeneficiariesRef()` function to get a reference to the query.
const ref = listBeneficiariesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBeneficiariesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.beneficiaries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.beneficiaries);
});
```

## GetExchangeRate
You can execute the `GetExchangeRate` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getExchangeRate(vars: GetExchangeRateVariables): QueryPromise<GetExchangeRateData, GetExchangeRateVariables>;

interface GetExchangeRateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExchangeRateVariables): QueryRef<GetExchangeRateData, GetExchangeRateVariables>;
}
export const getExchangeRateRef: GetExchangeRateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getExchangeRate(dc: DataConnect, vars: GetExchangeRateVariables): QueryPromise<GetExchangeRateData, GetExchangeRateVariables>;

interface GetExchangeRateRef {
  ...
  (dc: DataConnect, vars: GetExchangeRateVariables): QueryRef<GetExchangeRateData, GetExchangeRateVariables>;
}
export const getExchangeRateRef: GetExchangeRateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getExchangeRateRef:
```typescript
const name = getExchangeRateRef.operationName;
console.log(name);
```

### Variables
The `GetExchangeRate` query requires an argument of type `GetExchangeRateVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetExchangeRateVariables {
  baseCurrency: string;
  targetCurrency: string;
}
```
### Return Type
Recall that executing the `GetExchangeRate` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetExchangeRateData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetExchangeRateData {
  exchangeRates: ({
    rate: number;
    timestamp: TimestampString;
  })[];
}
```
### Using `GetExchangeRate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getExchangeRate, GetExchangeRateVariables } from '@dataconnect/generated';

// The `GetExchangeRate` query requires an argument of type `GetExchangeRateVariables`:
const getExchangeRateVars: GetExchangeRateVariables = {
  baseCurrency: ..., 
  targetCurrency: ..., 
};

// Call the `getExchangeRate()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getExchangeRate(getExchangeRateVars);
// Variables can be defined inline as well.
const { data } = await getExchangeRate({ baseCurrency: ..., targetCurrency: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getExchangeRate(dataConnect, getExchangeRateVars);

console.log(data.exchangeRates);

// Or, you can use the `Promise` API.
getExchangeRate(getExchangeRateVars).then((response) => {
  const data = response.data;
  console.log(data.exchangeRates);
});
```

### Using `GetExchangeRate`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getExchangeRateRef, GetExchangeRateVariables } from '@dataconnect/generated';

// The `GetExchangeRate` query requires an argument of type `GetExchangeRateVariables`:
const getExchangeRateVars: GetExchangeRateVariables = {
  baseCurrency: ..., 
  targetCurrency: ..., 
};

// Call the `getExchangeRateRef()` function to get a reference to the query.
const ref = getExchangeRateRef(getExchangeRateVars);
// Variables can be defined inline as well.
const ref = getExchangeRateRef({ baseCurrency: ..., targetCurrency: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getExchangeRateRef(dataConnect, getExchangeRateVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.exchangeRates);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.exchangeRates);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateBeneficiary
You can execute the `CreateBeneficiary` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createBeneficiary(vars: CreateBeneficiaryVariables): MutationPromise<CreateBeneficiaryData, CreateBeneficiaryVariables>;

interface CreateBeneficiaryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBeneficiaryVariables): MutationRef<CreateBeneficiaryData, CreateBeneficiaryVariables>;
}
export const createBeneficiaryRef: CreateBeneficiaryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createBeneficiary(dc: DataConnect, vars: CreateBeneficiaryVariables): MutationPromise<CreateBeneficiaryData, CreateBeneficiaryVariables>;

interface CreateBeneficiaryRef {
  ...
  (dc: DataConnect, vars: CreateBeneficiaryVariables): MutationRef<CreateBeneficiaryData, CreateBeneficiaryVariables>;
}
export const createBeneficiaryRef: CreateBeneficiaryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createBeneficiaryRef:
```typescript
const name = createBeneficiaryRef.operationName;
console.log(name);
```

### Variables
The `CreateBeneficiary` mutation requires an argument of type `CreateBeneficiaryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateBeneficiary` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateBeneficiaryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateBeneficiaryData {
  beneficiary_insert: Beneficiary_Key;
}
```
### Using `CreateBeneficiary`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createBeneficiary, CreateBeneficiaryVariables } from '@dataconnect/generated';

// The `CreateBeneficiary` mutation requires an argument of type `CreateBeneficiaryVariables`:
const createBeneficiaryVars: CreateBeneficiaryVariables = {
  userId: ..., 
  accountNumber: ..., // optional
  address: ..., // optional
  bankName: ..., // optional
  country: ..., 
  currency: ..., 
  email: ..., // optional
  firstName: ..., 
  lastName: ..., 
  phoneNumber: ..., // optional
  swiftCode: ..., // optional
};

// Call the `createBeneficiary()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBeneficiary(createBeneficiaryVars);
// Variables can be defined inline as well.
const { data } = await createBeneficiary({ userId: ..., accountNumber: ..., address: ..., bankName: ..., country: ..., currency: ..., email: ..., firstName: ..., lastName: ..., phoneNumber: ..., swiftCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createBeneficiary(dataConnect, createBeneficiaryVars);

console.log(data.beneficiary_insert);

// Or, you can use the `Promise` API.
createBeneficiary(createBeneficiaryVars).then((response) => {
  const data = response.data;
  console.log(data.beneficiary_insert);
});
```

### Using `CreateBeneficiary`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createBeneficiaryRef, CreateBeneficiaryVariables } from '@dataconnect/generated';

// The `CreateBeneficiary` mutation requires an argument of type `CreateBeneficiaryVariables`:
const createBeneficiaryVars: CreateBeneficiaryVariables = {
  userId: ..., 
  accountNumber: ..., // optional
  address: ..., // optional
  bankName: ..., // optional
  country: ..., 
  currency: ..., 
  email: ..., // optional
  firstName: ..., 
  lastName: ..., 
  phoneNumber: ..., // optional
  swiftCode: ..., // optional
};

// Call the `createBeneficiaryRef()` function to get a reference to the mutation.
const ref = createBeneficiaryRef(createBeneficiaryVars);
// Variables can be defined inline as well.
const ref = createBeneficiaryRef({ userId: ..., accountNumber: ..., address: ..., bankName: ..., country: ..., currency: ..., email: ..., firstName: ..., lastName: ..., phoneNumber: ..., swiftCode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createBeneficiaryRef(dataConnect, createBeneficiaryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.beneficiary_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.beneficiary_insert);
});
```

## UpdateTransferStatus
You can execute the `UpdateTransferStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTransferStatus(vars: UpdateTransferStatusVariables): MutationPromise<UpdateTransferStatusData, UpdateTransferStatusVariables>;

interface UpdateTransferStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTransferStatusVariables): MutationRef<UpdateTransferStatusData, UpdateTransferStatusVariables>;
}
export const updateTransferStatusRef: UpdateTransferStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTransferStatus(dc: DataConnect, vars: UpdateTransferStatusVariables): MutationPromise<UpdateTransferStatusData, UpdateTransferStatusVariables>;

interface UpdateTransferStatusRef {
  ...
  (dc: DataConnect, vars: UpdateTransferStatusVariables): MutationRef<UpdateTransferStatusData, UpdateTransferStatusVariables>;
}
export const updateTransferStatusRef: UpdateTransferStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTransferStatusRef:
```typescript
const name = updateTransferStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateTransferStatus` mutation requires an argument of type `UpdateTransferStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTransferStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateTransferStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTransferStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTransferStatusData {
  transfer_update?: Transfer_Key | null;
}
```
### Using `UpdateTransferStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTransferStatus, UpdateTransferStatusVariables } from '@dataconnect/generated';

// The `UpdateTransferStatus` mutation requires an argument of type `UpdateTransferStatusVariables`:
const updateTransferStatusVars: UpdateTransferStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTransferStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTransferStatus(updateTransferStatusVars);
// Variables can be defined inline as well.
const { data } = await updateTransferStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTransferStatus(dataConnect, updateTransferStatusVars);

console.log(data.transfer_update);

// Or, you can use the `Promise` API.
updateTransferStatus(updateTransferStatusVars).then((response) => {
  const data = response.data;
  console.log(data.transfer_update);
});
```

### Using `UpdateTransferStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTransferStatusRef, UpdateTransferStatusVariables } from '@dataconnect/generated';

// The `UpdateTransferStatus` mutation requires an argument of type `UpdateTransferStatusVariables`:
const updateTransferStatusVars: UpdateTransferStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTransferStatusRef()` function to get a reference to the mutation.
const ref = updateTransferStatusRef(updateTransferStatusVars);
// Variables can be defined inline as well.
const ref = updateTransferStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTransferStatusRef(dataConnect, updateTransferStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.transfer_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.transfer_update);
});
```

