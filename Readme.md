# HLD-1

![This HLD Image.](./Architectural%20Diagrams/HLD.png)

# HLD-2

![This HLD Image.](./Architectural%20Diagrams/HLD-2.png)

## LLD

![alt text](./Architectural%20Diagrams/LLD-1.png)

![alt text](./Architectural%20Diagrams/LLD-2.png)

## Time To Optimize POST Microservices

### Before

"/posts/:postId/like"
"/posts/:postId/unlike" ---> MongoDB (direct write)
"/posts/:postId/comment"

### After

"/posts/:postId/like"
"/posts/:postId/unlike" ---> Kafka (event) → Consumer → MongoDB (write)
"/posts/:postId/comment"

### Futher Improvement

"/posts/:postId/like"
"/posts/:postId/unlike" ---> Kafka (event) → Consumer → Redis (durable buffer) → Worker → MongoDB (Batch write)
"/posts/:postId/comment"

`Initially planed to go with in-memory Buffer, but there is probability of data loss on crash`
