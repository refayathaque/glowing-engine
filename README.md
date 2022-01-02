- Design work is outsourced to Cedric because _comparative advantage_, will build out public facing for LLC website using this React project using his wireframe when ready. For now, this README will serve as a thought log and work tracker for everything app dev

Sat Jan 1 2022

- Starting to plan out the API build for the storage crud app, using the [Swagger OpenAPI guide](https://swagger.io/docs/specification/2-0/basic-structure/) and [Best practices in API design](https://swagger.io/resources/articles/best-practices-in-api-design/).
  - The first thing to do will be to make API calls locally using the GCP node.js SDK and the admin access service account currently being used for tf provisioning and `gcloud`. Will create a separate file for each HTTP method/operation (GET, POST, PUT/PATCH, DELETE) with code from the SDK. The goals of this exercise are to understand what SDK code will be required in each microservice to do storage related operations, and to have the data structure that is returned from the API calls to use with Mirage.js for React development.
    - These node.js scripts are in `gcp-infra-and-microservices/nodejs-scripts/storage`
      - `get.js` should list buckets and list objects
      - `delete.js` should delete buckets and delete objects
      - `post.js` should create buckets and create objects
      - `put.js` should update buckets and update objects
- 