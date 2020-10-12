import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { path } from 'd3';
import { D3ViewComponent } from './d3-view/d3-view.component'

const routes: Routes = [
  { path: 'demo', component: D3ViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
