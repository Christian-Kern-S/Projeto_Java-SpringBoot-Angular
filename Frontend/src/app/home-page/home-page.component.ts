import { Component, ViewChild } from '@angular/core';
import { ClienteService } from '../servicos/cliente/cliente.service';
import { ClienteModel } from '../models/cliente.model';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

  form: FormGroup
  clientes: ClienteModel[] = []
  formCliente: FormGroup;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      value: [''],
      type: ['1', [Validators.required]]
    })
    this.loadClientes()
    this.formCliente = this.fb.group({
      nome: new FormControl<string | null>(null, {nonNullable: true}),
      logradouro: new FormControl<string | null>(null),
      numero: new FormControl<string | null>(null),
      complemento: new FormControl<string | null>(null),
      bairro: new FormControl<string | null>(null),
      cidade: new FormControl<string | null>(null),
      uf: new FormControl<string | null>(null),
      cep: new FormControl<string | null>(null),
      cpf: new FormControl<string | null>(null, {nonNullable: true}),
      email: new FormControl<string | null>(null, {nonNullable: true}),
      telefone: new FormControl<string | null>(null, {nonNullable: true}),
      rendaMensal: new FormControl<number | null>(null),
      dataCadastro: new FormControl<Date | null>(null, { nonNullable: true })
    })
  }

  loadClientes(): void {
    this.clienteService.listarClientes(
      this.form.getRawValue()
    ).subscribe(clientes => {
      this.clientes = clientes
    });
  }

  verMais(cliente: any) {
    this.router.navigate([`/cliente/${cliente.idCliente}`])
  }

  onSubmit(): void {
    this.loadClientes()
  }

  obterDataAtual(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0'); // Mês começa em 0
    const dia = hoje.getDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  } 

  @ViewChild('adicionarClienteModal') modal!: Modal;
  onSend(): void {
      // Obter a data atual formatada
    const dataAtual = this.obterDataAtual();

    // Definir o valor do campo dataCadastro no formulário
    this.formCliente.patchValue({
      dataCadastro: dataAtual
    });
    this.clienteService.save(this.formCliente.value).subscribe({
      next: (result) => {
        this.onSuccess()
      },
      error: (error) => {
        this.onError()
      }
    });
  }

  private onSuccess() {
    this.snackBar.open('Cliente salvo com sucesso.', '', { duration: 5000 })
    this.loadClientes()
    this.modal.hide()
  }

  private onError() {
    this.snackBar.open('Erro ao salvar o cliente.', '', { duration: 5000 })
  }
}
