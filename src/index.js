import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

// Configure Amplify **after** imports
Amplify.configure(awsconfig);

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_9CwAB85xS",
  client_id: "58hc6tvb57fio4hlmdeht6qnu5",
  redirect_uri: "https://main.dt99oihfbmpcm.amplifyapp.com/",
  response_type: "code",
  scope: "email openid phone",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
