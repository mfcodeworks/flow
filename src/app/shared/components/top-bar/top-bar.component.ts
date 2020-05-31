import { Component, ViewChild, AfterViewInit, Input, ElementRef, OnInit } from '@angular/core';
import { IonInput, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { QRService } from '../../../services/qr/qr.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

const qrTest = new RegExp(`${environment.appUrl}/profile/[0-9]`.replace('/', '\\/'));

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit, AfterViewInit {

    @Input('hasMenuButton') hasMenuButton = false;
    @Input('hasQRButton') hasQRButton = false;
    @ViewChild('topbar') topbar: any;
    @ViewChild("qrFile") qrFile: IonInput;
    @ViewChild("qrFileCanvas") qrCanvas: ElementRef<HTMLCanvasElement>;
    private cameraButton = {
        text: 'Camera Scan QR',
        icon: 'camera-outline',
        handler: () => {
            this.qrScan('camera');
        }
    };
    private actionsheet = {
        cssClass: 'qr-sheet',
        buttons: [{
            text: 'Scan QR File',
            icon: 'qr-code-outline',
            handler: () => {
                this.getQrFile();
            }
        }]
    };
    public el: any;

    constructor(
        private _qr: QRService,
        private _router: Router,
        private _actionSheet: ActionSheetController,
        private _alerts: AlertController,
        private _platform: Platform
    ) {}

    ngOnInit() {
        if (this._platform.is('hybrid')) {
            this.actionsheet.buttons.push(this.cameraButton);
        }
    }

    ngAfterViewInit(): void {
        this.el = this.topbar.el;
        this.scanQR = async () => {
            const actionSheet = await this._actionSheet.create(this.actionsheet);
            await actionSheet.present();
        }
    }

    async scanQR(): Promise<void> {
        const actionSheet = await this._actionSheet.create({
            cssClass: 'qr-sheet',
            buttons: [{
                text: 'Camera Scan QR',
                icon: 'camera-outline',
                handler: () => {
                    this.qrScan('camera');
                }
            }, {
                text: 'Scan QR File',
                icon: 'qr-code-outline',
                handler: () => {
                    this.getQrFile();
                }
            }]
        });
        await actionSheet.present();
    }

    async getQrFile(): Promise<void> {
        console.log(this.qrFile);
        const file = await this.qrFile.getInputElement();
        file.click();
    }

    async qrScan(mode = 'camera'): Promise<void> {
        const alert = await this._alerts.create({
            header: 'No QR Detected',
            message: 'No Flow QR code was detected',
            buttons: ['Okay']
        });

        let data: string = '';

        if (mode === 'photo') {
            // Get file
            const {files} = await this.qrFile.getInputElement()
            const file = files[0];

            if (!file) {
                return;
            }

            // Scan file
            data = await this._qr.scan(file);

            // Alert if no QR was found
            if (!data) {
                console.warn('Alerting no QR');
                await alert.present();
            }
        } else {
            // Camera scan
            data = await this._qr.scan();
            if (!data) {
                return;
            }
        }

        // DEBUG: Log QR data
        console.log(`QR Scanner Detected ${data}`);
        console.log('QR Testing', qrTest.test(data));

        // Test if QR code has a valid profile URL
        if (qrTest.test(data)) {
            this._router.navigateByUrl(data.replace(environment.appUrl, ''));
        } else {
            console.warn('Alerting no QR');
            await alert.present();
        }

        // Clear QR file input
        (<HTMLInputElement>document.getElementById('qrFile')).value = "";
    }
}
