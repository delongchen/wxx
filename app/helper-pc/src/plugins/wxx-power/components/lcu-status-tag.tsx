import {memo} from "react";
import { Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react'
import { VscInfo, VscError, VscEllipsis } from "react-icons/vsc"
import { IconType } from "react-icons";
import {useCurrentSummoner, useLcuProcessStatus} from "../hooks/common";


type TagAllowedColor = 'red' | 'green' | 'yellow'

interface BaseTagProps {
  color: TagAllowedColor
  text: string
  icon?: IconType
}

const BaseTag = (
  { color, text, icon }: BaseTagProps,
) => (
  <Tag size='md' colorScheme={color}>
    {icon === undefined ?
      null
      :
      <TagLeftIcon as={icon}/>
    }
    <TagLabel>{text}</TagLabel>
  </Tag>
)

const RedTag = <BaseTag
  color='red'
  text='上号GKD'
  icon={VscError}
/>

const YellowTag = <BaseTag
  color='yellow'
  text='请使用管理员权限启动'
  icon={VscInfo}
/>

function LcuStatusTag() {
  const { status } = useLcuProcessStatus()
  const currentSummoner = useCurrentSummoner()

  if (status === 1) return RedTag
  if (status === 2) return YellowTag

  if (currentSummoner === null) {
    return (
      <BaseTag color='green' text='' icon={VscEllipsis} />
    )
  }

  const { gameName, tagLine } = currentSummoner
  const text = `${gameName}#${tagLine}`

  return (
    <BaseTag
      color='green'
      text={text}
    />
  )
}

export default memo(LcuStatusTag)
