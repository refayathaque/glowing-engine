- Design work is outsourced to Cedric because _comparative advantage_, will build out public facing for LLC website using this React project using his wireframe when ready. For now, this README will serve as a thought log and work tracker for everything app dev

Sat Jan 1 2022

- Starting to plan out the API build for the storage crud app, using the [Swagger OpenAPI guide](https://swagger.io/docs/specification/2-0/basic-structure/) and [Best practices in API design](https://swagger.io/resources/articles/best-practices-in-api-design/).
  - The first thing to do will be to make API calls locally using the GCP node.js SDK and the admin access service account currently being used for tf provisioning and `gcloud`. Will create a separate file for each HTTP method/operation (GET, POST, PUT/PATCH, DELETE) with code from the SDK. The goals of this exercise are to understand what SDK code will be required in each microservice to do storage related operations, and to have the data structure that is returned from the API calls to use with Mirage.js for React development.
    - These node.js scripts are in `gcp-infra-and-microservices/nodejs-scripts/storage`
      - Service account authentication [reference](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/HEAD/auth/auth.js), project id and key filename are in `secrets.js` as named exports and this file _must be **in** the project for imports to work_ (i.e., in the directory where you ran `npm init`)
      - `get.js` should list buckets ✅, list objects ✅ and object metadata ✅
      - `delete.js` should delete buckets ✅ and delete objects
      - `post.js` should create buckets ✅ and create objects (upload files)
      - `put.js` should rename objects ✅
- Created a simple bash script to run from the root directory (~) and push dev branch code in all 3 repos - `push-all.sh`

Sun Jan 2 2022

- You [cannot rename a bucket](https://cloud.google.com/storage/docs/moving-buckets) after creation, but there are some things you can change
  - [Non-editable metadata](https://cloud.google.com/storage/docs/bucket-metadata#non-editable_metadata) - name, location, project
  - _[Editable metadata](https://cloud.google.com/storage/docs/bucket-metadata#editable)_ - a few, but interesting ones are IAM policies, default storage class, lifecycle configuration policy and retention policy
    - Methods and examples can be found [here](https://googleapis.dev/nodejs/storage/latest/index.html), just search for "add" and "set"
      - Methods I could use: `deleteLabels`, `setLabels`, `setPolicy`
- There are Notification [methods](https://googleapis.dev/nodejs/storage/latest/Notification.html) in the SDK, could be leveraged to give users the ability to set up Pub/Sub for bucket and object events
- Got a few more storage operations done that I started yesterday