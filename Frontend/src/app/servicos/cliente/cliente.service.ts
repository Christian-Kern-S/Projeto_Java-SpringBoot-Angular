import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteModel } from '../../models/cliente.model';
import { environment } from '../../../environments/environment';
import { DependenteModel } from '../../models/dependente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = environment.apiUrl;
  constructor(private readonly http: HttpClient) { }

  listarClientes(id:any, filtros: { value: string, type: string }) : Observable<ClienteModel[]> {
    return this.http.get<ClienteModel[]>(this.baseUrl + `/user/${id}/clientes`, { params: { ...filtros }})
  }


  findById(id: string): Observable<ClienteModel> {
    return this.http.get<ClienteModel>(this.baseUrl + `/cliente/${id}`)
  }


  save(id_user:any, record: ClienteModel){
    return this.http.post<ClienteModel>(this.baseUrl + `/user/${id_user}/cliente`, record);
  }

  update(id: string, cliente: ClienteModel): Observable<any> {
    const url = this.baseUrl + `/cliente/${id}`;
    return this.http.put(url, cliente);
  }

  delete(id: string){
    const url = this.baseUrl + `/cliente/${id}`;
    return this.http.delete(url);
  }

  // TRATATIVA COM O DEPENDENTE

  findDependenteById(id: string, id2: string): Observable<DependenteModel> {
    return this.http.get<DependenteModel>(this.baseUrl + `/cliente/${id}/depedente/${id2}`)
  }

  listarDependentes(id: any, filtros: {value: string, type: string}) : Observable<DependenteModel[]> {
    const url = this.baseUrl + `/cliente/${id}/dependentes`;
    return this.http.get<DependenteModel[]>(url, { params: { ...filtros }})
  }

  saveDependente(id: string, record: DependenteModel ){
    return this.http.post<DependenteModel>(this.baseUrl + `/cliente/${id}/dependente`, record);
  }

  updateDependete(id: string, id2: any, depedente?: DependenteModel): Observable<any> {
    const idDepen = id2.idDependente;
    const url = this.baseUrl + `/cliente/${id}/dependente/${idDepen}`;
    return this.http.put(url, depedente);
  }

  deleteDependente(id: string, dependente: any) {
    const id2 = dependente.idDependente; 
    const url = this.baseUrl + `/cliente/${id}/dependente/${id2}`;
    return this.http.delete(url);
  }
}
