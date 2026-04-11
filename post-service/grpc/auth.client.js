import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";

const protoPath = path.resolve("proto/auth.proto");
const packageDef = protoLoader.loadSync(protoPath);
const grpcObject = grpc.loadPackageDefinition(packageDef);

const authPackage = grpcObject.auth;

export const authClient = new authPackage.AuthService(
  //  "user-service:50051", // Docker service name
  "localhost:50051", // for local host development :: User Service
  grpc.credentials.createInsecure(),
);
