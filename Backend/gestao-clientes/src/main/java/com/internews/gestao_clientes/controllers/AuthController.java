package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.ChangePasswordDto;
import com.internews.gestao_clientes.dtos.LoginDto;
import com.internews.gestao_clientes.models.UsuarioModel;
import com.internews.gestao_clientes.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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

        UsuarioModel usuario = authService.loadByUsername(loginDto.username());


        // trocar por um JWT real ou outro mecanismo
        String fakeToken = "Bearer " + java.util.UUID.randomUUID().toString();

        // Constroi o JSON de resposta contendo token, id_user e username
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("token",   fakeToken);
        responseBody.put("id_user", usuario.getId().toString());
        responseBody.put("username", usuario.getUsername());
        responseBody.put("fullname", usuario.getFullname());
        responseBody.put("cargo", usuario.getCargo());
        responseBody.put("email", usuario.getEmail());
        responseBody.put("ramal", usuario.getRamal());
        responseBody.put("dataCadastro", usuario.getDataCadastro());
        responseBody.put("role", usuario.getRole());

        return ResponseEntity.ok(responseBody);
    }

    @PutMapping("/changepass/{id}")
    public ResponseEntity<?> changePassword(@PathVariable(value = "id") UUID id, @RequestBody ChangePasswordDto changePasswordDto) {
        UUID userId = id;
        try{
            authService.changePassword(userId, changePasswordDto.oldPassword(), changePasswordDto.newPassword());
            return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso!"));
        } catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error",e.getMessage()));
        }
    }
}
