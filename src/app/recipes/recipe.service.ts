import {  Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Recipe } from "./recipe.model";

@Injectable()
export class RecipeService {
    recipesChanged = new Subject<Recipe[]>()

    // private recipes: Recipe[] = [
    //     new Recipe('A Test Recipe', 'A test recipe sample', 'https://picturetherecipe.com/wp-content/uploads/2020/07/Butter-Chicken-PictureTheRecipe.jpg', [new Ingredient('Meat', 1), new Ingredient('Palm oil', 2)]),
    //     new Recipe('Another Test Recipe', 'A test recipe sample', 'https://picturetherecipe.com/wp-content/uploads/2020/07/Butter-Chicken-PictureTheRecipe.jpg', [new Ingredient('Fish', 1), new Ingredient('Spaghetti', 5)])
    // ]

    private recipes: Recipe[] = []

    constructor(private slService: ShoppingListService) {}

    setRecipes(recipes: Recipe[]) {
        this.recipes = recipes
        this.recipesChanged.next(this.recipes.slice())
    }

    getRecipes() {
        return this.recipes.slice()
    }

    getRecipe(index: number) {
        return this.recipes[index]
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
        this.slService.addIngredients(ingredients)
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe)
        this.recipesChanged.next(this.recipes.slice())
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe
        this.recipesChanged.next(this.recipes.slice())
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index, 1)
        this.recipesChanged.next(this.recipes.slice())
    }
}