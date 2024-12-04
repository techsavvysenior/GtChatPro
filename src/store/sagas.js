import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { allActions } from './actions/allActions';
import { AuthActions } from './actions/AuthActions';
import { contactsData } from './Requests/contactsData';
// import {userLogin}  from './LoginSaga'
import { userLogin } from './actions/userLogin';
import { archiveData } from './Requests/archiveData';
import { visitorData } from './Requests/visitorData';



function* fetchUsers(action) {
    try {
        const users = yield call(userLogin, action);
        yield put({ type: allActions.GET_USERS_SUCCESS, payload: users });
    } catch (e) {
        yield put({ type: allActions.GET_USERS_SUCCESS, payload:users });
    }
}

function* fetchContacts(action) {
    // console.log("ACtions",action)
    try {
        const contacts = yield call(contactsData, action);
        yield put({ type: allActions.CONTACTS_SUCCESS_DATA_REQUEST, payload: contacts });
    } catch (e) {
        yield put({ type: allActions.CONTACTS_SUCCESS_DATA_REQUEST, payload:contacts });
    }
}

function* fetchArchive(action) {
    // console.log("ACtions archive",action)
    try {
        const archive = yield call(archiveData, action);
        yield put({ type: allActions.ARCHIVE_SUCCESS_DATA_REQUEST, payload: archive });
    } catch (e) {
        yield put({ type: allActions.ARCHIVE_SUCCESS_DATA_REQUEST, payload:archive });
    }
}

function* fetchVisitor(action) {
    // console.log("ACtions visitor",action)
    try {
        const visitor = yield call(visitorData, action);
        yield put({ type: allActions.VISITOR_SUCCESS_DATA_REQUEST, payload: visitor });
    } catch (e) {
        yield put({ type: allActions.VISITOR_SUCCESS_DATA_REQUEST, payload:visitor });
    }
}

function* rootSaga() {
    yield takeLatest(allActions.GET_USERS_REQUESTED, fetchUsers);
    yield takeLatest(allActions.CONTACTS_GET_DATA_REQUEST, fetchContacts);
    yield takeLatest(allActions.ARCHIVE_GET_DATA_REQUEST, fetchArchive);
    yield takeLatest(allActions.VISITOR_GET_DATA_REQUEST, fetchVisitor);




}
export default rootSaga;
