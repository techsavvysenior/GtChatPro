import Api from '../../network/Api';

export function archiveData(param) {
      // console.log("params",param)
      //     let params = { email: user.payload.email, password: user.payload.password };
      let res =  Api.get(`admin/profile/archived-chats?api_key=${param.payload.api_key}&page=${param.payload.page}`);
      return res;

}