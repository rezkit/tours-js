RezKit Tour Manager Client (JS)
===============================

Idiomatic TypeScript/JavaScript client to interact with the RezKit tour manager API.

Installation
------------

### npm

    npm add @rezkit/tours

### yarn

    yarn add @rezkit/tours


Usage 
-----

### Configure Credentials

API credentials can be provided either as a string of static credentials. 
Credentials can also be provided dynamically via a callback function which takes the request as a parameter.


#### Example: Use dynamic environment variables for API key

```typescript
import {CredentialProvider} from "@rezkit/tours";
import {AxiosRequestConfig} from "axios";
import TourManager from "@rezkit/tours";

// envProvider creates a function that returns the credentials from the specified env var
function envProvider(envKey: string): CredentialProvider {
    return async function (req: AxiosRequestConfig): Promise<string> {
        return process.env[envKey]
    }
}

const client = new TourManager({ api_key: envProvider('RK_API_KEY') })
```
