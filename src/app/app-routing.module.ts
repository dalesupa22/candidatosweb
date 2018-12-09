import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/layout/home.component';
import { ResultsComponent } from './results/layout/results.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'results', component: ResultsComponent }
];

export const Routing = RouterModule.forRoot(routes);
