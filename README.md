# Ladder Web

A platform for managing ladder competitions for racket sports, built with Next.js and AWS Amplify Gen2.

## Getting Started

1. Install dependencies:

```bash
yarn install
```

2. Start the development server:

```bash
yarn dev
```

## AWS Amplify Integration

This project uses AWS Amplify Gen2 for authentication, data storage, and API functionality.

### Local Development

During development, the app connects to your Amplify backend in the cloud.

### Authentication

Authentication is handled through AWS Cognito, allowing users to sign up, sign in, and manage their accounts.

### Data Models

The application uses the following data models:
- Ladder: Represents a competition ladder
- Team: Represents a team in a ladder
- Player: Represents an individual player
- Match: Represents a match between two teams

## Deployment

To deploy to AWS Amplify:

1. Install the Amplify CLI:

```bash
npm install -g @aws-amplify/cli
```

2. Push your Amplify backend:

```bash
yarn amplify push
```

3. Build the Next.js application:

```bash
yarn build
```
