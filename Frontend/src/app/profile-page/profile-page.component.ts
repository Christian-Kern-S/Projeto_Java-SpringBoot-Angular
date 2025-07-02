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
  formPass: FormGroup
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
      id_user: new FormControl<string | null>(null, { nonNullable: true }),
      username: new FormControl<string | null>(null, { nonNullable: true }),
      fullname: new FormControl<string | null>(null, { nonNullable: true }),
      cargo: new FormControl<string | null>(null, { nonNullable: true }),
      email: new FormControl<string | null>(null, { nonNullable: true }),
      ramal: new FormControl<string | null>(null, { nonNullable: true }),
      dataCadastro: new FormControl<Date | null>(null, { nonNullable: true })
    })
    this.formPass = new FormGroup({
      oldPassword: new FormControl<string | null>(null, { nonNullable: true }),
      newPassword: new FormControl<string | null>(null, { nonNullable: true }),
      repeatNewPassword: new FormControl<string | null>(null, { nonNullable: true })
    })
  }

  onUpload(event: FileUploadEvent) {
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
  }

  ngOnInit(): void {
    this.id_user = this.route.snapshot.paramMap.get('id');
    if (this.id_user) {
      this.loadUsuario(this.id_user)
    }
  }

  loadUsuario(id: string): void {
    this.usuarioService.findById(id).subscribe({
      next: (res) => {
        this.usuario = res;
        this.formUsuario.patchValue({
          id_user: res.id_user,
          username: res.username,
          fullname: res.fullname,
          cargo: res.cargo,
          email: res.email,
          ramal: res.ramal,
          dataCadastro: res.dataCadastro
        })
      },
      error: (err) => {
        this.showError('Usuário não encontrado');
      }
    });
  }

  isNull(): boolean {
    const oldPassword = this.formPass.get('oldPassword')?.value as string;
    const newPassword = this.formPass.get('newPassword')?.value as string;
    const repeatNewPassword = this.formPass.get('repeatNewPassword')?.value as string;
    if (!oldPassword && !newPassword && !repeatNewPassword) {
      return true;
    }
    return false;
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.showSuccess('Modo de edição ativado. Agora você pode editar os campos.');
    } else {
      this.showSuccess('Modo de edição desativado. Os campos estão protegidos.');
    }
  }

  // NOVA FUNÇÃO PARA SALVAR ALTERAÇÕES
  saveChanges(): void {
    if (this.editMode && this.formUsuario.valid) {
      this.onEdit();
      this.editMode = false;
    }
  }

  // NOVA FUNÇÃO PARA CANCELAR EDIÇÃO
  cancelEdit(): void {
    if (this.usuario) {
      this.formUsuario.patchValue({
        username: this.usuario.username,
        fullname: this.usuario.fullname,
        cargo: this.usuario.cargo,
        email: this.usuario.email,
        ramal: this.usuario.ramal,
        dataCadastro: this.usuario.dataCadastro
      });
    }
    this.editMode = false;
    this.showSuccess('Alterações canceladas. Dados originais restaurados.');
  }


  backPage() {
    window.history.back();
  }

  onEdit(): void {
    if (!this.usuario || !this.usuario.id_user) {
      this.showError('ID do usuário não encontrado.');
      return;
    }
    this.usuarioService.update(this.usuario.id_user, this.formUsuario.value).subscribe({
      next: () => {
        this.onSuccess();
        this.ngOnInit();
      },
      error: () => {
        this.onError();
      }
    });
  }

  changePass(): void {

    const oldPassword = this.formPass.get('oldPassword')?.value as string;
    const newPassword = this.formPass.get('newPassword')?.value as string;
    const repeatNewPassword = this.formPass.get('repeatNewPassword')?.value as string;

    if (newPassword != repeatNewPassword) {
      this.showError('As senhas não são iguais.');
      return;
    }

    if (!oldPassword || !newPassword || !repeatNewPassword) {
      this.showError('Todos os campos devem ser preenchidos');
      return;
    }

    if (/\s/.test(newPassword)) {
      this.showError('A senha nova não pode conter espaços em branco');
      return;
    }

    if (!this.usuario || !this.usuario.id_user) {
      this.showError('ID do usuário não encontrado.');
      return;
    }
    this.usuarioService.changePass(this.usuario.id_user, this.formPass.value).subscribe({
      next: () => {
        this.onSuccessPass()
      },
      error: () => {
        this.onErrorPass()
      }
    })
  }

  onDelete(): void {
    this.usuarioService.delete(this.usuario!.id_user).subscribe({
      next: (result) => {
        this.onSuccessDelete()
      },
      error: (error) => {
        this.onErrorDelete()
      }
    });
  }

  private onSuccess() {
    this.showSuccess('Cliente atualizado com sucesso.');
  }

  private async onSuccessPass() {
    this.showSuccess('Cliente atualizado com sucesso.');
    await new Promise(resolve => setTimeout(resolve, 3000));
    window.location.reload();
  }

  private async onSuccessDelete() {
    this.showSuccess('Cliente excluido com sucesso.');
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private onError() {
    this.showError('Erro ao atualizar o cliente.');
  }

  private onErrorPass() {
    this.showError('Erro ao atualizar a senha.');
  }

  private onErrorDelete() {
    this.showError('Erro ao excluir o cliente.');
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
