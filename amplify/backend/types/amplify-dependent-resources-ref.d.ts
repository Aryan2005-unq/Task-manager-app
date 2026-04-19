export type AmplifyDependentResourcesAttributes = {
  "api": {
    "aiprediction": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    },
    "todoapp": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string"
    }
  },
  "auth": {
    "todoappd2f18784": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    }
  },
  "function": {
    "aiTaskFunction": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "emailReminderFunction": {
      "Arn": "string",
      "CloudWatchEventRule": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    }
  },
  "storage": {
    "todoStorage": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}