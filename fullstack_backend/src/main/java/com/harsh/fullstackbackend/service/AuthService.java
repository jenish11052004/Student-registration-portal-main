package com.harsh.fullstackbackend.service;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private java.util.Set<String> loggedInUsers = java.util.concurrent.ConcurrentHashMap.newKeySet();

    @org.springframework.beans.factory.annotation.Value("${app.google.client-id}")
    private String clientId;

    @org.springframework.beans.factory.annotation.Value("${app.google.client-secret}")
    private String clientSecret;

    public boolean exchangeCodeForToken(String authCode) {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();

            // 1. Exchange code for tokens
            String requestBody = "code=" + authCode +
                    "&client_id=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&redirect_uri=http://localhost:3000" +
                    "&grant_type=authorization_code";

            java.net.http.HttpRequest tokenRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://oauth2.googleapis.com/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            java.net.http.HttpResponse<String> tokenResponse = client.send(tokenRequest,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            if (tokenResponse.statusCode() == 200) {
                com.google.gson.JsonObject tokenJson = com.google.gson.JsonParser.parseString(tokenResponse.body())
                        .getAsJsonObject();
                String accessToken = tokenJson.get("access_token").getAsString();

                // 2. Get user info using access token
                java.net.http.HttpRequest userRequest = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                        .header("Authorization", "Bearer " + accessToken)
                        .GET()
                        .build();

                java.net.http.HttpResponse<String> userResponse = client.send(userRequest,
                        java.net.http.HttpResponse.BodyHandlers.ofString());

                if (userResponse.statusCode() == 200) {
                    com.google.gson.JsonObject userJson = com.google.gson.JsonParser.parseString(userResponse.body())
                            .getAsJsonObject();
                    String email = userJson.get("email").getAsString();

                    // Check if email is admin
                    if ("jenishvekariya011@gmail.com".equals(email)) {
                        if (loggedInUsers.contains(email)) {
                            throw new RuntimeException("User is already logged in");
                        }
                        loggedInUsers.add(email);
                        return true;
                    }
                }
            } else {
                System.out.println("Token exchange failed: " + tokenResponse.body());
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public void logout(String email) {
        loggedInUsers.remove(email);
    }
}
