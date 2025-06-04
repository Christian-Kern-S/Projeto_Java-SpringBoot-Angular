package com.internews.gestao_clientes.dtos;

import jakarta.validation.constraints.NotBlank;

public record LoginDto(@NotBlank String username, @NotBlank String password) {
}
