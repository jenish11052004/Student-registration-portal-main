package com.harsh.fullstackbackend.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {

    @Value("${app.google.client-id}")
    private String clientId;

    @Value("${app.google.client-secret}")
    private String clientSecret;

    @Value("${app.google.redirect-uri}")
    private String redirectUri;

    // Store tokens in memory: email -> {idToken, accessToken, refreshToken}
    private final Map<String, TokenData> tokenStore = new ConcurrentHashMap<>();

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Exchange authorization code for tokens (ID, Access, Refresh)
     */
    public TokenData exchangeCodeForTokens(String authCode) throws Exception {
        String requestBody = "code=" + authCode +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&redirect_uri=" + redirectUri +
                "&grant_type=authorization_code";

        HttpRequest tokenRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> tokenResponse = httpClient.send(tokenRequest,
                HttpResponse.BodyHandlers.ofString());

        if (tokenResponse.statusCode() != 200) {
            throw new RuntimeException("Token exchange failed: " + tokenResponse.body());
        }

        JsonObject tokenJson = JsonParser.parseString(tokenResponse.body()).getAsJsonObject();

        String idToken = tokenJson.has("id_token") ? tokenJson.get("id_token").getAsString() : null;
        String accessToken = tokenJson.get("access_token").getAsString();
        String refreshToken = tokenJson.has("refresh_token") ? tokenJson.get("refresh_token").getAsString() : null;

        return new TokenData(idToken, accessToken, refreshToken);
    }

    /**
     * Validate ID token using Google's tokeninfo endpoint
     */
    public String validateToken(String idToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Token validation failed");
        }

        JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();

        // Verify the token is for our client
        String aud = jsonResponse.get("aud").getAsString();
        if (!clientId.equals(aud)) {
            throw new RuntimeException("Token audience mismatch");
        }

        // Return the email from the token
        return jsonResponse.get("email").getAsString();
    }

    /**
     * Store tokens in session
     */
    public void storeTokens(String email, TokenData tokens) {
        tokenStore.put(email, tokens);
    }

    /**
     * Get stored tokens
     */
    public TokenData getStoredTokens(String email) {
        return tokenStore.get(email);
    }

    /**
     * Remove tokens (logout)
     */
    public void removeTokens(String email) {
        tokenStore.remove(email);
    }

    /**
     * Check if user has active session
     */
    public boolean hasActiveSession(String email) {
        return tokenStore.containsKey(email);
    }

    /**
     * Token data holder
     */
    public static class TokenData {
        private final String idToken;
        private final String accessToken;
        private final String refreshToken;

        public TokenData(String idToken, String accessToken, String refreshToken) {
            this.idToken = idToken;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }

        public String getIdToken() {
            return idToken;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public String getRefreshToken() {
            return refreshToken;
        }
    }
}
