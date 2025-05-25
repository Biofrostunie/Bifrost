package com.pi.ggi.dto.cognito;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignUpDto {
    @NotNull
    private String name;

    @NotNull
    private String nickName;

    @NotNull
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "A senha deve ter pelo menos 8 caracteres e incluir pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial (ex: Senha@123)"
    )
    @Schema(example = "Senha@123")
    private @NotNull String password;

    @NotNull
    @Pattern(
            regexp = "^\\+[1-9]\\d{1,14}$",
            message = "O número de telefone deve estar no formato E.164, começando com + seguido do código do país e do número. Exemplo: +5511999998888"
    )
    @Schema(example = "+5511999998888")
    private @NotNull String phoneNumber;

    @NotNull
    private @NotNull @Email String email;
}

