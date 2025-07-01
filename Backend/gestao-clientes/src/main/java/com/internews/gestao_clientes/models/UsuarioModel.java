package com.internews.gestao_clientes.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.hateoas.RepresentationModel;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "USUARIO_MODEL")
public class UsuarioModel extends RepresentationModel<UsuarioModel> implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id_user;

    @Column(nullable = false, unique = true)
    private String username;
    private String fullname;

    @Column(nullable = false)
    private String password;

    private String role;
    private String email;
    private String cargo;
    private String ramal;
    private LocalDate dataCadastro;


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClienteModel> clientes;

    /*INICIO DOS GETTERS E SETTERS*/

    public UsuarioModel() { }

    public UsuarioModel(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @JsonProperty("id_user")
    public UUID getId() {
        return id_user;
    }

    public void setId(UUID id_user) {
        this.id_user = id_user;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getRamal() {
        return ramal;
    }

    public void setRamal(String ramal) {
        this.ramal = ramal;
    }

    public String getDataCadastro() {
        if (dataCadastro == null) {
            return "Não foi possível verificar a data de cadastro";
        }
        return dataCadastro.toString();
    }

    public void setDataCadastro(LocalDate dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public List<ClienteModel> getClientes() {
        return clientes;
    }

    public void setClientes(List<ClienteModel> clientes) {
        this.clientes = clientes;
    }
}
