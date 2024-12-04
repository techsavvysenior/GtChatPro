
import { allActions } from '../actions/allActions';
import io from 'socket.io-client';


const initialState = {
    users: {}, loading: false, token: '', currentScreen: '', TransferedReq: [],
    AcceptedChats: [],
    Socket: '',
};

export const AuthReducer = (state = initialState, action) => {

    switch (action.type) {

        // case allActions.ADD_TODO_SUCCESS:

        //     return { ...state, token: action.payload };


        case allActions.AUTH_KEY:
            return { ...state, token: action.payload }

        case allActions.GET_USERS_REQUESTED:

            return {
                ...state,
                // users:action.payload,
                loading: true
            };

        case allActions.GET_USERS_SUCCESS:

            return {
                ...state,
                users: action.payload,
                loading: false
            };

        case allActions.GET_USERS_FAILED:

            return {
                ...state,

            };
        case allActions.LOG_OUT:
            // console.log('Logout')
            return {
                users: action.payload,
                loading: false,
                token: action.payload

            };
        case allActions.CURRENT_SCREEN:
            return {
                ...state,
                currentScreen: action.payload
            }

        case allActions.TRANSFERED_REQ:
            return {
                ...state,
                TransferedReq: action.payload

            }

        case allActions.ACCEPTED_CHATS:
            return {
                ...state,
                AcceptedChats: action.payload

            }

        case allActions.SOCKET:
            return {
                ...state,
                Socket: action.payload

            }
        case allActions.CONTACTS_GET_DATA_REQUEST:

            return {
                ...state,
                loading: true
            };

        case allActions.CONTACTS_SUCCESS_DATA_REQUEST:

            return {
                ...state,
                contactsSuccessData: action.payload,
                loading: false
            };
        case allActions.ARCHIVE_GET_DATA_REQUEST:

            return {
                ...state,
                loading: true
            };

        case allActions.ARCHIVE_SUCCESS_DATA_REQUEST:

            return {
                ...state,
                archiveSuccessData: action.payload,
                loading: false
            };

            case allActions.VISITOR_GET_DATA_REQUEST:

                return {
                    ...state,
                    loading: true
                };
    
            case allActions.VISITOR_SUCCESS_DATA_REQUEST:
    
                return {
                    ...state,
                    visitorSuccessData: action.payload,
                    loading: false
                };

        default:
            return state;
    }

};