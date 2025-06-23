import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { UsuarioModel } from "../models/usuario.model";

interface LoginResponse {
    token: string
    id_user: string
    username: string
    fullname: string
    cargo: string
    email: string
    ramal: string
    dataCadastro: string
    role: string
}

interface SignInResponse{
    status: string;
}

@Injectable({
    providedIn: 'root'
})

export class AuthService{

    private readonly baseUrl = 'http://localhost:8080/api/auth'
    private currentUser: UsuarioModel | null = null

    constructor(private readonly http: HttpClient) {}

    login(username: string, password: string): Observable<LoginResponse> {
        const body = { username, password };
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, body, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }).pipe(
        tap(response => {
            // 1) salva o token
            localStorage.setItem('token', response.token);

            // 2) salva também os dados do usuário (id_user e username)
            const userData: UsuarioModel = {
            id_user: response.id_user,
            username: response.username,
            fullname: response.fullname,
            cargo: response.cargo,
            email: response.email,
            ramal: response.ramal,
            dataCadastro: response.dataCadastro,
            role: response.role
        };
            localStorage.setItem('userData', JSON.stringify(userData));

            // 3) armazena em memória
            this.currentUser = userData;
        })
        );
    }

    signIn(username: string, password: string): Observable<SignInResponse>{
        const body = {username, password};
        return this.http.post<SignInResponse>(`${this.baseUrl}/register`, body,{
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        })
    }

    public saveToken(token: string): void{
        localStorage.setItem('token',token)
    }

    isLoggedIn(): boolean{
        return !!localStorage.getItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        this.currentUser = null;
    }

    getCurrentUser(): Observable<UsuarioModel> {
        // 1) se já tiver em memória, devolve imediatamente
        if (this.currentUser) {
        return of(this.currentUser);
        }

        // 2) senão, tenta ler do localStorage
        const stored = localStorage.getItem('userData');
        if (stored) {
        this.currentUser = JSON.parse(stored) as UsuarioModel;
        return of(this.currentUser);
        }

        // 3) se não tiver nada, devolve erro
        return new Observable<UsuarioModel>(subscriber => {
        subscriber.error('Usuário não encontrado');
        });
    }
    changePassword(id_user: string, oldPassword: string, newPassword: string): Observable<any> {
        const body = { oldPassword, newPassword };
        return this.http.put(`${this.baseUrl}/api/auth/changepass/${id_user}`, body, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }
}