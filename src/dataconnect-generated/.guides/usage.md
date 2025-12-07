# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createBeneficiary, listBeneficiaries, updateTransferStatus, getExchangeRate } from '@dataconnect/generated';


// Operation CreateBeneficiary:  For variables, look at type CreateBeneficiaryVars in ../index.d.ts
const { data } = await CreateBeneficiary(dataConnect, createBeneficiaryVars);

// Operation ListBeneficiaries: 
const { data } = await ListBeneficiaries(dataConnect);

// Operation UpdateTransferStatus:  For variables, look at type UpdateTransferStatusVars in ../index.d.ts
const { data } = await UpdateTransferStatus(dataConnect, updateTransferStatusVars);

// Operation GetExchangeRate:  For variables, look at type GetExchangeRateVars in ../index.d.ts
const { data } = await GetExchangeRate(dataConnect, getExchangeRateVars);


```