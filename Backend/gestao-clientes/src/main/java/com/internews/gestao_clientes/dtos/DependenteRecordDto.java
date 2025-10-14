package com.internews.gestao_clientes.dtos;

import jakarta.validation.constraints.NotBlank;

public record DependenteRecordDto(@NotBlank String nome, @NotBlank String telefone, @NotBlank String parentesco) {
}
