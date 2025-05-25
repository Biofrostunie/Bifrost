package com.pi.ggi.controller;

import com.pi.ggi.dto.cognito.SignUpDto;
import com.pi.ggi.service.CognitoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class CognitoController {
    private final CognitoService cognitoService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(SignUpDto signUpDto) {
        return cognitoService.signUp(signUpDto);
    }

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmUser(String username, String code) {
        return cognitoService.confirmSignUp(username, code);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(String username, String password) {
        return cognitoService.signIn(username, password);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Deu Certo");
    }
}
