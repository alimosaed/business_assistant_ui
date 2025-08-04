# Authentication API Specification

This document outlines the API endpoints required for the Python backend to handle OAuth 2.0 authentication.

---

## 1. Initiate Login

*   **Endpoint:** `GET /api/auth/login`
*   **Description:** This endpoint kicks off the OAuth 2.0 authentication process. The frontend will redirect the user to this endpoint when they click the "Sign in with OAuth" button.
*   **Backend Responsibility:**
    1.  Generate the OAuth provider's authorization URL (e.g., Google, GitHub, etc.).
    2.  The URL must include the following query parameters:
        *   `client_id`: Your application's client ID from the OAuth provider.
        *   `redirect_uri`: The URL where the user will be redirected after authentication. This must be set to your backend's callback URL (e.g., `http://localhost:8000/api/auth/callback`).
        *   `response_type`: Must be set to `code`.
        *   `scope`: A space-delimited list of scopes you are requesting permission for (e.g., `openid profile email`).
        *   `state`: A random, unguessable string to protect against CSRF attacks.
    3.  Redirect the user's browser to the generated authorization URL.

---

## 2. Handle OAuth Callback

*   **Endpoint:** `GET /api/auth/callback`
*   **Description:** The OAuth provider will redirect the user to this endpoint after they have authorized (or denied) your application.
*   **Backend Responsibility:**
    1.  Extract the `code` and `state` query parameters from the request.
    2.  Verify that the `state` parameter matches the one you generated in the previous step.
    3.  Exchange the `code` for an `access_token` by making a `POST` request to the OAuth provider's token endpoint. This request should include your `client_id`, `client_secret`, the `code`, and the `redirect_uri`.
    4.  With the `access_token`, make a request to the OAuth provider's user info endpoint to get the user's profile data (e.g., name, email).
    5.  Create a user in your database if they don't already exist.
    6.  Generate a JSON Web Token (JWT) for the user. This token will be used to authenticate subsequent requests from the UI.
    7.  Redirect the user back to the frontend's authentication callback page, passing the JWT as a query parameter.
        *   **Redirect URL:** `http://localhost:3000/auth?token=<YOUR_JWT>`

---

## 3. Verify User Session (Optional but Recommended)

*   **Endpoint:** `GET /api/auth/me`
*   **Description:** A protected endpoint that allows the frontend to get the currently authenticated user's information.
*   **Backend Responsibility:**
    1.  Expect a JWT in the `Authorization` header of the request (e.g., `Authorization: Bearer <YOUR_JWT>`).
    2.  Validate the JWT. If the token is valid, respond with the user's information.
    3.  If the token is invalid or expired, respond with a `401 Unauthorized` error.
*   **Example Response (Success):**
    ```json
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
    ```

By implementing these three endpoints in your Python backend, you will have a complete authentication system that integrates seamlessly with the UI I've built.