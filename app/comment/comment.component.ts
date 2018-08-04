import { Component, OnInit } from '@angular/core';
import { Comment } from '../shared/comment';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TextField } from 'ui/text-field';
import { Slider } from 'ui/slider' ;

@Component({
    moduleId: module.id,
    templateUrl: './comment.component.html'
})

export class CommentComponent implements OnInit {
    commentForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
        private params: ModalDialogParams) {
            this.commentForm = this.formBuilder.group({
                author: ['', Validators.required],
                rating: 5,
                comment: ['', Validators.required]
            });
        }
    ngOnInit() { }

    onAuthorChange(args) {
        let textField = <TextField>args.object;
        this.commentForm.patchValue({ author: textField.text });
    }
    onRatingChange(args) {
        let slider = <Slider>args.object;
        this.commentForm.patchValue({ rating: slider.value });
    }
    onCommentChange(args) {
        let textField = <TextField>args.object;
        this.commentForm.patchValue({ comment: textField.text });
    }
    onSubmit() {
        if(this.commentForm.valid) {
            let comment: Comment = this.commentForm.value;
            const date = new Date();
            comment.date = date.toISOString();
            this.params.closeCallback(comment);
        } else {
            this.params.closeCallback(null);
        }
    }
}