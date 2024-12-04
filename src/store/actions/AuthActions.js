import { allActions } from './allActions';

// export const AuthActions = (authData) => {

//     return {
//         type: allActions.ADD_TODO_SUCCESS,
//         payload: authData
//     };
// };

export const AuthKeyAction = (key) => {

    return {
        type: allActions.API_KEY,
        payload: key
    };


};

export const getUsers = (user) => {

    return {

        type: allActions.GET_USERS_REQUESTED,
        payload: user
    };
};

export const Logout = (user) => {

    return {
        type: allActions.LOG_OUT,
        payload: user
    };


};

export const CurrentScreen = (data) => {

    return {
        type: allActions.CURRENT_SCREEN,
        payload: data
    };


};

export const TransferedReq = (data) => {

    return {
        type: allActions.TRANSFERED_REQ,
        payload: data
    };


};

export const AcceptedChats = (data) => {

    return {
        type: allActions.ACCEPTED_CHATS,
        payload: data
    };

};
export const Socket = (data) => {

    return {
        type: allActions.SOCKET,
        payload: data
    };
};
export const ContactsData = (data) =>{
    return{
        type:allActions.CONTACTS_GET_DATA_REQUEST,
        payload:data
    }
}

export const ArchiveData=(data)=>{
    return{
        type:allActions.ARCHIVE_GET_DATA_REQUEST,
        payload:data
    }
}

export const VisitorData=(data)=>{
    return{
        type:allActions.VISITOR_GET_DATA_REQUEST,
        payload:data
    }
}
