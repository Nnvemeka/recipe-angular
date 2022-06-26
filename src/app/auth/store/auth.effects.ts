import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Actions, ofType, Effect } from '@ngrx/effects'
import { catchError, map, of, switchMap, tap } from 'rxjs'
import * as AuthActions from './auth.action'

export interface AuthResponseData {
    idToken: string
    email: string
    refreshToken: string
    expiresIn: string
    localId: string
    registered?: boolean
}

const handleAuthentication = (expiresIn: number, email: string, userId: string, token: string) => {
    const expirationDate = new Date(
        new Date().getTime() + expiresIn * 1000
    )
    return new AuthActions.AuthenticateSuccess({
        email: email,
        userId: userId,
        token: token,
        expirationDate: expirationDate
    }
    )
}

const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred!'
    if (!errorRes.error || !errorRes.error.error) {
        return of(new AuthActions.AuthenticateFail(errorMessage))
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
    return of(new AuthActions.AuthenticateFail(errorMessage))
}

@Injectable()
export class AuthEffects {

    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            return this.http
                .post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBqQKiNnr03hi0fZRG6GfX0ooQy_Pc7nXA',
                    {
                        email: signupAction.payload.email,
                        password: signupAction.payload.password,
                        returnSecureToken: true
                    }
                )
                .pipe(
                    map(resData => {
                        return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken)
                    }),
                    catchError(errorRes => {
                        return handleError(errorRes)
                    }),
                )
        })
    )

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http.post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBqQKiNnr03hi0fZRG6GfX0ooQy_Pc7nXA',
                {
                    email: authData.payload.email,
                    password: authData.payload.password,
                    returnSecureToken: true
                }
            ).pipe(
                map(resData => {
                    return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken)
                }),
                catchError(errorRes => {
                    return handleError(errorRes)
                }),
            )
        }),
    )

    @Effect({ dispatch: false })
    authSuccess = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap(() => {
            this.router.navigate(['/'])
        })
    )

    @Effect({ dispatch: false })
    authRedirect = this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
            this.router.navigate(['/auth'])
        })
    )

    constructor(private actions$: Actions, private http: HttpClient, private router: Router) { }
}