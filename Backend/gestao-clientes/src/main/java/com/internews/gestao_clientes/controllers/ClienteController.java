package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.ClienteRecordDto;
import com.internews.gestao_clientes.models.ClienteModel;
import com.internews.gestao_clientes.repositories.ClienteRepository;
import jakarta.validation.Valid;

import org.hibernate.query.Page;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class ClienteController {
    @Autowired
    ClienteRepository clienteRepository;

    @PostMapping("/cliente")
    public ResponseEntity<ClienteModel> salvarCliente(@RequestBody @Valid ClienteRecordDto clienteRecordDto )
    {
        var clienteModel = new ClienteModel();
        BeanUtils.copyProperties(clienteRecordDto, clienteModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteRepository.save(clienteModel));
    }

    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteModel>> listarTodosClientes(@RequestParam(value = "") String value) {
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
            clienteList = clienteRepository.findAll();
        }

        return ResponseEntity.ok(clienteList);
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<Object> listarClientePorId(@PathVariable(value="id") UUID id)
    {
        Optional<ClienteModel> cliente0 = clienteRepository.findById(id);
        if (cliente0.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(cliente0);
    }

    @PutMapping("/cliente/{id}")
    public ResponseEntity<Object> atualizarCliente(@PathVariable(value = "id") UUID id, @RequestBody @Valid ClienteRecordDto clienteRecordDto)
    {
        Optional<ClienteModel> cliente0 = clienteRepository.findById(id);
        if (cliente0.isEmpty())
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        var clienteModel = cliente0.get();
        BeanUtils.copyProperties(clienteRecordDto, clienteModel);
        return ResponseEntity.status(HttpStatus.OK).body(clienteRepository.save(clienteModel));
    }

    @DeleteMapping("/cliente/{id}")
    public ResponseEntity<Object> deletarCliente(@PathVariable(value = "id") UUID id)
    {
        Optional<ClienteModel> cliente0 = clienteRepository.findById(id);
        if (cliente0.isEmpty())
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        clienteRepository.delete(cliente0.get());
        return ResponseEntity.status(HttpStatus.OK).body("Produto deletado com sucesso");
    }
}
