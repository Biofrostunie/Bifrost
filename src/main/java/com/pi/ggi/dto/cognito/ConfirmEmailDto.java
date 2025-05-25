package com.pi.ggi.dto.cognito;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConfirmEmailDto {
    private @NotNull @Email String email;
    private @NotNull String confirmationCode;
}

