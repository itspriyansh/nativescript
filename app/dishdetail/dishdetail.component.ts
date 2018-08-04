import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router'; 
import { switchMap } from 'rxjs/operators';
import { FavoriteService } from '../services/favorite.service';
import { TNSFontIconService } from 'nativescript-ngx-fonticon';
import { Toasty } from 'nativescript-toasty';
import { action } from 'ui/dialogs';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';
import { CommentComponent } from '../comment/comment.component';

@Component({
    selector: 'app-dishdetail',
    moduleId: module.id,
    templateUrl: './dishdetail.component.html'
})

export class DishdetailComponent implements OnInit{
    dish: Dish;
    comment: Comment;
    errMess: string;
    avgstars: string;
    numcomments: number;
    favorite: boolean = false;

    constructor(private dishService: DishService,
        private route: ActivatedRoute,
        private routerExtensions: RouterExtensions,
        @Inject('BaseURL') public BaseURL,
        private favoriteService: FavoriteService,
        public fonticon: TNSFontIconService,
        private vcRef: ViewContainerRef,
        private modalService: ModalDialogService){ }
    
    ngOnInit() {
        this.route.params
        .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
            .subscribe(dish => {
                this.dish = dish;
                this.favorite = this.favoriteService.isFavorite(dish.id);
                this.numcomments = this.dish.comments.length;

                let total = 0;
                this.dish.comments.forEach(comment => total += comment.rating);
                this.avgstars = (total/this.numcomments).toFixed(2);
            },
                errmess => { this.dish = null; this.errMess = <any>errmess });
    }
    addToFavorites() {
        if(!this.favorite) {
            console.log('Adding To Favorites', this.dish.id);
            this.favorite = this.favoriteService.addFavorite(this.dish.id);
            const toast = new Toasty('Added Dish ' + this.dish.id, 'short', 'bottom');
            toast.show();
        }
    }
    goBack(): void{
        this.routerExtensions.back();
    }
    openAction() {
        action({
            title: 'Actions',
            cancelButtonText: 'Cancel',
            actions: ['Add to Favorites', 'Add Comment']
        }).then((option: any) => {
            if(option === 'Add to Favorites') {
                this.addToFavorites();
            } else if(option === 'Add Comment') {
                this.showModal();
            } else {
                console.log('Action dialod cancelled');
            }
        });
    }
    showModal() {
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false
        };
        this.modalService.showModal(CommentComponent, options)
            .then((comment: Comment) => {
                if(comment) {
                    console.log(comment);
                    this.dish.comments.push(comment);
                    this.numcomments = this.dish.comments.length;
                    let total = 0;
                    this.dish.comments.forEach(comment => total += comment.rating);
                    this.avgstars = (total/this.numcomments).toFixed(2);
                } else {
                    console.log('Comment Form Invalid!');
                }
            });
    }
}
