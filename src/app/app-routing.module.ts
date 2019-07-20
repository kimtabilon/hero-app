import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './register/register.module#RegisterPageModule' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'service', loadChildren: './service/service.module#ServicePageModule' },
  { path: 'option', loadChildren: './option/option.module#OptionPageModule' },
  { path: 'form', loadChildren: './form/form.module#FormPageModule' },
  { path: 'hero', loadChildren: './hero/hero.module#HeroPageModule' },
  { path: 'summary', loadChildren: './summary/summary.module#SummaryPageModule' },
  { path: 'job', loadChildren: './job/job.module#JobPageModule' },
  { path: 'inbox', loadChildren: './inbox/inbox.module#InboxPageModule' },
  { path: 'help', loadChildren: './help/help.module#HelpPageModule' },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' },
  { path: 'jobview', loadChildren: './jobview/jobview.module#JobviewPageModule' },
  { path: 'quotation', loadChildren: './quotation/quotation.module#QuotationPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
