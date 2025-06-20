import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../servicos/cliente/cliente.service';
import { ClienteModel } from '../models/cliente.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { DependenteModel } from '../models/dependente.model';

@Component({
  selector: 'app-cliente-page',
  templateUrl: './detalhe-cliente-page.component.html',
  styleUrls: ['./detalhe-cliente-page.component.css']
})
export class DetalheClientePageComponent implements OnInit {

  cliente: ClienteModel | null = null
  dependente: DependenteModel | null = null
  id?: string | null
  id2?: string | null
  exibirModal: boolean = false
  formCliente: FormGroup
  formDependente: FormGroup
  form: FormGroup
  hasNoData: boolean = false;
  loading: boolean = false;
  visible: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  dependentes: DependenteModel[] = []
  dependenteId: string | null = null
  private errorTimeout?: any;
  private successTimeout?: any;
  private loadingTimeout?: any;

  // NOVA PROPRIEDADE PARA MODO DE EDIÇÃO
  editMode: boolean = false;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly location: Location,
    private readonly fb: FormBuilder
  ) {
    this.form = this.fb.group({
      value: [''],
      type: ['1', [Validators.required]]
    })
    this.formCliente = new FormGroup({
      nome: new FormControl<string | null>(null, { nonNullable: true }),
      logradouro: new FormControl<string | null>(null),
      numero: new FormControl<string | null>(null),
      complemento: new FormControl<string | null>(null),
      bairro: new FormControl<string | null>(null),
      cidade: new FormControl<string | null>(null),
      uf: new FormControl<string | null>(null),
      cep: new FormControl<string | null>(null),
      cpf: new FormControl<string | null>(null, [Validators.required, Validators.minLength(11)]),
      email: new FormControl<string | null>(null, { nonNullable: true }),
      telefone: new FormControl<string | null>(null, { nonNullable: true }),
      rendaMensal: new FormControl<number | null>(null),
      dataCadastro: new FormControl<Date | null>(null, { nonNullable: true })
    })
    this.formDependente = new FormGroup({
      nome: new FormControl<string | null>(null, { nonNullable: true }),
      telefone: new FormControl<string | null>(null),
      parentesco: new FormControl<string | null>(null, { nonNullable: true })
    })
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadCliente(this.id)
    }
  }

  // NOVA FUNÇÃO PARA ALTERNAR MODO DE EDIÇÃO
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
    if (this.editMode && this.formCliente.valid) {
      this.onEdit();
      this.editMode = false;
    }
  }

  // NOVA FUNÇÃO PARA CANCELAR EDIÇÃO
  cancelEdit(): void {
    if (this.cliente) {
      this.formCliente.patchValue({
        nome: this.cliente.nome,
        logradouro: this.cliente.logradouro,
        numero: this.cliente.numero,
        complemento: this.cliente.complemento,
        bairro: this.cliente.bairro,
        cidade: this.cliente.cidade,
        uf: this.cliente.uf,
        cep: this.cliente.cep,
        cpf: this.cliente.cpf,
        email: this.cliente.email,
        telefone: this.cliente.telefone,
        rendaMensal: this.cliente.rendaMensal,
        dataCadastro: this.cliente.dataCadastro
      });
    }
    this.editMode = false;
    this.showSuccess('Alterações canceladas. Dados originais restaurados.');
  }

  loadCliente(id: string): void {
    this.clienteService.findById(id).subscribe({
      next: (res) => {
        this.cliente = res;
        this.formCliente.patchValue({
          nome: res.nome,
          logradouro: res.logradouro,
          numero: res.numero,
          complemento: res.complemento,
          bairro: res.bairro,
          cidade: res.cidade,
          uf: res.uf,
          cep: res.cep,
          cpf: res.cpf,
          email: res.email,
          telefone: res.telefone,
          rendaMensal: res.rendaMensal,
          dataCadastro: res.dataCadastro
        })
        this.loadDependentes();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onEdit(): void {
    // Atualiza o cliente no backend
    this.clienteService.update(this.cliente!.idCliente, this.formCliente.value).subscribe({
      next: () => {
        this.onSuccess();
        this.loadCliente(this.cliente!.idCliente) // Recarrega o cliente
      },
      error: () => {
        this.onError();
      }
    });
  }

  onDelete(): void {
    this.clienteService.delete(this.cliente!.idCliente).subscribe({
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

  private onSuccessDelete() {
    this.location.back()
    this.showSuccess('Cliente excluido com sucesso.');
  }

  private onError() {
    this.showError('Erro ao atualizar o cliente.');
  }

  private onErrorDelete() {
    this.showError('Erro ao excluir o cliente.');
  }

  // TRATATIVA COM O DEPENDENTE

  definirDependente(idDependente: string): void {
    this.dependenteId = idDependente;
  }

  onSendDependente(): void {
    this.clienteService.saveDependente(this.cliente!.idCliente, this.formDependente.value).subscribe({
      next: (result) => {
        this.onSuccessCreateDependente()
      },
      error: (error) => {
        this.onErrorCriarDependente()
      }
    });
  }

  loadDependentes(): void {
    this.dependentes = [];

    if (this.cliente) {
      this.clienteService.listarDependentes(
        this.cliente.idCliente,
        this.form.getRawValue()
      ).subscribe({
        next: (dependente: DependenteModel[]) => {
          this.showLoading()
          this.dependentes = dependente;
          this.hasNoData = (dependente.length === 0);
        },
        error: (err) => {
          console.error('Erro ao listar clientes:', err);
          this.hasNoData = true;
        }
      });
    }
  }

  onEditDependente() {
    if (this.dependenteId) {
      this.clienteService.updateDependete(this.cliente!.idCliente, this.dependenteId, this.formDependente.value).subscribe({
        next: () => {
          this.onSuccessAtualizarDependente()
        },
        error: () => {
          this.onErrorAtualizarDependente()
        }
      });
    } else {
      console.error("ID do dependente a ser excluído não encontrado.");
    }
  }

  onDeleteDependente(): void {
    if (this.dependenteId) {
      this.clienteService.deleteDependente(this.cliente!.idCliente, this.dependenteId).subscribe({
        next: (result) => {
          this.OnSuccessExcluirDependente();
        },
        error: (error) => {
          this.OnErrorExcluirDependente();
        }
      });
    } else {
      console.error("ID do dependente a ser excluído não encontrado.");
    }
  }

  backPage(): void {
    this.router.navigate(['/clientes']);
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

  private onSuccessCreateDependente() {
    this.loadDependentes()
    this.showSuccess('Dependente criado com sucesso.');
  }

  private onErrorCriarDependente() {
    this.showError('Erro ao criar o dependente.');
  }

  private onSuccessAtualizarDependente() {
    this.loadDependentes()
    this.showSuccess('Dependente atualizado com sucesso.');
  }

  private onErrorAtualizarDependente() {
    this.showError('Erro ao atualizar o dependente.');
  }

  private OnSuccessExcluirDependente() {
    this.loadDependentes()
    this.showSuccess('Dependente excluido com sucesso.')
  }

  private OnErrorExcluirDependente() {
    this.showError('Erro ao excluir o dependente.')
  }
}

