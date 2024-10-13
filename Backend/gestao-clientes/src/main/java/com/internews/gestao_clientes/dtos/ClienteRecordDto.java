package com.internews.gestao_clientes.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ClienteRecordDto(@NotBlank String nome, String logradouro, String numero, String complemento, String bairro, String cidade, String uf, String cep, @NotBlank @NotNull String cpf, @NotBlank String email, @NotBlank String telefone, @Positive
                               BigDecimal rendaMensal, @PastOrPresent LocalDate dataCadastro) {

}
