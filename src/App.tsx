import React from 'react'
import {
  Box,
  CircularProgress,
  CssBaseline,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import TextCommandSettings from './ConfigSections/TextCommandSettings'
import BaseSettings from './ConfigSections/BaseSettings'

type ConfigTab = {
  label: string
  component: React.ComponentType
}

const ConfigTabs: ConfigTab[] = [
  {
    label: '기본 설정',
    component: BaseSettings,
  },
  {
    label: '텍스트 설정 커맨드',
    component: TextCommandSettings,
  },
]

const baseSettingRequired = !localStorage.baseSettings

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  return (
    <CssBaseline>
      {baseSettingRequired ? (
        <Box
          sx={{
            minHeight: '100vh',
            p: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Paper
            sx={{
              maxWidth: 500,
              width: '100%',
              mx: 'auto',
              my: 'auto',
              overflow: 'hidden',
            }}
            variant="outlined"
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">기본 설정을 완료해 주세요.</Typography>
              <Divider sx={{ my: 1 }} />
              <BaseSettings />
            </Box>
          </Paper>
        </Box>
      ) : loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            minHeight: '100vh',
            p: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Paper
            sx={{
              maxWidth: 500,
              width: '100%',
              mx: 'auto',
              my: 'auto',
              overflow: 'hidden',
            }}
            variant="outlined"
          >
            <Tabs
              variant="scrollable"
              scrollButtons="auto"
              onChange={(e, v) => setCurrentTab(v)}
              value={currentTab}
            >
              {ConfigTabs.map((x, i) => (
                <Tab label={x.label} key={i} value={i} />
              ))}
            </Tabs>
            <Box sx={{ p: 2 }}>
              {ConfigTabs.map((x, i) =>
                i === currentTab ? (
                  <div key={i}>
                    <x.component />
                  </div>
                ) : null
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </CssBaseline>
  )
}

export default App
