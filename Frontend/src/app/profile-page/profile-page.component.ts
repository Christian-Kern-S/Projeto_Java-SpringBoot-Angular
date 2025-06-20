import { Component } from '@angular/core';
import { UsuarioModel } from '../models/usuario.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  usuario: UsuarioModel | null = null
  id_user?: string | null
  errorMessage: string | null = null
  successMessage: string | null = null
  editMode: boolean = false
  formUsuario: FormGroup
  form: FormGroup
  private errorTimeout?: any;
  private successTimeout?: any;


  constructor(private readonly fb: FormBuilder, private readonly route: ActivatedRoute,) {
    this.form = this.fb.group({
      value: [''],
      type: ['1', [Validators.required]]
    })
    this.formUsuario = new FormGroup({
      nome: new FormControl<string | null>(null, { nonNullable: true }),
      email: new FormControl<string | null>(null, { nonNullable: true }),
      ramal: new FormControl<string | null>(null, { nonNullable: true }),
      dataCadastro: new FormControl<Date | null>(null, { nonNullable: true })
    })
  }

  ngOnInit(): void {
    this.id_user = this.route.snapshot.paramMap.get('id_user');
    if (this.id_user) {
      this.loadUsuario(this.id_user);
    }
  }

  loadUsuario(id: string): void {
  
  }

  backPage() {
    window.history.back();
  }

  private showError(message: string): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    this.errorMessage = message;
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = null;
      this.errorTimeout = undefined;
    }, 5000);
  }

  private showSuccess(message: string): void {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }

    this.successMessage = message;
    this.successTimeout = setTimeout(() => {
      this.successMessage = null;
      this.successTimeout = undefined;
    }, 5000);
  }
}
