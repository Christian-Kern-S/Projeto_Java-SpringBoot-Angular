package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.ClienteRecordDto;
import com.internews.gestao_clientes.models.ClienteModel;
import com.internews.gestao_clientes.repositories.ClienteRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
public class ClienteController {
    @Autowired
    ClienteRepository clienteRepository;

    @PostMapping("/clientes")
    public ResponseEntity<ClienteModel> salvarCliente(@RequestBody @Valid ClienteRecordDto clienteRecordDto )
    {
        var clienteModel = new ClienteModel();
        BeanUtils.copyProperties(clienteRecordDto, clienteModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteRepository.save(clienteModel));
    }

    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteModel>> listarTodosClientes()
    {
        List<ClienteModel> clienteList = clienteRepository.findAll();
        if(!clienteList.isEmpty())
        {
            for(ClienteModel cliente : clienteList)
            {
                String cpf = cliente.getCpf();
                cliente.add(linkTo(methodOn(ClienteController.class).listarClienteCpf(cpf)).withSelfRel());
            }
        }
        return ResponseEntity.status(HttpStatus.OK).body(clienteList);
    }

    @GetMapping("/clientes/{cpf}")
    public ResponseEntity<Object> listarClienteCpf(@PathVariable(value="cpf") String cpf)
    {
        Optional<ClienteModel> cliente0 = clienteRepository.findByCpf(cpf);
        if (cliente0.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        cliente0.get().add(linkTo(methodOn(ClienteController.class).listarTodosClientes()).withSelfRel());
        return ResponseEntity.status(HttpStatus.OK).body(cliente0.get());
    }

    @PutMapping("/clientes/{cpf}")
    public ResponseEntity<Object> atualizarCliente(@PathVariable(value = "cpf") String cpf, @RequestBody @Valid ClienteRecordDto clienteRecordDto)
    {
        Optional<ClienteModel> cliente0 = clienteRepository.findByCpf(cpf);
        if (cliente0.isEmpty())
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        var clienteModel = cliente0.get();
        BeanUtils.copyProperties(clienteRecordDto, clienteModel);
        return ResponseEntity.status(HttpStatus.OK).body(clienteRepository.save(clienteModel));
    }

    @DeleteMapping("/clientes/{cpf}")
    public ResponseEntity<Object> deletarCliente(@PathVariable(value = "cpf") String cpf)
    {
        Optional<ClienteModel> cliente0 = clienteRepository.findByCpf(cpf);
        if (cliente0.isEmpty())
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        clienteRepository.delete(cliente0.get());
        return ResponseEntity.status(HttpStatus.OK).body("Produto deletado com sucesso");
    }
}
