import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        MatSnackBarModule,
        MatButtonModule,
        MatChipsModule,
        MatListModule,
        MatIconModule,
        MatTabsModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressBarModule,
        MatStepperModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatButtonToggleModule,
        MatCheckboxModule
    ],
    providers: [
        MatSnackBar
    ],
    exports: [
        MatButtonModule,
        MatChipsModule,
        MatListModule,
        MatIconModule,
        MatTabsModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressBarModule,
        MatStepperModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatButtonToggleModule,
        MatCheckboxModule
    ]
})
export class MaterialModule { }
