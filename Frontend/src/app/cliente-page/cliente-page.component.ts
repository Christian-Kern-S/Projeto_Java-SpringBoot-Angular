import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../servicos/cliente/cliente.service';
import { ClienteModel } from '../models/cliente.model';

@Component({
  selector: 'app-cliente-page',
  templateUrl: './cliente-page.component.html',
  styleUrl: './cliente-page.component.css'
})
export class ClientePageComponent {
  cliente: ClienteModel | null = null
  id?: string | null
  constructor (
    private readonly clienteService: ClienteService,
    private readonly route: ActivatedRoute
  ) {
    this.id = this.route.snapshot.paramMap.get('id')

    if (this.id) {
      this.loadCliente(this.id)
    }
  }


  loadCliente(id: string): void {
    this.clienteService.findById(id).subscribe({ /// nova
      next: (res) => { /// caso de sucesso
        this.cliente = res
      },
      error: (err) => { /// em caso de erro
        console.log(err)
      }
    })
    // this.clienteService.findById(id).subscribe((res) => { /// Nao usar
    //   this.cliente = res
    // }, (e) => {
    //   console.log(e)
    // })
  }

}
