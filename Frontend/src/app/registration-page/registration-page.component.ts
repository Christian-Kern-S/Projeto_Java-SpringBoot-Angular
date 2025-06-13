import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.css'
})

export class RegistrationPageComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  errorMessage: string | null = null;
  isMobile = window.innerWidth <= 1000;
  private timeoutHandle?: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    // Inicializa o FormGroup com dois controles (por exemplo "usuario" e "senha")
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      senha:   ['', Validators.required],
      senha_confirm: ['', Validators.required]
    });
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 1000;
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
  onLogin(): void{
    this.router.navigate(['/loging']);
  }

  onSubmit(): void {

    const usuario = this.form.get('usuario')?.value as string;
    const senha = this.form.get('senha')?.value as string;
    const senhaConfirm = this.form.get('senha_confirm')?.value as string;

    if (senha != senhaConfirm) {
      this.showError('As senhas não são iguais.');
      return;
    }

    if (!usuario || !senha || !senhaConfirm) {
      this.showError('Todos os campos devem ser preenchidos');
      return;
    }

    if (/\s/.test(senha)) {
    this.showError('A senha não pode conter espaços em branco');
    return;
    }

    if (/\s/.test(usuario)) {
    this.showError('O usuário não pode conter espaços em branco');
    return;
    }
      
    const username = this.form.get('usuario')?.value?.toLowerCase()
    const password = this.form.get('senha')?.value

    this.authService.signIn(username, password).subscribe({
      next: () => {
        this.errorMessage = null;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if(err.status === 400){
          this.showError('Já existe um usuário com esse nome');
        } else {
          this.showError('Erro no servidor. Tente novamente');
        }
        console.error(err);
      }
    });
  }

  private showError(message: string): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }

    this.errorMessage = message;
    this.timeoutHandle = setTimeout(() => {
      this.errorMessage = null;
      this.timeoutHandle = undefined;
    }, 5000);
  }
}
