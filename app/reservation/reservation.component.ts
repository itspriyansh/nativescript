import { Component, OnInit, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { Switch } from 'ui/switch';
import { TextField } from 'ui/text-field';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { ReservationModalComponent } from '../reservationmodal/reservationmodal.component';
import * as app from 'application';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { Page } from 'ui/page';
import { View } from 'ui/core/view';
import * as enums from 'ui/enums';
import { CouchbaseService } from '../services/couchbase.service';

@Component({
    selector: 'app-reservation',
    moduleId: module.id,
    templateUrl: './reservation.component.html'
})

export class ReservationComponent implements OnInit {
    reservation: FormGroup;
    showForm: boolean = true;
    resevationForm: View;
    submittedForm: View;
    docId: string = 'reservations';

    constructor(private formBuilder: FormBuilder,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private page: Page,
        private couchbaseService: CouchbaseService) {
        this.reservation = this.formBuilder.group({
            guests: 3,
            smoking: false,
            dateTime: ['', Validators.required]
        });
    }

    ngOnInit() { }

    onSmokingChecked(args) {
        let smokingSwitch = <Switch>args.object;
        if(smokingSwitch.checked) {
            this.reservation.patchValue({smoking: true});
        } else {
            this.reservation.patchValue({smoking: false});
        }
    }

    onGuestChange(args) {
        let textField = <TextField>args.object;
        this.reservation.patchValue({guests: textField.text});
    }

    onDateTimeChange(args) {
        let textField = <TextField>args.object;
        this.reservation.patchValue({dateTime: textField.text});
    }

    onSubmit() {
        this.resevationForm = this.page.getViewById<View>('reservationForm');
        this.submittedForm = this.page.getViewById<View>('submittedForm');
        this.submittedForm.animate({
            scale: { x: 0, y: 0 },
            opacity: 0
        });
        this.resevationForm.animate({
            scale: { x: 0, y: 0 },
            opacity: 0,
            duration: 500,
            curve: enums.AnimationCurve.easeIn
        }).then(() => {
            this.showForm = false;
            this.submittedForm.animate({
                scale: { x: 1, y: 1 },
                opacity: 1,
                duration: 500,
                curve: enums.AnimationCurve.easeIn
            }).then(() => {
                console.log(JSON.stringify(this.reservation.value));
                let doc = this.couchbaseService.getDocument(this.docId);
                if(doc === null) {
                    console.log("This is the first reservation");
                    this.couchbaseService.createDocument({"reservations": [this.reservation.value]}, this.docId);
                } else {
                    doc.reservations.push(this.reservation.value);
                    this.couchbaseService.updateDocument(this.docId, {"reservations": doc.reservations});
                } console.log(this.couchbaseService.getDocument(this.docId));
            }).catch((e) => console.log(e.message));
        }).catch((e) => console.log(e.message));
    }

    createModalView(args) {
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: args,
            fullscreen: false
        };
        this.modalService.showModal(ReservationModalComponent, options)
            .then((result: any) => {
                if(args === "guest") {
                    this.reservation.patchValue({guests: result});
                } else if(args === "date-time") {
                    this.reservation.patchValue({dateTime: result});
                }
            });
    }
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
}