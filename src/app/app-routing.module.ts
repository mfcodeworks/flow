import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, ExtraOptions } from '@angular/router';
import { SignedOutGuard } from './shared/guards/signed-out.guard';
import { SignedInGuard } from './shared/guards/signed-in.guard';

// const routes: Routes = [
//     {
//         path: '',
//         redirectTo: 'folder/Inbox',
//         pathMatch: 'full'
//     },
//     {
//         path: 'folder/:id',
//         loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
//     }
// ];
const routes: Routes = [
    {
        path: '',
        // canActivate: [SignedInGuard],
        loadChildren: () => import('./main/main.module').then(m => m.MainModule)
    },
    {
        path: '',
        canActivate: [SignedOutGuard],
        loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
    }
];

const options: ExtraOptions = {
    useHash: false,
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    preloadingStrategy: PreloadAllModules
};

@NgModule({
    imports: [
        // RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
        RouterModule.forRoot(routes, options)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
