import React from 'react'
import { Button, TextField } from '@mui/material'
import { toast } from 'react-toastify'
import { obs } from '../api'

const settings = localStorage.baseSettings
  ? JSON.parse(localStorage.baseSettings)
  : {
      wsPassword: '',
      wsAddress: '',
      twitchUsername: '',
    }

const BaseSettings: React.FC = () => {
  const [wsAddress, setWsAddress] = React.useState(settings.wsAddress)
  const [wsPassword, setWsPassword] = React.useState(settings.wsPassword)
  const [twitchUsername, setTwitchUsername] = React.useState(
    settings.twitchUsername
  )
  const [processing, setProcessing] = React.useState(false)

  return (
    <div>
      <TextField
        label="OBS 웹소켓 주소"
        variant="standard"
        disabled={processing}
        value={wsAddress}
        onChange={(e) => setWsAddress(e.target.value)}
        fullWidth
      />
      <TextField
        label="OBS 웹소켓 비밀번호"
        variant="standard"
        fullWidth
        disabled={processing}
        value={wsPassword}
        onChange={(e) => setWsPassword(e.target.value)}
        sx={{ mt: 2 }}
      />
      <TextField
        label="트위치 닉네임"
        variant="standard"
        fullWidth
        disabled={processing}
        value={twitchUsername}
        onChange={(e) => setTwitchUsername(e.target.value)}
        sx={{ mt: 2 }}
      />
      <Button
        sx={{ mt: 2 }}
        variant="contained"
        disableElevation
        disabled={processing}
        fullWidth
        onClick={() => {
          if (!wsAddress) {
            return toast.error('웹소켓 주소는 필수입니다')
          }
          if (!twitchUsername) {
            return toast.error('트위치 유저네임은 필수입니다')
          }
          setProcessing(true)
          toast
            .promise(
              async () => {
                console.log(wsAddress)
                await obs.connect(wsAddress, wsPassword || undefined)
                await obs.disconnect()
              },
              {
                success: '연결 테스트 성공',
                error: '연결 테스트 실패',
                pending: '연결 테스트 진행중...',
              }
            )
            .finally(() => setProcessing(false))
        }}
      >
        저장하기
      </Button>
    </div>
  )
}

export default BaseSettings
