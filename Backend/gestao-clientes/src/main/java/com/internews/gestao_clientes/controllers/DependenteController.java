package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.DependenteRecordDto;
import com.internews.gestao_clientes.models.ClienteModel;
import com.internews.gestao_clientes.models.DependenteModel;
import com.internews.gestao_clientes.repositories.ClienteRepository;
import com.internews.gestao_clientes.repositories.DependenteRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class DependenteController {
    @Autowired
    DependenteRepository dependenteRepository;
    @Autowired
    private ClienteRepository clienteRepository;

    @PostMapping("/cliente/{id}/dependente")
    public ResponseEntity<DependenteModel> salvarDependente(@PathVariable("id") UUID clienteId, @Valid @RequestBody DependenteRecordDto dependenteRecordDto) {

        Optional<ClienteModel> clienteOptional = clienteRepository.findById(clienteId);
        if (clienteOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        // Associe o dependente ao cliente
        var dependenteModel = new DependenteModel();
        BeanUtils.copyProperties(dependenteRecordDto, dependenteModel);
        dependenteModel.setCliente(clienteOptional.get());

        return ResponseEntity.status(HttpStatus.CREATED).body(dependenteRepository.save(dependenteModel));
    }

    @GetMapping("/cliente/{id}/dependentes")
    public ResponseEntity<List<DependenteModel>> listarTodosDependentes(@PathVariable(value = "id") UUID idCliente, @RequestParam(value = "") String value) {
        List<DependenteModel> dependenteList;

        if (!value.isEmpty()) {
            try {
                UUID idDependente = UUID.fromString(value);
                dependenteList = dependenteRepository.findByIdDependente(idDependente);
            } catch (IllegalArgumentException e) {
                dependenteList = dependenteRepository.findByNomeContaining(value);
            }
        } else {
            Optional<ClienteModel> clienteOptional = clienteRepository.findById(idCliente);
            if (clienteOptional.isPresent()) {
                dependenteList = clienteOptional.get().getDependentes();
            } else {
                dependenteList = Collections.emptyList();
            }

        }

        return ResponseEntity.status(HttpStatus.OK).body(dependenteList);
    }

    @GetMapping("/cliente/{id}/dependente/{id2}")
    public ResponseEntity<Object> listarDependentePorId(@PathVariable(value = "id2") UUID id2) {
        Optional<DependenteModel> dependente0 = dependenteRepository.findById(id2);
        if (dependente0.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dependente não encotrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(dependente0);
    }

    @PutMapping("/cliente/{id}/dependente/{id2}")
    public ResponseEntity<Object> atualizarDependente(@PathVariable(value = "id2") UUID id2,
                                                      @RequestBody @Valid DependenteRecordDto dependenteRecordDto) {
        Optional<DependenteModel> dependente0 = dependenteRepository.findById(id2);
        if (dependente0.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dependente não encontrado");
        }
        var dependenteModel = dependente0.get();
        BeanUtils.copyProperties(dependenteRecordDto, dependenteModel);
        return ResponseEntity.status(HttpStatus.OK).body(dependenteRepository.save(dependenteModel));
    }

    @DeleteMapping("/cliente/{id}/dependente/{id2}")
    public ResponseEntity<Object> deletarDependente(@PathVariable(value = "id2") UUID id2){
        Optional<DependenteModel> dependente0 = dependenteRepository.findById(id2);
        if (dependente0.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dependente não encontrado");
        }
        dependenteRepository.delete(dependente0.get());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Cliente deletado com sucesso");
    }
}
