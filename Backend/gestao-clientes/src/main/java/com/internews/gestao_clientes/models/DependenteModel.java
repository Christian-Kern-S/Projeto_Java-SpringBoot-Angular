package com.internews.gestao_clientes.models;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.hateoas.RepresentationModel;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table ( name = "TB_DEPENDENTES")
public class DependenteModel extends RepresentationModel<ClienteModel> implements Serializable {
    private static final long serialVersionUID = 1L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCliente", referencedColumnName = "idCliente")
    @JsonIgnore
    private ClienteModel cliente;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idDependente;
    private String nome;
    private String telefone;
    private String parentesco;;

    /* INICIO DOS GETTERS E SETTERS */

    public ClienteModel getCliente() {
        return cliente;
    }
    public void setCliente(ClienteModel cliente) {
        this.cliente = cliente;
    }

    public UUID getidDependente() {
        return idDependente;
    }
    public void setidDependente(UUID id) {
        this.idDependente = id;
    }

    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }
    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getParentesco() {
        return parentesco;
    }
    public void setParentesco(String parentesco) {
        this.parentesco = parentesco;
    }
}
