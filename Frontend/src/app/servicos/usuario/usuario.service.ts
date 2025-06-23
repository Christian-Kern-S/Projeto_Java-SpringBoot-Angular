import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { UsuarioModel } from "../../models/usuario.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private baseUrl = environment.apiUrl;

    constructor(private readonly http: HttpClient) { }
    
    findById(id: string): Observable<UsuarioModel> {
        return this.http.get<UsuarioModel>(this.baseUrl + `/user/${id}`);
    }
}