import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { BehaviorSubject, catchError, tap, throwError } from "rxjs";
import { User } from "./user.model";
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
        private http: HttpClient,
        private router: Router,
        private store: Store<fromApp.AppState>
    ) { }

    autoLogin() {
        const userData: { email: string, id: string, _token: string, _tokenExpDate: string } = JSON.parse(localStorage.getItem('userData'))
        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpDate)
        )

        if (loadedUser.token) {
            // this.user.next(loadedUser)
            this.store.dispatch(
                new AuthActions.AuthenticateSuccess({
                    email: loadedUser.email,
                    userId: loadedUser.id,
                    token: loadedUser.token,
                    expirationDate: new Date(userData._tokenExpDate)
                })
            )
            const expirationDate = new Date(userData._tokenExpDate).getTime() - new Date().getTime()
            this.autoLogout(expirationDate)
        }
    }

    logout() {
        // this.user.next(null)
        this.store.dispatch(new AuthActions.Logout())
        localStorage.removeItem('userData')
        if (this.tokenEpirationTimer) {
            clearTimeout(this.tokenEpirationTimer)
        }
        this.tokenEpirationTimer = null
    }

    autoLogout(expirationDuration: number) {
        this.tokenEpirationTimer = setTimeout(() => {
            this.logout()
        }, expirationDuration)
    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000)
        const user = new User(email, userId, token, expirationDate)
        // this.user.next(user)
        this.store.dispatch(
            new AuthActions.AuthenticateSuccess({
                email: email,
                userId: userId,
                token: token,
                expirationDate: expirationDate
            })
        )
        this.autoLogout(expiresIn * 1000)
        localStorage.setItem('userData', JSON.stringify(user))
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!'
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage)
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This email already exists.'
                break
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email does not exists.'
                break
            case 'INVALID_PASSWORD':
                errorMessage = 'This password is incorrect.'
                break
        }
        return throwError(errorMessage)
    }
}