package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.UsuarioRecordDto;
import com.internews.gestao_clientes.models.UsuarioModel;
import com.internews.gestao_clientes.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class UsuarioContoller {
    @Autowired
    UsuarioRepository usuarioRepository;

    @GetMapping("/users")
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

    @GetMapping("/user/{id}")
    public ResponseEntity<?> listarUsuarioId(@PathVariable(value = "id") UUID id) {
        Optional<UsuarioModel> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(usuario);
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> atualizarUsuario(@PathVariable(value = "id") UUID id, @RequestBody @Valid UsuarioRecordDto usuarioRecordDto) {
        Optional<UsuarioModel> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        }
        var usuarioModel = usuario.get();
        BeanUtils.copyProperties(usuarioRecordDto, usuarioModel);
        return ResponseEntity.status(HttpStatus.OK).body(usuarioRepository.save(usuarioModel));
    }
}
