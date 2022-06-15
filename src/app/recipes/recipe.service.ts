import { EventEmitter } from "@angular/core";
import { Ingredient } from "../shared/ingredient.model";
import { Recipe } from "./recipe.model";

export class RecipeService {
    recipeSelected = new EventEmitter<Recipe>()

    private recipes: Recipe[] = [
        new Recipe('A Test Recipe', 'A test recipe sample', 'https://picturetherecipe.com/wp-content/uploads/2020/07/Butter-Chicken-PictureTheRecipe.jpg', [new Ingredient('Meat', 1), new Ingredient('Palm oil', 2)]),
        new Recipe('Another Test Recipe', 'A test recipe sample', 'https://picturetherecipe.com/wp-content/uploads/2020/07/Butter-Chicken-PictureTheRecipe.jpg', [new Ingredient('Fish', 1), new Ingredient('Spaghetti', 5)])
    ]

    getRecipe() {
        return this.recipes.slice()
    }
}