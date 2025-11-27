package com.harsh.fullstackbackend.controller;

import com.harsh.fullstackbackend.service.TokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OAuthController {

    @Autowired
    private TokenService tokenService;

    @Value("${app.google.client-id}")
    private String clientId;

    @Value("${app.google.redirect-uri}")
    private String redirectUri;

    @Value("${app.admin-email}")
    private String adminEmail;

    /**
     * Step 1: Redirect user to Google OAuth login
     */
    @GetMapping("/login")
    public RedirectView login() throws UnsupportedEncodingException {
        String scope = "openid email profile";
        String responseType = "code";

        String authUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + clientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8.toString()) +
                "&response_type=" + responseType +
                "&scope=" + URLEncoder.encode(scope, StandardCharsets.UTF_8.toString()) +
                "&access_type=offline" +
                "&prompt=consent";

        return new RedirectView(authUrl);
    }

    /**
     * Step 2: Handle OAuth callback from Google
     */
    @GetMapping("/oauth2/callback")
    public RedirectView callback(@RequestParam("code") String code, HttpServletResponse response) {
        try {
            // Exchange code for tokens
            TokenService.TokenData tokens = tokenService.exchangeCodeForTokens(code);

            // Validate the ID token and get user email
            String email = tokenService.validateToken(tokens.getIdToken());

            // Check if user is authorized (admin email)
            if (!adminEmail.equals(email)) {
                return new RedirectView("http://localhost:3000/?error=unauthorized");
            }

            // Check for duplicate login
            if (tokenService.hasActiveSession(email)) {
                return new RedirectView("http://localhost:3000/?error=already_logged_in");
            }

            // Store tokens in session
            tokenService.storeTokens(email, tokens);

            // Set HTTP-only cookie with ID token
            Cookie idTokenCookie = new Cookie("google_id_token", tokens.getIdToken());
            idTokenCookie.setHttpOnly(true);
            idTokenCookie.setPath("/");
            idTokenCookie.setMaxAge(3600); // 1 hour
            // For production, also set: idTokenCookie.setSecure(true);
            response.addCookie(idTokenCookie);

            // Also set email cookie for frontend access
            Cookie emailCookie = new Cookie("user_email", email);
            emailCookie.setPath("/");
            emailCookie.setMaxAge(3600);
            response.addCookie(emailCookie);

            // Redirect to frontend home page
            return new RedirectView("http://localhost:3000/home");

        } catch (Exception e) {
            e.printStackTrace();
            return new RedirectView("http://localhost:3000/?error=login_failed");
        }
    }

    /**
     * Step 3: Logout - clear cookies and session
     */
    @PostMapping("/signout")
    public void signout(@CookieValue(value = "user_email", required = false) String email,
            HttpServletResponse response) {

        // Remove tokens from session
        if (email != null) {
            tokenService.removeTokens(email);
        }

        // Delete ID token cookie
        Cookie idTokenCookie = new Cookie("google_id_token", null);
        idTokenCookie.setHttpOnly(true);
        idTokenCookie.setPath("/");
        idTokenCookie.setMaxAge(0); // Delete immediately
        response.addCookie(idTokenCookie);

        // Delete email cookie
        Cookie emailCookie = new Cookie("user_email", null);
        emailCookie.setPath("/");
        emailCookie.setMaxAge(0);
        response.addCookie(emailCookie);

        response.setStatus(HttpStatus.OK.value());
    }
}
