import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsuarioModel } from '../models/usuario.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../servicos/usuario/usuario.service';
import { AuthService } from '../auth/auth.service';
import { MessageService } from 'primeng/api';
import { FileUploadEvent } from 'primeng/fileupload';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit, OnDestroy {
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
  selectedFileName: string = '';
  uploadUrl: string = '';
  isPhotoModalOpen = false;
  pendingAvatarFile: File | null = null;
  previewUrl: string | null = null;
  isUploadingAvatar = false;
  private objectUrlToRevoke: string | null = null;


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

  ngOnDestroy(): void {
    this.destroyObjectUrl();
  }

  onUpload(event: FileUploadEvent) {
    // Ao concluir o upload via PrimeNG, recarrega a página para refletir a nova imagem
    this.showSuccess('Foto atualizada com sucesso. Recarregando...');
    setTimeout(() => window.location.reload(), 1200);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file || !this.usuario?.id_user) {
      this.showError('Selecione um arquivo válido.');
      return;
    }
    this.selectedFileName = file.name;
    this.uploadAvatarFile(file);
  }

  onAvatarUpload(event: any): void {
    const files: File[] = event.files as File[];
    if (!files || files.length === 0 || !this.usuario?.id_user) {
      this.showError('Selecione um arquivo válido.');
      return;
    }
    const file = files[0];
    this.uploadAvatarFile(file);
  }

  ngOnInit(): void {
    this.id_user = this.route.snapshot.paramMap.get('id');
    if (this.id_user) {
      this.uploadUrl = environment.apiUrl + `/user/${this.id_user}/avatar`;
      this.loadUsuario(this.id_user)
    }
  }

  openPhotoModal(): void {
    this.resetPhotoModalState();
    this.isPhotoModalOpen = true;
  }

  closePhotoModal(): void {
    this.isPhotoModalOpen = false;
    this.resetPhotoModalState();
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    if (this.isUploadingAvatar) {
      return;
    }
    fileInput.click();
  }

  onModalFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }
    this.pendingAvatarFile = file;
    this.selectedFileName = file.name;
    this.applyPreviewFromFile(file);
  }

  confirmAvatarUpload(): void {
    if (!this.pendingAvatarFile) {
      this.showError('Selecione uma imagem para continuar.');
      return;
    }
    this.isUploadingAvatar = true;
    this.uploadAvatarFile(this.pendingAvatarFile, true);
  }

  clearPendingAvatar(fileInput?: HTMLInputElement): void {
    if (fileInput) {
      fileInput.value = '';
    }
    this.pendingAvatarFile = null;
    this.selectedFileName = '';
    this.resetPreviewToCurrentAvatar();
  }

  getUserInitial(): string {
    const source = this.usuario?.fullname || this.usuario?.username || '';
    return source.trim().charAt(0).toUpperCase();
  }

  loadUsuario(id: string): void {
    this.usuarioService.findById(id).subscribe({
      next: (res) => {
        // Normaliza avatarUrl para URL absoluta
        if (res && res.avatarUrl && !res.avatarUrl.startsWith('http')) {
          res.avatarUrl = environment.apiUrl + res.avatarUrl;
        }
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

  deleteAvatar(): void {
    if (!this.usuario?.id_user) {
      this.showError('Usuário não encontrado.');
      return;
    }
    this.usuarioService.deleteAvatar(this.usuario.id_user).subscribe({
      next: () => {
        if (this.usuario) {
          this.usuario.avatarUrl = undefined;
        }
        // Update localStorage
        const stored = localStorage.getItem('userData');
        if (stored) {
          const parsed = JSON.parse(stored) as UsuarioModel;
          parsed.avatarUrl = undefined;
          localStorage.setItem('userData', JSON.stringify(parsed));
        }
        if (this.isPhotoModalOpen) {
          this.closePhotoModal();
        }
        this.showSuccess('Foto excluída com sucesso.');
      },
      error: () => {
        this.showError('Erro ao excluir a foto.');
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

  private uploadAvatarFile(file: File, closeModalAfterUpload: boolean = false): void {
    if (!this.usuario?.id_user) {
      this.showError('Usuário não encontrado.');
      this.isUploadingAvatar = false;
      return;
    }
    this.usuarioService.uploadAvatar(this.usuario.id_user, file).subscribe({
      next: (urlText: any) => {
        let newUrl = typeof urlText === 'string' ? urlText : (urlText?.toString?.() ?? '');
        if (newUrl && !newUrl.startsWith('http')) {
          newUrl = environment.apiUrl + newUrl;
        }
        const bust = newUrl.includes('?') ? `${newUrl}&t=${Date.now()}` : `${newUrl}?t=${Date.now()}`;
        if (this.usuario) {
          this.usuario.avatarUrl = bust;
        }
        const stored = localStorage.getItem('userData');
        if (stored) {
          const parsed = JSON.parse(stored) as UsuarioModel;
          parsed.avatarUrl = bust;
          localStorage.setItem('userData', JSON.stringify(parsed));
        }
        this.showSuccess('Foto atualizada com sucesso.');
        this.isUploadingAvatar = false;
        if (closeModalAfterUpload || this.isPhotoModalOpen) {
          this.closePhotoModal();
        }
      },
      error: () => {
        this.showError('Erro ao atualizar a foto.');
        this.isUploadingAvatar = false;
      }
    });
  }

  private resetPhotoModalState(): void {
    this.isUploadingAvatar = false;
    this.pendingAvatarFile = null;
    this.selectedFileName = '';
    this.resetPreviewToCurrentAvatar();
  }

  private resetPreviewToCurrentAvatar(): void {
    this.destroyObjectUrl();
    this.previewUrl = this.usuario?.avatarUrl ?? null;
  }

  private applyPreviewFromFile(file: File): void {
    this.destroyObjectUrl();
    this.objectUrlToRevoke = URL.createObjectURL(file);
    this.previewUrl = this.objectUrlToRevoke;
  }

  private destroyObjectUrl(): void {
    if (this.objectUrlToRevoke) {
      URL.revokeObjectURL(this.objectUrlToRevoke);
      this.objectUrlToRevoke = null;
    }
  }
}
