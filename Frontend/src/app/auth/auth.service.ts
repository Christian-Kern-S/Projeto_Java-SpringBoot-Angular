import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

interface LoginResponse {
    token: string;
}

@Injectable({
    providedIn: 'root'
})

export class AuthService{

    private readonly baseUrl = 'http://localhost:8080/api/auth'

    constructor(private readonly http: HttpClient) {}

    login(username: string, password: string): Observable<LoginResponse>{
        const body = {username, password};
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, body,{
            headers: new HttpHeaders({ 'Content-Type': 'application/json'})
        });
    }

    public saveToken(token: string): void{
        localStorage.setItem('token',token)
    }

    isLoggedIn(): boolean{
        return !!localStorage.getItem('token');
    }

    logout(): void{
        localStorage.removeItem('token');
    }
}