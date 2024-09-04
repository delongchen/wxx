import { concat } from '../utils';
import baseInfoShare from './base-info-share';
import lobbyShare from './lobby-share'

export default concat(
  baseInfoShare,
  lobbyShare,
)
