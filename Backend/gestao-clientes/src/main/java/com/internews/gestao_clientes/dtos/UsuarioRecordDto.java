package com.internews.gestao_clientes.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record UsuarioRecordDto(@NotBlank String username, @NotBlank String email, @NotBlank String Cargo ,@NotBlank String ramal, @PastOrPresent LocalDate dataCadastro ) {
}
