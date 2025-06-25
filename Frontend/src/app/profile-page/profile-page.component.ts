import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from '../models/usuario.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../servicos/usuario/usuario.service';
import { AuthService } from '../auth/auth.service';
import { MessageService } from 'primeng/api';
import { FileUploadEvent } from 'primeng/fileupload';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  usuario: UsuarioModel | null = null;
  id_user?: string | null
  errorMessage: string | null = null
  successMessage: string | null = null
  editMode: boolean = false
  formUsuario: FormGroup
  form: FormGroup
  private errorTimeout?: any;
  private successTimeout?: any;


  constructor(private messageService: MessageService, private readonly fb: FormBuilder, private readonly route: ActivatedRoute, private readonly usuarioService: UsuarioService, private readonly authService: AuthService,
    private readonly router: Router) {
    this.form = this.fb.group({
      value: [''],
      type: ['1', [Validators.required]]
    })
    this.formUsuario = new FormGroup({
      username: new FormControl<string | null>(null, { nonNullable: true }),
      fullname: new FormControl<string | null>(null, { nonNullable: true }),
      cargo: new FormControl<string | null>(null, { nonNullable: true }),
      email: new FormControl<string | null>(null, { nonNullable: true }),
      ramal: new FormControl<string | null>(null, { nonNullable: true }),
      dataCadastro: new FormControl<Date | null>(null, { nonNullable: true })
    })
  }

  onUpload(event: FileUploadEvent) {
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
  }
  
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log(user);
        this.usuario = user;
        this.formUsuario.patchValue({
          username: user.username,
          fullname: user.fullname,
          cargo: user.cargo,
          email: user.email,
          ramal: user.ramal,
          dataCadastro: user.dataCadastro
        });
      },
      error: (err) => {
        this.showError('Usuário não encontrado');
      }
    });
  }


  backPage() {
    window.history.back();
  }

  private showError(message: string): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    this.errorMessage = message;
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = null;
      this.errorTimeout = undefined;
    }, 5000);
  }

  private showSuccess(message: string): void {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }

    this.successMessage = message;
    this.successTimeout = setTimeout(() => {
      this.successMessage = null;
      this.successTimeout = undefined;
    }, 5000);
  }
}
