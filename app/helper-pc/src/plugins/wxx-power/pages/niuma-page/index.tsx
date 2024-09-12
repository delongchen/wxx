import { memo, useCallback, useState } from 'react';
import { getCurrentSummoner } from 'tauri-plugin-wxx-core/lcu-api/summoner'
import { SummonerInfo } from 'tauri-plugin-wxx-core'


function NiumaPage() {
  const [info, setInfo] = useState<SummonerInfo | null>(null)

  const handleClick = useCallback(async () => {
    getCurrentSummoner().then(setInfo)
  }, [])

  return (
    <div>
      <h2>niuma</h2>
      <button onClick={handleClick}>get</button>
      <div>
        {info === null ? null : (
          <pre>{JSON.stringify(info, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}

export default memo(NiumaPage)
