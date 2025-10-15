package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.UsuarioRecordDto;
import com.internews.gestao_clientes.models.UsuarioModel;
import com.internews.gestao_clientes.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import net.coobird.thumbnailator.Thumbnails;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;

@RestController
public class UsuarioContoller {
    @Autowired
    UsuarioRepository usuarioRepository;

    @GetMapping("/users")
    public ResponseEntity<?> listarUsuarios(@RequestParam(value = "value", required = false, defaultValue = "") String value) {
        // Se não veio nenhum parâmetro (value == ""), retorna todos
        if (value.isEmpty()) {
            List<UsuarioModel> todos = usuarioRepository.findAll();
            return ResponseEntity.ok(todos);
        }

        Optional<UsuarioModel> resultado;
        try {
            UUID idUser = UUID.fromString(value);
            resultado = usuarioRepository.findById(idUser);
        } catch (IllegalArgumentException e) {
            // Se não for UUID válido, busca por username
            resultado = usuarioRepository.findByUsername(value);
        }

        if (resultado.isPresent()) {
            return ResponseEntity.ok(resultado.get());
        } else {
            // Se não encontrou nada, devolve 404 Not Found
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> listarUsuarioId(@PathVariable(value = "id") UUID id) {
        Optional<UsuarioModel> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(usuario.get());
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> atualizarUsuario(@PathVariable(value = "id") UUID id, @RequestBody @Valid UsuarioRecordDto usuarioRecordDto) {
        Optional<UsuarioModel> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        }
        var usuarioModel = usuario.get();
        // Preserve avatarUrl if not provided in DTO to avoid accidental clearing
        String currentAvatar = usuarioModel.getAvatarUrl();
        BeanUtils.copyProperties(usuarioRecordDto, usuarioModel);
        if (usuarioRecordDto.avatarUrl() == null || usuarioRecordDto.avatarUrl().isBlank()) {
            usuarioModel.setAvatarUrl(currentAvatar);
        }
        return ResponseEntity.status(HttpStatus.OK).body(usuarioRepository.save(usuarioModel));
    }

    @PostMapping(value = "/user/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(@PathVariable("id") UUID id,
                                          @RequestParam("file") MultipartFile file) {
        Optional<UsuarioModel> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        }
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Arquivo não enviado");
        }

        try {
            // valida tipo
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("image/png") || contentType.equals("image/jpeg") || contentType.equals("image/jpg"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tipo de imagem inválido. Use PNG ou JPG");
            }

            // Ensure upload directory exists
            Path uploadDir = Paths.get("uploads", "avatars");
            Files.createDirectories(uploadDir);

            String original = file.getOriginalFilename();
            if (original == null) original = "avatar";
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) {
                ext = original.substring(dot);
            }
            String filename = id + (ext.isBlank() ? ".png" : ext.toLowerCase());
            Path target = uploadDir.resolve(filename);

            // Delete old avatar file if exists
            UsuarioModel usuarioModel = usuarioOpt.get();
            String oldAvatarUrl = usuarioModel.getAvatarUrl();
            if (oldAvatarUrl != null && !oldAvatarUrl.isBlank()) {
                try {
                    Path oldFilePath = Paths.get("uploads", "avatars", oldAvatarUrl.substring(oldAvatarUrl.lastIndexOf('/') + 1));
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    // Log error but continue
                }
            }

            // Processa imagem: converte para quadrada, máximo 512x512, compressão leve
            BufferedImage inputImg = ImageIO.read(file.getInputStream());
            if (inputImg == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Não foi possível ler a imagem");
            }
            int w = inputImg.getWidth();
            int h = inputImg.getHeight();
            int size = Math.min(w, h);
            int x = (w - size) / 2;
            int y = (h - size) / 2;
            BufferedImage cropped = inputImg.getSubimage(x, y, size, size);

            // redimensiona para no máximo 512x512
            Thumbnails.of(cropped)
                    .size(512, 512)
                    .outputQuality(0.9)
                    .toFile(target.toFile());

            String publicUrl = "/uploads/avatars/" + filename;

            usuarioModel.setAvatarUrl(publicUrl);
            usuarioRepository.save(usuarioModel);

            return ResponseEntity.ok(publicUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao salvar arquivo");
        }
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deletarUsuario(@PathVariable(value = "id") UUID id) {
        Optional<UsuarioModel> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        }

        usuarioRepository.delete(usuario.get());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Cliente deletado com sucesso");
    }

    @DeleteMapping("/user/{id}/avatar")
    public ResponseEntity<?> deleteAvatar(@PathVariable("id") UUID id) {
        Optional<UsuarioModel> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
        }

        UsuarioModel usuarioModel = usuarioOpt.get();
        String avatarUrl = usuarioModel.getAvatarUrl();
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            try {
                Path filePath = Paths.get("uploads", "avatars", avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1));
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log error but continue
            }
            usuarioModel.setAvatarUrl(null);
            usuarioRepository.save(usuarioModel);
        }

        return ResponseEntity.ok("Avatar deletado com sucesso");
    }
}
