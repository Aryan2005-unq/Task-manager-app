# AWS Amplify Serverless Task Manager

A full-stack React project built with [AWS Amplify](https://aws.amazon.com/amplify/) and [Vite](https://vitejs.dev/). This application empowers users to securely manage their personal tasks using a robust, serverless AWS backend. 

## 🚀 Features

* **Secure Authentication**: User sign-up, sign-in, and email verification using **Amazon Cognito**.
* **Real-time Database**: Create, read, and delete personal tasks powered by a **GraphQL API (AWS AppSync)** and a NoSQL database (**Amazon DynamoDB**).
* **Data Isolation**: Strict GraphQL `@auth` rules ensure users can only view and mutate tasks that belong to them (Owner-level authorization).
* **Modern UI Components**: Features cloud-connected UI components mapped specifically for React via **AWS Amplify UI**.
* **Blazing Fast Frontend**: Scaffolded with **Vite** for a highly responsive developer experience.

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 + Vite
* **Styling**: AWS Amplify UI React Components
* **Authentication**: Amazon Cognito (Email / Password)
* **API Layer**: AWS AppSync (GraphQL)
* **Database**: Amazon DynamoDB
* **Hosting**: AWS Amplify Hosting

## 📋 Prerequisites

To run this project, make sure you have the following installed:
- [Node.js](https://nodejs.org/en) (v18 or higher)
- [AWS CLI](https://aws.amazon.com/cli/) or an active AWS Account
- The AWS Amplify CLI (`npm install -g @aws-amplify/cli`)

## ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd todo-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize Amplify Environment (if pulling from git):**
   ```bash
   amplify pull --appId <your-app-id> --envName <your-env-name>
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## ☁️ Deployment

This project is configured to be hosted natively on AWS Amplify Hosting. 

To deploy any frontend code changes to your live URL, run:
```bash
amplify publish
```

To push changes to your backend GraphQL schema (`amplify/backend/api/todoapp/schema.graphql`), run:
```bash
amplify push
```

## 🔐 Security Overview
By heavily utilizing Amazon Cognito User Pools, user data isolates securely per account automatically configured by our `schema.graphql`:
```graphql
type Todo @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  name: String!
  description: String
}
```
