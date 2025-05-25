package com.pi.ggi.service;

import com.pi.ggi.dto.cognito.SignUpDto;
import com.pi.ggi.dto.cognito.SignInResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CognitoService {

    private final CognitoIdentityProviderClient cognitoClient;

    @Value("${spring.aws.cognito.appClientId}")
    private String appClientId;
    @Value("${spring.aws.secretKey}")
    private String secretKey;

    public ResponseEntity<String> signUp(SignUpDto signUpDto) {
        try {
            System.out.println("\nSigning up user: " + signUpDto.getNickName() + "\n");

            String secretHash = calculateSecretHash(signUpDto.getNickName(), appClientId, secretKey);

            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .clientId(appClientId)
                    .secretHash(secretHash)
                    .username(signUpDto.getNickName())
                    .password(signUpDto.getPassword())
                    .userAttributes(
                            AttributeType.builder().name("name").value(signUpDto.getName()).build(),
                            AttributeType.builder().name("email").value(signUpDto.getEmail()).build(),
                            AttributeType.builder().name("nickname").value(signUpDto.getNickName()).build(),
                            AttributeType.builder().name("phone_number").value(signUpDto.getPhoneNumber()).build()
                    )

                    .build();

            cognitoClient.signUp(signUpRequest); // Faz a inscrição do usuário no Cognito

            return ResponseEntity.status(HttpStatus.OK).body("User signed up successfully");

            // Adiciona o usuário ao grupo especificado

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error signing up user: " + e.getMessage());
        }
    }

    public ResponseEntity<String> confirmSignUp(String username, String confirmationCode) {
        try {
            String secretHash = calculateSecretHash(username, appClientId, secretKey);

            ConfirmSignUpRequest confirmSignUpRequest = ConfirmSignUpRequest.builder()
                    .clientId(appClientId)
                    .secretHash(secretHash)
                    .username(username)
                    .confirmationCode(confirmationCode)
                    .build();

            ConfirmSignUpResponse confirmSignUpResponse = cognitoClient.confirmSignUp(confirmSignUpRequest);

            System.out.println("\nCONFIRM SIGNUP: " + confirmSignUpResponse + "\n");

            return ResponseEntity.ok("User confirmed successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error confirming user: " + e.getMessage());
        }
    }

    public ResponseEntity<?> signIn(String username, String password) {
        try {
            String secretHash = calculateSecretHash(username, appClientId, secretKey);

            Map<String, String> authParams = new HashMap<>();
            authParams.put("USERNAME", username);
            authParams.put("PASSWORD", password);
            authParams.put("SECRET_HASH", secretHash);

            InitiateAuthRequest authRequest = InitiateAuthRequest.builder()
                    .clientId(appClientId)
                    .authFlow(AuthFlowType.USER_PASSWORD_AUTH) // Fluxo de autenticação
                    .authParameters(authParams)
                    .build();

            InitiateAuthResponse authResponse = cognitoClient.initiateAuth(authRequest);
            AuthenticationResultType authResult = authResponse.authenticationResult();
            SignInResponseDto signInResponseDto = new SignInResponseDto(
                    authResult.accessToken(),
                    authResult.expiresIn(),
                    authResult.tokenType(),
                    authResult.refreshToken(),
                    authResult.idToken()
            );
            return ResponseEntity.status(HttpStatus.OK).body(signInResponseDto);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error authenticating user: " + e.getMessage());
        }
    }

    private String calculateSecretHash(String username, String clientId, String secretKey) {
        try {
            String message = username + clientId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hmacBytes = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error calculating secret hash", e);
        }
    }

}
