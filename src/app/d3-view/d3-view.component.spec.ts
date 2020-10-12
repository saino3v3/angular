import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ViewComponent } from './d3-view.component';

describe('D3ViewComponent', () => {
  let component: D3ViewComponent;
  let fixture: ComponentFixture<D3ViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3ViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3ViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
