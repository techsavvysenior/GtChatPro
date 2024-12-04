import Api from '../../network/Api';

export function visitorData(param) {
      // console.log("params",param)
      
      let res =  Api.get(`admin/profile/visitor-chats?api_key=${param.payload.api_key}&page=${param.payload.page}`);
      return res;

}
