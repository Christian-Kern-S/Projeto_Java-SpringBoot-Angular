import { Component, ViewChild } from '@angular/core';
import { ClienteService } from '../servicos/cliente/cliente.service';
import { ClienteModel } from '../models/cliente.model';
import { UsuarioModel } from '../models/usuario.model';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Modal } from 'bootstrap';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-clientes-page',
  templateUrl: './clientes-page.component.html',
  styleUrl: './clientes-page.component.css'
})
export class ClientesPageComponent {

  form: FormGroup
  clientes: ClienteModel[] = []
  formCliente: FormGroup;
  usuario: UsuarioModel | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  hasNoData: boolean = false;
  loading: boolean = false;
  visible: boolean = false;
  private errorTimeout?: any;
  private successTimeout?: any;
  private loadingTimeout?: any;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      value: [''],
      type: ['1', [Validators.required]],
    })
    this.loadClientes()
    this.formCliente = this.fb.group({
      nome: new FormControl<string | null>(null, [Validators.required, Validators.nullValidator]),
      logradouro: new FormControl<string | null>(null),
      numero: new FormControl<string | null>(null),
      complemento: new FormControl<string | null>(null),
      bairro: new FormControl<string | null>(null),
      cidade: new FormControl<string | null>(null),
      uf: new FormControl<string | null>(null, [Validators.required, minLengthIfOne(2)]),
      cep: new FormControl<string | null>(null, [Validators.required, minLengthCep(8)]),
      cpf: new FormControl<string | null>(null, [Validators.required, Validators.minLength(11)]),
      email: new FormControl<string | null>(null, { nonNullable: true }),
      telefone: new FormControl<string | null>(null, [Validators.required, Validators.nullValidator]),
      rendaMensal: new FormControl<number | null>(null),
      dataCadastro: new FormControl<Date | null>(null, { nonNullable: true })
    })
  }

  ngOnInit(): void {
    // Pega o usuário logado (agora o getCurrentUser() não vai falhar)
    this.authService.getCurrentUser().subscribe({
      next: (u: UsuarioModel) => {
        this.usuario = u;
        this.loadClientes();
      },
      error: (err) => {
        console.error('Não foi possível obter o usuário logado', err);
        // Opcional: redirecionar para login se não houver usuário
        this.router.navigate(['/login']);
      }
    });
  }

  ngAfterViewInit(): void {
    // Depois que o template já foi renderizado, capturamos todos os inputs de classe "input"
    const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll('.input');

    // Adiciona listener de focus/blur a cada um
    inputs.forEach(input => {
      input.addEventListener('focus', this.onFocus);
      input.addEventListener('blur', this.onBlur);
    });
  }

  /**
   * Chamado quando um <input class="input"> ganha foco.
   * Adiciona a classe "focus" ao elemento-pai-do-pai.
   */
  onFocus(event: Event): void {
    const target = event.target as HTMLInputElement;
    // Como no HTML original o input está dentro de duas divs,
    // fazemos parentNode duas vezes (input → <div class="div"> → <div class="input-div ...">).
    const parent = (target as HTMLElement).closest('.input-div') as HTMLElement;
    if (parent) {
      parent.classList.add('focus');
    }
  }

  /**
   * Chamado quando um <input class="input"> perde o foco.
   * Remove a classe "focus" se o campo estiver vazio.
   */
  onBlur(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.value) {
      const parent = (target as HTMLElement).closest('.input-div') as HTMLElement;
      parent?.classList.remove('focus');
    }
  }


  async loadClientes(): Promise<void> {
    if (!this.usuario) {
      this.hasNoData = true;
      return;
    }
    await this.showLoading()
    this.clienteService.listarClientes(
      this.usuario.id_user,
      this.form.getRawValue()
    ).subscribe({
      next: (clientes: ClienteModel[]) => {
        this.clientes = clientes;
        this.hasNoData = (clientes.length === 0);
      },
      error: (err) => {
        console.error('Erro ao listar clientes:', err);
        this.hasNoData = true;
      }
    });
  }

  verMais(cliente: any) {
    this.router.navigate([`/cliente/${cliente.idCliente}`])
  }

  onSubmit(): void {
    this.loadClientes()
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  obterDataAtual(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoje.getDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  @ViewChild('adicionarClienteModal') modal!: Modal;
  onSend(): void {
    if (!this.usuario) {
      return;
    }
    // Obter a data atual formatada
    const dataAtual = this.obterDataAtual();
    this.errorMessage = null;
    this.successMessage = null;

    // Definir o valor do campo dataCadastro no formulário
    this.formCliente.patchValue({
      dataCadastro: dataAtual
    });
    this.clienteService.save(
      this.usuario.id_user,
      this.formCliente.value
    ).subscribe({
      next: (result) => {
        this.showSuccess('Cliente salvo com sucesso.')
        this.formCliente.reset();
        this.loadClientes();

      },
      error: (error) => {
        this.formCliente.reset();
        this.showError('Erro ao salvar o cliente')
      }
    });
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

  private showLoading(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.loading = true;
    this.loadingTimeout = setTimeout(() => {
      this.loadingTimeout = undefined;
      this.loading = false;
    }, 700);
  }

  showDialog() {
    this.visible = true;
  }

  get cpfInvalid(): boolean {
    const control = this.formCliente.get('cpf')
    return !!(control?.invalid && control?.touched)
  }

  get nomeInvalid(): boolean {
    const control = this.formCliente.get('nome')
    return !!(control?.invalid && control?.touched)
  }
  get telefoneInvalid(): boolean {
    const control = this.formCliente.get('telefone')
    return !!(control?.invalid && control?.touched)
  }

  get ufInvalid(): boolean {
    const control = this.formCliente.get('uf')
    return !!(control?.errors?.['minLengthIfOne'] && control.touched)
  }

  get cepInvalid(): boolean {
    const control = this.formCliente.get('cep')
    return !!(control?.errors?.['minLengthCep'] && control.touched)
  }
}

export function minLengthIfOne(min: number): import("@angular/forms").ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as string | null
    if (v == null) return null
    return v.length === 1 ? { minLengthIfOne: { requiredLength: min, actualLength: v.length } } : null
  }
}

export function minLengthCep(min: number): import("@angular/forms").ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as string | null
    if (v == null) return null
    return v.length < min && v.length != 0 && v.length != null ? { minLengthCep: { requiredLength: min, actualLength: v.length } } : null
  }
}

