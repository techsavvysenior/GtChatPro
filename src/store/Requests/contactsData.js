import Api from '../../network/Api';

export function contactsData(param) {
      console.log("contactsDataparams",param)
      //     let params = { email: user.payload.email, password: user.payload.password };
      let res =  Api.get(`admin/profile/agent-chats?api_key=${param.payload.api_key}&page=${param.payload.page}`);
      return res;

}
