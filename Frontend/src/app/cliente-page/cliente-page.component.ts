import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../servicos/cliente/cliente.service';
import { ClienteModel } from '../models/cliente.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { DependenteModel } from '../models/dependente.model';

@Component({
    selector: 'app-cliente-page',
    templateUrl: './cliente-page.component.html',
    styleUrls: ['./cliente-page.component.css'],
    standalone: false
})
export class ClientePageComponent implements OnInit {

  cliente: ClienteModel | null = null
  dependente: DependenteModel | null = null
  id?: string | null
  id2?: string | null
  exibirModal: boolean = false
  formCliente: FormGroup
  formDependente: FormGroup
  form: FormGroup
  dependentes: DependenteModel[] = []
  dependenteId: string | null = null
  
  constructor(
    private readonly clienteService: ClienteService,
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
      nome: new FormControl<string | null>(null, {nonNullable: true}),
      logradouro: new FormControl<string | null>(null),
      numero: new FormControl<string | null>(null),
      complemento: new FormControl<string | null>(null),
      bairro: new FormControl<string | null>(null),
      cidade: new FormControl<string | null>(null),
      uf: new FormControl<string | null>(null),
      cep: new FormControl<string | null>(null),
      cpf: new FormControl<string | null>(null, [Validators.required, Validators.minLength(11)]),
      email: new FormControl<string | null>(null, {nonNullable: true}),
      telefone: new FormControl<string | null>(null, {nonNullable: true}),
      rendaMensal: new FormControl<number | null>(null),
      dataCadastro: new FormControl<Date | null>(null, { nonNullable: true })
    })
    this.formDependente = new FormGroup({
      nome: new FormControl<string | null>(null, {nonNullable: true}),
      telefone: new FormControl<string | null>(null),
      parentesco: new FormControl<string | null>(null, {nonNullable: true})
    })
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadCliente(this.id)
    }
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
    this.clienteService.update(this.cliente!.idCliente,this.formCliente.value).subscribe({
      next: () => {
        this.onSuccess();
        this.loadCliente(this.cliente!.idCliente) // Recarrega o cliente
      },
      error: () => {
        this.onError();
      }
    });
  }

  onDelete(): void{
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
    this.snackBar.open('Cliente atualizado com sucesso.', '', { duration: 5000 });
  }

  private onSuccessDelete() {
    this.location.back()
    this.snackBar.open('Cliente excluido com sucesso.', '', { duration: 5000 });
  }

  private onError() {
    this.snackBar.open('Erro ao atualizar o cliente.', '', { duration: 5000 });
  }

  private onErrorDelete() {
    this.snackBar.open('Erro ao excluir o cliente.', '', { duration: 5000 });
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
      ).subscribe(dependentes => {
        this.dependentes = dependentes;
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

  private onSuccessCreateDependente() {
    this.loadDependentes()
    this.snackBar.open('Dependente criado com sucesso.', '', { duration: 5000 });
  }
  
  private onErrorCriarDependente() {
    this.snackBar.open('Erro ao criar o dependente.', '', { duration: 5000 });
  }

  private onSuccessAtualizarDependente() {
    this.loadDependentes()
    this.snackBar.open('Dependente atualizado com sucesso.', '', { duration: 5000 });
  }
  
  private onErrorAtualizarDependente() {
    this.snackBar.open('Erro ao atualizar o dependente.', '', { duration: 5000 });
  }
  
  private OnSuccessExcluirDependente(){
    this.loadDependentes()
    this.snackBar.open('Dependente excluido com sucesso.', '', {duration: 5000})
  }
  
  private OnErrorExcluirDependente(){
    this.snackBar.open('Erro ao excluir o dependente.', '', {duration: 5000})
  }
}