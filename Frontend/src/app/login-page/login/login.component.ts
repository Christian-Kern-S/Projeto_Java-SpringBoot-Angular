import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  
}

const container = document.getElementById('container');
const registerBtn = document.getElementById('registro');
const loginBtn = document.getElementById('login');


registerBtn.addEventListener('click', () => {container.classList.add("active");})

loginBtn.addEventListener('click', () => {container.classList.remove("active");})