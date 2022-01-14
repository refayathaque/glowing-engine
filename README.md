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

- Decided to work on a rather big feature, and one that will make it easier to build out this app moving forward. This feature will seek to build out an end-to-end system that allows the React app (API client) to make a requests to API Gateway and have that request go through to the backend Cloud Run microservice. The Cloud Run microservice will return the list of buckets and the objects inside of each (with metadata for both) and provide the client with abilities to delete buckets, delete objects, create buckets, ~~upload objects~~ and rename objects. The only authentication required will be the project API key in the path query string.
  - Main tasks for this feature will be:
    - Build out and **locally test a node.js container** running express, using the local service account you should be able to make API calls to storage using the methods in `nodejs-scripts/storage`
      - Code out `server.js` to serve data returned from storage methods
        - Simply run `node server.js` to run the express app, and add the path to `localhost:8080` that corresponds to each of your [express routes](https://expressjs.com/en/starter/hello-world.html)
        - "modularize your implementation details and put them into dedicated files and folders whereas the src/index.js file should only care about putting everything together and starting the application." - https://www.robinwieruch.de/node-express-server-rest-api/
        - Use [nodemon](https://www.npmjs.com/package/nodemon) to not have to restart express app every time you make a change
      - Code will need to be different prior to deployment because we won't be using this God-mode admin service account when deployed to Cloud Run
        - Will need to figure out a strategy for this later...
      - Express route to fetch a list of buckets ✅
        - `curl localhost:8080/bucket`
      - Express route to fetch objects in a bucket ✅
        - `curl localhost:8080/objects/<name>`
      - Express route to create bucket ✅
        - `curl -X POST localhost:8080/buckets/<name>`
      - ~~Express route to upload object~~
      - Express route to delete bucket ✅
        - `curl -X "DELETE" localhost:8080/buckets/<name>`
      - Express route to delete object
        - `curl -X "DELETE" localhost:8080/objects/<bucket>/<name>` ✅
      - Express route to rename object
        - `curl -X "PUT" localhost:8080/objects/<bucket>/<name>/<newname>` ✅
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

- Got the dockerization and dockerized testing done and updated code and docs in `basic-express` as well. When preparing the tf files for infra provisioning I realized that it's stupid to not code out all the app functionalities in this prototype/feature build, so went back and revised the goals and added _all_ CRUD operations to list of functionalities. Will now have to change the name of service and other files from `get-buckets-and-objects` to `storage-crud`.
  - Change name everywhere from from `get-buckets-and-objects` to `storage-crud`. ✅
- Document how to run [nodemon](https://www.npmjs.com/package/nodemon) for making life easier when building express apps ✅
  - `nodemon ./server.js localhost 8080`
- Added a few new routes in `server.js`, and decided that the upload file functionality would be too hard for what I need to get up and running right now, will return to this later.
- Change structure of responses in express routes to include status codes and JSONified data. ✅

Fri Jan 7 2022

- Code out remaining 3 express routes for delete bucket, delete object and rename object (not sure if this will be put/patch).
- Work out how to do error handling in node.js code and express routes, when there is an error the response status code should reflect that appropriately.
- When sending form data it won't be possible to just provide that in the URL params, I need to start looking into how the express code can accept JSON objects in the request. I might need to use Postman to test this out.
  - https://expressjs.com/en/4x/api.html#req.body
    - Express has it's own body-parsing middleware, in the stack overflow blog linked below they use a node package called "body-parser", safe to assume both are fine.
- **Understand best-practices for API development** and change the response objects/arrays appropriately, and whatever else I think I need to.
  - "If we don’t follow commonly accepted conventions, then we confuse the maintainers of the API and the clients that use them since it’s different from what everyone expects."
  - https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/

Sat Jan 8 2022

- Goal tonight is to code out and test delete object and rename object functionalities, then start refactoring the express code to do things like error handling and other API best-practice-y things.
- Look into req.body and how to unpack that from it's JSON form using middleware (more information in Jan 7 notes).
  - "If you want to implement guards or any other logic in your route that relies on that id (of an existing user), you pass the userID in the params. Let's say you are submitting a form where a new user registers.. You don't want to send the credentials in the parameters since it's confidential data and easily accessible this way. Here it makes sense to put those values in the request-body and use therefore req.body.."
    - https://stackoverflow.com/a/54903133/8379751
- Read up on GCP storage, AWS S3, Azure Blob Storage use cases to get a feel for how you might be able to repackage this app for a client.
- Some operations (e.g., updateObject) are returning tons of extraneous data we don't need, at some point I'll need to groom the response in the API call modules to only return what will be useful for the UI.

  - updateObject ✅

Sun Jan 9 2022

- Working on error handling today, inserted try catch blocks in all the routes, and now have to code out the blocks in all routes.
  - /buckets ✅
    - Had to test using another SA that has NO access, since this route isn't expecting params I couldn't use invalid params, I had to test by blocking access
  - /objects/:bucket ✅
  - create - /buckets/:name ✅
  - delete - /buckets/:name ✅
  - delete - /objects/:bucket/:name ✅
  - put - /objects/:bucket/:name/:newname ✅

Mon Jan 10 2022

- If required params are not provided then route should return 4xx instead of invoking storage operation modules.
  - Don't need to do any error handling in routes for this because if the request is missing params it wouldn't even hit the route, as the route definition includes the params.
- Data grooming, make sure all routes are returning data that will actually be useful in the UI, updateObject (put - /objects/:bucket/:name/:newname) is already done, so need to check the responses for all other routes.
  - get - /buckets ✅
  - get - /objects/:bucket ✅
  - create - /buckets/:name ✅
  - delete - /buckets/:name ✅
  - delete - /objects/:bucket/:name ✅
  - put - /objects/:bucket/:name/:newname ✅

Tue Jan 11 2022

- Review notes from prior days to see what else needs to be done in terms of container image creation, if there are no other significant to dos let's deploy this bad boy/girl and see what happens 😬
- Build out all necessary tf files using prototype-a as reference. ✅
  - Make sure SA associate with cloud run service has necessary permissions to interact with storage. ✅
    - This will be different to what's in the prototype-a code because that microservice did nothing but return 'hello world'. ✅
- Build out OpenAPI spec file based on what is in `server.js` ✅
- Do stage 1 of terraform deployment (stage 1 being the artifact registry repo creation and the docker image build and push, i.e., running `run-me-first.sh`) ✅
  - ^ need to re-do because **image code is using authentication based on local SA key**, so the image code needs to be changed

Wed Jan 12 2022

- _Wrote day off_ 😀

Thu Jan 13 2022

- Redo stage 1 of terraform deployment (stage 1 being the artifact registry repo creation and the docker image build and push, i.e., running `run-me-first.sh`) since the image code is not set up correctly, it's currently set up to use the SA local key to interact with storage.
  - This is not a good approach, **for testing locally (both dockerized [`bash local-docker-testing.sh`] and non-dockerized[`nodemon ./server.js localhost 8080`])** I should have a separate SA with keys, **I should no tbe using the one I have with admin privileges for terraform infra provisioning**.
    - Create new SA key and put in `gcp-infra-and-microservices/nodejs-containers/storage-crud` and **ADD TO .gitignore** ✅
    - Edit key path in `./secrets.js` ✅
- Explore node.js env variables so I don't have to change existing container image code depending on whether I am testing locally or deploying it to cloud run, there should be a way to turn off the use of local test SA key when building the image for cloud run deployment. ✅
  - Dockerfile for cloud run should have build environment variable `AUTH=dev` ✅
  - Dockerfile.local for local testing should have build environment variable `AUTH=local` ✅
    The `local-docker-testing.sh` script uses ^ as the Dockerfile
- Source code should have conditionality to use/not use local test SA key, prototype this out with `createBucket.js` and test to make sure this works when running the docker image. ✅
  - Module called `client.js` checks the environment variable `AUTH`, and based on what it sees sets the storage client to have/omit the SA key and project id. This module is then imported into storage operation modules.
  - Code out ^ refactor in all other operation modules and test while running docker container
    - fetch a list of buckets
      - `curl localhost:8080/bucket`
    - fetch objects in a bucket
      - `curl localhost:8080/objects/<name>`
    - create bucket
      - `curl -X POST localhost:8080/buckets/<name>`
    - ~~upload object~~
    - delete bucket
      - `curl -X "DELETE" localhost:8080/buckets/<name>`
    - delete object
      - `curl -X "DELETE" localhost:8080/objects/<bucket>/<name>`
    - rename object
      - `curl -X "PUT" localhost:8080/objects/<bucket>/<name>/<newname>`