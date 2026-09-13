# IoT Monitoring System

AWS cloud-based IoT monitoring project built with Node.js/Express.

## Architecture

Sensor Simulator -> Amazon API Gateway -> AWS Lambda -> Amazon DynamoDB / Amazon S3

Web Browser -> AWS Elastic Beanstalk (Node.js/Express) -> DynamoDB / Amazon Athena -> Amazon S3

## AWS services

- AWS Elastic Beanstalk
- Amazon API Gateway
- AWS Lambda
- Amazon DynamoDB
- Amazon S3
- Amazon Athena

## Features

- Simulated temperature, humidity and air-quality readings
- Latest sensor readings dashboard
- Threshold management
- Automatic alerts for out-of-range readings
- Historical sensor queries using Athena over S3
- JWT-based authentication for protected actions

## Run locally

```bash
npm install
```

Create a `.env` file from `.env.example`, then run:

```bash
node app.js
```

To run the sensor simulator:

```bash
node sensor-simulator.js
```

## Security

Do not commit AWS credentials or the real `.env` file. AWS access is expected to use the environment/instance role configuration.
