import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { ClienteModel } from '../../models/cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = environment.apiUrl;
  constructor(private readonly http: HttpClient) { }

  listarClientes(filtros: { value: string, type: string }) : Observable<ClienteModel[]> {
    return this.http.get<ClienteModel[]>(this.baseUrl + '/clientes', { params: { ...filtros }})
  }

  findById(id: string): Observable<ClienteModel> {
    return this.http.get<ClienteModel>(this.baseUrl + `/cliente/${id}`)
  }

  save(record: ClienteModel){
    return this.http.post<ClienteModel>(this.baseUrl + '/cliente', record);
  }
}
