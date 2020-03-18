import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { BackendService } from '../../services/backend/backend.service';

@Injectable()
export class ProfileResolver implements Resolve<Observable<any>> {

    constructor(
        private backend: BackendService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot) {
        return this.backend.getProfile(
            parseInt(route.paramMap.get('profile'))
        ).pipe(
            catchError((error) => {
                this.router.navigate(['/404']);
                return of(error);
            })
        );
    }
}
