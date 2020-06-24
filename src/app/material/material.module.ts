import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
    imports: [
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        MatStepperModule,
        MatSelectModule
    ],
    exports: [
        MatInputModule,
        MatFormFieldModule,
        MatStepperModule,
        MatSelectModule
    ]
})
export class MaterialModule {}
