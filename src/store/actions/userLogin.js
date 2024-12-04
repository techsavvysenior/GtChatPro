import Api from '../../network/Api';
import { AuthActions } from '../actions/AuthActions';

import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { allActions } from './allActions';


export function userLogin(user) {
    
    let params = { email: user.payload.email, password: user.payload.password };
    let res =  Api.post('login_api', params);
    return res;

}
