import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { LongholdDirective } from './directives/longhold.directive';
import { RouteTransformerDirective } from './directives/route-transformer.directive';

@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot()
    ],
    declarations: [
        LongholdDirective,
        RouteTransformerDirective,
        TopBarComponent
    ],
    exports: [
        LongholdDirective,
        RouteTransformerDirective,
        TopBarComponent
    ]
})
export class SharedModule {}
