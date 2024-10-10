import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientePageComponent } from './cliente-page.component';

describe('ClientePageComponent', () => {
  let component: ClientePageComponent;
  let fixture: ComponentFixture<ClientePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
