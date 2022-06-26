import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer'
import * as AuthActions from './store/auth.action'

export interface AuthResponseData {
    idToken: string
    email: string
    refreshToken: string
    expiresIn: string
    localId: string
    registered?: boolean
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    // user = new BehaviorSubject<User>(null)
    private tokenEpirationTimer: any

    constructor(
        private store: Store<fromApp.AppState>
    ) { }

    setLogoutTimer(expirationDuration: number) {
        this.tokenEpirationTimer = setTimeout(() => {
            this.store.dispatch(new AuthActions.Logout())
        }, expirationDuration)
    }

    clearLogoutTimer() {
        if (this.tokenEpirationTimer) {
            clearTimeout(this.tokenEpirationTimer)
        }
        this.tokenEpirationTimer = null
    }
}