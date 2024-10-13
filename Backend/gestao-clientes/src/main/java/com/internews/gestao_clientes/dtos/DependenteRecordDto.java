package com.internews.gestao_clientes.dtos;

import com.internews.gestao_clientes.models.ClienteModel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DependenteRecordDto(@NotBlank String nome, @NotBlank String telefone, @NotBlank String parentesco) {
}
