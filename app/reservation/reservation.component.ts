import { Component, OnInit } from '@angular/core';
import { Switch } from 'ui/switch';
import { TextField } from 'ui/text-field';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-reservation',
    moduleId: module.id,
    templateUrl: './reservation.component.html'
})

export class ReservationComponent implements OnInit {
    reservation: FormGroup;

    constructor(private formBuilder: FormBuilder) {
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
        console.log(JSON.stringify(this.reservation.value));
    }
}