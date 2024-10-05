package com.internews.gestao_clientes.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClienteRecordDto(@NotBlank String nome, String logradouro, String numero, String complemento, String bairro, String cidade, String uf, String cep, @NotBlank @NotNull String cpf, @NotBlank String email, @NotBlank String telefone) {

}
