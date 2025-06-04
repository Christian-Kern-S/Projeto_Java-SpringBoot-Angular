package com.internews.gestao_clientes;

import com.internews.gestao_clientes.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SistemaDeGestaoDeClientesApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaDeGestaoDeClientesApplication.class, args);
	}

	public CommandLineRunner initUsers(AuthService authService) {
		return args -> {
			// Cria um usuário “admin” com senha “123456”, role ROLE_ADMIN
			try {
				authService.register("admin", "123456", "ROLE_ADMIN");
				System.out.println("Usuário 'admin' criado com sucesso (senha=123456)");
			} catch (Exception e) {
				System.out.println("Usuário 'admin' já existe.");
			}
		};
	}
}
