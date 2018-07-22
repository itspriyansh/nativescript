import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ProcessHTTPMsgService{
    constructor() { }
    public handleError(error: HttpErrorResponse | any){
        let errMess: string;

        if(error.error instanceof ErrorEvent){
            errMess = error.error.message;
        }else{
            errMess = `${error.status} - ${error.statusText || ''} ${error.message}`;
        }
        return throwError(errMess);
    }
}