import { Component, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectionStrategy } from '@angular/core';
import QRCode from 'easyqrcodejs';

@Component({
  selector: 'app-qr',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss']
})
export class QRComponent implements AfterViewInit {
    @ViewChild('qr') qrDisplay: ElementRef;
    @Input() data: string = '';
    @Input() width: number = 256;
    @Input() height: number = 256;
    @Input() colorDark: string = "#000";
    @Input() colorLight: string = "#fff";
    @Input() logo: string = '';
    @Input() logoBackgroundColor: string ='#fff';
    @Input() logoBackgroundTransparent: boolean = false;
    @Input() logoWidth: number = 80;
    @Input() logoHeight: number = 80;
    @Input() correctLevel: any = QRCode.CorrectLevel.H;
    @Input() dotScale: number = 1;
    qr: QRCode;

    constructor() { }

    ngAfterViewInit() {
        console.log('Making QR', this);
        this.qr = new QRCode(this.qrDisplay.nativeElement, {
            text: this.data,
            width: this.width,
            height: this.height,
            colorDark : this.colorDark,
            colorLight : this.colorLight,
            logo: this.logo,
            logoBackgroundColor: this.logoBackgroundColor,
            logoBackgroundTransparent: this.logoBackgroundTransparent,
            logoWidth: this.logoWidth,
            logoHeight: this.logoHeight,
            correctLevel: this.correctLevel,
            dotScale: this.dotScale,
        })
    }

}
