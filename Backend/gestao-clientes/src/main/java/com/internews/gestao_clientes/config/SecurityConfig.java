package com.internews.gestao_clientes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // 1) Definição única do bean PasswordEncoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2) SecurityFilterChain para Spring Security 6.1+
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 2.1) Habilita CORS via WebMvcConfigurer (WebConfig.addCorsMappings)
                .cors(Customizer.withDefaults())

                // 2.2) Desabilita CSRF para permitir chamadas REST do Angular sem token
                .csrf(csrf -> csrf.disable())

                // 2.3) Define as regras de autorização
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login"   ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/{id_user}/cliente"   ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/cliente/{id}/dependente"   ).permitAll()

                        .requestMatchers(HttpMethod.GET, "/users").permitAll()
                        .requestMatchers(HttpMethod.GET, "/user/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/user/{id_user}/clientes"   ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/cliente/{id}"   ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/cliente/{id}/dependentes"   ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/cliente/{id}/dependente/{id2}"   ).permitAll()

                        .requestMatchers(HttpMethod.PUT, "/cliente/{id}"   ).permitAll()
                        .requestMatchers(HttpMethod.PUT, "/cliente/{id}/dependente/{id2}"   ).permitAll()
                        .requestMatchers(HttpMethod.PUT, "/user/{id}").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/changepass/{id}").permitAll()

                        .requestMatchers(HttpMethod.DELETE, "cliente/{id}/dependente/{id2}"   ).permitAll()
                        .requestMatchers(HttpMethod.DELETE, "cliente/{id}"   ).permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/user/{id}").permitAll()

                        .requestMatchers("/h2-console/**"                    ).permitAll()
                        .anyRequest().authenticated()
                )

                // 2.4) Desabilita o formulário de login padrão do Spring
                .formLogin(form -> form.disable())

                // 2.5) Desabilita HTTP Basic (caso não queira usá-lo)
                .httpBasic(basic -> basic.disable())

                // 2.6) Permite que o H2 Console abra em um <iframe>
                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())
                )
        ;

        return http.build();
    }
}
