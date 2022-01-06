- Design work is outsourced to Cedric because _comparative advantage_, will build out public facing for LLC website using this React project and his wireframe when ready. For now, this README will serve as a thought log and work tracker for everything app development.

Sat Jan 1 2022

- Starting to plan out the API build for the storage CRUD app, using the [Swagger OpenAPI guide](https://swagger.io/docs/specification/2-0/basic-structure/) and [Best practices in API design](https://swagger.io/resources/articles/best-practices-in-api-design/).
  - The first thing to do will be to make API calls locally using the GCP Node.js SDK and the admin access service account currently being used for tf provisioning and `gcloud`. Will create a separate file for each HTTP method/operation (GET, POST, PUT/PATCH, DELETE) with code from the SDK. The goals of this exercise are to understand what SDK code will be required in each microservice to do storage related operations, and to have the data structure that is returned from the API calls to use with Mirage.js for React development.
    - These node.js scripts are in `gcp-infra-and-microservices/nodejs-scripts/storage`
      - Service account authentication [reference](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/HEAD/auth/auth.js), project id and key filename are in `secrets.js` as named exports and this file _must be **in** the project for imports to work_ (i.e., in the directory where you ran `npm init`)
      - `get.js` should list buckets ✅, list objects ✅, bucket metadata ✅ and object metadata ✅
      - `delete.js` should delete buckets ✅ and delete objects ✅
      - `post.js` should create buckets ✅ and create objects (upload files) ✅
      - `put.js` should rename objects ✅
- Created a simple bash script to run from the root directory (~) and push dev branch code in all 3 repos - `push-all.sh`

Sun Jan 2 2022

- You [cannot rename a bucket](https://cloud.google.com/storage/docs/moving-buckets) after creation, but there are some things you can change.
  - [Non-editable metadata](https://cloud.google.com/storage/docs/bucket-metadata#non-editable_metadata) - name, location, project
  - _[Editable metadata](https://cloud.google.com/storage/docs/bucket-metadata#editable)_ - there's a few here, but the interesting ones are IAM policies, default storage class, lifecycle configuration policy and retention policy
    - Methods and examples can be found [here](https://googleapis.dev/nodejs/storage/latest/index.html), just search for "add" and "set"
      - Methods I _could potentially_ use: `deleteLabels`, `setLabels`, `setPolicy`
- There are Notification [methods](https://googleapis.dev/nodejs/storage/latest/Notification.html) in the SDK as well, and they could be leveraged to give users the ability to set up Pub/Sub for bucket and object events.
- Got a few more storage operations done that I started yesterday.

Mon Jan 3 2022

- Plan is to not get carried away by all storage methods discovered yesterday, and focus on some basic functionality based on what I have coded out in the React app, e.g., I still have to figure out how to do a few more operations like delete objects, create objects (upload files) and get bucket metadata.

Tue Jan 4 2022

- Continuing getting all the storage methods coded and tested, but will re group file structure of methods not by type of HTTP Restful methods, but by the actual methods. ✅

Wed Jan 5 2022

- Decided to work on a rather big feature, and one that will make it easier to build out this app moving forward. This feature will seek to build out an end-to-end system that allows the React app (API client) to make a requests to API Gateway and have that request go through to the backend Cloud Run microservice. The Cloud Run microservice will return the list of buckets and the objects inside of each (with metadata for both) and provide the client with abilities to delete buckets, delete objects, create buckets, upload objects and rename objects. The only authentication required will be the project API key in the path query string.
  - Main tasks for this feature will be:
    - Build out and **locally test a node.js container** running express, using the local service account you should be able to make API calls to storage using the methods in `nodejs-scripts/storage`
      - Code out `server.js` to serve data returned from storage methods
        - Simply run `node server.js` to run the express app, and add the path to `localhost:8080` that corresponds to each of your [express routes](https://expressjs.com/en/starter/hello-world.html)
        - "modularize your implementation details and put them into dedicated files and folders whereas the src/index.js file should only care about putting everything together and starting the application." - https://www.robinwieruch.de/node-express-server-rest-api/
        - Use [nodemon](https://www.npmjs.com/package/nodemon) to not have to restart express app every time you make a change
      - Code will need to be different prior to deployment because we won't be using this God-mode admin service account when deployed to Cloud Run
        - Will need to figure out a strategy for this later...
      - Express route to fetch a list of buckets ✅
      - Express route to fetch objects in a bucket ✅
      - Express route to create bucket
      - Express route to upload object
      - Express route to delete bucket
      - Express route to delete object
      - Express route to rename object
      - Dockerize and make CD ready
        - Add Dockerfile (check paths!), Dockerfile.local for local Docker testing and .dockerignore ✅
        - Write bash script to make it simple to run the Docker container locally for testing purposes ✅
          - https://docs.docker.com/engine/reference/commandline/build/#specify-a-dockerfile--f
          - Test that the dockerized version of this express app works ✅
        - Add `cloudbuild.yaml` ✅
        - Add notes about local testing with Docker in a README within `gcp-infra-and-microservices/nodejs-containers/basic-express` ✅
    - Build out the **OpenAPI spec yaml** file that will correspond to ^, there will be only one backend as we'll have a single microservice returning both bucket and object data. Follow API building best-practices and examples to design the response data.
      - Security configuration for API key
      - Paths:
        - GET all buckets
        - GET all objects - will need bucket name as parameter
    - Build out required **infra** like buckets, API Gateway resources, associated IAM resources, Cloud Build, Cloud Run service, etc.
      - Custom IAM policy to allow Cloud Run service to **only list/get buckets and objects**
      - Create tf resource files ✅
    - Code out **React app** to fetch and display buckets, objects and buckets and objects together

Thu Jan 6 2022

- Got the dockerization and dockerized testing done and updated code and docs in `basic-express` as well. When starting up on preparing the tf files for infra provisioning I realized that it's stupid to not code out all the app functionalities in this iteration of the prototype/feature, so went back and revised the intentions of this feature and added all CRUD operations to list of functionalities. Will now have to change the name of service and other files from `get-buckets-and-objects` to `storage-crud`.
  - Change name everywhere from from `get-buckets-and-objects` to `storage-crud`.
