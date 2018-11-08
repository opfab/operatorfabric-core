import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ArchivesComponent} from './components/archives/archives.component';
import {LightCardsComponent} from './components/light-cards/light-cards.component';

const routes: Routes = [
  {path: 'feed', component:
    // CardComponent
    LightCardsComponent
  },
  {path: 'archives', component: ArchivesComponent},
  {path: '**', redirectTo: '/feed'}
  ];
// TODO manage visible path more gently
export const navigationRoutes: Routes = routes.slice(0, 2);

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
