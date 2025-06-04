// login-page.component.ts

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'] // <- CORRIGIDO: era "styleUrl" e deve ser "styleUrls"
})
export class LoginPageComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    // Inicializa o FormGroup com dois controles (por exemplo "usuario" e "senha")
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      senha:   ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  ngAfterViewInit(): void {
    // Depois que o template já foi renderizado, capturamos todos os inputs de classe "input"
    const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll('.input');

    // Adiciona listener de focus/blur a cada um
    inputs.forEach(input => {
      input.addEventListener('focus', this.onFocus);
      input.addEventListener('blur', this.onBlur);
    });
  }

  /**
   * Chamado quando um <input class="input"> ganha foco.
   * Adiciona a classe "focus" ao elemento-pai-do-pai.
   */
  onFocus(event: Event): void {
    const target = event.target as HTMLInputElement;
    // Como no HTML original o input está dentro de duas divs,
    // fazemos parentNode duas vezes (input → <div class="div"> → <div class="input-div ...">).
    const parent = (target.parentNode as HTMLElement).parentNode as HTMLElement;
    parent.classList.add('focus');
  }

  /**
   * Chamado quando um <input class="input"> perde o foco.
   * Remove a classe "focus" se o campo estiver vazio.
   */
  onBlur(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.value) {
      const parent = (target.parentNode as HTMLElement).parentNode as HTMLElement;
      parent.classList.remove('focus');
    }
  }

  /**
   * Método a ser chamado quando o usuário submeter o formulário de login.
   * Por enquanto só redireciona para outra rota como exemplo,
   * mas aqui você colocaria a chamada à API, validação, etc.
   */
  onSubmit(): void {
    // if (this.form.invalid) {
    //   this.errorMessage = 'Preencha usuário e senha.';
    //   return;
    // }
    
    const username = this.form.get('usuario')?.value;
    const password = this.form.get('senha')?.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.errorMessage = null;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        if (err.status === 401){
          this.errorMessage = 'Credenciais inválidas.'
        } else {
          this.errorMessage = 'Erro no servidor. Tente novamente';
        }
        console.error(err);
      }
    });
  }
}
