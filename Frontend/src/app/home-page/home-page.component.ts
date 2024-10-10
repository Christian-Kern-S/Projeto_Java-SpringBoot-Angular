import { Component } from '@angular/core';
import { ClienteService } from '../servicos/cliente/cliente.service';
import { ClienteModel } from '../models/cliente.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { Modal } from 'bootstrap'; 

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  
  form: FormGroup
  clientes: ClienteModel[] = []
  formCliente: any;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private snackBar: MatSnackBar,
    private location: Location,
  ) {
    this.form = this.fb.group({
      value: [''],
      type: ['1', [Validators.required]]
    })
    this.loadClientes()
    this.formCliente = this.fb.group({
        nome:[null],
        logradouro:[null],
        numero:[null],
        complemento:[null],
        bairro:[null],
        cidade:[null],
        uf:[null],
        cep:[null],
        cpf:[null],
        email:[null],
        telefone:[null]
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

  onSend(): void {
    this.clienteService.save(this.formCliente.value)
      .subscribe({
        next: (result) => {
          this.onSuccess(),
          this.fecharModal();
        },
          error: (error) => {
          this.onError(); 
        }
      });
  }

  onCancel(): void{

  }

  private onSuccess(){
    this.snackBar.open('Cliente salvo com sucesso.', '',{ duration: 5000 })
  }
  
  private onError(){
    this.snackBar.open('Erro ao salvar o cliente.', '',{ duration: 5000 })
  }

  fecharModal() {
    const modalEl = document.getElementById('adicionarClienteModal');
    if (modalEl) {
      const modal = Modal.getOrCreateInstance(modalEl); // Use getOrCreateInstance
      modal.hide();
    }
  }
}
