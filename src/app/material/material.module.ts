import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    imports: [
        CommonModule,
        MatSnackBarModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatStepperModule,
        MatSelectModule,
        MatCheckboxModule
    ],
    providers: [MatSnackBar],
    exports: [
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatStepperModule,
        MatSelectModule,
        MatCheckboxModule
    ]
})
export class MaterialModule {}
