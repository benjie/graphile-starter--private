# @app/graphql

This folder contains the autogenerated types and components produced by [`graphql-code-generator`](https://github.com/dotansimha/graphql-code-generator), from the GraphQL files found inside `@app/client`. You can then import them like:

```js
/*
 * e.g. if you have `mutation DoTheThing { ... }`, then you can import the
 * Apollo React Hook via:
 */
import { useDoTheThingMutation } from "@app/graphql";
```
