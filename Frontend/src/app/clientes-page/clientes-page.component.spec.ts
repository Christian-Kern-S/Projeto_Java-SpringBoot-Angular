import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesPageComponent } from './clientes-page.component';

describe('ClientesPageComponent', () => {
  let component: ClientesPageComponent;
  let fixture: ComponentFixture<ClientesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
