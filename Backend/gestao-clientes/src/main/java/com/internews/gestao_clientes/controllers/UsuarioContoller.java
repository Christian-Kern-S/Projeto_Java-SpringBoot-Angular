package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.models.UsuarioModel;
import com.internews.gestao_clientes.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class UsuarioContoller {
    @Autowired
    UsuarioRepository usuarioRepository;

    @GetMapping("/user")
    public ResponseEntity<?> listarUsuarios(@RequestParam(value = "value", required = false, defaultValue = "") String value) {
        // Se não veio nenhum parâmetro (value == ""), retorna todos
        if (value.isEmpty()) {
            List<UsuarioModel> todos = usuarioRepository.findAll();
            return ResponseEntity.ok(todos);
        }

        Optional<UsuarioModel> resultado;
        try {
            UUID idUser = UUID.fromString(value);
            resultado = usuarioRepository.findById(idUser);
        } catch (IllegalArgumentException e) {
            // Se não for UUID válido, busca por username
            resultado = usuarioRepository.findByUsername(value);
        }

        if (resultado.isPresent()) {
            return ResponseEntity.ok(resultado.get());
        } else {
            // Se não encontrou nada, devolve 404 Not Found
            return ResponseEntity.notFound().build();
        }
    }
}
