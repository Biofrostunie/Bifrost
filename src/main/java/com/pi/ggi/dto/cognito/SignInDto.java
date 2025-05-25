package com.pi.ggi.dto.cognito;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SignInDto {
    private @NotNull String nickName;
    private @NotNull String password;
}

