import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { PasswordModel, UsuarioModel } from "../../models/usuario.model";
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

    update(id: string, usuario: UsuarioModel): Observable<any> {
        const url = this.baseUrl + `/user/${id}`;
        return this.http.put(url, usuario);
    }

    delete(id: string) {
        const url = this.baseUrl + `/user/${id}`;
        return this.http.delete(url);
    }

    changePass(id: string, pass: PasswordModel): Observable<any>{
        const url = this.baseUrl + `/api/auth/changepass/${id}`
        return this.http.put(url, pass)
    }

    uploadAvatar(id: string, file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);
        const url = this.baseUrl + `/user/${id}/avatar`;
        return this.http.post(url, formData, { responseType: 'text' });
    }

    deleteAvatar(id: string): Observable<string> {
        const url = this.baseUrl + `/user/${id}/avatar`;
        return this.http.delete(url, { responseType: 'text' });
    }
}