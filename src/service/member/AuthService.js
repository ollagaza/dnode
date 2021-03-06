import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import ServiceConfig from '../../service/service-config'
import MemberService from '../../service/member/MemberService'
import log from '../../libs/logger'
import logger from "../../libs/logger";


const AuthServiceClass = class {
  constructor() {
    this.log_prefix = '[AuthServiceClass]'
  }

  login = async (database, req) => {
    const result = new StdObject()
    const req_body = req.body
    if (!req_body || !req_body.user_id || !req_body.password) {
      throw new StdObject(-1, '아이디 비밀번호를 확인해 주세요...', 400)
    }
    const user_id = req_body.user_id
    const password = req_body.password
    const admin = req_body.admin

    const member_info = await MemberService.getMemberInfoById(database, user_id)
    if (member_info == null || member_info.user_id !== user_id) {
      throw new StdObject(-1, '등록된 회원 정보가 없습니다.', 400)
    }
    await MemberService.checkPassword(database, member_info, req_body.password, true)
    // await MemberService.updateLastLogin(DBMySQL, member_info.seq);
    switch (member_info.used) {
      case 0:
        if (member_info.user_type === 'P') {
          throw new StdObject(-101.1, '회원 가입 승인이 완료되지 않았습니다.<br/>승인이 완료되면 알려드리겠습니다.', 400)
        }
      case 2:
        throw new StdObject(-102, '관리자에 의하여 강제 탈퇴 되었습니다.', 400)
      case 3:
        throw new StdObject(-103, '자발적 탈퇴를 하였습니다..', 400)
      case 4:
        throw new StdObject(-104, '현재 휴면 상태 입니다.', 400)
      case 5:
        throw new StdObject(-105, '현재 사용 중지 중입니다.', 400)
      case 6:
        throw new StdObject(-106, '회원 가입 승인이 거절 되었습니다.<br/>상세한 사항은 이메일을 확인 하여 주시기 바랍니다.', 400)
      default:
        break
    }
    // logger.debug(member_info);
    return member_info;
  }
}

const auth_service = new AuthServiceClass()

export default auth_service

