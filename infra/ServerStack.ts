import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { join } from "path";

export class ServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "ProductImages", {
      publicReadAccess: true,
    });

    const stage = scope.node.tryGetContext("stage") as string | undefined;

    const secret = stage
      ? Secret.fromSecretNameV2(
          this,
          `MONGO_URL`,
          `${stage.toUpperCase()}_MONGO_URL`
        )
      : Secret.fromSecretNameV2(this, `MONGO_URL`, `MONGO_URL`);

    const createProductFn = new NodejsFunction(this, "CreateProduct", {
      entry: join(__dirname, "../server/functions/createProduct.ts"),
      environment: {
        BUCKET: bucket.bucketName,
        SECRETS_ARN: secret.secretArn,
      },
    });

    bucket.grantWrite(createProductFn);
    secret.grantRead(createProductFn);

    const listProductFn = new NodejsFunction(this, "ListProducts", {
      entry: join(__dirname, "../server/functions/listProducts.ts"),
      environment: {
        BUCKET: bucket.bucketName,
        SECRETS_ARN: secret.secretArn,
      },
      memorySize: 256,
    });

    secret.grantRead(listProductFn);

    const retrieveProductFn = new NodejsFunction(this, "RetrieveProduct", {
      entry: join(__dirname, "../server/functions/retrieveProduct.ts"),
      environment: {
        BUCKET: bucket.bucketName,
        SECRETS_ARN: secret.secretArn,
      },
      memorySize: 256,
    });

    secret.grantRead(retrieveProductFn);

    const restApi = new RestApi(this, "RestApi", {
      restApiName: `${stage || "dev"}-thegoodstr-api`,
      deployOptions: {
        stageName: stage || "dev",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["POST"],
        allowHeaders: ["*"],
        allowCredentials: true,
      },
    });

    const productsEndpoint = restApi.root.addResource("products");

    productsEndpoint.addMethod("POST", new LambdaIntegration(createProductFn));
    productsEndpoint.addMethod("GET", new LambdaIntegration(listProductFn));

    const productsIdEndpoint = productsEndpoint.addResource("{id}");
    productsIdEndpoint.addMethod(
      "GET",
      new LambdaIntegration(retrieveProductFn)
    );
  }
}
