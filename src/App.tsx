import React from 'react'
import { Box, CssBaseline, Paper, Tab, Tabs } from '@mui/material'
import TextCommandSettings from './ConfigSections/TextCommandSettings'

type ConfigTab = {
  label: string
  component: React.ComponentType
}

const ConfigTabs: ConfigTab[] = [
  {
    label: '텍스트 설정 커맨드',
    component: TextCommandSettings,
  },
]

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = React.useState(0)

  return (
    <CssBaseline>
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
    </CssBaseline>
  )
}

export default App
