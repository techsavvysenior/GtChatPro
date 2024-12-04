import { put, takeLatest } from 'redux-saga/effects';
import { userLogin } from '../store//actions/userLogin';
import { allActions } from './actions/allActions';
import { AuthActions } from './actions/AuthActions';

// export default function* LoginSaga({ payload }) {
//   try {
//     const response = yield userLogin(payload);
//     yield put(AuthActions(response));
//   } catch (error) {
//     //    yield put({type: 'LOGIN_FAILURE', error: error.message});
//   }
// }
// export default function* loginScreenSaga() {
//  yield takeLatest(allActions.API_TOKEN, loginUser);
// }
