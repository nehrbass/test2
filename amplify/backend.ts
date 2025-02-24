import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { myApiFunction } from "./backend/functions/api-function/resource";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";


const backend= defineBackend({
  auth,
  data,
  myApiFunction
});

const apiStack = backend.createStack("api-stack");

const myRestApi = new RestApi(apiStack, "RestApi", {
  restApiName: "paul-api-2",
  deploy: true,
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS, // Restrict this to domains you trust
    allowMethods: Cors.ALL_METHODS, // Specify only the methods you need to allow
    allowHeaders: Cors.DEFAULT_HEADERS, // Specify only the headers you need to allow
  }});

// create a new Lambda integration
const lambdaIntegration = new LambdaIntegration(
    backend.myApiFunction.resources.lambda
);

// create a new resource path with IAM authorization
const metricsPath = myRestApi.root.addResource("metrics", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE
  },
});

// add methods you would like to create to the resource path
metricsPath.addMethod("GET", lambdaIntegration);
metricsPath.addMethod("POST", lambdaIntegration);

// add a proxy resource path to the API
metricsPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});


// create a new IAM policy to allow Invoke access to the API
const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/metrics", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/metrics/*", "dev")}`,
      ],
    }),
  ],
});

// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
    apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
    apiRestPolicy
);