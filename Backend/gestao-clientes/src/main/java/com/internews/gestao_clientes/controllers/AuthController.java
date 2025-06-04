package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.LoginDto;
import com.internews.gestao_clientes.models.UsuarioModel;
import com.internews.gestao_clientes.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    /**
     * Endpoint de registro de novo usuário (ex.: POST /api/auth/register).
     * Espera JSON { "username": "...", "password": "...", "role": "ROLE_USER" }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UsuarioModel newUser) {
        try {
            UsuarioModel created = authService.register(
                    newUser.getUsername(),
                    newUser.getPassword(),
                    newUser.getRole() != null ? newUser.getRole() : "ROLE_USER"
            );

            created.setPassword(null);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    /**
     * Endpoint de login (POST /api/auth/login).
     * Recebe JSON { username, password } via LoginDto.
     * Retorna 200 OK se for válido, 401 Unauthorized se inválido.
     * Opcionalmente, devolve um “token” (aqui usamos um valor fictício ou a própria mensagem).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        boolean valid = authService.authenticate(loginDto);
        if (!valid) {
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }

        String fakeToken = "Bearer" + java.util.UUID.randomUUID().toString();
        return ResponseEntity.ok().body(Map.of("token", fakeToken));
    }
}
