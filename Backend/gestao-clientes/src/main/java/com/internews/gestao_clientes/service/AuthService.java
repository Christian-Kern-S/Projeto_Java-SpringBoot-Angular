package com.internews.gestao_clientes.service;

import com.internews.gestao_clientes.dtos.LoginDto;
import com.internews.gestao_clientes.models.UsuarioModel;
import com.internews.gestao_clientes.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioModel register(String username, String rawPassword, String role) {
        Optional<UsuarioModel> exists = usuarioRepository.findByUsername(username);
        if (exists.isPresent()) {
            throw new RuntimeException("Já existe um usuário com esse nome");
        }

        String encodedPassword = passwordEncoder.encode(rawPassword);

        UsuarioModel newUser = new UsuarioModel(username, encodedPassword, role);
        return usuarioRepository.save(newUser);
    }

    public boolean authenticate(LoginDto loginDto) {
        Optional<UsuarioModel> optional = usuarioRepository.findByUsername(loginDto.username());
        if (optional.isEmpty()) {
            return false;
        }

        UsuarioModel user = optional.get();

        return passwordEncoder.matches(loginDto.password(), user.getPassword());
    }

    public UsuarioModel loadByUsername(String username) {
        return usuarioRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}


