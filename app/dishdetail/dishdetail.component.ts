import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router'; 
import { switchMap } from 'rxjs/operators';
import { FavoriteService } from '../services/favorite.service';
import { TNSFontIconService } from 'nativescript-ngx-fonticon';
import { Toasty } from 'nativescript-toasty';

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
        public fonticon: TNSFontIconService){ }
    
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
}
