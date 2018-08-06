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
import { Page } from 'ui/page';
import { Animation, AnimationDefinition } from 'ui/animation';
import { View } from 'ui/core/view';
import { SwipeDirection, SwipeGestureEventData } from 'ui/gestures';
import { Color } from 'color';
import * as enums from 'ui/enums';
import * as SocialSharing from 'nativescript-social-share';
import { ImageSource, fromUrl } from 'image-source';

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
    cardImage: View;
    commentList: View;
    cardLayout: View;
    showComments: boolean = false;

    constructor(private dishService: DishService,
        private route: ActivatedRoute,
        private routerExtensions: RouterExtensions,
        @Inject('BaseURL') public BaseURL,
        private favoriteService: FavoriteService,
        public fonticon: TNSFontIconService,
        private vcRef: ViewContainerRef,
        private modalService: ModalDialogService,
        private page: Page){ }
    
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
            actions: ['Add to Favorites', 'Add Comment', 'Social Sharing']
        }).then((option: any) => {
            if(option === 'Add to Favorites') {
                this.addToFavorites();
            } else if(option === 'Add Comment') {
                this.showModal();
            } else if(option === 'Social Sharing') {
                this.socialShare();
            } else {
                console.log('Action dialog cancelled');
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
    onSwipe(args: SwipeGestureEventData) {
        if(this.dish) {
            this.cardImage = <View>this.page.getViewById<View>('cardImage');
            this.commentList = <View>this.page.getViewById<View>('commentList');
            this.cardLayout = <View>this.page.getViewById<View>('cardLayout');
            if(args.direction === SwipeDirection.up && !this.showComments) {
                this.animateUp();
            } else if(args.direction === SwipeDirection.down && this.showComments) {
                this.showComments = false;
                this.animateDown();
            }
        }
    }
    showAndHideComments() {
        if(this.dish) {
            this.cardImage = <View>this.page.getViewById<View>('cardImage');
            this.commentList = <View>this.page.getViewById<View>('commentList');
            this.cardLayout = <View>this.page.getViewById<View>('cardLayout');
            if(!this.showComments) {
                this.animateUp();
            } else if(this.showComments) {
                this.showComments = false;
                this.animateDown();
            }
        }
    }
    animateUp() {
        let definitions = new Array<AnimationDefinition>();
        let a1: AnimationDefinition = {
            target: this.cardImage,
            scale: { x: 1, y: 0 },
            translate: { x: 0, y: -200 },
            opacity: 0,
            duration: 500,
            curve: enums.AnimationCurve.easeIn
        };
        definitions.push(a1);

        let a2: AnimationDefinition = {
            target: this.cardLayout,
            backgroundColor: new Color('#ffc107'),
            duration: 500,
            curve: enums.AnimationCurve.easeIn
        };
        definitions.push(a2);

        let definitionSet = new Animation(definitions);

        definitionSet.play().then(() => {
            this.showComments = true;
        })
            .catch((e) => { console.log(e.message); });
    }

    animateDown() {
        let definitions = new Array<AnimationDefinition>();
        let a1: AnimationDefinition = {
            target: this.cardImage,
            scale: { x: 1, y: 1 },
            translate: { x: 0, y: 0 },
            opacity: 1,
            duration: 500,
            curve: enums.AnimationCurve.easeIn
        };
        definitions.push(a1);

        let a2: AnimationDefinition = {
            target: this.cardLayout,
            backgroundColor: new Color('#ffffff'),
            duration: 500,
            curve: enums.AnimationCurve.easeIn
        };
        definitions.push(a2);

        let definitionSet = new Animation(definitions);

        definitionSet.play().then(() => {})
            .catch((e) => { console.log(e.message); });
    }
    socialShare() {
        let image: ImageSource;

        fromUrl(this.BaseURL + this.dish.image)
            .then((img: ImageSource) => {
                image = img;
                SocialSharing.shareImage(image, 'How would you like to share this image?');
            }).catch(() => { console.log('Error loading image'); });
    }
}