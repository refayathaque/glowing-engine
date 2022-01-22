Paragraph 1

- All apps, be they web or mobile, have a “backend” they communicate with to enable users to do things like authenticate, fetch data, add data, etc.
- The layer in between the app, a.k.a. client, and the backend is an API, short for [Application Programming Interface](https://www.freecodecamp.org/news/what-is-an-api-in-english-please-b880a3214a82/).
- Google Cloud is a cloud provider just like Microsoft Azure and AWS, you can use those services to create APIs as well, but this guide focuses purely on the Google Cloud implementation.
- Google Cloud defines an [API](https://cloud.google.com/api-gateway/docs/about-api-gateway#what_is_an_api) as, "...an interface that makes it easy for one application to consume capabilities or data from another application. By defining stable, simple, and well-documented entry points, APIs enable developers to easily access and reuse application logic built by other developers."
- In most software development teams there are frontend developers building the client, and coding the client to make [RESTful](https://restfulapi.net/) API calls via HTTP to the backend
- While frontend developers build the client, backend developers are building out the API for the client to be able to access the backend.
- Frontend developers only need to know the API endpoints their client needs to hit to perform required functions, these endpoints are published as part of the API by the backend engineers.

Paragraph 2

- This API will allow users to create buckets, list buckets, list objects, rename object, delete buckets in Google Cloud Storage.
- E.g., developers can use the endpoints we publish by creating this API to have their apps, or clients, interact with Google Cloud Storage.
- Google storage is a managed service that allows you to store any kind of files in groupings called "buckets", this is essentially the same as AWS' S3, or Simple Storage Service.

Paragraph 3

- While there are many approaches to API development, we’ve adopted the Google Cloud prescribed methodology, which dictates the use of their API Gateway service and the [Swagger OpenAPI Specification Version 2](https://swagger.io/docs/specification/basic-structure/).
- This Specification is essentially a YAML file describing the API, as you’ll see later, this file will be used by the API Gateway Google Cloud resource to deploy our API and act as the aforementioned layer between the client and backend.
- There are several benefits to using API Gateway, as is explained in the Google Cloud documentation. "API Gateway enables you to provide secure access to your services through a well-defined REST API that is consistent across all of your services, regardless of service implementation. A consistent API: Makes it easy for app developers to consume your services and enables you to change the backend service implementation without affecting the public API."
- Due to the importance of APIs we decided to develop this prototype as scaffolding for all future applications. The flexibility of this methodology means that we can use the same scaffolding to build other APIs acting as intermediaries between other client types like IoT and all other backend services, not just web servers running on virtual machines. Having an API implementation of this nature makes it backend agnostic. For example, in this exercise we will create a Node.js web server running as a Docker container in Google Cloud Run responding to client requests, but if we change our mind and decide to use Serverless Cloud Functions as the backend instead of Cloud Run we can, and all we’ll need to do is change the “backend” argument in the spec YAML file.
- The code samples can be found [here](https://github.com/refayathaque/gcp-infra-and-microservices)
- APIs allow for full decoupling of concerns between frontend and backend engineers, and the GCP methodology takes it even further with decoupling between the API and the backend layers, the API spec author just needs the endpoint for whatever service backend engineers will chose to use. The standardization and uniformity achieved with APIs and the OpenAPI Specificiation results in improved software delivery velocity.

Paragraph 4

- Create a Google Cloud account, and in the process you will be guided to create a project, keep the project id handy as we will need it in subsquent configuration setup.
- Before getting started you'll need to set up your local environment to deploy code and provision infrastructure in Google Cloud, follow the instructions on these links to get this done: Installing the [Cloud SDK](https://cloud.google.com/sdk/docs/install), [initializing](https://cloud.google.com/sdk/docs/initializing), and [authorizing](https://cloud.google.com/sdk/docs/authorizing).
- "Terraform is an open-source infrastructure as code software tool that provides a consistent CLI workflow to manage hundreds of cloud services. Terraform codifies cloud APIs into declarative configuration files." "Write infrastructure as code using declarative configuration files. HashiCorp Configuration Language (HCL) allows for concise descriptions of resources using blocks, arguments, and expressions." "Apply changes to hundreds of cloud providers with terraform apply to reach the desired state of the configuration."
  - Why use it?
    - "Codify your application infrastructure - Reduce human error and increase automation by provisioning infrastructure as code."
    - "Create reproducible infrastructure Provision consistent testing, staging, and production environments with the same configuration."
- ^ all from terraform homepage
- Use this [link](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/getting_started) to set up Terraform in your local environment and ready to provision infrastructure in your project.
  - The sample code's `prototype-b` directory contains all the terraform code you will need to build this API, for this initial set up portion of this excercise, copy over the `provider.tf` file to your local working directory and run the terraform commands from this working directory. You'll see that the provider references terraform variables and that's something you can set up using the code [here](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/getting_started), all you need to do is fill in the default values.
    - The first three values you can find in the Google Cloud console
    - The service account key will be the path name to the `.json` file, you can create this key and download it using this [link](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating), set the role to Editor (under "Basic")
      - We will discuss IAM and Service Accounts a little more in depth in later parts of this guide, for now just know that this is something you need to authorize Terraform to create infrastructure in your Google Cloud project.
      - I advise you to keep it in the local working directory (same as where your `provider.tf` is)

Paragraph 5 (Container Image)

- A Docker "[container](https://www.docker.com/resources/what-container) is a standard unit of software that packages up code and all its dependencies so the application runs quickly and reliably from one computing environment to another. A Docker container image is a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries and settings." Using Docker ensures that the code we write in our local machines will work in the environment Cloud Run (which I'll describe below) is running.
- The code which we will dockerize is using [Express.js](https://expressjs.com/) and the Google Cloud Storage SDK to run a Node.js web application that responds to HTTP methods and returns data, writes data, etc. Express.js is excellent for creating API backends because it has "a myriad of HTTP utility methods and middleware at your disposal, creating a robust API is quick and easy." The main Express.js code can be found in the `server.js` file within the container image [code](https://github.com/refayathaque/somtum.io-infra-and-images/tree/main/nodejs-containers/storage-crud)
- The Node.js web server we’ll be deploying is performing some very basic Google Cloud Storage tasks like providing the client abilities to create buckets, delete buckets, delete objects, list buckets, list objects, and change object names. The entry file is `server.js` and it’s leveraging Express.js to create routes for the client to hit. There are modules corresponding to each route to do things like fetch buckets, delete buckets, etc. When the time comes to provision our entire API infrastructure, we will first create this docker image and deploy it to Google Cloud for Cloud Run to later use in provisioning itself. For now it’s important to understand what this image is doing, and that’s returning Google Cloud Storage data to the client by leveraging the JavaScript Google Cloud Storage client. However, it’s important to discuss, albeit in short, the security implications of this web server. As you’ll see in the infrastructure provisioning section, this Cloud Run service running the Node.js Express web server will have limited permissions, permissions only to do the storage operations it needs to do, nothing more.
- Our intention with this code is for others to take and tweak as necessary to maybe have a Node.js app that interacts with other Google Cloud services or even other Cloud provider's services. If you want to for example, create an app that can interact with Machine Learning services you just have to add the Node.js library for that service and write the code.
- Cloud Run is akin to AWS' Elastic Container Service if you're more familiar with that, it's essentially a service that allows you to "develop and deploy highly scalable containerized applications on a fully managed serverless platform", and its also highly cost-effective due to it's "serverless" nature, you "only pay when your code is running." We will use this service to run our Docker container image that will interact with Google Cloud Storage.

Paragraph 6 (Intro to infra provisioning)

- In deploying this API we will be taking a two-step approach to infrastructure deployment, and that is due to the way Cloud Run services work. Since Cloud Run needs to know what container image to use we need to first build and push the image to Google Cloud Artifact Registry. Once the image is deployed we can proceed and build out all the other infrastructure pieces listed below.

Paragraph 7 (Infra part 1)

- `apis.tf`
  - We need to enable a bunch of Google Cloud services we will need to provision the infrastructure, without enabling these services terraform will not be able to provision and you'll get errors. The terraform code is written in a way where we've sequence the provisioning of all resources to only occur if their respective APIs have been enabled.
- What is API Gateway and why do we need it?
  - Advantage being I can change the backend to something else if I want to
- How do I push the image to Google Cloud?
- What do I need to do prior to pushing?
  - What is Artifact Registry? What does the `run-me-first.sh` script do?

Paragraph 8 (Infra part 2) Provisioning Google Cloud infrastructure with Terraform

- Enabling appropriate APIs to allow us to interact with services in Google Cloud
- Cloud Run
- IAM
- Cloud Build
  - Enable in UI first
- API Gateway

Paragraph 9 (Testing)

- To test that our API is working as expected we’ll take the API Gateway default hostname returned by terraform and append the routes described in the open api spec file, inserting parameters wherever necessary.

Last Paragraph (Conclusion)

- For help with local testing please reach out
- If something doesn't work also reach out and I'll try to help you out as much as possible
