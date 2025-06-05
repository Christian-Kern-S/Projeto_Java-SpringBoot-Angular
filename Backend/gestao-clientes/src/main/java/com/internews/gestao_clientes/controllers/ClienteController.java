package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.ClienteRecordDto;
import com.internews.gestao_clientes.models.ClienteModel;
import com.internews.gestao_clientes.models.UsuarioModel;
import com.internews.gestao_clientes.repositories.ClienteRepository;
import com.internews.gestao_clientes.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
public class ClienteController {
    @Autowired
    ClienteRepository clienteRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/user/{id_user}/cliente")
    public ResponseEntity<ClienteModel> salvarCliente(@PathVariable("id_user") UUID id_user, @RequestBody @Valid ClienteRecordDto clienteRecordDto) {
        Optional<UsuarioModel> usuarioOptional = usuarioRepository.findById(id_user);
        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        var clienteModel = new ClienteModel();
        BeanUtils.copyProperties(clienteRecordDto, clienteModel);
        clienteModel.setUser(usuarioOptional.get());

        return ResponseEntity.status(HttpStatus.CREATED).body(clienteRepository.save(clienteModel));
    }

    @GetMapping("/user/{id}/clientes")
    public ResponseEntity<List<ClienteModel>> listarTodosClientes(@PathVariable(value = "id") UUID id_user ,@RequestParam(value = "") String value) {
        List<ClienteModel> clienteList = null;

        // Verifica se o valor passado é um UUID válido
        if (!value.isEmpty()) {
            try {
                // Se for um UUID válido, busca pelo ID
                UUID idCliente = UUID.fromString(value);
                clienteList = clienteRepository.findByIdCliente(idCliente);
            } catch (IllegalArgumentException e) {
                // Se não for um UUID válido, busca pelo nome
                clienteList = clienteRepository.findByNomeContaining(value);
            }
        } else {
            Optional<UsuarioModel> usuarioOptional = usuarioRepository.findById(id_user);
            if (usuarioOptional.isPresent()) {
                clienteList = usuarioOptional.get().getClientes();
            }else{
                clienteList = Collections.emptyList();
            }
        }

        return ResponseEntity.ok(clienteList);
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<Object> listarClientePorId(@PathVariable(value = "id") UUID id) {
        Optional<ClienteModel> cliente0 = clienteRepository.findById(id);
        if (cliente0.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(cliente0);
    }

    @PutMapping("/cliente/{id}")
    public ResponseEntity<Object> atualizarCliente(@PathVariable(value = "id") UUID id,
                                                   @RequestBody @Valid ClienteRecordDto clienteRecordDto) {
        Optional<ClienteModel> cliente0 = clienteRepository.findById(id);
        if (cliente0.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        var clienteModel = cliente0.get();
        BeanUtils.copyProperties(clienteRecordDto, clienteModel);
        return ResponseEntity.status(HttpStatus.OK).body(clienteRepository.save(clienteModel));
    }

    @DeleteMapping("/cliente/{id}")
    public ResponseEntity<Object> deletarCliente(@PathVariable(value = "id") UUID id) {
        Optional<ClienteModel> cliente0 = clienteRepository.findById(id);
        if (cliente0.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        clienteRepository.delete(cliente0.get());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Cliente deletado com sucesso");
    }
}
