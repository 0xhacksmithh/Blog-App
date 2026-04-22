# HLD

## Version 3

High-level overview of the microservices-based blog platform. Requests flow through the API Gateway to User, Post, and Notification services, with asynchronous communication handled via Kafka.

![This HLD Image.](./Architectural%20Diagrams/HLD/v3.png)

## Version 2

![This HLD Image.](./Architectural%20Diagrams/HLD/v2.png)

## Version 1

![This HLD Image.](./Architectural%20Diagrams/HLD/v1.png)

# Flow Diagrams

## User Authentication Flow

Illustrates how users sign up/sign in and receive a JWT. This token is later used for accessing protected routes across services.

![This HLD Image.](./Architectural%20Diagrams/FlowDiagrams/Signin_Signup.png)

## Subscription Flow (Reader → Author)

Shows how a reader subscribes to an author with a preferred notification mode. The subscription is stored in the User service and propagated to the Notification service via Kafka.

![This HLD Image.](./Architectural%20Diagrams/FlowDiagrams/Subscribe_Author.png)

## Authentication Middleware (JWT + gRPC)

Describes how protected routes validate users. The Post service verifies the JWT and performs a gRPC call to the User service to confirm user identity and role.

![This HLD Image.](./Architectural%20Diagrams/FlowDiagrams/Auth_Middleware.png)

## Post Creation Flow (Author)

Depicts how an author creates a post. After authentication, the post is stored and an event is published to Kafka to trigger downstream processes like notifications.

![This HLD Image.](./Architectural%20Diagrams/FlowDiagrams/Post_Creation.png)

## Notification Fanout (Kafka Consumer)

This service listens to post creation events and dispatches notifications
to subscribers using batch processing and multi-channel delivery.

![This HLD Image.](./Architectural%20Diagrams/FlowDiagrams/Subscriber_Notification.png)

## Interaction Processing (Kafka + Redis Batching)

Explains how likes, dislikes, and comments are processed asynchronously using Kafka and Redis batching, reducing direct database writes and improving scalability.

![This HLD Image.](./Architectural%20Diagrams/FlowDiagrams/Kafka_Redis_Batch_Processing.png)

## Notification Consumer Processing (Detailed)

Shows the internal working of the Notification service: consuming events, querying subscribers, batching them, grouping by notification mode, and dispatching messages.

![This HLD Image.](./Architectural%20Diagrams/FlowDiagrams/Notification_Batch_Processing.png)
